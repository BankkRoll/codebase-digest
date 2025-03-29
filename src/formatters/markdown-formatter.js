/**
 * Markdown Formatter
 *
 * This module provides functionality for formatting file contents as markdown.
 *
 * @module formatters/markdown-formatter
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
 * Formats file contents as markdown with syntax highlighting
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted markdown output
 */
export const formatMarkdown = (fileContents, config = {}) => {
  logger.debug("Formatting output as markdown");

  // Merge with default config
  config = { ...defaultConfig, ...config };

  const lines = [`${HEADER_LINE}\n# Code Digest\n${HEADER_LINE}\n\n`];

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
    lines.push(`${SUBHEADER_LINE}\n## ${normalizedPath}\n${SUBHEADER_LINE}\n`);

    if (config.includeMetadata) {
      lines.push("### File Information");
      if (file.size) lines.push(`- Size: ${formatFileSize(file.size)}`);
      if (file.modified) lines.push(`- Modified: ${file.modified}`);
      if (file.extension) lines.push(`- Extension: ${file.extension}`);
      if (file.language) lines.push(`- Language: ${file.language}`);
      lines.push("\n"); // Empty line after metadata
    }

    if (file.error) {
      lines.push(`**Error:** ${file.error}\n\n`);
      return;
    }

    // Determine language for syntax highlighting
    const ext = file.extension || path.extname(file.path).substring(1);
    const language = getLanguageForExtension(ext);

    lines.push("### File Contents\n");

    if (config.includeLineNumbers) {
      const contentLines = file.content.split("\n");
      lines.push("```" + language);
      lines.push(
        contentLines
          .map((line, i) => `${String(i + 1).padStart(5)} ${line}`)
          .join("\n"),
      );
      lines.push("```\n\n");
    } else {
      lines.push("```" + language);
      lines.push(file.content);
      if (!file.content.endsWith("\n")) {
        lines.push("");
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
