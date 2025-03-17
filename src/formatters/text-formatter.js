/**
 * Text Formatter
 *
 * This module provides functionality for formatting file contents as plain text.
 *
 * @module formatters/text-formatter
 */

import { formatFileSize } from "../utils/metadata.js";
import { logger } from "../utils/logger.js";

/**
 * Formats file contents as plain text
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted text output
 */
export const formatText = (fileContents, config) => {
  logger.debug("Formatting output as plain text");

  let output = "";

  fileContents.forEach((file, index) => {
    if (config.includeFileSeparator && index > 0) {
      output += "================================================\n\n";
    }

    if (config.includeFileHeader) {
      output += `File: ${file.path}\n`;

      if (config.includeByteSize) {
        output += `Size: ${formatFileSize(file.size)}\n`;
      }

      if (config.includeLastModified && file.modified) {
        output += `Modified: ${file.modified.toISOString()}\n`;
      }

      if (config.includeFileHash && file.hash) {
        output += `${config.hashAlgorithm.toUpperCase()}: ${file.hash}\n`;
      }

      if (config.includeMimeType && file.mimeType) {
        output += `MIME Type: ${file.mimeType}\n`;
      }

      output += "================================================\n";
    }

    if (file.error) {
      output += `[Error: ${file.error}]\n\n`;
      return;
    }

    if (config.includeLineNumbers) {
      const lines = file.content.split("\n");
      output += lines
        .map((line, i) => `${(i + 1).toString().padStart(6)}: ${line}`)
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
