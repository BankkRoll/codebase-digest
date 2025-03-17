/**
 * XML Formatter
 *
 * This module provides functionality for formatting file contents as XML.
 *
 * @module formatters/xml-formatter
 */

import { escapeXML } from "../utils/escape.js";
import { logger } from "../utils/logger.js";

/**
 * Formats file contents as XML
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} Formatted XML output
 */
export const formatXML = (fileContents, config) => {
  logger.debug("Formatting output as XML");

  let output = `<?xml version="1.0" encoding="UTF-8"?>\n<codeDigest>\n`;

  // Add metadata if requested
  if (config.codeStatistics) {
    output += generateStatisticsMetadata(fileContents);
  }

  fileContents.forEach((file) => {
    output += `  <file path="${escapeXML(file.path)}"`;

    if (config.includeByteSize) {
      output += ` size="${file.size}"`;
    }

    if (config.includeLastModified && file.modified) {
      output += ` modified="${file.modified.toISOString()}"`;
    }

    if (config.includeFileHash && file.hash) {
      output += ` hash="${file.hash}"`;
    }

    if (config.includeMimeType && file.mimeType) {
      output += ` mimeType="${escapeXML(file.mimeType)}"`;
    }

    if (file.error) {
      output += `>\n    <error>${escapeXML(file.error)}</error>\n  </file>\n`;
    } else {
      output += `>\n    <content><![CDATA[${file.content}]]></content>\n  </file>\n`;
    }
  });

  output += `</codeDigest>`;

  return output;
};

/**
 * Generates statistics metadata section for XML output
 *
 * @param {Object[]} fileContents - Array of file data objects
 * @returns {string} XML formatted statistics metadata
 */
function generateStatisticsMetadata(fileContents) {
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

  let metadata = `  <metadata>\n`;
  metadata += `    <totalFiles>${totalFiles}</totalFiles>\n`;
  metadata += `    <totalSize>${totalSize}</totalSize>\n`;
  metadata += `    <fileTypes>\n`;

  Object.entries(fileTypes)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ext, count]) => {
      metadata += `      <fileType extension="${escapeXML(ext || "no-extension")}" count="${count}" />\n`;
    });

  metadata += `    </fileTypes>\n`;
  metadata += `  </metadata>\n`;

  return metadata;
}
