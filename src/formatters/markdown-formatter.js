/**
 * Markdown Formatter
 *
 * This module provides functionality for formatting file contents as markdown.
 *
 * @module formatters/markdown-formatter
 */

import { formatFileSize } from "../utils/metadata.js";
import { getLanguageForExtension } from "../config/language-map.js";
import { logger } from "../utils/logger.js";
import path from "path";

/**
 * Formats file contents as markdown with syntax highlighting
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted markdown output
 */
export const formatMarkdown = (fileContents, config) => {
  logger.debug("Formatting output as markdown");

  let output = "# Code Digest\n\n";

  if (fileContents.length === 0) {
    output += "No files processed.\n";
    return output;
  }

  // Add summary if requested
  if (config.codeStatistics) {
    output += generateStatisticsSummary(fileContents);
  }

  // Add file contents
  fileContents.forEach((file) => {
    output += `## ${file.path}\n\n`;

    // Add file metadata
    if (
      config.includeByteSize ||
      config.includeLastModified ||
      config.includeFileHash ||
      config.includeMimeType
    ) {
      output += "<details>\n<summary>File metadata</summary>\n\n";

      if (config.includeByteSize) {
        output += `- Size: ${formatFileSize(file.size)}\n`;
      }

      if (config.includeLastModified && file.modified) {
        output += `- Modified: ${file.modified.toISOString()}\n`;
      }

      if (config.includeFileHash && file.hash) {
        output += `- ${config.hashAlgorithm.toUpperCase()}: ${file.hash}\n`;
      }

      if (config.includeMimeType && file.mimeType) {
        output += `- MIME Type: ${file.mimeType}\n`;
      }

      output += "\n</details>\n\n";
    }

    if (file.error) {
      output += `**Error:** ${file.error}\n\n`;
      return;
    }

    // Determine language for syntax highlighting
    const ext = file.extension || path.extname(file.path).substring(1);
    const language = getLanguageForExtension(ext);

    if (config.includeLineNumbers) {
      const lines = file.content.split("\n");
      output += "```" + language + "\n";
      output += lines
        .map((line, i) => `${(i + 1).toString().padStart(6)}: ${line}`)
        .join("\n");
      output += "\n```\n\n";
    } else {
      output += "```" + language + "\n";
      output += file.content;
      output += "\n```\n\n";
    }
  });

  return output;
};

/**
 * Generates a statistics summary section for markdown output
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @returns {string} Markdown formatted statistics summary
 */
function generateStatisticsSummary(fileContents) {
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

  let summary = "## Summary\n\n";
  summary += `- Total files: ${totalFiles}\n`;
  summary += `- Total size: ${formatFileSize(totalSize)}\n`;
  summary += "- File types:\n";

  Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      summary += `  - ${ext || "no extension"}: ${count} files\n`;
    });

  summary += "\n";
  return summary;
}
