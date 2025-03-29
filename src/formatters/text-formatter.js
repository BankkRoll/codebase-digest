/**
 * Text Formatter
 *
 * This module provides functionality for formatting file contents as plain text.
 *
 * @module formatters/text-formatter
 */

import path from "path";
import { getLanguageForExtension } from "../config/language-map.js";
import { logger } from "../utils/logger.js";
import { formatFileSize } from "../utils/metadata.js";

/**
 * Formats file contents as plain text
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted text output
 */
export const formatText = (fileContents, config = {}) => {
  logger.debug("Formatting output as plain text");

  // Set default configuration
  const defaultConfig = {
    includeFileSeparator: true,
    includeFileHeader: true,
    includeByteSize: true,
    includeLastModified: true,
    includeFileHash: true,
    includeMimeType: true,
    includeLineNumbers: false,
  };

  // Merge with provided config
  config = { ...defaultConfig, ...config };

  let output = "";
  const separator = "=".repeat(50) + "\n\n";

  fileContents.forEach((file, index) => {
    if (config.includeFileSeparator && index > 0) {
      output += separator;
    }

    // Add file header if enabled
    if (config.includeFileHeader) {
      output += `File: ${file.path}\n`;

      if (config.includeByteSize) {
        output += `Size: ${formatFileSize(file.size)}\n`;
      }

      if (config.includeLastModified && file.modified) {
        output += `Modified: ${file.modified.toISOString()}\n`;
      }

      if (config.includeFileHash && file.hash) {
        output += `${config.hashAlgorithm?.toUpperCase() || "HASH"}: ${file.hash}\n`;
      }

      if (config.includeMimeType && file.mimeType) {
        output += `MIME Type: ${file.mimeType}\n`;
      }

      // Add language info
      const ext = file.extension || path.extname(file.path).substring(1);
      const language = getLanguageForExtension(ext);
      if (language) {
        output += `Language: ${language}\n`;
      }

      output += separator;
    }

    if (file.error) {
      output += `[Error: ${file.error}]\n\n`;
      return;
    }

    // Add content with line numbers if enabled
    if (config.includeLineNumbers) {
      const lines = file.content.split("\n");
      const maxLineNumberWidth = String(lines.length).length;
      output += lines
        .map(
          (line, i) => `${String(i + 1).padStart(maxLineNumberWidth)} ${line}`,
        )
        .join("\n");
    } else {
      output += file.content;
    }

    // Ensure there's a newline at the end
    if (!output.endsWith("\n\n")) {
      output += output.endsWith("\n") ? "\n" : "\n\n";
    }
  });

  return output;
};
