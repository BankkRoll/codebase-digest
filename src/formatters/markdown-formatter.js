/**
 * Markdown Formatter
 *
 * This module provides functionality for formatting file contents as markdown.
 *
 * @module formatters/markdown-formatter
 */

import path from "path";
import { getLanguageForExtension } from "../config/language-map.js";
import { logger } from "../utils/logger.js";
import { formatFileSize } from "../utils/metadata.js";

/**
 * Formats file contents as markdown with syntax highlighting
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted markdown output
 */
export const formatMarkdown = (fileContents, config = {}) => {
  logger.debug("Formatting output as markdown");

  const { includeMetadata = false } = config;

  const lines = ["# Code Digest\n"];

  if (fileContents.length === 0) {
    lines.push("No files processed.\n");
    return lines.join("\n");
  }

  // Add summary if requested
  if (config.includeStatistics) {
    lines.push(generateStatisticsSummary(fileContents));
  }

  fileContents.forEach((file) => {
    const normalizedPath = file.path.replace(/\\/g, "/");
    lines.push(`## ${normalizedPath}\n`);

    if (includeMetadata) {
      if (file.size) lines.push(`Size: ${formatFileSize(file.size)}`);
      if (file.modified) lines.push(`Modified: ${file.modified}`);
      if (file.extension) lines.push(`Extension: ${file.extension}`);
      if (file.language) lines.push(`Language: ${file.language}`);
      lines.push(""); // Empty line after metadata
    }

    if (file.error) {
      lines.push(`**Error:** ${file.error}\n\n`);
      return;
    }

    // Determine language for syntax highlighting
    const ext = file.extension || path.extname(file.path).substring(1);
    const language = getLanguageForExtension(ext);

    if (config.includeLineNumbers) {
      const lines = file.content.split("\n");
      lines.push("```" + language + "\n");
      lines.push(
        lines
          .map((line, i) => `${String(i + 1).padStart(5)} ${line}`)
          .join("\n"),
      );
      lines.push("\n```\n\n");
    } else {
      lines.push("```" + language + "\n");
      lines.push(file.content);
      if (!file.content.endsWith("\n")) {
        lines.push("\n");
      }
      lines.push("```\n\n");
    }
  });

  return lines.join("\n");
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
