/**
 * Text Formatter
 *
 * This module provides functionality for formatting file contents as plain text.
 *
 * @module formatters/text-formatter
 */

import path from "path";
import { defaultConfig } from "../config/defaults.js";
import { getLanguageForExtension } from "../config/language-map.js";
import { logger } from "../utils/logger.js";
import { formatFileSize } from "../utils/metadata.js";

// Header styling constants
const HEADER_LINE = "=".repeat(50);
const SUBHEADER_LINE = "-".repeat(50);

/**
 * Formats file contents as plain text
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted text output
 */
export const formatText = (fileContents, config = {}) => {
  logger.debug("Formatting output as plain text");

  // Merge with default config
  config = { ...defaultConfig, ...config };

  let output = "";

  // Add main header
  output += `${HEADER_LINE}\n`;
  output += "Code Digest\n";
  output += `${HEADER_LINE}\n\n`;

  fileContents.forEach((file, index) => {
    if (config.includeFileSeparator && index > 0) {
      output += `${HEADER_LINE}\n\n`;
    }

    // Add file header if enabled
    if (config.includeFileHeader) {
      output += `${SUBHEADER_LINE}\n`;
      output += `File: ${file.path}\n`;
      output += `${SUBHEADER_LINE}\n\n`;

      output += "File Information:\n";
      if (config.includeByteSize) {
        output += `- Size: ${formatFileSize(file.size)}\n`;
      }

      if (config.includeLastModified && file.modified) {
        output += `- Modified: ${file.modified.toISOString()}\n`;
      }

      if (config.includeFileHash && file.hash) {
        output += `- ${config.hashAlgorithm?.toUpperCase() || "HASH"}: ${file.hash}\n`;
      }

      if (config.includeMimeType && file.mimeType) {
        output += `- MIME Type: ${file.mimeType}\n`;
      }

      // Add language info
      const ext = file.extension || path.extname(file.path).substring(1);
      const language = getLanguageForExtension(ext);
      if (language) {
        output += `- Language: ${language}\n`;
      }

      output += "\nFile Contents:\n";
      output += `${SUBHEADER_LINE}\n`;
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

  // Add final footer
  output += HEADER_LINE + "\n";

  return output;
};
