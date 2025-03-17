import {
  PROJECT_TEMPLATES,
  cleanAllFixtures,
  compareWithSnapshot,
  createCustomFixture,
  createSnapshot,
  measurePerformance,
  parseAndValidateJSON,
  setupTestEnvironment,
  validateOutputFormat,
} from "../helper.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import fs from "fs/promises";
import path from "path";
import { processDirectory } from "../../src/core/processor.js";

describe("Output Formats E2E", () => {
  const { setup, teardown } = setupTestEnvironment();
  let testDir;

  beforeAll(async () => {
    await setup();

    // Create a rich test project with various file types and structures
    testDir = await createCustomFixture("output-formats-test", {
      "src/index.js":
        'import { helper } from "./utils/helper.js";\nimport { formatter } from "./utils/formatter.js";\n\nconsole.log(helper(formatter("world")));',
      "src/utils/helper.js":
        "export function helper(name) {\n  return `Hello, ${name}!`;\n}",
      "src/utils/formatter.js":
        "export function formatter(text) {\n  return text.charAt(0).toUpperCase() + text.slice(1);\n}",
      "src/styles/main.css":
        "body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}",
      "public/index.html":
        "<!DOCTYPE html>\n<html>\n<head>\n  <title>Test Project</title>\n</head>\n<body>\n  <h1>Test Project</h1>\n</body>\n</html>",
      "README.md":
        '# Test Project\n\nThis is a test project with multiple files and formats.\n\n## Features\n\n- Feature 1\n- Feature 2\n\n```javascript\nconsole.log("Example code");\n```',
      "data/config.json":
        '{\n  "name": "test-project",\n  "version": "1.0.0",\n  "description": "A test project"\n}',
      "data/users.csv":
        "id,name,email\n1,John Doe,john@example.com\n2,Jane Smith,jane@example.com",
      "data/settings.xml":
        '<?xml version="1.0" encoding="UTF-8"?>\n<settings>\n  <theme>dark</theme>\n  <language>en</language>\n</settings>',
    });
  });

  afterAll(async () => {
    await teardown();
    await cleanAllFixtures();
  });

  it("should generate text format correctly", async () => {
    const config = { outputFormat: "text" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`Text format generation took ${duration}ms`);

    // Validate basic content
    expect(result).toContain("File: src/index.js");
    expect(result).toContain("import { helper }");
    expect(result).toContain("File: README.md");
    expect(result).toContain("# Test Project");

    // Validate format
    expect(validateOutputFormat(result, "text")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("text-format-output", result);
    expect(await compareWithSnapshot("text-format-output", result)).toBe(true);
  });

  it("should generate text format with custom options", async () => {
    const config = {
      outputFormat: "text",
      includeLineNumbers: true,
      includeFileSeparator: true,
      includeFileHeader: true,
    };

    const result = await processDirectory(testDir, config);

    // Should include line numbers
    expect(result).toMatch(/1\s+import { helper }/);

    // Should include file separators
    expect(result).toContain("==========");

    // Should include file headers
    expect(result).toContain("File: src/index.js");
  });

  it("should generate markdown format correctly", async () => {
    const config = { outputFormat: "markdown" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`Markdown format generation took ${duration}ms`);

    // Validate basic structure
    expect(result).toContain("# Code Digest");
    expect(result).toContain("## src/index.js");
    expect(result).toContain("```javascript");
    expect(result).toContain("import { helper }");
    expect(result).toContain("```");

    // Validate format
    expect(validateOutputFormat(result, "markdown")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("markdown-format-output", result);
    expect(await compareWithSnapshot("markdown-format-output", result)).toBe(
      true,
    );
  });

  it("should generate markdown format with custom options", async () => {
    const config = {
      outputFormat: "markdown",
      title: "Custom Project Digest",
      includeFileMetadata: true,
      includeTableOfContents: true,
    };

    const result = await processDirectory(testDir, config);

    // Should use custom title
    expect(result).toContain("# Custom Project Digest");

    // Should include table of contents
    expect(result).toContain("## Table of Contents");
    expect(result).toContain("- [src/index.js](#srcindexjs)");

    // Should include file metadata
    expect(result).toMatch(/Size: \d+ bytes/);
    expect(result).toMatch(/Language: javascript/);
  });

  it("should generate JSON format correctly", async () => {
    const config = { outputFormat: "json" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`JSON format generation took ${duration}ms`);

    // Validate JSON structure
    const parsed = parseAndValidateJSON(result);

    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBe(9); // All files in the fixture

    // Check file properties
    const indexFile = parsed.find((file) => file.path === "src/index.js");
    expect(indexFile).toBeDefined();
    expect(indexFile.content).toContain("import { helper }");
    expect(indexFile.extension).toBe("js");

    // Validate format
    expect(validateOutputFormat(result, "json")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("json-format-output", parsed);
    expect(await compareWithSnapshot("json-format-output", parsed)).toBe(true);
  });

  it("should generate JSON format with custom options", async () => {
    const config = {
      outputFormat: "json",
      includeFileMetadata: true,
      includeContent: false,
      prettyPrint: false,
    };

    const result = await processDirectory(testDir, config);

    // Should be valid JSON even when not pretty printed
    const parsed = parseAndValidateJSON(result);

    // Should include metadata
    expect(parsed[0].size).toBeDefined();
    expect(parsed[0].modified).toBeDefined();

    // Should not include content
    expect(parsed[0].content).toBeUndefined();
  });

  it("should generate HTML format correctly", async () => {
    const config = { outputFormat: "html" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`HTML format generation took ${duration}ms`);

    // Validate HTML structure
    expect(result).toContain("<!DOCTYPE html>");
    expect(result).toContain("<html");
    expect(result).toContain("<body");
    expect(result).toContain("<h1>Code Digest</h1>");
    expect(result).toContain("<h2>src/index.js</h2>");
    expect(result).toContain("<pre");
    expect(result).toContain("</html>");

    // Validate format
    expect(validateOutputFormat(result, "html")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("html-format-output", result);
    expect(await compareWithSnapshot("html-format-output", result)).toBe(true);
  });

  it("should generate HTML format with syntax highlighting", async () => {
    const config = {
      outputFormat: "html",
      includeSyntaxHighlighting: true,
      includeFileMetadata: true,
      includeTableOfContents: true,
    };

    const result = await processDirectory(testDir, config);

    // Should include syntax highlighting classes
    expect(result).toContain('class="language-javascript"');
    expect(result).toContain('class="language-css"');
    expect(result).toContain('class="language-markdown"');

    // Should include table of contents
    expect(result).toContain("<h2>Table of Contents</h2>");
    expect(result).toContain("<ul>");
    expect(result).toContain('<a href="#');

    // Should include file metadata
    expect(result).toContain('<div class="file-metadata">');
    expect(result).toMatch(/Size: \d+ bytes/);
  });

  it("should generate CSV format correctly", async () => {
    const config = { outputFormat: "csv" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`CSV format generation took ${duration}ms`);

    // Validate CSV structure
    const lines = result.split("\n");
    expect(lines[0]).toBe("path,content");
    expect(lines.length).toBeGreaterThan(9); // Header + all files

    // Check content is properly escaped
    expect(result).toContain('"import { helper }');

    // Validate format
    expect(validateOutputFormat(result, "csv")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("csv-format-output", result);
    expect(await compareWithSnapshot("csv-format-output", result)).toBe(true);
  });

  it("should generate CSV format with metadata columns", async () => {
    const config = {
      outputFormat: "csv",
      includeFileMetadata: true,
    };

    const result = await processDirectory(testDir, config);

    // Should include metadata columns
    const header = result.split("\n")[0];
    expect(header).toContain("path,size,modified,extension,language,content");
  });

  it("should generate XML format correctly", async () => {
    const config = { outputFormat: "xml" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      testDir,
      config,
    );

    console.log(`XML format generation took ${duration}ms`);

    // Validate XML structure
    expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(result).toContain("<codebase>");
    expect(result).toContain('<file path="src/index.js">');
    expect(result).toContain("<content><![CDATA[");
    expect(result).toContain("import { helper }");
    expect(result).toContain("]]></content>");
    expect(result).toContain("</file>");
    expect(result).toContain("</codebase>");

    // Validate format
    expect(validateOutputFormat(result, "xml")).toBe(true);

    // Create and compare with snapshot
    const snapshotPath = await createSnapshot("xml-format-output", result);
    expect(await compareWithSnapshot("xml-format-output", result)).toBe(true);
  });

  it("should generate XML format with metadata attributes", async () => {
    const config = {
      outputFormat: "xml",
      includeFileMetadata: true,
    };

    const result = await processDirectory(testDir, config);

    // Should include metadata attributes
    expect(result).toMatch(/size="\d+"/);
    expect(result).toMatch(/extension="js"/);
    expect(result).toMatch(/language="javascript"/);
  });

  it("should handle invalid output format gracefully", async () => {
    const config = { outputFormat: "invalid-format" };

    // Should throw an error for invalid format
    await expect(processDirectory(testDir, config)).rejects.toThrow();
  });

  it("should filter files by pattern for all formats", async () => {
    const formats = ["text", "markdown", "json", "html", "csv", "xml"];

    for (const format of formats) {
      const config = {
        outputFormat: format,
        includePatterns: ["src/**/*.js"],
      };

      const result = await processDirectory(testDir, config);

      // For JSON, we can directly check the files
      if (format === "json") {
        const parsed = JSON.parse(result);
        expect(parsed.length).toBe(3); // Only the 3 JS files
        expect(parsed.every((file) => file.path.endsWith(".js"))).toBe(true);
      } else {
        // For other formats, check that JS files are included
        expect(result).toContain("src/index.js");
        expect(result).toContain("src/utils/helper.js");
        expect(result).toContain("src/utils/formatter.js");

        // And other files are excluded
        expect(result).not.toContain("README.md");
        expect(result).not.toContain("data/config.json");
      }
    }
  });

  it("should handle large projects efficiently", async () => {
    // Create a large project with many files
    const largeProjectDir = await createCustomFixture("large-project-test", {});

    // Add 100 JavaScript files
    for (let i = 0; i < 100; i++) {
      const content = `// File ${i}\nexport function func${i}() {\n  return ${i};\n}`;
      await fs.writeFile(path.join(largeProjectDir, `file${i}.js`), content);
    }

    const config = { outputFormat: "json" };

    const { result, duration } = await measurePerformance(
      processDirectory,
      largeProjectDir,
      config,
    );

    console.log(`Processing large project took ${duration}ms`);

    const parsed = JSON.parse(result);
    expect(parsed.length).toBe(100);

    // Performance should be reasonable (adjust threshold as needed)
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });

  it("should handle all file types correctly in all formats", async () => {
    const formats = ["text", "markdown", "json", "html", "csv", "xml"];

    for (const format of formats) {
      const config = { outputFormat: format };

      const result = await processDirectory(testDir, config);

      // Check that all file types are handled correctly
      if (format === "json") {
        const parsed = JSON.parse(result);

        // Check all file extensions are present
        const extensions = parsed.map((file) => path.extname(file.path));
        expect(extensions).toContain(".js");
        expect(extensions).toContain(".md");
        expect(extensions).toContain(".html");
        expect(extensions).toContain(".css");
        expect(extensions).toContain(".json");
        expect(extensions).toContain(".csv");
        expect(extensions).toContain(".xml");
      } else {
        // For other formats, check that different file types are included
        expect(result).toContain("src/index.js");
        expect(result).toContain("README.md");
        expect(result).toContain("public/index.html");
        expect(result).toContain("src/styles/main.css");
        expect(result).toContain("data/config.json");
        expect(result).toContain("data/users.csv");
        expect(result).toContain("data/settings.xml");
      }
    }
  });
});
