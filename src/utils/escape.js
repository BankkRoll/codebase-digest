/**
 * Escape Utilities
 *
 * This module provides utilities for escaping special characters in different formats.
 *
 * @module utils/escape
 */

/**
 * Escapes special characters in HTML content
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeHTML = (str) => {
  if (!str || typeof str !== "string") return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Escapes special characters in XML content
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeXML = (str) => {
  if (!str || typeof str !== "string") return "";

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
};

/**
 * Escapes special characters in CSV content
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeCSV = (str) => {
  if (!str || typeof str !== "string") return "";

  // If the string contains quotes, commas, or newlines, it needs to be quoted
  if (/[",\n\r]/.test(str)) {
    // Double up any quotes and wrap in quotes
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

/**
 * Escapes special characters in JSON content
 *
 * @param {string} str - The string to escape
 * @returns {string} The escaped string
 */
export const escapeJSON = (str) => {
  if (!str || typeof str !== "string") return "";

  return JSON.stringify(str).slice(1, -1);
};
