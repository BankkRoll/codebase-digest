import { describe, expect, it } from "vitest";
import {
  formatCSV,
  formatHTML,
  formatJSON,
  formatMarkdown,
  formatText,
  formatXML,
} from "../../src/formatters/index.js";
import { parseAndValidateJSON, validateOutputFormat } from "../helper.js";

describe("Formatters", () => {
  const sampleFileContents = [
    {
      path: "src/index.js",
      size: 100,
      modified: new Date("2023-01-01"),
      content:
        'console.log("Hello, world!");\n\nfunction example() {\n  return 42;\n}\n\nexport default example;',
      extension: "js",
      language: "javascript",
      isBinary: false,
    },
    {
      path: "README.md",
      size: 200,
      modified: new Date("2023-01-02"),
      content:
        "# Test Project\n\nThis is a test project.\n\n- Feature 1\n- Feature 2",
      extension: "md",
      language: "markdown",
      isBinary: false,
    },
    {
      path: "src/styles.css",
      size: 150,
      modified: new Date("2023-01-03"),
      content:
        "body {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n\nh1 {\n  color: #333;\n}",
      extension: "css",
      language: "css",
      isBinary: false,
    },
  ];

  describe("Text Formatter", () => {
    it("should format text correctly with default options", () => {
      const result = formatText(sampleFileContents, {});

      expect(result).toContain("File: src/index.js");
      expect(result).toContain('console.log("Hello, world!");');
      expect(result).toContain("File: README.md");
      expect(result).toContain("# Test Project");
      expect(result).toContain("File: src/styles.css");
      expect(result).toContain("body {");
    });

    it("should include file separator when configured", () => {
      const result = formatText(sampleFileContents, {
        includeFileSeparator: true,
      });

      expect(result).toContain("=====");
    });

    it("should include line numbers when configured", () => {
      const result = formatText(sampleFileContents, {
        includeLineNumbers: true,
      });

      expect(result).toMatch(/1\s+console\.log/);
      expect(result).toMatch(/1\s+# Test Project/);
      expect(result).toMatch(/1\s+body {/);
    });

    it("should exclude file headers when configured", () => {
      const result = formatText(sampleFileContents, {
        includeFileHeader: false,
      });

      expect(result).not.toContain("File: src/index.js");
      expect(result).not.toContain("File: README.md");
      expect(result).not.toContain("File: src/styles.css");

      // Content should still be included
      expect(result).toContain('console.log("Hello, world!");');
      expect(result).toContain("# Test Project");
      expect(result).toContain("body {");
    });
  });

  describe("Markdown Formatter", () => {
    it("should format markdown correctly with default options", () => {
      const result = formatMarkdown(sampleFileContents, {});

      expect(result).toContain("# Code Digest");
      expect(result).toContain("## src/index.js");
      expect(result).toContain("```javascript");
      expect(result).toContain('console.log("Hello, world!");');
      expect(result).toContain("```");

      expect(result).toContain("## README.md");
      expect(result).toContain("```markdown");
      expect(result).toContain("# Test Project");

      expect(result).toContain("## src/styles.css");
      expect(result).toContain("```css");
      expect(result).toContain("body {");
    });

    it("should include file metadata when configured", () => {
      const result = formatMarkdown(sampleFileContents, {
        includeFileMetadata: true,
      });

      expect(result).toContain("Size: 100 bytes");
      expect(result).toContain("Modified: ");
      expect(result).toContain("Language: javascript");
    });

    it("should use custom title when provided", () => {
      const result = formatMarkdown(sampleFileContents, {
        title: "Custom Project Digest",
      });

      expect(result).toContain("# Custom Project Digest");
    });

    it("should validate as markdown format", () => {
      const result = formatMarkdown(sampleFileContents, {});
      expect(validateOutputFormat(result, "markdown")).toBe(true);
    });
  });

  describe("JSON Formatter", () => {
    it("should format JSON correctly", () => {
      const result = formatJSON(sampleFileContents, {});

      // Should be valid JSON
      const parsed = parseAndValidateJSON(result);

      expect(parsed).toBeInstanceOf(Array);
      expect(parsed.length).toBe(3);

      expect(parsed[0].path).toBe("src/index.js");
      expect(parsed[0].content).toContain('console.log("Hello, world!");');
      expect(parsed[0].extension).toBe("js");
      expect(parsed[0].language).toBe("javascript");

      expect(parsed[1].path).toBe("README.md");
      expect(parsed[1].content).toContain("# Test Project");

      expect(parsed[2].path).toBe("src/styles.css");
      expect(parsed[2].content).toContain("body {");
    });

    it("should include file metadata when configured", () => {
      const result = formatJSON(sampleFileContents, {
        includeFileMetadata: true,
      });

      const parsed = parseAndValidateJSON(result);

      expect(parsed[0].size).toBe(100);
      expect(parsed[0].modified).toBeDefined();
      expect(parsed[0].language).toBe("javascript");
    });

    it("should exclude content when configured", () => {
      const result = formatJSON(sampleFileContents, {
        includeContent: false,
      });

      const parsed = parseAndValidateJSON(result);

      expect(parsed[0].path).toBe("src/index.js");
      expect(parsed[0].content).toBeUndefined();
    });

    it("should validate against a schema", () => {
      const result = formatJSON(sampleFileContents, {});

      // Define a schema for validation
      const schema = {
        path: "string",
        content: "string",
        extension: "string",
      };

      const parsed = parseAndValidateJSON(result, schema);
      expect(parsed).toBeDefined();
    });
  });

  describe("HTML Formatter", () => {
    it("should format HTML correctly", () => {
      const result = formatHTML(sampleFileContents, {});

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<html");
      expect(result).toContain("<body");
      expect(result).toContain("<h1>Code Digest</h1>");

      // Should have file headings
      expect(result).toContain("<h2>src/index.js</h2>");
      expect(result).toContain("<h2>README.md</h2>");
      expect(result).toContain("<h2>src/styles.css</h2>");

      // Should have content in pre tags
      expect(result).toContain("<pre");
      expect(result).toContain('console.log("Hello, world!");');
      expect(result).toContain("# Test Project");
      expect(result).toContain("body {");

      // Should close tags properly
      expect(result).toContain("</body>");
      expect(result).toContain("</html>");
    });

    it("should include syntax highlighting when configured", () => {
      const result = formatHTML(sampleFileContents, {
        includeSyntaxHighlighting: true,
      });

      // Should have syntax highlighting classes
      expect(result).toContain('class="language-javascript"');
      expect(result).toContain('class="language-markdown"');
      expect(result).toContain('class="language-css"');
    });

    it("should validate as HTML format", () => {
      const result = formatHTML(sampleFileContents, {});
      expect(validateOutputFormat(result, "html")).toBe(true);
    });
  });

  describe("CSV Formatter", () => {
    it("should format CSV correctly", () => {
      const result = formatCSV(sampleFileContents, {});

      // Should have header row
      expect(result).toContain("path,content");

      // Should have data rows
      const lines = result.split("\n");
      expect(lines.length).toBeGreaterThan(3); // Header + 3 files

      // Content should be properly escaped
      expect(result).toContain('"console.log(\\"Hello, world!\\");');
      expect(result).toContain('"# Test Project');
      expect(result).toContain('"body {');
    });

    it("should include metadata columns when configured", () => {
      const result = formatCSV(sampleFileContents, {
        includeFileMetadata: true,
      });

      // Should have extended header row
      expect(result).toContain("path,size,modified,extension,language,content");

      // Should include metadata in rows
      expect(result).toContain("100,");
      expect(result).toContain("javascript,");
    });

    it("should validate as CSV format", () => {
      const result = formatCSV(sampleFileContents, {});
      expect(validateOutputFormat(result, "csv")).toBe(true);
    });
  });

  describe("XML Formatter", () => {
    it("should format XML correctly", () => {
      const result = formatXML(sampleFileContents, {});

      // Should have XML declaration
      expect(result).toContain('<?xml version="1.0" encoding="UTF-8"?>');

      // Should have root element
      expect(result).toContain("<codebase>");
      expect(result).toContain("</codebase>");

      // Should have file elements
      expect(result).toContain('<file path="src/index.js">');
      expect(result).toContain('<file path="README.md">');
      expect(result).toContain('<file path="src/styles.css">');

      // Should have content elements with proper escaping
      expect(result).toContain(
        '<content><![CDATA[console.log("Hello, world!");',
      );
      expect(result).toContain("<content><![CDATA[# Test Project");
      expect(result).toContain("<content><![CDATA[body {");

      // Should close elements properly
      expect(result).toContain("</file>");
      expect(result).toContain("</codebase>");
    });

    it("should include metadata attributes when configured", () => {
      const result = formatXML(sampleFileContents, {
        includeFileMetadata: true,
      });

      // Should include metadata attributes
      expect(result).toContain('size="100"');
      expect(result).toContain('extension="js"');
      expect(result).toContain('language="javascript"');
    });

    it("should validate as XML format", () => {
      const result = formatXML(sampleFileContents, {});
      expect(validateOutputFormat(result, "xml")).toBe(true);
    });
  });
});
