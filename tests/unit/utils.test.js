import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  calculateFileHash,
  createFileWithBOM,
  createFileWithEncoding,
  createFileWithIndentation,
  createFileWithLineEndings,
  createFileWithMixedLineEndings,
  setupTestEnvironment,
} from "../helper.js";
import {
  detectFileEncoding,
  detectIndentation,
  detectLineEndings,
  isBinaryFile,
  normalizeLineEndings,
  readFileWithEncoding,
} from "../../src/utils/file-detection.js";

import { createHexdump } from "../../src/utils/encoding.js";
import fs from "fs/promises";
import path from "path";

describe("File Detection Utils", () => {
  const { setup, teardown } = setupTestEnvironment();
  let testDir;

  beforeAll(async () => {
    await setup();
    testDir = path.join(process.cwd(), "tests/fixtures/file-utils-test");
    await fs.mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await teardown();
  });

  it("should correctly identify binary files", async () => {
    // Create a test binary file
    const binaryPath = path.join(testDir, "test.bin");
    const buffer = Buffer.from([0x00, 0x01, 0x02, 0x03, 0xff]);
    await fs.writeFile(binaryPath, buffer);

    const result = await isBinaryFile(binaryPath);
    expect(result).toBe(true);

    // Check a text file
    const textPath = path.join(testDir, "test.txt");
    await fs.writeFile(textPath, "This is a text file");

    const textResult = await isBinaryFile(textPath);
    expect(textResult).toBe(false);
  });

  it("should create valid hexdump", () => {
    const buffer = Buffer.from(
      "Hello, world! This is a test of the hexdump function.",
    );
    const hexdump = createHexdump(buffer);

    // Check format of hexdump
    expect(hexdump).toContain("00000000"); // Offset
    expect(hexdump).toContain("48 65 6c 6c 6f"); // Hex for "Hello"
    expect(hexdump).toContain("Hello, world!"); // ASCII representation
  });

  it("should detect file encoding correctly", async () => {
    // Test UTF-8
    const utf8Path = path.join(testDir, "utf8.txt");
    await createFileWithEncoding(
      utf8Path,
      "UTF-8 text with special chars: é ñ ç",
      "utf8",
    );

    let encoding = await detectFileEncoding(utf8Path);
    expect(encoding).toBe("utf8");

    // Test UTF-8 with BOM
    const utf8BomPath = path.join(testDir, "utf8-bom.txt");
    await createFileWithBOM(utf8BomPath, "UTF-8 text with BOM", "utf8");

    encoding = await detectFileEncoding(utf8BomPath);
    expect(encoding).toBe("utf8");

    // Test UTF-16LE
    const utf16Path = path.join(testDir, "utf16.txt");
    await createFileWithEncoding(
      utf16Path,
      "UTF-16 text with special chars: é ñ ç",
      "utf16le",
    );

    encoding = await detectFileEncoding(utf16Path);
    expect(encoding).toBe("utf16le");
  });

  it("should read files with correct encoding", async () => {
    // Test UTF-8
    const utf8Path = path.join(testDir, "read-utf8.txt");
    const utf8Content = "UTF-8 text with special chars: é ñ ç";
    await createFileWithEncoding(utf8Path, utf8Content, "utf8");

    let content = await readFileWithEncoding(utf8Path, "utf8");
    expect(content).toBe(utf8Content);

    // Test auto-detection
    content = await readFileWithEncoding(utf8Path);
    expect(content).toBe(utf8Content);

    // Test UTF-16LE
    const utf16Path = path.join(testDir, "read-utf16.txt");
    const utf16Content = "UTF-16 text with special chars: é ñ ç";
    await createFileWithEncoding(utf16Path, utf16Content, "utf16le");

    content = await readFileWithEncoding(utf16Path, "utf16le");
    expect(content).toBe(utf16Content);
  });

  it("should calculate file hash correctly", async () => {
    const filePath = path.join(testDir, "hash-test.txt");
    const content = "This is a test file for hash calculation";
    await fs.writeFile(filePath, content);

    // Calculate MD5 hash
    const md5Hash = await calculateFileHash(filePath, "md5");
    expect(md5Hash).toMatch(/^[0-9a-f]{32}$/); // MD5 is 32 hex chars

    // Calculate SHA-256 hash
    const sha256Hash = await calculateFileHash(filePath, "sha256");
    expect(sha256Hash).toMatch(/^[0-9a-f]{64}$/); // SHA-256 is 64 hex chars
  });

  it("should detect line endings correctly", async () => {
    // Test CRLF
    const crlfPath = path.join(testDir, "crlf.txt");
    await createFileWithLineEndings(crlfPath, "Line 1\nLine 2\nLine 3", "crlf");

    let lineEndings = await detectLineEndings(crlfPath);
    expect(lineEndings).toBe("crlf");

    // Test LF
    const lfPath = path.join(testDir, "lf.txt");
    await createFileWithLineEndings(lfPath, "Line 1\nLine 2\nLine 3", "lf");

    lineEndings = await detectLineEndings(lfPath);
    expect(lineEndings).toBe("lf");

    // Test CR
    const crPath = path.join(testDir, "cr.txt");
    await createFileWithLineEndings(crPath, "Line 1\nLine 2\nLine 3", "cr");

    lineEndings = await detectLineEndings(crPath);
    expect(lineEndings).toBe("cr");

    // Test mixed
    const mixedPath = path.join(testDir, "mixed.txt");
    await createFileWithMixedLineEndings(
      mixedPath,
      "Line 1\nLine 2\nLine 3\nLine 4\nLine 5",
    );

    lineEndings = await detectLineEndings(mixedPath);
    expect(lineEndings).toBe("mixed");
  });

  it("should normalize line endings", async () => {
    // Test CRLF to LF
    const crlfContent = "Line 1\r\nLine 2\r\nLine 3";
    const normalizedCrlf = normalizeLineEndings(crlfContent, "lf");
    expect(normalizedCrlf).toBe("Line 1\nLine 2\nLine 3");

    // Test CR to LF
    const crContent = "Line 1\rLine 2\rLine 3";
    const normalizedCr = normalizeLineEndings(crContent, "lf");
    expect(normalizedCr).toBe("Line 1\nLine 2\nLine 3");

    // Test mixed to CRLF
    const mixedContent = "Line 1\r\nLine 2\rLine 3\n";
    const normalizedMixed = normalizeLineEndings(mixedContent, "crlf");
    expect(normalizedMixed).toBe("Line 1\r\nLine 2\r\nLine 3\r\n");
  });

  it("should detect indentation correctly", async () => {
    // Test spaces (2)
    const spaces2Path = path.join(testDir, "spaces2.js");
    const spaces2Content = "function test() {\n  const x = 1;\n  return x;\n}";
    await fs.writeFile(spaces2Path, spaces2Content);

    let indentation = await detectIndentation(spaces2Path);
    expect(indentation.type).toBe("spaces");
    expect(indentation.size).toBe(2);

    // Test spaces (4)
    const spaces4Path = path.join(testDir, "spaces4.js");
    await createFileWithIndentation(spaces4Path, spaces2Content, "spaces", 4);

    indentation = await detectIndentation(spaces4Path);
    expect(indentation.type).toBe("spaces");
    expect(indentation.size).toBe(4);

    // Test tabs
    const tabsPath = path.join(testDir, "tabs.js");
    await createFileWithIndentation(tabsPath, spaces2Content, "tabs");

    indentation = await detectIndentation(tabsPath);
    expect(indentation.type).toBe("tabs");
  });
});
