/**
 * File Detection Utilities
 *
 * This module provides utilities for detecting file types, particularly
 * distinguishing between binary and text files.
 *
 * @module utils/file-detection
 */

import fs from "fs/promises";
import { logger } from "./logger.js";

/**
 * Determines if a file is binary based on content analysis
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<boolean>} True if the file is binary, false otherwise
 */
export const isBinaryFile = async (filePath) => {
  try {
    const fd = await fs.open(filePath, "r");
    const buffer = Buffer.alloc(4096);
    const { bytesRead } = await fd.read(buffer, 0, 4096, 0);
    await fd.close();

    if (bytesRead === 0) {
      return false; // Empty file is not binary
    }

    // Check for NULL bytes and control characters
    let suspiciousBytes = 0;
    for (let i = 0; i < bytesRead; i++) {
      const byte = buffer[i];
      // NULL byte or control characters (except common ones like newline, tab, etc.)
      if (byte === 0 || (byte < 32 && ![9, 10, 13].includes(byte))) {
        suspiciousBytes++;
      }
    }

    // If more than 10% of the bytes are suspicious, consider it binary
    return suspiciousBytes / bytesRead > 0.1;
  } catch (error) {
    logger.error(`Error in isBinaryFile for ${filePath}: ${error.message}`);
    return false;
  }
};

/**
 * Detects the encoding of a file
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<string>} The detected encoding
 */
export const detectFileEncoding = async (filePath) => {
  try {
    const buffer = await fs.readFile(filePath);

    // Check for UTF-16 BOM
    if (buffer.length >= 2) {
      if (buffer[0] === 0xff && buffer[1] === 0xfe) {
        return "utf16le";
      }
      if (buffer[0] === 0xfe && buffer[1] === 0xff) {
        return "utf16be";
      }
    }

    // Check for UTF-8 BOM
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xef &&
      buffer[1] === 0xbb &&
      buffer[2] === 0xbf
    ) {
      return "utf8";
    }

    // Default to UTF-8
    return "utf8";
  } catch (error) {
    logger.error(`Error detecting encoding for ${filePath}: ${error.message}`);
    return "utf8";
  }
};

/**
 * Reads a file with the specified encoding
 *
 * @async
 * @param {string} filePath - Path to the file to read
 * @param {string} encoding - The encoding to use
 * @returns {Promise<string>} The file contents
 */
export const readFileWithEncoding = async (filePath, encoding = "utf8") => {
  try {
    const content = await fs.readFile(filePath, encoding);
    return content;
  } catch (error) {
    logger.error(`Error reading file ${filePath}: ${error.message}`);
    throw error;
  }
};

/**
 * Detects line endings in a file
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<string>} The detected line ending type ('lf', 'crlf', or 'cr')
 */
export const detectLineEndings = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf8");

    const crlfCount = (content.match(/\r\n/g) || []).length;
    const lfCount = (content.match(/[^\r]\n/g) || []).length;
    const crCount = (content.match(/\r(?!\n)/g) || []).length;

    if (crlfCount > lfCount && crlfCount > crCount) return "crlf";
    if (lfCount > crlfCount && lfCount > crCount) return "lf";
    if (crCount > crlfCount && crCount > lfCount) return "cr";

    return "lf"; // Default to LF
  } catch (error) {
    logger.error(
      `Error detecting line endings for ${filePath}: ${error.message}`,
    );
    return "lf";
  }
};

/**
 * Normalizes line endings in text
 *
 * @param {string} content - The text content to normalize
 * @param {string} targetEnding - The desired line ending ('lf', 'crlf', or 'cr')
 * @returns {string} The normalized text
 */
export const normalizeLineEndings = (content, targetEnding = "lf") => {
  // First convert all line endings to LF
  let normalized = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Then convert to target ending
  switch (targetEnding.toLowerCase()) {
    case "crlf":
      return normalized.replace(/\n/g, "\r\n");
    case "cr":
      return normalized.replace(/\n/g, "\r");
    case "lf":
    default:
      return normalized;
  }
};

/**
 * Detects indentation in a file
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<{type: string, size: number}>} The detected indentation type and size
 */
export const detectIndentation = async (filePath) => {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const lines = content.split("\n");

    let spaceIndents = 0;
    let tabIndents = 0;
    let spaceIndentSizes = new Map();

    for (const line of lines) {
      const indentMatch = line.match(/^(\s+)/);
      if (!indentMatch) continue;

      const indent = indentMatch[1];
      if (indent.includes("\t")) {
        tabIndents++;
      } else {
        spaceIndents++;
        const size = indent.length;
        spaceIndentSizes.set(size, (spaceIndentSizes.get(size) || 0) + 1);
      }
    }

    if (tabIndents > spaceIndents) {
      return { type: "tabs", size: 1 };
    }

    // Find most common space indent size
    let maxCount = 0;
    let mostCommonSize = 2; // Default to 2 spaces
    for (const [size, count] of spaceIndentSizes) {
      if (count > maxCount) {
        maxCount = count;
        mostCommonSize = size;
      }
    }

    return { type: "spaces", size: mostCommonSize };
  } catch (error) {
    logger.error(
      `Error detecting indentation for ${filePath}: ${error.message}`,
    );
    return { type: "spaces", size: 2 };
  }
};

/**
 * Determines if a file should be processed based on configuration rules
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @param {string} relativePath - Path relative to the base directory
 * @param {Object} config - Configuration object
 * @returns {Promise<{shouldProcess: boolean, reason: string}>} Result object with decision and reason
 */
export const shouldProcessFile = async (filePath, relativePath, config) => {
  try {
    // Get file stats
    const stats = await fs.stat(filePath);

    // Check if file is empty and skipEmptyFiles is true
    if (config.skipEmptyFiles && stats.size === 0) {
      return {
        shouldProcess: false,
        reason: "File is empty and skipEmptyFiles is true",
      };
    }

    // Check if file is too small
    if (stats.size < config.minFileSize) {
      return {
        shouldProcess: false,
        reason: `File size (${stats.size} bytes) is below minimum (${config.minFileSize} bytes)`,
      };
    }

    // Check if file is too large
    if (stats.size > config.maxFileSize) {
      return {
        shouldProcess: false,
        reason: `File size (${stats.size} bytes) exceeds maximum (${config.maxFileSize} bytes)`,
      };
    }

    // Check if file is binary
    if (config.detectBinary) {
      const isBinary = await isBinaryFile(filePath);

      if (isBinary && config.skipBinaryFiles) {
        return {
          shouldProcess: false,
          reason: "File is binary and skipBinaryFiles is true",
        };
      }
    }

    // All checks passed
    return { shouldProcess: true, reason: "All checks passed" };
  } catch (error) {
    logger.error(
      `Error in shouldProcessFile for ${filePath}: ${error.message}`,
    );
    return {
      shouldProcess: false,
      reason: `Error checking file: ${error.message}`,
    };
  }
};
