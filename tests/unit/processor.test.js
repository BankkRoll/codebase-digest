import {
  PROJECT_TEMPLATES,
  calculateFileHash,
  cleanAllFixtures,
  compareWithSnapshot,
  createCustomFixture,
  createFixture,
  createSnapshot,
  injectErrors,
  measurePerformance,
  mockFileSystem,
  setupTestEnvironment,
} from "../helper.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import path from "path";
import { processDirectory } from "../../src/core/processor.js";

describe("Processor", () => {
  const { setup, teardown } = setupTestEnvironment();
  let basicFixtureDir;
  let complexFixtureDir;
  let customFixtureDir;

  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    // Create various fixture types for different test scenarios
    basicFixtureDir = await createFixture("basic-test", "basic");
    complexFixtureDir = await createFixture("complex-test", "fullstack");

    // Create a custom fixture with specific test cases
    customFixtureDir = await createCustomFixture("custom-test", {
      "special-file.js": 'const x = "special";\nconsole.log(x);',
      "mixed-line-endings.js": "line1\r\nline2\rline3\n",
      "binary-data.bin": Buffer.from([0x00, 0x01, 0x02, 0xff]),
      "utf16.txt": {
        content: "Unicode text with special chars: é Ω ᾭ",
        encoding: "utf16le",
      },
      ".gitignore": "node_modules\n*.log\n.DS_Store",
      "node_modules/should-ignore.js": 'console.log("Should be ignored");',
      "error-case.js": 'console.log("This file will trigger an error");',
    });
  });

  it("should process a basic directory correctly", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*"],
      excludePatterns: [],
      respectGitignore: false,
    };

    const { result, duration } = await measurePerformance(
      processDirectory,
      basicFixtureDir,
      config,
    );

    console.log(`Processing took ${duration}ms`);
    const parsed = JSON.parse(result);

    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBe(Object.keys(PROJECT_TEMPLATES.basic).length);
    expect(parsed.some((file) => file.path.includes("README.md"))).toBe(true);
    expect(parsed.some((file) => file.path.includes("src/index.js"))).toBe(
      true,
    );

    // Test snapshot comparison
    const snapshotPath = await createSnapshot("basic-directory-result", parsed);
    expect(await compareWithSnapshot("basic-directory-result", parsed)).toBe(
      true,
    );
  });

  it("should process a complex directory with many file types", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*"],
      excludePatterns: [],
      respectGitignore: false,
    };

    const result = await processDirectory(complexFixtureDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.length).toBe(Object.keys(PROJECT_TEMPLATES.fullstack).length);

    // Check for different file types
    const fileTypes = parsed.map((file) => path.extname(file.path));
    expect(fileTypes).toContain(".js");
    expect(fileTypes).toContain(".md");
    expect(fileTypes).toContain(".html");
    expect(fileTypes).toContain(".css");
    expect(fileTypes).toContain(".yml");
  });

  it("should respect git ignore patterns", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*"],
      excludePatterns: [],
      respectGitignore: true,
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    // Should not include node_modules files
    expect(parsed.every((file) => !file.path.includes("node_modules"))).toBe(
      true,
    );

    // Other files should be included
    expect(parsed.some((file) => file.path === "special-file.js")).toBe(true);
  });

  it("should handle binary files correctly", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*"],
      excludePatterns: [],
      binaryFilesAction: "include",
      binaryEncoding: "base64",
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    const binaryFile = parsed.find((file) => file.path === "binary-data.bin");
    expect(binaryFile).toBeDefined();
    expect(binaryFile.isBinary).toBe(true);
    expect(binaryFile.encoding).toBe("base64");

    // Should be able to decode the content back to the original binary
    const decodedContent = Buffer.from(binaryFile.content, "base64");
    expect(decodedContent[0]).toBe(0x00);
    expect(decodedContent[3]).toBe(0xff);
  });

  it("should skip binary files when configured", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*"],
      excludePatterns: [],
      binaryFilesAction: "skip",
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.every((file) => file.path !== "binary-data.bin")).toBe(true);
  });

  it("should handle different encodings", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*.txt"],
      detectFileEncoding: true,
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    const utf16File = parsed.find((file) => file.path === "utf16.txt");
    expect(utf16File).toBeDefined();
    expect(utf16File.encoding).toBe("utf16le");
    expect(utf16File.content).toContain("Unicode text with special chars");
  });

  it("should handle mixed line endings", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["mixed-line-endings.js"],
      normalizeLineEndings: true,
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    const mixedFile = parsed.find(
      (file) => file.path === "mixed-line-endings.js",
    );
    expect(mixedFile).toBeDefined();

    // All line endings should be normalized
    expect(mixedFile.content.match(/\r\n/g)).toBeNull();
    expect(mixedFile.content.match(/\r(?!\n)/g)).toBeNull();
    expect(mixedFile.content.match(/\n/g).length).toBe(3); // 3 normalized line endings
  });

  it("should handle error cases gracefully", async () => {
    // Mock file system to inject errors
    const restore = injectErrors({
      readErrors: [path.join(customFixtureDir, "error-case.js")],
    });

    try {
      const config = {
        outputFormat: "json",
        includePatterns: ["**/*.js"],
        continueOnError: true,
      };

      const result = await processDirectory(customFixtureDir, config);
      const parsed = JSON.parse(result);

      // The processor should continue and include other files
      expect(parsed.length).toBeGreaterThan(0);
      expect(parsed.every((file) => file.path !== "error-case.js")).toBe(true);
    } finally {
      restore();
    }
  });

  it("should throw an error when continueOnError is false", async () => {
    // Mock file system to inject errors
    const restore = injectErrors({
      readErrors: [path.join(customFixtureDir, "error-case.js")],
    });

    try {
      const config = {
        outputFormat: "json",
        includePatterns: ["error-case.js"],
        continueOnError: false,
      };

      await expect(
        processDirectory(customFixtureDir, config),
      ).rejects.toThrow();
    } finally {
      restore();
    }
  });

  it("should test with mocked file system", async () => {
    const mockFiles = {
      [path.join(customFixtureDir, "mock-file.js")]:
        'console.log("Mocked content");',
      [path.join(customFixtureDir, "another-mock.js")]: "const x = 42;",
    };

    const restore = mockFileSystem(mockFiles);

    try {
      const config = {
        outputFormat: "json",
        includePatterns: ["mock-file.js", "another-mock.js"],
      };

      const result = await processDirectory(customFixtureDir, config);
      const parsed = JSON.parse(result);

      expect(parsed.length).toBe(2);
      expect(parsed.some((file) => file.path === "mock-file.js")).toBe(true);
      expect(parsed.some((file) => file.path === "another-mock.js")).toBe(true);
      expect(parsed.find((f) => f.path === "mock-file.js").content).toBe(
        'console.log("Mocked content");',
      );
    } finally {
      restore();
    }
  });

  it("should compute file hashes when configured", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["special-file.js"],
      includeFileHash: true,
      hashAlgorithm: "md5",
    };

    const result = await processDirectory(customFixtureDir, config);
    const parsed = JSON.parse(result);

    const file = parsed.find((f) => f.path === "special-file.js");
    expect(file).toBeDefined();
    expect(file.hash).toBeDefined();

    // Verify hash is correct
    const expectedHash = await calculateFileHash(
      path.join(customFixtureDir, "special-file.js"),
      "md5",
    );
    expect(file.hash).toBe(expectedHash);
  });
});
