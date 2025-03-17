/**
 * HTML Formatter
 *
 * This module provides functionality for formatting file contents as HTML.
 *
 * @module formatters/html-formatter
 */

import { escapeHTML } from "../utils/escape.js";
import { formatFileSize } from "../utils/metadata.js";
import { logger } from "../utils/logger.js";

/**
 * Formats file contents as HTML
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted HTML output
 */
export const formatHTML = (fileContents, config) => {
  logger.debug("Formatting output as HTML");

  let output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Digest</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; }
    h2 { color: #3498db; margin-top: 30px; }
    pre { background-color: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
    code { font-family: 'Courier New', Courier, monospace; }
    .file-header { background-color: #eee; padding: 10px; border-radius: 5px 5px 0 0; margin-bottom: 0; }
    .file-content { margin-top: 0; border-radius: 0 0 5px 5px; }
    .metadata { color: #666; font-size: 0.9em; margin-bottom: 10px; }
    .line-numbers { color: #999; user-select: none; }
    .error { color: #e74c3c; }
    details { margin-bottom: 10px; }
    summary { cursor: pointer; }
  </style>
</head>
<body>
  <h1>Code Digest</h1>
`;

  if (fileContents.length === 0) {
    output += "  <p>No files processed.</p>\n";
  } else {
    // Add summary if requested
    if (config.codeStatistics) {
      output += generateStatisticsSummary(fileContents);
    }

    // Add file contents
    fileContents.forEach((file) => {
      output += `  <h2>${escapeHTML(file.path)}</h2>\n`;

      // Add file metadata
      if (
        config.includeByteSize ||
        config.includeLastModified ||
        config.includeFileHash ||
        config.includeMimeType
      ) {
        output += "  <details>\n";
        output += "    <summary>File metadata</summary>\n";
        output += '    <div class="metadata">\n';

        if (config.includeByteSize) {
          output += `      <div>Size: ${formatFileSize(file.size)}</div>\n`;
        }

        if (config.includeLastModified && file.modified) {
          output += `      <div>Modified: ${file.modified.toISOString()}</div>\n`;
        }

        if (config.includeFileHash && file.hash) {
          output += `      <div>${config.hashAlgorithm.toUpperCase()}: ${file.hash}</div>\n`;
        }

        if (config.includeMimeType && file.mimeType) {
          output += `      <div>MIME Type: ${file.mimeType}</div>\n`;
        }

        output += "    </div>\n";
        output += "  </details>\n";
      }

      if (file.error) {
        output += `  <div class="error">Error: ${escapeHTML(file.error)}</div>\n`;
      } else {
        output += `  <pre class="file-content"><code>`;

        if (config.includeLineNumbers) {
          const lines = file.content.split("\n");
          output += lines
            .map(
              (line, i) =>
                `<span class="line-numbers">${(i + 1).toString().padStart(6)}: </span>${escapeHTML(line)}`,
            )
            .join("\n");
        } else {
          output += escapeHTML(file.content);
        }

        output += `</code></pre>\n`;
      }
    });
  }

  output += `</body>
</html>`;

  return output;
};

/**
 * Generates a statistics summary section for HTML output
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @returns {string} HTML formatted statistics summary
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

  let summary = "  <h2>Summary</h2>\n";
  summary += "  <ul>\n";
  summary += `    <li>Total files: ${totalFiles}</li>\n`;
  summary += `    <li>Total size: ${formatFileSize(totalSize)}</li>\n`;
  summary += "    <li>File types:\n";
  summary += "      <ul>\n";

  Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      summary += `        <li>${ext || "no extension"}: ${count} files</li>\n`;
    });

  summary += "      </ul>\n";
  summary += "    </li>\n";
  summary += "  </ul>\n";

  return summary;
}
