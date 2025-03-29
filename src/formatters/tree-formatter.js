/**
 * Tree Formatter
 *
 * This module provides functionality for formatting directory structure as an ASCII tree.
 *
 * @module formatters/tree-formatter
 */

import { logger } from "../utils/logger.js";

/**
 * Format file size in human-readable format
 *
 * @param {number} size - Size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(size) {
  if (size < 1024) return `${size}B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = size;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(1)}${units[unitIndex]}`;
}

/**
 * Formats directory structure as an ASCII tree
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted tree output
 */
export const formatTree = (fileContents, config) => {
  logger.debug("Formatting output as tree structure");

  if (fileContents.length === 0) {
    return "Empty directory\n";
  }

  // Sort files by path for proper tree structure
  const sortedFiles = [...fileContents].sort((a, b) =>
    a.path.localeCompare(b.path),
  );

  // Build directory structure
  const tree = {};
  sortedFiles.forEach((file) => {
    let current = tree;
    const parts = file.path.split(/[/\\]/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (!current[part]) {
        current[part] = {
          isFile: isLast,
          children: {},
          metadata: isLast ? file : null,
        };
      }

      if (!isLast) {
        current = current[part].children;
      }
    }
  });

  // Generate tree output
  let output = "";

  const renderTree = (node, prefix = "", isLastEntry = true) => {
    const entries = Object.entries(node);

    entries.forEach(([name, data], index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "└── " : "├── ";
      const newPrefix = prefix + (isLast ? "    " : "│   ");

      // Build the line with optional metadata
      let line = prefix + connector + name;

      if (data.isFile) {
        if (config.includeByteSize && data.metadata?.size !== undefined) {
          line += ` (${formatFileSize(data.metadata.size)})`;
        }
        if (config.includeLastModified && data.metadata?.modified) {
          line += ` [${data.metadata.modified.toISOString()}]`;
        }
      }

      output += line + "\n";

      // Process children if any exist
      const childEntries = Object.entries(data.children);
      if (childEntries.length > 0) {
        renderTree(data.children, newPrefix, isLast);
      }
    });
  };

  renderTree(tree);
  return output;
};
