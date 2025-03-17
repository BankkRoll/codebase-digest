import { createReadStream, createWriteStream, existsSync } from "fs";

import { createGzip } from "zlib";
import crypto from "crypto";
import { exec } from "child_process";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { pipeline } from "stream/promises";
import { promisify } from "util";
import { vi } from "vitest";

// Promisified functions
const execAsync = promisify(exec);

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(PROJECT_ROOT, "src");
const TEST_FIXTURES_DIR = path.join(__dirname, "fixtures");
const SNAPSHOTS_DIR = path.join(__dirname, "snapshots");
const TEMP_DIR = path.join(os.tmpdir(), "codebase-digest-tests");

// File type templates
const FILE_TEMPLATES = {
  javascript:
    'console.log("Hello, world!");\n\nfunction example() {\n  return 42;\n}\n\nexport default example;',
  typescript:
    "interface Example {\n  value: number;\n}\n\nconst data: Example = {\n  value: 42\n};\n\nexport default data;",
  markdown:
    '# Test Project\n\n## Overview\n\nThis is a test project for codebase-digest.\n\n- Item 1\n- Item 2\n\n```javascript\nconsole.log("Code block");\n```',
  html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>Test</title>\n</head>\n<body>\n  <h1>Test Page</h1>\n  <p>This is a test page.</p>\n</body>\n</html>",
  css: "body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}",
  json: '{\n  "name": "test-project",\n  "version": "1.0.0",\n  "description": "Test project for codebase-digest",\n  "main": "index.js",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  },\n  "keywords": [],\n  "author": "",\n  "license": "MIT"\n}',
  yaml: "name: test-project\nversion: 1.0.0\ndescription: Test project for codebase-digest\ndependencies:\n  - lodash\n  - express\n",
  binary: Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]),
  text: "This is a plain text file.\nIt has multiple lines.\nIt is used for testing codebase-digest.",
  python:
    'def hello():\n    print("Hello, world!")\n\nif __name__ == "__main__":\n    hello()',
  ruby: 'def hello\n  puts "Hello, world!"\nend\n\nhello if __FILE__ == $0',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("Hello, world!")\n}',
  rust: 'fn main() {\n    println!("Hello, world!");\n}',
  java: 'public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println("Hello, world!");\n    }\n}',
  php: '<?php\necho "Hello, world!";\n?>',
  sql: 'CREATE TABLE users (\n  id INTEGER PRIMARY KEY,\n  name TEXT NOT NULL,\n  email TEXT NOT NULL UNIQUE\n);\n\nINSERT INTO users (name, email) VALUES ("Test User", "test@example.com");',
  gitignore: "node_modules\n.DS_Store\n*.log\ndist\ncoverage\n.env",
  dockerfile:
    'FROM node:16-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nCMD ["node", "index.js"]',
  shell: '#!/bin/bash\necho "Hello, world!"\nexit 0',
  xml: '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item id="1">\n    <name>Test Item</name>\n    <value>42</value>\n  </item>\n</root>',
  csv: "id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com\n3,Bob Johnson,bob@example.com",
};

// File extensions map
const EXTENSION_MAP = {
  javascript: ".js",
  typescript: ".ts",
  markdown: ".md",
  html: ".html",
  css: ".css",
  json: ".json",
  yaml: ".yml",
  binary: ".bin",
  text: ".txt",
  python: ".py",
  ruby: ".rb",
  go: ".go",
  rust: ".rs",
  java: ".java",
  php: ".php",
  sql: ".sql",
  gitignore: "",
  dockerfile: "",
  shell: ".sh",
  xml: ".xml",
  csv: ".csv",
};

// Project templates
const PROJECT_TEMPLATES = {
  basic: {
    "README.md": "markdown",
    "package.json": "json",
    "src/index.js": "javascript",
    "src/utils/helper.js": "javascript",
  },
  fullstack: {
    "README.md": "markdown",
    "package.json": "json",
    ".gitignore": "gitignore",
    "src/index.js": "javascript",
    "src/utils/helper.js": "javascript",
    "src/components/Button.js": "javascript",
    "src/styles/main.css": "css",
    "public/index.html": "html",
    "tests/index.test.js": "javascript",
    "docs/api.md": "markdown",
    "config.yml": "yaml",
  },
  multilanguage: {
    "README.md": "markdown",
    "package.json": "json",
    ".gitignore": "gitignore",
    "src/index.js": "javascript",
    "src/utils/helper.ts": "typescript",
    "src/styles/main.css": "css",
    "scripts/build.sh": "shell",
    "data/users.csv": "csv",
    "config.xml": "xml",
    Dockerfile: "dockerfile",
    "server/app.py": "python",
    "lib/helper.rb": "ruby",
    "cmd/main.go": "go",
  },
  withBinaries: {
    "README.md": "markdown",
    "src/index.js": "javascript",
    "assets/image.bin": "binary",
    "assets/data.bin": "binary",
    "docs/document.md": "markdown",
  },
  deepNested: {
    "README.md": "markdown",
    "src/index.js": "javascript",
    "src/components/ui/Button.js": "javascript",
    "src/components/ui/Input.js": "javascript",
    "src/components/layout/Header.js": "javascript",
    "src/components/layout/Footer.js": "javascript",
    "src/utils/helpers/string.js": "javascript",
    "src/utils/helpers/number.js": "javascript",
    "src/utils/helpers/date.js": "javascript",
    "src/utils/api/client.js": "javascript",
    "src/utils/api/endpoints/users.js": "javascript",
    "src/utils/api/endpoints/posts.js": "javascript",
  },
  withLargeFiles: {
    "README.md": "markdown",
    "src/index.js": "javascript",
    "data/large.json": "json", // Will be made large
    "data/huge.txt": "text", // Will be made huge
  },
};

/**
 * Get the absolute path to a source file
 * @param {string} relativePath - Path relative to src directory
 * @returns {string} Absolute path
 */
export function getSrcPath(relativePath) {
  return path.join(SRC_DIR, relativePath);
}

/**
 * Get the absolute path to the project root
 * @returns {string} Absolute path to project root
 */
export function getProjectRoot() {
  return PROJECT_ROOT;
}

/**
 * Create a directory if it doesn't exist
 * @param {string} dirPath - Path to the directory
 * @returns {Promise<void>}
 */
async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

/**
 * Generate a large file with repeated content
 * @param {string} filePath - Path to the file
 * @param {string|Buffer} content - Content to repeat
 * @param {number} sizeInMB - Desired file size in MB
 * @returns {Promise<void>}
 */
async function generateLargeFile(filePath, content, sizeInMB) {
  const contentBuffer = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content);
  const targetSize = sizeInMB * 1024 * 1024;
  const repeats = Math.ceil(targetSize / contentBuffer.length);

  const writeStream = createWriteStream(filePath);

  for (let i = 0; i < repeats; i++) {
    if (!writeStream.write(contentBuffer)) {
      // Wait for drain event if buffer is full
      await new Promise((resolve) => writeStream.once("drain", resolve));
    }
  }

  writeStream.end();

  return new Promise((resolve, reject) => {
    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });
}

/**
 * Create a test fixture directory with a specific project template
 * @param {string} fixtureName - Name of the fixture directory
 * @param {string} templateName - Name of the project template
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Path to the fixture directory
 */
export async function createFixture(
  fixtureName,
  templateName = "basic",
  options = {},
) {
  const fixtureDir = path.join(TEST_FIXTURES_DIR, fixtureName);

  // Create fixture directory
  await ensureDir(fixtureDir);

  const template = PROJECT_TEMPLATES[templateName] || PROJECT_TEMPLATES.basic;

  // Create files according to template
  for (const [filePath, fileType] of Object.entries(template)) {
    const fullPath = path.join(fixtureDir, filePath);
    const dirName = path.dirname(fullPath);

    await ensureDir(dirName);

    const content = FILE_TEMPLATES[fileType];

    if (Buffer.isBuffer(content)) {
      await fs.writeFile(fullPath, content);
    } else {
      await fs.writeFile(fullPath, content, "utf8");
    }
  }

  // Handle special cases for large files
  if (templateName === "withLargeFiles") {
    await generateLargeFile(
      path.join(fixtureDir, "data/large.json"),
      FILE_TEMPLATES.json,
      options.largeSizeMB || 1,
    );

    await generateLargeFile(
      path.join(fixtureDir, "data/huge.txt"),
      FILE_TEMPLATES.text,
      options.hugeSizeMB || 5,
    );
  }

  return fixtureDir;
}

/**
 * Create a custom fixture with specified files
 * @param {string} fixtureName - Name of the fixture directory
 * @param {Object} files - Map of file paths to file types or content
 * @returns {Promise<string>} Path to the fixture directory
 */
export async function createCustomFixture(fixtureName, files) {
  const fixtureDir = path.join(TEST_FIXTURES_DIR, fixtureName);

  // Create fixture directory
  await ensureDir(fixtureDir);

  // Create files
  for (const [filePath, fileTypeOrContent] of Object.entries(files)) {
    const fullPath = path.join(fixtureDir, filePath);
    const dirName = path.dirname(fullPath);

    await ensureDir(dirName);

    if (typeof fileTypeOrContent === "string") {
      if (FILE_TEMPLATES[fileTypeOrContent]) {
        // It's a file type
        const content = FILE_TEMPLATES[fileTypeOrContent];
        if (Buffer.isBuffer(content)) {
          await fs.writeFile(fullPath, content);
        } else {
          await fs.writeFile(fullPath, content, "utf8");
        }
      } else {
        // It's direct content
        await fs.writeFile(fullPath, fileTypeOrContent, "utf8");
      }
    } else if (Buffer.isBuffer(fileTypeOrContent)) {
      // It's binary content
      await fs.writeFile(fullPath, fileTypeOrContent);
    } else if (typeof fileTypeOrContent === "object") {
      // It's JSON content
      await fs.writeFile(
        fullPath,
        JSON.stringify(fileTypeOrContent, null, 2),
        "utf8",
      );
    }
  }

  return fixtureDir;
}

/**
 * Clean up a test fixture
 * @param {string} fixtureName - Name of the fixture directory
 */
export async function cleanFixture(fixtureName) {
  const fixtureDir = path.join(TEST_FIXTURES_DIR, fixtureName);
  if (existsSync(fixtureDir)) {
    await fs.rm(fixtureDir, { recursive: true, force: true });
  }
}

/**
 * Clean up all test fixtures
 */
export async function cleanAllFixtures() {
  if (existsSync(TEST_FIXTURES_DIR)) {
    await fs.rm(TEST_FIXTURES_DIR, { recursive: true, force: true });
  }
}

/**
 * Use the actual codebase as a test fixture
 * @returns {string} Path to the project root
 */
export function useCodebaseAsFixture() {
  return PROJECT_ROOT;
}

/**
 * Get the CLI path
 * @returns {string} Path to the CLI entry point
 */
export function getCliPath() {
  return path.join(PROJECT_ROOT, "src", "index.js");
}

/**
 * Run the CLI with specified arguments
 * @param {string[]} args - CLI arguments
 * @param {Object} options - Options for exec
 * @returns {Promise<{stdout: string, stderr: string}>} CLI output
 */
export async function runCli(args, options = {}) {
  const cliPath = getCliPath();
  const command = `node ${cliPath} ${args.join(" ")}`;
  return execAsync(command, options);
}

/**
 * Create a temporary directory for tests
 * @param {string} name - Name of the temporary directory
 * @returns {Promise<string>} Path to the temporary directory
 */
export async function createTempDir(name) {
  const tempDir = path.join(TEMP_DIR, name);
  await ensureDir(tempDir);
  return tempDir;
}

/**
 * Clean up a temporary directory
 * @param {string} name - Name of the temporary directory
 */
export async function cleanTempDir(name) {
  const tempDir = path.join(TEMP_DIR, name);
  if (existsSync(tempDir)) {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

/**
 * Clean up all temporary directories
 */
export async function cleanAllTempDirs() {
  if (existsSync(TEMP_DIR)) {
    await fs.rm(TEMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Compress a file using gzip
 * @param {string} inputPath - Path to the input file
 * @param {string} outputPath - Path to the output file
 * @returns {Promise<void>}
 */
export async function compressFile(inputPath, outputPath) {
  const readStream = createReadStream(inputPath);
  const writeStream = createWriteStream(outputPath);
  const gzip = createGzip();

  await pipeline(readStream, gzip, writeStream);
}

/**
 * Calculate the hash of a file
 * @param {string} filePath - Path to the file
 * @param {string} algorithm - Hash algorithm (md5, sha1, sha256, etc.)
 * @returns {Promise<string>} File hash
 */
export async function calculateFileHash(filePath, algorithm = "md5") {
  const content = await fs.readFile(filePath);
  const hash = crypto.createHash(algorithm);
  hash.update(content);
  return hash.digest("hex");
}

/**
 * Create a snapshot of test output
 * @param {string} snapshotName - Name of the snapshot
 * @param {string|Object} content - Content to save
 * @returns {Promise<string>} Path to the snapshot file
 */
export async function createSnapshot(snapshotName, content) {
  await ensureDir(SNAPSHOTS_DIR);

  const snapshotPath = path.join(SNAPSHOTS_DIR, `${snapshotName}.snap`);
  const contentToSave =
    typeof content === "string" ? content : JSON.stringify(content, null, 2);

  await fs.writeFile(snapshotPath, contentToSave, "utf8");

  return snapshotPath;
}

/**
 * Compare output with a snapshot
 * @param {string} snapshotName - Name of the snapshot
 * @param {string|Object} content - Content to compare
 * @returns {Promise<boolean>} True if the content matches the snapshot
 */
export async function compareWithSnapshot(snapshotName, content) {
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${snapshotName}.snap`);

  if (!existsSync(snapshotPath)) {
    return false;
  }

  const snapshotContent = await fs.readFile(snapshotPath, "utf8");
  const contentToCompare =
    typeof content === "string" ? content : JSON.stringify(content, null, 2);

  return snapshotContent === contentToCompare;
}

/**
 * Update a snapshot with new content
 * @param {string} snapshotName - Name of the snapshot
 * @param {string|Object} content - New content
 * @returns {Promise<string>} Path to the updated snapshot file
 */
export async function updateSnapshot(snapshotName, content) {
  return createSnapshot(snapshotName, content);
}

/**
 * Mock file system operations for testing
 * @param {Object} mocks - Map of file paths to mock content
 * @returns {Function} Function to restore original behavior
 */
export function mockFileSystem(mocks) {
  const originalReadFile = fs.readFile;
  const originalWriteFile = fs.writeFile;
  const originalStat = fs.stat;
  const originalExists = existsSync;

  // Mock readFile
  vi.spyOn(fs, "readFile").mockImplementation(async (filePath, options) => {
    const normalizedPath = path.normalize(filePath.toString());

    if (normalizedPath in mocks) {
      const content = mocks[normalizedPath];
      if (Buffer.isBuffer(content)) {
        return content;
      }
      if (typeof content === "string") {
        return Buffer.from(content);
      }
      return Buffer.from(JSON.stringify(content));
    }

    return originalReadFile(filePath, options);
  });

  // Mock writeFile (just pass through)
  vi.spyOn(fs, "writeFile").mockImplementation(
    async (filePath, data, options) => {
      return originalWriteFile(filePath, data, options);
    },
  );

  // Mock stat
  vi.spyOn(fs, "stat").mockImplementation(async (filePath) => {
    const normalizedPath = path.normalize(filePath.toString());

    if (normalizedPath in mocks) {
      const content = mocks[normalizedPath];
      const size = Buffer.isBuffer(content)
        ? content.length
        : Buffer.from(
            typeof content === "string" ? content : JSON.stringify(content),
          ).length;

      return {
        isFile: () => true,
        isDirectory: () => false,
        size,
        mtime: new Date(),
        birthtime: new Date(),
      };
    }

    return originalStat(filePath);
  });

  // Mock existsSync
  vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
    const normalizedPath = path.normalize(filePath.toString());

    if (normalizedPath in mocks) {
      return true;
    }

    return originalExists(filePath);
  });

  // Return function to restore original behavior
  return () => {
    vi.restoreAllMocks();
  };
}

/**
 * Inject errors for testing error handling
 * @param {Object} errorConfig - Configuration for error injection
 * @returns {Function} Function to restore original behavior
 */
export function injectErrors(errorConfig) {
  const originalReadFile = fs.readFile;
  const originalWriteFile = fs.writeFile;
  const originalStat = fs.stat;

  // Mock readFile to inject errors
  vi.spyOn(fs, "readFile").mockImplementation(async (filePath, options) => {
    const normalizedPath = path.normalize(filePath.toString());

    if (
      errorConfig.readErrors &&
      errorConfig.readErrors.includes(normalizedPath)
    ) {
      throw new Error(`Mock read error for ${normalizedPath}`);
    }

    return originalReadFile(filePath, options);
  });

  // Mock writeFile to inject errors
  vi.spyOn(fs, "writeFile").mockImplementation(
    async (filePath, data, options) => {
      const normalizedPath = path.normalize(filePath.toString());

      if (
        errorConfig.writeErrors &&
        errorConfig.writeErrors.includes(normalizedPath)
      ) {
        throw new Error(`Mock write error for ${normalizedPath}`);
      }

      return originalWriteFile(filePath, data, options);
    },
  );

  // Mock stat to inject errors
  vi.spyOn(fs, "stat").mockImplementation(async (filePath) => {
    const normalizedPath = path.normalize(filePath.toString());

    if (
      errorConfig.statErrors &&
      errorConfig.statErrors.includes(normalizedPath)
    ) {
      throw new Error(`Mock stat error for ${normalizedPath}`);
    }

    return originalStat(filePath);
  });

  // Return function to restore original behavior
  return () => {
    vi.restoreAllMocks();
  };
}

/**
 * Measure the performance of a function
 * @param {Function} fn - Function to measure
 * @param {any[]} args - Arguments to pass to the function
 * @returns {Promise<{result: any, duration: number}>} Result and duration in milliseconds
 */
export async function measurePerformance(fn, ...args) {
  const start = process.hrtime.bigint();
  const result = await fn(...args);
  const end = process.hrtime.bigint();
  const duration = Number(end - start) / 1_000_000; // Convert to milliseconds

  return { result, duration };
}

/**
 * Parse and validate JSON output
 * @param {string} jsonString - JSON string to parse
 * @param {Object} schema - Schema to validate against
 * @returns {Object} Parsed JSON
 */
export function parseAndValidateJSON(jsonString, schema = null) {
  try {
    const parsed = JSON.parse(jsonString);

    if (schema) {
      // Simple schema validation
      for (const [key, type] of Object.entries(schema)) {
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            validateProperty(item, key, type);
          }
        } else {
          validateProperty(parsed, key, type);
        }
      }
    }

    return parsed;
  } catch (error) {
    throw new Error(`JSON parsing error: ${error.message}`);
  }
}

/**
 * Validate a property against a type
 * @param {Object} obj - Object to validate
 * @param {string} key - Property key
 * @param {string} type - Expected type
 */
function validateProperty(obj, key, type) {
  if (!(key in obj)) {
    throw new Error(`Missing property: ${key}`);
  }

  const value = obj[key];

  if (type === "string" && typeof value !== "string") {
    throw new Error(`Property ${key} should be a string, got ${typeof value}`);
  }

  if (type === "number" && typeof value !== "number") {
    throw new Error(`Property ${key} should be a number, got ${typeof value}`);
  }

  if (type === "boolean" && typeof value !== "boolean") {
    throw new Error(`Property ${key} should be a boolean, got ${typeof value}`);
  }

  if (type === "array" && !Array.isArray(value)) {
    throw new Error(`Property ${key} should be an array, got ${typeof value}`);
  }

  if (
    type === "object" &&
    (typeof value !== "object" || value === null || Array.isArray(value))
  ) {
    throw new Error(`Property ${key} should be an object, got ${typeof value}`);
  }
}

/**
 * Create a file with specific encoding
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} encoding - File encoding
 * @returns {Promise<void>}
 */
export async function createFileWithEncoding(filePath, content, encoding) {
  const buffer = Buffer.from(content);

  if (encoding === "utf8" || encoding === "utf-8") {
    await fs.writeFile(filePath, buffer);
  } else if (encoding === "utf16le" || encoding === "utf-16le") {
    const utf16Buffer = Buffer.from(content, "utf16le");
    await fs.writeFile(filePath, utf16Buffer);
  } else if (encoding === "latin1" || encoding === "iso-8859-1") {
    const latin1Buffer = Buffer.from(content, "latin1");
    await fs.writeFile(filePath, latin1Buffer);
  } else if (encoding === "base64") {
    const base64Buffer = Buffer.from(content, "base64");
    await fs.writeFile(filePath, base64Buffer);
  } else {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }
}

/**
 * Create a file with BOM (Byte Order Mark)
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} encoding - File encoding (utf8, utf16le)
 * @returns {Promise<void>}
 */
export async function createFileWithBOM(filePath, content, encoding = "utf8") {
  let bomBuffer;
  let contentBuffer;

  if (encoding === "utf8" || encoding === "utf-8") {
    bomBuffer = Buffer.from([0xef, 0xbb, 0xbf]);
    contentBuffer = Buffer.from(content, "utf8");
  } else if (encoding === "utf16le" || encoding === "utf-16le") {
    bomBuffer = Buffer.from([0xff, 0xfe]);
    contentBuffer = Buffer.from(content, "utf16le");
  } else {
    throw new Error(`Unsupported encoding for BOM: ${encoding}`);
  }

  const finalBuffer = Buffer.concat([bomBuffer, contentBuffer]);
  await fs.writeFile(filePath, finalBuffer);
}

/**
 * Create a symlink
 * @param {string} target - Target path
 * @param {string} linkPath - Link path
 * @returns {Promise<void>}
 */
export async function createSymlink(target, linkPath) {
  await fs.symlink(target, linkPath);
}

/**
 * Create a file with specific line endings
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} lineEnding - Line ending (lf, crlf, cr)
 * @returns {Promise<void>}
 */
export async function createFileWithLineEndings(filePath, content, lineEnding) {
  let normalizedContent;

  // First normalize to LF
  normalizedContent = content.replace(/\r\n|\r/g, "\n");

  // Then convert to the desired line ending
  if (lineEnding === "crlf") {
    normalizedContent = normalizedContent.replace(/\n/g, "\r\n");
  } else if (lineEnding === "cr") {
    normalizedContent = normalizedContent.replace(/\n/g, "\r");
  }
  // For 'lf', no conversion needed

  await fs.writeFile(filePath, normalizedContent);
}

/**
 * Create a file with mixed line endings
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
export async function createFileWithMixedLineEndings(filePath, content) {
  // Split into lines
  const lines = content.replace(/\r\n|\r/g, "\n").split("\n");

  // Mix line endings
  let mixedContent = "";
  for (let i = 0; i < lines.length; i++) {
    if (i % 3 === 0) {
      mixedContent += lines[i] + "\r\n"; // CRLF
    } else if (i % 3 === 1) {
      mixedContent += lines[i] + "\n"; // LF
    } else {
      mixedContent += lines[i] + "\r"; // CR
    }
  }

  await fs.writeFile(filePath, mixedContent);
}

/**
 * Create a file with specific indentation
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} indentType - Indentation type (spaces, tabs)
 * @param {number} indentSize - Indentation size (for spaces)
 * @returns {Promise<void>}
 */
export async function createFileWithIndentation(
  filePath,
  content,
  indentType,
  indentSize = 2,
) {
  // Split into lines
  const lines = content.replace(/\r\n|\r/g, "\n").split("\n");

  // Process each line
  const processedLines = lines.map((line) => {
    // Count leading spaces
    const match = line.match(/^(\s+)/);
    if (!match) return line;

    const leadingSpaces = match[1];
    const indentLevel = Math.floor(leadingSpaces.length / 2); // Assuming original is 2 spaces

    if (indentType === "tabs") {
      return "\t".repeat(indentLevel) + line.substring(leadingSpaces.length);
    } else {
      return (
        " ".repeat(indentLevel * indentSize) +
        line.substring(leadingSpaces.length)
      );
    }
  });

  await fs.writeFile(filePath, processedLines.join("\n"));
}

/**
 * Create a file with comments
 * @param {string} filePath - Path to the file
 * @param {string} content - File content
 * @param {string} fileType - File type (js, py, etc.)
 * @returns {Promise<void>}
 */
export async function createFileWithComments(filePath, content, fileType) {
  let commentedContent;

  if (fileType === "js" || fileType === "javascript") {
    commentedContent =
      `// This is a single-line comment\n` +
      `/* This is a\n` +
      ` * multi-line comment\n` +
      ` */\n` +
      content;
  } else if (fileType === "py" || fileType === "python") {
    commentedContent =
      `# This is a single-line comment\n` +
      `'''\n` +
      `This is a\n` +
      `multi-line comment\n` +
      `'''\n` +
      content;
  } else if (fileType === "html") {
    commentedContent = `<!-- This is an HTML comment -->\n` + content;
  } else if (fileType === "css") {
    commentedContent = `/* This is a CSS comment */\n` + content;
  } else {
    commentedContent = content;
  }

  await fs.writeFile(filePath, commentedContent);
}

/**
 * Create a test configuration file
 * @param {string} configPath - Path to the configuration file
 * @param {Object} config - Configuration object
 * @returns {Promise<void>}
 */
export async function createTestConfig(configPath, config) {
  await fs.writeFile(configPath, JSON.stringify(config, null, 2));
}

/**
 * Validate output format
 * @param {string} output - Output to validate
 * @param {string} format - Expected format (json, markdown, etc.)
 * @returns {boolean} True if the output is valid
 */
export function validateOutputFormat(output, format) {
  if (format === "json") {
    try {
      JSON.parse(output);
      return true;
    } catch (error) {
      return false;
    }
  } else if (format === "markdown") {
    // Simple markdown validation
    return output.includes("#") && !output.includes("<html>");
  } else if (format === "html") {
    // Simple HTML validation
    return output.includes("<html>") && output.includes("</html>");
  } else if (format === "xml") {
    // Simple XML validation
    return output.includes("<?xml") && output.includes("</");
  } else if (format === "csv") {
    // Simple CSV validation
    const lines = output.split("\n");
    if (lines.length < 2) return false;
    const headerCount = lines[0].split(",").length;
    return lines
      .slice(1)
      .every(
        (line) => line.trim() === "" || line.split(",").length === headerCount,
      );
  } else {
    // For text format, just return true
    return true;
  }
}

/**
 * Setup and teardown for tests
 * @returns {Object} Setup and teardown functions
 */
export function setupTestEnvironment() {
  return {
    setup: async () => {
      await ensureDir(TEST_FIXTURES_DIR);
      await ensureDir(SNAPSHOTS_DIR);
      await ensureDir(TEMP_DIR);
    },
    teardown: async () => {
      await cleanAllFixtures();
      await cleanAllTempDirs();
    },
  };
}

// Export all file templates and project templates for direct use
export { FILE_TEMPLATES, PROJECT_TEMPLATES, EXTENSION_MAP };
