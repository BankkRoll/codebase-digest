import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  cleanAllFixtures,
  cleanTempDir,
  createCustomFixture,
  createFixture,
  createTempDir,
  getCliPath,
  measurePerformance,
  runCli,
  setupTestEnvironment,
} from "../helper.js";

import fs from "fs/promises";
import path from "path";

describe("CLI Integration", () => {
  const { setup, teardown } = setupTestEnvironment();
  const fixtureName = "cli-test";
  let fixtureDir;
  let outputDir;

  beforeAll(async () => {
    await setup();
  });

  afterAll(async () => {
    await teardown();
    await cleanTempDir("cli-output");
  });

  beforeEach(async () => {
    fixtureDir = await createFixture(fixtureName, "basic");
    outputDir = await createTempDir("cli-output");
  });

  it("should process a directory via CLI with default options", async () => {
    const {
      result: { stdout },
      duration,
    } = await measurePerformance(runCli, [fixtureDir]);

    console.log(`CLI execution took ${duration}ms`);

    expect(stdout).toContain("src/index.js");
    expect(stdout).toContain("README.md");
    expect(stdout).toContain("package.json");
  });

  it("should respect format option for JSON output", async () => {
    const { stdout } = await runCli([fixtureDir, "-f", "json"]);
    const parsed = JSON.parse(stdout);

    expect(parsed).toBeInstanceOf(Array);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("path");
    expect(parsed[0]).toHaveProperty("content");
  });

  it("should respect format option for Markdown output", async () => {
    const { stdout } = await runCli([fixtureDir, "-f", "markdown"]);

    expect(stdout).toContain("# Code Digest");
    expect(stdout).toContain("## src/index.js");
    expect(stdout).toContain("```javascript");
  });

  it("should respect format option for HTML output", async () => {
    const { stdout } = await runCli([fixtureDir, "-f", "html"]);

    expect(stdout).toContain("<html");
    expect(stdout).toContain("<body");
    expect(stdout).toContain("<pre");
    expect(stdout).toContain("</html>");
  });

  it("should write output to file when specified", async () => {
    const outputPath = path.join(outputDir, "output.md");

    await runCli([fixtureDir, "-f", "markdown", "-o", outputPath]);

    const content = await fs.readFile(outputPath, "utf8");
    expect(content).toContain("# Code Digest");
    expect(content).toContain("## src/index.js");
  });

  it("should filter files using include patterns", async () => {
    const { stdout } = await runCli([
      fixtureDir,
      "--include",
      "**/*.js",
      "-f",
      "json",
    ]);

    const parsed = JSON.parse(stdout);
    expect(parsed.every((file) => file.path.endsWith(".js"))).toBe(true);
    expect(parsed.every((file) => !file.path.includes(".md"))).toBe(true);
  });

  it("should filter files using exclude patterns", async () => {
    const { stdout } = await runCli([
      fixtureDir,
      "--exclude",
      "**/*.md",
      "-f",
      "json",
    ]);

    const parsed = JSON.parse(stdout);
    expect(parsed.every((file) => !file.path.endsWith(".md"))).toBe(true);
  });

  it("should handle multiple include and exclude patterns", async () => {
    const { stdout } = await runCli([
      fixtureDir,
      "--include",
      "**/*.js",
      "--include",
      "**/*.json",
      "--exclude",
      "**/utils/**",
      "-f",
      "json",
    ]);

    const parsed = JSON.parse(stdout);

    // Should only include .js and .json files
    expect(
      parsed.every(
        (file) => file.path.endsWith(".js") || file.path.endsWith(".json"),
      ),
    ).toBe(true);

    // Should exclude files in utils directory
    expect(parsed.every((file) => !file.path.includes("/utils/"))).toBe(true);
  });

  it("should respect gitignore when flag is set", async () => {
    // Create a custom fixture with .gitignore
    const customDir = await createCustomFixture("cli-gitignore-test", {
      ".gitignore": "ignored_dir/\n*.log",
      "normal.js": 'console.log("normal");',
      "ignored_dir/should-be-ignored.js": 'console.log("ignored");',
      "error.log": "Error log content",
    });

    const { stdout } = await runCli([
      customDir,
      "--respect-gitignore",
      "-f",
      "json",
    ]);

    const parsed = JSON.parse(stdout);

    // Should include normal.js
    expect(parsed.some((file) => file.path === "normal.js")).toBe(true);

    // Should not include ignored files
    expect(parsed.every((file) => !file.path.includes("ignored_dir"))).toBe(
      true,
    );
    expect(parsed.every((file) => !file.path.endsWith(".log"))).toBe(true);
  });

  it("should handle binary files according to configuration", async () => {
    // Create a custom fixture with binary file
    const binaryDir = await createCustomFixture("cli-binary-test", {
      "normal.js": 'console.log("normal");',
      "binary.bin": Buffer.from([0x00, 0x01, 0x02, 0xff]),
    });

    // Test skipping binary files
    let { stdout } = await runCli([
      binaryDir,
      "--binary-action=skip",
      "-f",
      "json",
    ]);

    let parsed = JSON.parse(stdout);
    expect(parsed.some((file) => file.path === "normal.js")).toBe(true);
    expect(parsed.every((file) => file.path !== "binary.bin")).toBe(true);

    // Test including binary files
    ({ stdout } = await runCli([
      binaryDir,
      "--binary-action=include",
      "-f",
      "json",
    ]));

    parsed = JSON.parse(stdout);
    expect(parsed.some((file) => file.path === "binary.bin")).toBe(true);
    expect(parsed.find((f) => f.path === "binary.bin").isBinary).toBe(true);
  });

  it("should handle invalid arguments gracefully", async () => {
    // Test with non-existent directory
    try {
      await runCli(["non-existent-dir"]);
      fail("Should have thrown an error");
    } catch (err) {
      expect(err.stderr).toContain("Error");
    }

    // Test with invalid format
    try {
      await runCli([fixtureDir, "-f", "invalid-format"]);
      fail("Should have thrown an error");
    } catch (err) {
      expect(err.stderr).toContain("Error");
    }
  });

  it("should display help when requested", async () => {
    const { stdout } = await runCli(["--help"]);

    expect(stdout).toContain("Usage:");
    expect(stdout).toContain("Options:");
    expect(stdout).toContain("--format");
    expect(stdout).toContain("--output");
  });

  it("should display version when requested", async () => {
    const { stdout } = await runCli(["--version"]);

    // Version should match pattern like 1.0.0
    expect(stdout).toMatch(/\d+\.\d+\.\d+/);
  });
});
