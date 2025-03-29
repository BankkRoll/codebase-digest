/**
 * Directory Processor
 *
 * This module provides the core functionality for processing directories
 * and generating digests of their contents.
 *
 * @module core/processor
 */

import { existsSync, readFileSync, statSync } from "fs";
import {
  formatJSON,
  formatMarkdown,
  formatText,
  formatTree,
} from "../formatters/index.js";
import { createHexdump, readFileWithEncoding } from "../utils/encoding.js";
import { isBinaryFile, shouldProcessFile } from "../utils/file-detection.js";
import { calculateFileHash, getFileMimeType } from "../utils/metadata.js";

import fs from "fs/promises";
import { glob } from "glob";
import ignore from "ignore";
import path from "path";
import { createGzip } from "zlib";
import { defaultConfig } from "../config/defaults.js";
import { logger } from "../utils/logger.js";

/**
 * Processes a directory and returns a digest of its contents
 *
 * @async
 * @param {string} directory - Path to the directory to process
 * @param {Object} [userConfig={}] - User configuration to override defaults
 * @returns {Promise<string|Buffer>} The digest output as a string or Buffer (if compressed)
 * @throws {Error} If the directory processing fails
 */
export async function processDirectory(directory, userConfig = {}) {
  try {
    // Normalize config by merging with defaults
    const config = { ...defaultConfig, ...userConfig };

    logger.setLevel(
      config.verbose ? "DEBUG" : config.silent ? "ERROR" : "INFO",
    );
    logger.info(`Processing directory: ${directory}`);
    logger.debug(`Configuration: ${JSON.stringify(config, null, 2)}`);

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () =>
          reject(
            new Error(
              `Operation timed out after ${config.timeout / 1000} seconds`,
            ),
          ),
        config.timeout,
      );
    });

    // Create the main processing promise
    const processingPromise = (async () => {
      // Load ignore patterns
      const ig = await loadIgnorePatterns(directory, config);

      // Find all matching files
      const files = await findMatchingFiles(directory, ig, config);

      if (config.verbose) {
        logger.info(`Found ${files.length} files to process`);
      }

      // Process files
      const fileContents = await processFiles(directory, files, config);

      // Group files if requested
      if (config.fileGrouping !== "none") {
        groupFiles(fileContents, config);
      }

      // Format the output
      const output = formatOutput(fileContents, config);

      // Compress output if requested
      if (config.compress) {
        return await compressOutput(output);
      }

      return output;
    })();

    // Race the processing promise against the timeout
    return await Promise.race([processingPromise, timeoutPromise]);
  } catch (error) {
    logger.error(`Error processing directory: ${error.message}`);
    throw new Error(`Error processing directory: ${error.message}`);
  }
}

/**
 * Processes a file and extracts its content and metadata
 *
 * @async
 * @param {string} filePath - Absolute path to the file
 * @param {string} relativePath - Path relative to the base directory
 * @param {Object} config - Configuration object
 * @returns {Promise<Object|null>} File data object or null if the file should be skipped
 */
export const processFile = async (filePath, relativePath, config) => {
  try {
    logger.debug(`Processing file: ${relativePath}`);

    // Check if the file should be processed
    const { shouldProcess, reason } = await shouldProcessFile(
      filePath,
      relativePath,
      config,
    );

    if (!shouldProcess) {
      if (config.verbose) {
        logger.debug(`Skipping file ${relativePath}: ${reason}`);
      }
      return null;
    }

    // Get file stats
    const stats = await fs.stat(filePath);

    // Check if file is binary
    let isBinary = false;
    if (config.detectBinary) {
      isBinary = await isBinaryFile(filePath);
    }

    // Prepare file metadata
    const fileData = {
      path: relativePath,
      size: stats.size,
      modified: stats.mtime,
      created: stats.birthtime,
      extension: path.extname(filePath).substring(1),
      isBinary,
    };

    // Add hash if requested
    if (config.includeFileHash) {
      fileData.hash = await calculateFileHash(filePath, config.hashAlgorithm);
    }

    // Add MIME type if requested
    if (config.includeMimeType) {
      fileData.mimeType = await getFileMimeType(filePath);
    }

    // Process file content based on binary status
    if (isBinary) {
      await processBinaryFile(filePath, relativePath, fileData, config);
    } else {
      await processTextFile(filePath, relativePath, fileData, config);
    }

    if (config.verbose) {
      logger.info(`Successfully processed: ${relativePath}`);
    }

    return fileData;
  } catch (error) {
    logger.error(`Error processing file ${relativePath}: ${error.message}`);

    if (!config.continueOnError) {
      throw error;
    }

    // Return error information instead of failing completely
    return {
      path: relativePath,
      size: 0,
      error: error.message,
      content: `[Error reading file: ${error.message}]`,
    };
  }
};

/**
 * Processes a binary file according to the configuration
 *
 * @async
 * @param {string} filePath - Absolute path to the file
 * @param {string} relativePath - Path relative to the base directory
 * @param {Object} fileData - File data object to update
 * @param {Object} config - Configuration object
 */
const processBinaryFile = async (filePath, relativePath, fileData, config) => {
  switch (config.binaryFilesAction) {
    case "skip":
      if (config.verbose) {
        logger.info(`Skipping binary file content: ${relativePath}`);
      }
      fileData.content = "[Binary file]";
      break;

    case "include":
      if (config.verbose) {
        logger.info(`Including binary file as base64: ${relativePath}`);
      }
      try {
        const buffer = await fs.readFile(filePath);
        fileData.content = buffer.toString("base64");
        fileData.encoding = "base64";
      } catch (error) {
        logger.error(
          `Error reading binary file ${relativePath}: ${error.message}`,
        );
        fileData.content = `[Error reading binary file: ${error.message}]`;
        fileData.error = error.message;
      }
      break;

    case "hexdump":
      if (config.verbose) {
        logger.info(`Creating hexdump for binary file: ${relativePath}`);
      }
      try {
        const hexBuffer = await fs.readFile(filePath);
        fileData.content = createHexdump(hexBuffer);
        fileData.encoding = "hexdump";
      } catch (error) {
        logger.error(
          `Error creating hexdump for ${relativePath}: ${error.message}`,
        );
        fileData.content = `[Error creating hexdump: ${error.message}]`;
        fileData.error = error.message;
      }
      break;

    default:
      logger.warn(
        `Unknown binary file action: ${config.binaryFilesAction}, defaulting to skip`,
      );
      fileData.content = "[Binary file]";
  }
};

/**
 * Processes a text file according to the configuration
 *
 * @async
 * @param {string} filePath - Absolute path to the file
 * @param {string} relativePath - Path relative to the base directory
 * @param {Object} fileData - File data object to update
 * @param {Object} config - Configuration object
 */
const processTextFile = async (filePath, relativePath, fileData, config) => {
  try {
    // Read text file with proper encoding
    fileData.content = await readFileWithEncoding(filePath, config);

    // Apply content transformations based on configuration
    applyContentTransformations(fileData, config);
  } catch (error) {
    logger.error(`Error reading text file ${relativePath}: ${error.message}`);
    fileData.content = `[Error reading file: ${error.message}]`;
    fileData.error = error.message;
  }
};

/**
 * Applies various transformations to file content based on configuration
 *
 * @param {Object} fileData - File data object to update
 * @param {Object} config - Configuration object
 */
const applyContentTransformations = (fileData, config) => {
  // Truncate line length if configured
  if (config.truncateLineLength > 0) {
    fileData.content = fileData.content
      .split("\n")
      .map((line) =>
        line.length > config.truncateLineLength
          ? line.substring(0, config.truncateLineLength) + "..."
          : line,
      )
      .join("\n");
  }

  // Preview only if configured
  if (config.fileContentPreview > 0) {
    const lines = fileData.content.split("\n");
    fileData.content = lines.slice(0, config.fileContentPreview).join("\n");
    if (lines.length > config.fileContentPreview) {
      fileData.content += "\n... [truncated]";
    }
  }

  // Add tail if configured
  if (config.fileContentTail > 0) {
    const lines = fileData.content.split("\n");
    if (lines.length > config.fileContentPreview + config.fileContentTail) {
      fileData.content += "\n... [truncated middle section]\n";
      fileData.content += lines.slice(-config.fileContentTail).join("\n");
    }
  }

  // Strip comments if configured
  if (config.commentStripping) {
    // This is a simplified approach - a real implementation would need
    // language-specific comment handling
    fileData.content = fileData.content
      .replace(/\/\/.*$/gm, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .replace(/^\s*#.*$/gm, "") // Remove shell/python style comments
      .replace(/<!--[\s\S]*?-->/g, ""); // Remove HTML comments
  }

  // Strip whitespace if configured
  if (config.stripWhitespace) {
    fileData.content = fileData.content
      .replace(/^\s+|\s+$/gm, "") // Remove leading/trailing whitespace
      .replace(/\n\s*\n\s*\n/g, "\n\n"); // Collapse multiple blank lines
  }
};

/**
 * Loads ignore patterns from standard ignore files and configuration
 *
 * @async
 * @param {string} directory - Path to the directory
 * @param {Object} config - Configuration object
 * @returns {Promise<Object>} Ignore instance with loaded patterns
 */
async function loadIgnorePatterns(directory, config) {
  let ig = ignore();

  // Load .gitignore if needed
  if (config.respectGitignore) {
    const gitignorePath = path.join(directory, ".gitignore");
    if (existsSync(gitignorePath)) {
      try {
        const gitignoreContent = readFileSync(gitignorePath, "utf8");
        ig = ig.add(gitignoreContent);
        logger.debug(`Loaded .gitignore patterns from ${gitignorePath}`);
      } catch (error) {
        logger.warn(`Error loading .gitignore: ${error.message}`);
      }
    }
  }

  // Load .npmignore if needed
  if (config.respectNpmignore) {
    const npmignorePath = path.join(directory, ".npmignore");
    if (existsSync(npmignorePath)) {
      try {
        const npmignoreContent = readFileSync(npmignorePath, "utf8");
        ig = ig.add(npmignoreContent);
        logger.debug(`Loaded .npmignore patterns from ${npmignorePath}`);
      } catch (error) {
        logger.warn(`Error loading .npmignore: ${error.message}`);
      }
    }
  }

  // Load .dockerignore if needed
  if (config.respectDockerignore) {
    const dockerignorePath = path.join(directory, ".dockerignore");
    if (existsSync(dockerignorePath)) {
      try {
        const dockerignoreContent = readFileSync(dockerignorePath, "utf8");
        ig = ig.add(dockerignoreContent);
        logger.debug(`Loaded .dockerignore patterns from ${dockerignorePath}`);
      } catch (error) {
        logger.warn(`Error loading .dockerignore: ${error.message}`);
      }
    }
  }

  // Add custom ignore patterns
  ig = ig.add(config.ignorePatterns);
  logger.debug(`Added ${config.ignorePatterns.length} custom ignore patterns`);

  return ig;
}

/**
 * Finds all files matching the include patterns and not excluded
 *
 * @async
 * @param {string} directory - Path to the directory
 * @param {Object} ig - Ignore instance with loaded patterns
 * @param {Object} config - Configuration object
 * @returns {Promise<string[]>} Array of matching file paths
 */
async function findMatchingFiles(directory, ig, config) {
  let files = [];

  // Find all files matching the include patterns
  for (const pattern of config.includePatterns) {
    try {
      const matches = await glob(pattern, {
        cwd: directory,
        dot: config.includeHidden,
        nodir: true,
        follow: config.followSymlinks,
        ignore: config.excludePatterns,
      });
      files = [...files, ...matches];
      logger.debug(`Pattern '${pattern}' matched ${matches.length} files`);
    } catch (error) {
      logger.error(`Error with glob pattern ${pattern}: ${error.message}`);
    }
  }

  // Remove duplicates
  files = [...new Set(files)];
  logger.debug(`Found ${files.length} unique files before filtering`);

  // Filter out excluded files
  files = files.filter((file) => {
    // Check if file is ignored by .gitignore or other ignore files
    if (config.respectGitignore && ig.ignores(file)) {
      logger.debug(`File ${file} ignored by ignore patterns`);
      return false;
    }

    // Check depth
    const depth = file.split(path.sep).length;
    if (depth > config.maxDepth) {
      logger.debug(
        `File ${file} exceeds maximum depth (${depth} > ${config.maxDepth})`,
      );
      return false;
    }

    return true;
  });

  logger.debug(`Found ${files.length} files after filtering`);

  // Sort files
  sortFiles(files, directory, config);

  return files;
}

/**
 * Sorts files according to configuration
 *
 * @param {string[]} files - Array of file paths to sort (modified in place)
 * @param {string} directory - Base directory path
 * @param {Object} config - Configuration object
 */
function sortFiles(files, directory, config) {
  logger.debug(
    `Sorting files by ${config.sortBy} in ${config.sortDirection} order`,
  );

  // Sort files
  switch (config.sortBy) {
    case "size":
      files.sort((a, b) => {
        const sizeA = statSync(path.join(directory, a)).size;
        const sizeB = statSync(path.join(directory, b)).size;
        return config.sortDirection === "asc" ? sizeA - sizeB : sizeB - sizeA;
      });
      break;

    case "extension":
      files.sort((a, b) => {
        const extA = path.extname(a).toLowerCase();
        const extB = path.extname(b).toLowerCase();
        return config.sortDirection === "asc"
          ? extA.localeCompare(extB)
          : extB.localeCompare(extA);
      });
      break;

    case "modified":
      files.sort((a, b) => {
        const mtimeA = statSync(path.join(directory, a)).mtime;
        const mtimeB = statSync(path.join(directory, b)).mtime;
        return config.sortDirection === "asc"
          ? mtimeA.getTime() - mtimeB.getTime()
          : mtimeB.getTime() - mtimeA.getTime();
      });
      break;

    case "path":
    default:
      files.sort((a, b) => {
        return config.sortDirection === "asc"
          ? a.localeCompare(b)
          : b.localeCompare(a);
      });
      break;
  }

  // Prioritize specific files if requested
  if (config.fileOrder.length > 0) {
    logger.debug(`Prioritizing ${config.fileOrder.length} specific files`);

    const priorityFiles = [];
    const remainingFiles = [];

    files.forEach((file) => {
      if (config.fileOrder.includes(file)) {
        priorityFiles.push(file);
      } else {
        remainingFiles.push(file);
      }
    });

    // Sort priority files according to the order in fileOrder
    priorityFiles.sort((a, b) => {
      return config.fileOrder.indexOf(a) - config.fileOrder.indexOf(b);
    });

    // Replace the files array with the prioritized order
    files.splice(0, files.length, ...priorityFiles, ...remainingFiles);
  }

  // Prioritize specific directories if requested
  if (config.directoryOrder.length > 0) {
    logger.debug(
      `Prioritizing ${config.directoryOrder.length} specific directories`,
    );

    const getDirectoryPriority = (file) => {
      for (let i = 0; i < config.directoryOrder.length; i++) {
        const dir = config.directoryOrder[i];
        if (file.startsWith(dir + path.sep)) {
          return i;
        }
      }
      return config.directoryOrder.length;
    };

    const originalOrder = [...files];
    files.sort((a, b) => {
      const priorityA = getDirectoryPriority(a);
      const priorityB = getDirectoryPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, maintain original sort
      return originalOrder.indexOf(a) - originalOrder.indexOf(b);
    });
  }
}

/**
 * Processes all files in parallel or sequentially
 *
 * @async
 * @param {string} directory - Base directory path
 * @param {string[]} files - Array of file paths to process
 * @param {Object} config - Configuration object
 * @returns {Promise<Object[]>} Array of file data objects
 */
async function processFiles(directory, files, config) {
  const fileContents = [];

  if (config.parallel && files.length > 1) {
    // Process files in parallel with a limit on concurrency
    logger.debug(
      `Processing ${files.length} files in parallel with max ${config.maxParallelProcesses} processes`,
    );

    const chunks = [];
    const chunkSize = Math.ceil(files.length / config.maxParallelProcesses);

    for (let i = 0; i < files.length; i += chunkSize) {
      chunks.push(files.slice(i, i + chunkSize));
    }

    await Promise.all(
      chunks.map(async (chunk) => {
        for (const file of chunk) {
          const filePath = path.join(directory, file);
          const result = await processFile(filePath, file, config);
          if (result) {
            fileContents.push(result);
          }
        }
      }),
    );
  } else {
    // Process files sequentially
    logger.debug(`Processing ${files.length} files sequentially`);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const result = await processFile(filePath, file, config);
      if (result) {
        fileContents.push(result);
      }
    }
  }

  return fileContents;
}

/**
 * Groups files according to configuration
 *
 * @param {Object[]} fileContents - Array of file data objects (modified in place)
 * @param {Object} config - Configuration object
 */
function groupFiles(fileContents, config) {
  logger.debug(`Grouping files by ${config.fileGrouping}`);

  fileContents.sort((a, b) => {
    let groupA, groupB;

    switch (config.fileGrouping) {
      case "extension":
        groupA = path.extname(a.path).substring(1) || "no-extension";
        groupB = path.extname(b.path).substring(1) || "no-extension";
        break;

      case "directory":
        const partsA = a.path.split(path.sep);
        const partsB = b.path.split(path.sep);

        groupA =
          partsA
            .slice(0, Math.min(config.fileGroupingDepth, partsA.length - 1))
            .join(path.sep) || ".";
        groupB =
          partsB
            .slice(0, Math.min(config.fileGroupingDepth, partsB.length - 1))
            .join(path.sep) || ".";
        break;

      case "language":
        const extA = path.extname(a.path).substring(1);
        const extB = path.extname(b.path).substring(1);

        // Use the pre-loaded language map
        groupA = languageMap(extA) || extA || "unknown";
        groupB = languageMap(extB) || extB || "unknown";
        break;
    }

    return groupA.localeCompare(groupB);
  });
}

/**
 * Formats the output according to the specified format
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted output
 */
function formatOutput(fileContents, config) {
  logger.debug(`Formatting output as ${config.outputFormat}`);

  switch (config.outputFormat.toLowerCase()) {
    case "text":
      return formatText(fileContents, config);
    case "json":
      return formatJSON(fileContents, config);
    case "markdown":
      return formatMarkdown(fileContents, config);
    case "tree":
      return formatTree(fileContents, config);
    default:
      logger.warn(
        `Unknown output format: ${config.outputFormat}, defaulting to text`,
      );
      return formatText(fileContents, config);
  }
}

/**
 * Compresses output using gzip
 *
 * @async
 * @param {string} output - The output to compress
 * @returns {Promise<Buffer>} Compressed output as a Buffer
 */
async function compressOutput(output) {
  logger.debug("Compressing output with gzip");

  const buffer = Buffer.from(output);
  const compressed = await new Promise((resolve, reject) => {
    const gzip = createGzip();
    const chunks = [];

    gzip.on("data", (chunk) => chunks.push(chunk));
    gzip.on("end", () => resolve(Buffer.concat(chunks)));
    gzip.on("error", reject);

    gzip.end(buffer);
  });

  logger.debug(
    `Compressed output from ${buffer.length} to ${compressed.length} bytes (${Math.round((compressed.length / buffer.length) * 100)}%)`,
  );
  return compressed;
}

/**
 * Promise-based wrapper for glob
 *
 * @param {string} pattern - Glob pattern
 * @param {Object} options - Glob options
 * @returns {Promise<string[]>} Array of matching file paths
 */
export function globPromise(pattern, options) {
  return new Promise((resolve, reject) => {
    glob(pattern, options, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

/**
 * Simple implementation of minimatch for pattern matching
 *
 * @param {string} file - File path to check
 * @param {string} pattern - Pattern to match against
 * @returns {boolean} True if the file matches the pattern
 */
export function minimatch(file, pattern) {
  try {
    // Handle exact matches
    if (pattern === file) return true;

    // Handle directory matches with trailing slash
    if (pattern.endsWith("/") && file.startsWith(pattern)) return true;

    // Convert glob pattern to regex
    let regex = pattern
      // Escape regex special chars except * and ?
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      // Convert glob * to regex .*
      .replace(/\*/g, ".*")
      // Convert glob ? to regex .
      .replace(/\?/g, ".");

    // Add start/end anchors
    regex = new RegExp(`^${regex}$`);
    return regex.test(file);
  } catch (error) {
    logger.error(`Error in minimatch: ${error.message}`);
    return false;
  }
}
