/**
 * File Metadata Utilities
 *
 * This module provides utilities for extracting and calculating metadata
 * about files, such as hashes and MIME types.
 *
 * @module utils/metadata
 */

import { createHash } from "crypto";
import { createReadStream } from "fs";
import path from "path";
import { logger } from "./logger.js";

/**
 * Calculates a cryptographic hash of a file's contents
 *
 * @async
 * @param {string} filePath - Path to the file
 * @param {string} [algorithm='md5'] - Hash algorithm to use (md5, sha1, sha256, sha512)
 * @returns {Promise<string>} The calculated hash as a hexadecimal string
 * @throws {Error} If the hash calculation fails
 */
export const calculateFileHash = async (filePath, algorithm = "md5") => {
  try {
    logger.debug(`Calculating ${algorithm} hash for ${filePath}`);

    // Validate algorithm
    const validAlgorithms = ["md5", "sha1", "sha256", "sha384", "sha512"];
    if (!validAlgorithms.includes(algorithm)) {
      logger.warn(`Invalid hash algorithm: ${algorithm}, falling back to md5`);
      algorithm = "md5";
    }

    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);

    return new Promise((resolve, reject) => {
      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => {
        const result = hash.digest("hex");
        logger.debug(
          `Hash calculation complete for ${filePath}: ${result.substring(0, 8)}...`,
        );
        resolve(result);
      });
      stream.on("error", (error) => {
        logger.error(
          `Error calculating hash for ${filePath}: ${error.message}`,
        );
        reject(
          new Error(`Error calculating hash for ${filePath}: ${error.message}`),
        );
      });
    });
  } catch (error) {
    logger.error(
      `Error in calculateFileHash for ${filePath}: ${error.message}`,
    );
    throw new Error(`Error calculating hash for ${filePath}: ${error.message}`);
  }
};

/**
 * Determines the MIME type of a file based on its extension
 *
 * @async
 * @param {string} filePath - Path to the file
 * @returns {Promise<string>} The MIME type or 'application/octet-stream' if unknown
 */
export const getFileMimeType = async (filePath) => {
  try {
    logger.debug(`Determining MIME type for ${filePath}`);

    // Use file extension to determine MIME type
    const ext = path.extname(filePath).toLowerCase().substring(1);
    const mimeTypes = {
      // Text files
      txt: "text/plain",
      html: "text/html",
      htm: "text/html",
      css: "text/css",
      csv: "text/csv",

      // Programming languages
      js: "application/javascript",
      mjs: "application/javascript",
      cjs: "application/javascript",
      jsx: "application/javascript",
      ts: "application/typescript",
      tsx: "application/typescript",
      json: "application/json",
      xml: "application/xml",
      py: "text/x-python",
      rb: "text/x-ruby",
      php: "text/x-php",
      java: "text/x-java",
      c: "text/x-c",
      cpp: "text/x-c++",
      cs: "text/x-csharp",
      go: "text/x-go",
      rs: "text/x-rust",

      // Document formats
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",

      // Images
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      bmp: "image/bmp",
      svg: "image/svg+xml",
      webp: "image/webp",

      // Audio/Video
      mp3: "audio/mpeg",
      mp4: "video/mp4",
      wav: "audio/wav",
      ogg: "audio/ogg",
      webm: "video/webm",

      // Archives
      zip: "application/zip",
      tar: "application/x-tar",
      gz: "application/gzip",
      rar: "application/vnd.rar",

      // Other
      md: "text/markdown",
      markdown: "text/markdown",
      yaml: "application/yaml",
      yml: "application/yaml",
      sh: "application/x-sh",
      bash: "application/x-sh",
      sql: "application/sql",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    logger.debug(`MIME type for ${filePath}: ${mimeType}`);
    return mimeType;
  } catch (error) {
    logger.error(
      `Error determining MIME type for ${filePath}: ${error.message}`,
    );
    return "application/octet-stream";
  }
};

/**
 * Formats a file size in bytes to a human-readable string
 *
 * @param {number} bytes - The file size in bytes
 * @returns {string} Human-readable file size (e.g., "1.23 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  if (bytes === undefined || bytes === null) return "Unknown";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};
