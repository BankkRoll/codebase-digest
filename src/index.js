#!/usr/bin/env node

/**
 * Codebase Digest - Main Entry Point
 *
 * This file serves as the main entry point for both CLI and programmatic usage.
 * It orchestrates the overall flow of the application and exports the public API.
 *
 * @module codebase-digest
 * @author BankkRoll
 * @license MIT
 */

import { calculateFileHash, getFileMimeType } from "./utils/metadata.js";
import { detectFileEncoding, readFileWithEncoding } from "./utils/encoding.js";
import {
  formatCSV,
  formatHTML,
  formatJSON,
  formatMarkdown,
  formatText,
  formatXML,
} from "./formatters/index.js";

import chalk from "chalk";
import { defaultConfig } from "./config/defaults.js";
import { fileURLToPath } from "url";
import { initializeCLI } from "./cli/index.js";
import { isBinaryFile } from "./utils/file-detection.js";
import { logger } from "./utils/logger.js";
import path from "path";
import { processDirectory } from "./core/processor.js";
import { readFileSync } from "fs";

// Internal modules

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Package version from package.json
let packageJson;
try {
  packageJson = JSON.parse(
    readFileSync(path.join(__dirname, "..", "package.json"), "utf8"),
  );
} catch (error) {
  logger.error(`Error reading package.json: ${error.message}`);
  packageJson = { version: "unknown" };
}

// Initialize CLI if this file is being executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    logger.info("Starting CLI execution");
    initializeCLI(packageJson.version);
  } catch (error) {
    logger.fatal(`Fatal error in CLI initialization: ${error.message}`);
    console.error(chalk.red(`Fatal error: ${error.message}`));
    if (error.stack) {
      logger.fatal(error.stack);
    }
    process.exit(1);
  } finally {
    logger.success("CLI execution completed");
  }
}

// Export public API for programmatic usage
export {
  processDirectory,
  defaultConfig,
  isBinaryFile,
  detectFileEncoding,
  readFileWithEncoding,
  calculateFileHash,
  getFileMimeType,
  formatText,
  formatMarkdown,
  formatJSON,
  formatCSV,
  formatHTML,
  formatXML,
};
