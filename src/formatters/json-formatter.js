/**
 * JSON Formatter
 *
 * This module provides functionality for formatting file contents as JSON.
 *
 * @module formatters/json-formatter
 */

import { logger } from "../utils/logger.js";

/**
 * Formats file contents as JSON
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted JSON output
 */
export const formatJSON = (fileContents, config) => {
  logger.debug("Formatting output as JSON");

  try {
    // Clean up circular references and non-serializable objects
    const cleanedContents = fileContents.map((file) => {
      const cleanFile = { ...file };

      // Convert Date objects to ISO strings
      if (cleanFile.modified instanceof Date) {
        cleanFile.modified = cleanFile.modified.toISOString();
      }
      if (cleanFile.created instanceof Date) {
        cleanFile.created = cleanFile.created.toISOString();
      }

      return cleanFile;
    });

    // Add metadata if requested
    let result = cleanedContents;

    if (config.codeStatistics) {
      const metadata = generateMetadata(fileContents);
      result = {
        metadata,
        files: cleanedContents,
      };
    }

    return JSON.stringify(result, null, 2);
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

  fileContents.forEach((file) => {
    const ext = file.extension || "unknown";
    fileTypes[ext] = (fileTypes[ext] || 0) + 1;
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
  };
}
