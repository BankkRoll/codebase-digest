/**
 * Encoding Utilities
 *
 * This module provides utilities for detecting and handling file encodings.
 *
 * @module utils/encoding
 */

import { detect } from "chardet";
import fs from "fs/promises";
import iconv from "iconv-lite";
import { logger } from "./logger.js";

/**
 * Detects the encoding of a file by analyzing its content
 *
 * @async
 * @param {string} filePath - Path to the file to analyze
 * @returns {Promise<string>} The detected encoding or 'utf8' if detection fails
 */
export const detectFileEncoding = async (filePath) => {
  try {
    logger.debug(`Detecting encoding for ${filePath}`);

    const buffer = Buffer.alloc(4096);
    const fd = await fs.open(filePath, "r");
    const { bytesRead } = await fd.read(buffer, 0, 4096, 0);
    await fd.close();

    if (bytesRead === 0) {
      logger.debug(`File ${filePath} is empty, defaulting to utf8`);
      return "utf8"; // Default for empty files
    }

    const detectedEncoding = detect(buffer.slice(0, bytesRead));
    logger.debug(
      `Detected encoding for ${filePath}: ${detectedEncoding || "unknown (defaulting to utf8)"}`,
    );

    return detectedEncoding || "utf8";
  } catch (error) {
    logger.warn(
      `Could not detect encoding for file ${filePath}: ${error.message}`,
    );
    return "utf8"; // Default to UTF-8 if detection fails
  }
};

/**
 * Reads a file with the appropriate encoding
 *
 * @async
 * @param {string} filePath - Path to the file to read
 * @param {Object} config - Configuration object
 * @returns {Promise<string>} The file content as a string
 * @throws {Error} If the file cannot be read
 */
export const readFileWithEncoding = async (filePath, config) => {
  try {
    let encoding = config.encoding;

    // Auto-detect encoding if configured
    if (encoding === "auto" && config.detectEncoding) {
      encoding = await detectFileEncoding(filePath);
    }

    logger.debug(`Reading ${filePath} with encoding: ${encoding}`);

    // For UTF-8 and other common encodings, use fs.readFile directly
    if (encoding === "utf8" || encoding === "utf-8") {
      return await fs.readFile(filePath, "utf8");
    }

    // For other encodings, use iconv-lite
    const buffer = await fs.readFile(filePath);

    // Verify that iconv-lite supports this encoding
    if (!iconv.encodingExists(encoding)) {
      logger.warn(
        `Encoding ${encoding} not supported by iconv-lite, falling back to utf8`,
      );
      encoding = "utf8";
    }

    return iconv.decode(buffer, encoding);
  } catch (error) {
    logger.error(`Error reading file ${filePath}: ${error.message}`);
    throw new Error(`Error reading file ${filePath}: ${error.message}`);
  }
};

/**
 * Creates a hexdump representation of binary data
 *
 * @param {Buffer} buffer - The binary data to convert
 * @param {number} [bytesPerLine=16] - Number of bytes to display per line
 * @returns {string} The hexdump representation
 */
export const createHexdump = (buffer, bytesPerLine = 16) => {
  let result = "";
  const lines = Math.ceil(buffer.length / bytesPerLine);

  for (let i = 0; i < lines; i++) {
    const offset = i * bytesPerLine;
    const lineBytes = buffer.slice(offset, offset + bytesPerLine);

    // Offset
    result += `${offset.toString(16).padStart(8, "0")}: `;

    // Hex values
    const hexValues = [];
    for (let j = 0; j < bytesPerLine; j++) {
      if (j < lineBytes.length) {
        hexValues.push(lineBytes[j].toString(16).padStart(2, "0"));
      } else {
        hexValues.push("  ");
      }
    }
    result += hexValues.join(" ") + " ";

    // ASCII representation
    result += " |";
    for (let j = 0; j < lineBytes.length; j++) {
      const byte = lineBytes[j];
      // Show printable ASCII characters, replace others with a dot
      result += byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".";
    }
    result += "|";

    if (i < lines - 1) {
      result += "\n";
    }
  }

  return result;
};
