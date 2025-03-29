/**
 * CLI Entry Point
 *
 * This module initializes and configures the command-line interface.
 *
 * @module cli
 */

import {
  createReadStream,
  createWriteStream,
  existsSync,
  readFileSync,
  statSync,
} from "fs";

import chalk from "chalk";
import { program } from "commander";
import fs from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { createGunzip } from "zlib";
import { defaultConfig } from "../config/defaults.js";
import { processDirectory } from "../core/processor.js";
import { logger } from "../utils/logger.js";

/**
 * Initializes the CLI with command-line options and handlers
 *
 * @param {string} version - Package version
 */
export function initializeCLI(version) {
  program
    .name("codebase-digest")
    .description(
      "Turn any codebase into a simple text digest for LLM consumption",
    )
    .version(version)
    .argument("<directory>", "Directory to process")
    .option("-o, --output <file>", "Output file (defaults to stdout)")
    .option(
      "-f, --format <format>",
      "Output format: text, json, markdown, tree",
      "text",
    )
    .option(
      "--max-file-size <size>",
      "Maximum file size in bytes to process",
      Number.parseInt,
    )
    .option(
      "--min-file-size <size>",
      "Minimum file size in bytes to process",
      Number.parseInt,
    )
    .option(
      "--include <patterns>",
      "Glob patterns to include (comma separated)",
    )
    .option(
      "--exclude <patterns>",
      "Glob patterns to exclude (comma separated)",
    )
    .option("--respect-gitignore", "Respect .gitignore files")
    .option("--no-npmignore", "Don't respect .npmignore files")
    .option("--no-dockerignore", "Don't respect .dockerignore files")
    .option("--no-file-header", "Don't include file headers")
    .option("--no-file-separator", "Don't include file separators")
    .option("--include-line-numbers", "Include line numbers in output")
    .option("--byte-size", "Include file size in bytes")
    .option("--mime-type", "Include MIME type")
    .option("--last-modified", "Include last modified date")
    .option("--file-hash", "Include file hash")
    .option(
      "--hash-algorithm <algorithm>",
      "Hash algorithm to use (md5, sha1, sha256, sha512)",
      "md5",
    )
    .option(
      "--binary-action <action>",
      "Action for binary files: skip, include, hexdump",
      "skip",
    )
    .option(
      "--encoding <encoding>",
      "File encoding (auto, utf8, latin1, etc.)",
      "auto",
    )
    .option("--no-detect-binary", "Don't detect binary files")
    .option("--no-detect-encoding", "Don't detect file encoding")
    .option("--no-parallel", "Process files sequentially")
    .option(
      "--max-parallel <count>",
      "Maximum number of parallel processes",
      Number.parseInt,
    )
    .option("--follow-symlinks", "Follow symbolic links")
    .option("--max-depth <depth>", "Maximum directory depth", Number.parseInt)
    .option("--compress", "Compress output with gzip")
    .option("--decompress", "Decompress input with gunzip")
    .option("--git-stats", "Include git statistics")
    .option(
      "--sort-by <field>",
      "Sort files by: path, size, extension, modified",
      "path",
    )
    .option("--sort-direction <direction>", "Sort direction: asc, desc", "asc")
    .option("--timeout <ms>", "Timeout in milliseconds", Number.parseInt)
    .option(
      "--retry-count <count>",
      "Number of retries for failed operations",
      Number.parseInt,
    )
    .option(
      "--retry-delay <ms>",
      "Delay between retries in milliseconds",
      Number.parseInt,
    )
    .option(
      "--truncate-line-length <length>",
      "Truncate lines to this length",
      Number.parseInt,
    )
    .option("--skip-empty-files", "Skip empty files")
    .option("--skip-binary-files", "Skip binary files")
    .option("--no-include-hidden", "Don't include hidden files")
    .option("--include-git-submodules", "Include git submodules")
    .option("--code-statistics", "Include code statistics")
    .option("--code-metrics", "Include code metrics")
    .option("--summary-only", "Only output summary, not file contents")
    .option(
      "--file-grouping <type>",
      "Group files by: none, extension, directory, language",
      "none",
    )
    .option(
      "--file-grouping-depth <depth>",
      "Depth for directory grouping",
      Number.parseInt,
    )
    .option(
      "--max-output-size <size>",
      "Maximum output size in bytes",
      Number.parseInt,
    )
    .option("--no-progress-bar", "Don't show progress bar")
    .option("--no-color-output", "Don't use color in output")
    .option(
      "--file-content-preview <lines>",
      "Number of lines to preview",
      Number.parseInt,
    )
    .option(
      "--file-content-tail <lines>",
      "Number of lines to show from the end",
      Number.parseInt,
    )
    .option("--comment-stripping", "Strip comments from code")
    .option(
      "--code-blocks-only",
      "Only include code blocks, not comments or whitespace",
    )
    .option("--strip-whitespace", "Strip unnecessary whitespace")
    .option("--merge-adjacent-files", "Merge adjacent files of the same type")
    .option("-v, --verbose", "Verbose output")
    .option("-s, --silent", "Silent mode (no output except errors)")
    .option("-c, --config <file>", "Path to config file")
    .option(
      "--include-metadata",
      "Include file metadata (size, modified date, etc.)",
    )
    .option("--exclude-headers", "Exclude file headers from output")
    .option("--exclude-separators", "Exclude file separators from output")
    .action(handleAction);

  program.parse();
}

/**
 * Handles the main CLI action
 *
 * @async
 * @param {string} directory - Directory to process
 * @param {Object} options - Command-line options
 */
async function handleAction(directory, options) {
  let config = { ...defaultConfig }; // Declare config here
  try {
    // Set color output
    chalk.level = options.colorOutput === false ? 0 : chalk.level;

    // Set logger level based on options
    if (options.verbose) {
      logger.setLevel("DEBUG");
    } else if (options.silent) {
      logger.setLevel("ERROR");
    } else {
      logger.setLevel("INFO");
    }

    // Merge config from file if provided
    if (options.config) {
      config = await loadConfigFile(options.config, config);
    }

    // Override with CLI options
    config = mergeCliOptions(options, config);

    // Resolve directory path
    const dirPath = path.resolve(process.cwd(), directory);

    // Check if directory exists
    if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
      logger.error(`The provided path is not a valid directory: ${dirPath}`);
      console.error(
        chalk.red(
          `Error: The provided path is not a valid directory: ${dirPath}`,
        ),
      );
      process.exit(1);
    }

    // Process the directory with retry logic
    const result = await processWithRetry(dirPath, config);

    // Handle output
    await handleOutput(result, config);
    process.exit(0);
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    console.error(chalk.red(`Error: ${error.message}`));
    if (config?.verbose) {
      console.error(error);
    }
    process.exit(1);
  }
}

/**
 * Loads configuration from a file
 *
 * @async
 * @param {string} configPath - Path to the configuration file
 * @param {Object} defaultConfig - Default configuration object
 * @returns {Promise<Object>} Merged configuration object
 */
async function loadConfigFile(configPath, defaultConfig) {
  const resolvedPath = path.resolve(process.cwd(), configPath);

  if (!existsSync(resolvedPath)) {
    logger.error(`Config file not found: ${resolvedPath}`);
    throw new Error(`Config file not found: ${resolvedPath}`);
  }

  try {
    logger.info(`Loading config from ${resolvedPath}`);
    const fileConfig = JSON.parse(readFileSync(resolvedPath, "utf8"));
    logger.success(`Successfully loaded config file`);
    return { ...defaultConfig, ...fileConfig };
  } catch (error) {
    logger.error(`Error parsing config file: ${error.message}`);
    throw new Error(`Error parsing config file: ${error.message}`);
  }
}

/**
 * Merges CLI options into the configuration object
 *
 * @param {Object} options - Command-line options
 * @param {Object} config - Configuration object
 * @returns {Object} Updated configuration object
 */
function mergeCliOptions(options, config) {
  // Only set if explicitly provided
  if (options.output !== undefined) config.outputFile = options.output;
  if (options.format !== undefined) config.outputFormat = options.format;
  if (options.maxFileSize !== undefined)
    config.maxFileSize = options.maxFileSize;
  if (options.minFileSize !== undefined)
    config.minFileSize = options.minFileSize;
  if (options.include !== undefined)
    config.includePatterns = options.include.split(",");
  if (options.exclude !== undefined)
    config.excludePatterns = options.exclude.split(",");
  if (options.gitignore !== undefined)
    config.respectGitignore = options.gitignore;
  if (options.npmignore !== undefined)
    config.respectNpmignore = options.npmignore;
  if (options.dockerignore !== undefined)
    config.respectDockerignore = options.dockerignore;
  if (options.fileHeader !== undefined)
    config.includeFileHeader = options.fileHeader;
  if (options.fileSeparator !== undefined)
    config.includeFileSeparator = options.fileSeparator;
  if (options.lineNumbers !== undefined)
    config.includeLineNumbers = options.lineNumbers;
  if (options.byteSize !== undefined) config.includeByteSize = options.byteSize;
  if (options.mimeType !== undefined) config.includeMimeType = options.mimeType;
  if (options.lastModified !== undefined)
    config.includeLastModified = options.lastModified;
  if (options.fileHash !== undefined) config.includeFileHash = options.fileHash;
  if (options.hashAlgorithm !== undefined)
    config.hashAlgorithm = options.hashAlgorithm;
  if (options.binaryFiles !== undefined)
    config.binaryFilesAction = options.binaryFiles;
  if (options.encoding !== undefined) config.encoding = options.encoding;
  if (options.detectBinary !== undefined)
    config.detectBinary = options.detectBinary;
  if (options.detectEncoding !== undefined)
    config.detectEncoding = options.detectEncoding;
  if (options.parallel !== undefined) config.parallel = options.parallel;
  if (options.maxParallel !== undefined)
    config.maxParallelProcesses = options.maxParallel;
  if (options.followSymlinks !== undefined)
    config.followSymlinks = options.followSymlinks;
  if (options.maxDepth !== undefined) config.maxDepth = options.maxDepth;
  if (options.compress !== undefined) config.compress = options.compress;
  if (options.decompress !== undefined) config.decompress = options.decompress;
  if (options.gitStats !== undefined) config.gitStats = options.gitStats;
  if (options.sortBy !== undefined) config.sortBy = options.sortBy;
  if (options.sortDirection !== undefined)
    config.sortDirection = options.sortDirection;
  if (options.timeout !== undefined) config.timeout = options.timeout;
  if (options.retryCount !== undefined) config.retryCount = options.retryCount;
  if (options.retryDelay !== undefined) config.retryDelay = options.retryDelay;
  if (options.truncateLineLength !== undefined)
    config.truncateLineLength = options.truncateLineLength;
  if (options.skipEmptyFiles !== undefined)
    config.skipEmptyFiles = options.skipEmptyFiles;
  if (options.skipBinaryFiles !== undefined)
    config.skipBinaryFiles = options.skipBinaryFiles;
  if (options.includeHidden !== undefined)
    config.includeHidden = options.includeHidden;
  if (options.includeGitSubmodules !== undefined)
    config.includeGitSubmodules = options.includeGitSubmodules;
  if (options.codeStatistics !== undefined)
    config.codeStatistics = options.codeStatistics;
  if (options.codeMetrics !== undefined)
    config.codeMetrics = options.codeMetrics;
  if (options.summaryOnly !== undefined)
    config.summaryOnly = options.summaryOnly;
  if (options.fileGrouping !== undefined)
    config.fileGrouping = options.fileGrouping;
  if (options.fileGroupingDepth !== undefined)
    config.fileGroupingDepth = options.fileGroupingDepth;
  if (options.maxOutputSize !== undefined)
    config.maxOutputSize = options.maxOutputSize;
  if (options.progressBar !== undefined)
    config.progressBar = options.progressBar;
  if (options.colorOutput !== undefined)
    config.colorOutput = options.colorOutput;
  if (options.fileContentPreview !== undefined)
    config.fileContentPreview = options.fileContentPreview;
  if (options.fileContentTail !== undefined)
    config.fileContentTail = options.fileContentTail;
  if (options.commentStripping !== undefined)
    config.commentStripping = options.commentStripping;
  if (options.codeBlocksOnly !== undefined)
    config.codeBlocksOnly = options.codeBlocksOnly;
  if (options.stripWhitespace !== undefined)
    config.stripWhitespace = options.stripWhitespace;
  if (options.mergeAdjacentFiles !== undefined)
    config.mergeAdjacentFiles = options.mergeAdjacentFiles;
  if (options.verbose !== undefined) config.verbose = options.verbose;
  if (options.silent !== undefined) config.silent = options.silent;
  if (options.includeMetadata !== undefined)
    config.includeMetadata = options.includeMetadata;
  if (options.excludeHeaders !== undefined)
    config.excludeHeaders = options.excludeHeaders;
  if (options.excludeSeparators !== undefined)
    config.excludeSeparators = options.excludeSeparators;

  return config;
}

/**
 * Processes a directory with retry logic
 *
 * @async
 * @param {string} dirPath - Path to the directory
 * @param {Object} config - Configuration object
 * @returns {Promise<string|Buffer>} Processing result
 */
async function processWithRetry(dirPath, config) {
  let result;
  let retryCount = 0;

  while (retryCount <= config.retryCount) {
    try {
      result = await processDirectory(dirPath, config);
      break; // Success, exit the retry loop
    } catch (error) {
      retryCount++;

      if (retryCount <= config.retryCount) {
        if (!config.silent) {
          logger.warn(
            `Attempt ${retryCount}/${config.retryCount} failed: ${error.message}`,
          );
          logger.warn(`Retrying in ${config.retryDelay / 1000} seconds...`);
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      } else {
        // All retries failed
        throw error;
      }
    }
  }

  return result;
}

/**
 * Handles the output of the processing result
 *
 * @async
 * @param {string|Buffer} result - Processing result
 * @param {Object} config - Configuration object
 */
async function handleOutput(result, config) {
  try {
    // Handle compressed output
    if (config.compress && config.outputFile) {
      await fs.writeFile(config.outputFile, result);
      if (config.verbose) {
        logger.info(`Compressed output written to ${config.outputFile}`);
      }
    }
    // Handle decompressed input
    else if (config.decompress && config.outputFile) {
      await pipeline(
        createReadStream(result),
        createGunzip(),
        createWriteStream(config.outputFile),
      );
      if (config.verbose) {
        logger.info(`Decompressed output written to ${config.outputFile}`);
      }
    }
    // Normal output
    else if (config.outputFile) {
      // Check if output is too large
      if (config.maxOutputSize > 0 && result.length > config.maxOutputSize) {
        logger.warn(
          `Output size (${result.length} bytes) exceeds maximum (${config.maxOutputSize} bytes). Truncating.`,
        );
        result =
          result.substring(0, config.maxOutputSize) +
          "\n\n[Output truncated due to size limit]";
      }

      await fs.writeFile(config.outputFile, result, config.outputEncoding);
      if (config.verbose) {
        logger.info(`Output written to ${config.outputFile}`);
      }
    } else {
      // Output to stdout
      if (!config.silent) {
        console.log(result);
      }
    }
  } catch (error) {
    logger.error(`Error handling output: ${error.message}`);
    throw error;
  }
}
