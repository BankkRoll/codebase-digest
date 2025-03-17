import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createCustomFixture,
  createTestConfig,
  mockFileSystem,
  setupTestEnvironment,
} from "../helper.js";

import fs from "fs/promises";
import path from "path";
import { processDirectory } from "../../src/core/processor.js";

describe("Configuration Options E2E", () => {
  const { setup, teardown } = setupTestEnvironment();
  let testDir;

  beforeAll(async () => {
    await setup();

    // Create a rich test project with various file types
    testDir = await createCustomFixture("config-test-project", {
      "src/index.js": "javascript",
      "src/components/Button.js": "javascript",
      "src/utils/helpers.js": "javascript",
      "src/styles/main.css": "css",
      "public/index.html": "html",
      "tests/index.test.js": "javascript",
      "docs/README.md": "markdown",
      "docs/API.md": "markdown",
      "assets/logo.bin": "binary",
      "data/users.csv": "csv",
      "data/config.xml": "xml",
      ".env": "DATABASE_URL=postgresql://localhost:5432/mydb",
      ".gitignore": "node_modules\ndist\n.env\n*.log",
      "node_modules/lodash/index.js": "javascript",
      "dist/bundle.js": "javascript",
      "logs/app.log": "text",
    });

    // Create a config file
    await createTestConfig(path.join(testDir, "digest-config.json"), {
      includePatterns: ["src/**/*.js", "docs/**/*.md"],
      excludePatterns: ["**/node_modules/**"],
      respectGitignore: true,
      outputFormat: "json",
    });
  });

  afterAll(async () => {
    await teardown();
  });

  it("should respect include patterns", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["src/**/*.js"],
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.length).toBe(3);
    expect(
      parsed.every(
        (file) => file.path.startsWith("src/") && file.path.endsWith(".js"),
      ),
    ).toBe(true);
    expect(parsed.map((file) => file.path)).toContain("src/index.js");
    expect(parsed.map((file) => file.path)).toContain(
      "src/components/Button.js",
    );
    expect(parsed.map((file) => file.path)).toContain("src/utils/helpers.js");
  });

  it("should respect multiple include patterns", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["src/**/*.js", "docs/**/*.md"],
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.length).toBe(5);

    // Should include JS files from src
    expect(parsed.some((file) => file.path === "src/index.js")).toBe(true);
    expect(
      parsed.some((file) => file.path === "src/components/Button.js"),
    ).toBe(true);
    expect(parsed.some((file) => file.path === "src/utils/helpers.js")).toBe(
      true,
    );

    // Should include MD files from docs
    expect(parsed.some((file) => file.path === "docs/README.md")).toBe(true);
    expect(parsed.some((file) => file.path === "docs/API.md")).toBe(true);
  });

  it("should respect exclude patterns", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*.js"],
      excludePatterns: ["tests/**/*.js"],
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    // Should include JS files except those in tests directory
    expect(parsed.every((file) => !file.path.startsWith("tests/"))).toBe(true);
    expect(parsed.some((file) => file.path === "src/index.js")).toBe(true);
  });

  it("should respect gitignore when configured", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["**/*.js", "**/*.log"],
      respectGitignore: true,
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    // Should not include files mentioned in .gitignore
    expect(parsed.every((file) => !file.path.startsWith("node_modules/"))).toBe(
      true,
    );
    expect(parsed.every((file) => !file.path.startsWith("dist/"))).toBe(true);
    expect(parsed.every((file) => !file.path.endsWith(".log"))).toBe(true);

    // Should include other JS files
    expect(parsed.some((file) => file.path === "src/index.js")).toBe(true);
  });

  it("should handle binary files according to configuration", async () => {
    // Test skipping binary files
    const skipConfig = {
      outputFormat: "json",
      includePatterns: ["assets/**/*"],
      binaryFilesAction: "skip",
    };

    let result = await processDirectory(testDir, skipConfig);
    let parsed = JSON.parse(result);
    expect(parsed.length).toBe(0); // Should skip the binary file

    // Test including binary files as base64
    const includeConfig = {
      outputFormat: "json",
      includePatterns: ["assets/**/*"],
      binaryFilesAction: "include",
      binaryEncoding: "base64",
    };

    result = await processDirectory(testDir, includeConfig);
    parsed = JSON.parse(result);
    expect(parsed.length).toBe(1);
    expect(parsed[0].path).toBe("assets/logo.bin");
    expect(parsed[0].isBinary).toBe(true);
    expect(parsed[0].encoding).toBe("base64");
  });

  it("should generate hexdump for binary files when configured", async () => {
    const config = {
      outputFormat: "json",
      includePatterns: ["assets/**/*"],
      binaryFilesAction: "hexdump",
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.length).toBe(1);
    expect(parsed[0].path).toBe("assets/logo.bin");
    expect(parsed[0].isBinary).toBe(true);
    expect(parsed[0].content).toContain("00000000"); // Offset
    expect(parsed[0].content).toMatch(/[0-9A-F]{2}/); // Hex values
  });

  it("should respect maximum file size", async () => {
    // Mock a very large file
    const mockLargeFile = {
      [path.join(testDir, "large-file.js")]: "x".repeat(1024 * 1024), // 1MB
    };

    const restore = mockFileSystem(mockLargeFile);

    try {
      // Test with small max size
      const smallConfig = {
        outputFormat: "json",
        includePatterns: ["large-file.js"],
        maxFileSizeKB: 10, // 10KB
      };

      let result = await processDirectory(testDir, smallConfig);
      let parsed = JSON.parse(result);
      expect(parsed.length).toBe(0); // Should skip the large file

      // Test with large max size
      const largeConfig = {
        outputFormat: "json",
        includePatterns: ["large-file.js"],
        maxFileSizeKB: 2000, // 2MB
      };

      result = await processDirectory(testDir, largeConfig);
      parsed = JSON.parse(result);
      expect(parsed.length).toBe(1); // Should include the large file
    } finally {
      restore();
    }
  });

  it("should load configuration from file", async () => {
    // Use the config file we created
    const config = {
      configFile: path.join(testDir, "digest-config.json"),
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    // Should respect the config file settings
    expect(parsed.length).toBe(5);
    expect(
      parsed.every(
        (file) =>
          (file.path.startsWith("src/") && file.path.endsWith(".js")) ||
          (file.path.startsWith("docs/") && file.path.endsWith(".md")),
      ),
    ).toBe(true);

    // Should not include node_modules files (from gitignore)
    expect(parsed.every((file) => !file.path.includes("node_modules"))).toBe(
      true,
    );
  });

  it("should combine config file with command line options", async () => {
    // Use the config file but override some options
    const config = {
      configFile: path.join(testDir, "digest-config.json"),
      excludePatterns: ["docs/**/*.md"], // Override to exclude docs
      outputFormat: "markdown", // Override output format
    };

    const result = await processDirectory(testDir, config);

    // Result should be in markdown format now
    expect(result).toContain("# Code Digest");
    expect(result).toContain("```javascript");

    // Should only include src JS files, not docs MD files
    expect(result).toContain("## src/index.js");
    expect(result).not.toContain("## docs/README.md");
  });

  it("should handle file encoding detection", async () => {
    // Create files with different encodings
    await fs.writeFile(
      path.join(testDir, "utf8-file.txt"),
      "UTF-8 text with special chars: é ñ ç",
      "utf8",
    );

    const config = {
      outputFormat: "json",
      includePatterns: ["**/*.txt"],
      detectFileEncoding: true,
    };

    const result = await processDirectory(testDir, config);
    const parsed = JSON.parse(result);

    expect(parsed.length).toBe(1);
    expect(parsed[0].path).toBe("utf8-file.txt");
    expect(parsed[0].encoding).toBe("utf8");
    expect(parsed[0].content).toContain("special chars");
  });
});
