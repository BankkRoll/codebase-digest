/**
 * CSV Formatter
 *
 * This module provides functionality for formatting file contents as CSV.
 *
 * @module formatters/csv-formatter
 */

import { escapeCSV } from "../utils/escape.js";
import { logger } from "../utils/logger.js";

/**
 * Formats file contents as CSV
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted CSV output
 */
export const formatCSV = (fileContents, config) => {
  logger.debug("Formatting output as CSV");

  if (fileContents.length === 0) return "";

  // Determine which fields to include
  const fields = ["path"];
  if (config.includeByteSize) fields.push("size");
  if (config.includeLastModified) fields.push("modified");
  if (config.includeFileHash) fields.push("hash");
  if (config.includeMimeType) fields.push("mimeType");
  fields.push("content");

  // Create header row
  let output = fields.join(",") + "\n";

  // Add data rows
  fileContents.forEach((file) => {
    const row = fields.map((field) => {
      let value = file[field];

      // Format dates
      if (field === "modified" && value instanceof Date) {
        value = value.toISOString();
      }

      // Escape and quote strings
      if (typeof value === "string") {
        value = escapeCSV(value);
      }

      return value || "";
    });

    output += row.join(",") + "\n";
  });

  return output;
};
