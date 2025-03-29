/**
 * JSON Formatter
 *
 * This module provides functionality for formatting file contents as JSON.
 *
 * @module formatters/json-formatter
 */

import path from "path";
import { getLanguageForExtension } from "../config/language-map.js";
import { logger } from "../utils/logger.js";

/**
 * Formats file contents as JSON
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted JSON output
 */
export const formatJSON = (fileContents, config = {}) => {
  logger.debug("Formatting output as JSON");

  try {
    const { includeMetadata = false, excludeContent = false } = config;

    const files = fileContents.map((file) => {
      const fileObj = {
        path: file.path.replace(/\\/g, "/"),
      };

      if (!excludeContent) {
        fileObj.content = file.content || "";
      }

      if (includeMetadata) {
        if (file.size !== undefined) {
          fileObj.size = file.size;
        }
        if (file.modified) {
          fileObj.modified = file.modified;
        }
        if (file.extension) {
          fileObj.extension = file.extension;
        }
        if (file.language) {
          fileObj.language = file.language;
        }
      }

      return fileObj;
    });

    // Add statistics if requested
    if (config.includeStatistics) {
      const metadata = generateMetadata(fileContents);
      return JSON.stringify({ metadata, files: files }, null, 2);
    }

    return JSON.stringify(files, null, 2);
  } catch (error) {
    logger.error(`Error formatting JSON: ${error.message}`);
    return JSON.stringify(
      { error: `Error formatting JSON: ${error.message}` },
      null,
      2,
    );
  }
};

/**
 * Generates metadata for JSON output
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @returns {Object} Metadata object
 */
function generateMetadata(fileContents) {
  const totalFiles = fileContents.length;
  const totalSize = fileContents.reduce(
    (sum, file) => sum + (file.size || 0),
    0,
  );
  const fileTypes = {};
  const languages = {};

  fileContents.forEach((file) => {
    const ext =
      file.extension || path.extname(file.path).substring(1) || "unknown";
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;

    const language = getLanguageForExtension(ext);
    if (language) {
      languages[language] = (languages[language] || 0) + 1;
    }
  });

  return {
    totalFiles,
    totalSize,
    fileTypes: Object.entries(fileTypes)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [ext, count]) => {
        obj[ext || "no-extension"] = count;
        return obj;
      }, {}),
    languages: Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .reduce((obj, [lang, count]) => {
        obj[lang] = count;
        return obj;
      }, {}),
  };
}
