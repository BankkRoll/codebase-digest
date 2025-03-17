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
import path from "path";

/**
 * Determines if a file is binary based on extension and content analysis
 *
 * This function uses a multi-stage approach:
 * 1. First checks the file extension against known binary/text extensions
 * 2. If inconclusive, reads a sample of the file and analyzes for binary content
 *
 * @async
 * @param {string} filePath - Path to the file to check
 * @param {Object} config - Configuration object
 * @returns {Promise<boolean>} True if the file is binary, false otherwise
 */
export const isBinaryFile = async (filePath, config) => {
  try {
    // Check extension first for performance
    const ext = path.extname(filePath).toLowerCase().substring(1);

    // Quick check against known extensions
    if (config.binaryFileExtensions.includes(ext)) {
      logger.debug(`File ${filePath} identified as binary by extension`);
      return true;
    }

    if (config.textFileExtensions.includes(ext)) {
      logger.debug(`File ${filePath} identified as text by extension`);
      return false;
    }

    // If extension check is inconclusive, read a sample of the file
    logger.debug(
      `Extension check inconclusive for ${filePath}, analyzing content`,
    );

    try {
      const fd = await fs.open(filePath, "r");
      const buffer = Buffer.alloc(4096);
      const { bytesRead } = await fd.read(buffer, 0, 4096, 0);
      await fd.close();

      if (bytesRead === 0) {
        logger.debug(`File ${filePath} is empty, treating as text`);
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
      const isBinary = suspiciousBytes / bytesRead > 0.1;
      logger.debug(
        `File ${filePath} analyzed: ${suspiciousBytes}/${bytesRead} suspicious bytes, isBinary=${isBinary}`,
      );
      return isBinary;
    } catch (error) {
      logger.warn(`Could not analyze content of ${filePath}: ${error.message}`);
      // Assume it's not binary if we can't check, to err on the side of inclusion
      return false;
    }
  } catch (error) {
    logger.error(`Error in isBinaryFile for ${filePath}: ${error.message}`);
    // In case of error, assume it's not binary to err on the side of inclusion
    return false;
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
      const isBinary = await isBinaryFile(filePath, config);

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
