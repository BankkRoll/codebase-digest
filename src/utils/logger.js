/**
 * Logger Utility
 *
 * This module provides a centralized logging system with different log levels
 * and formatting options.
 *
 * @module utils/logger
 */

import chalk from "chalk";

/**
 * Log levels with corresponding numeric values
 *
 * @enum {number}
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  FATAL: 4,
  SILENT: 5,
};

/**
 * Current log level, defaults to INFO in production, DEBUG in development
 */
let currentLogLevel =
  process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

/**
 * Whether to include timestamps in log messages
 */
let includeTimestamp = true;

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  /**
   * Sets the current log level
   *
   * @param {string|number} level - Log level name or numeric value
   */
  setLevel(level) {
    if (typeof level === "string") {
      const upperLevel = level.toUpperCase();
      if (LOG_LEVELS[upperLevel] !== undefined) {
        currentLogLevel = LOG_LEVELS[upperLevel];
      }
    } else if (typeof level === "number") {
      if (level >= LOG_LEVELS.DEBUG && level <= LOG_LEVELS.SILENT) {
        currentLogLevel = level;
      }
    }
  },

  /**
   * Enables or disables timestamps in log messages
   *
   * @param {boolean} enable - Whether to include timestamps
   */
  setTimestamp(enable) {
    includeTimestamp = !!enable;
  },

  /**
   * Formats a log message with optional timestamp
   *
   * @private
   * @param {string} level - Log level label
   * @param {string} message - Log message
   * @returns {string} Formatted log message
   */
  _format(level, message) {
    const timestamp = includeTimestamp ? `[${new Date().toISOString()}] ` : "";
    return `${timestamp}${level}: ${message}`;
  },

  /**
   * Logs a debug message
   *
   * @param {string} message - Message to log
   */
  debug(message) {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.debug(this._format("DEBUG", message));
    }
  },

  /**
   * Logs an info message
   *
   * @param {string} message - Message to log
   */
  info(message) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.info(chalk.blue(this._format("INFO", message)));
    }
  },

  /**
   * Logs a warning message
   *
   * @param {string} message - Message to log
   */
  warn(message) {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(chalk.yellow(this._format("WARN", message)));
    }
  },

  /**
   * Logs an error message
   *
   * @param {string} message - Message to log
   */
  error(message) {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error(chalk.red(this._format("ERROR", message)));
    }
  },

  /**
   * Logs a fatal error message
   *
   * @param {string} message - Message to log
   */
  fatal(message) {
    if (currentLogLevel <= LOG_LEVELS.FATAL) {
      console.error(chalk.bgRed.white(this._format("FATAL", message)));
    }
  },

  /**
   * Logs a success message
   *
   * @param {string} message - Message to log
   */
  success(message) {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(chalk.green(this._format("SUCCESS", message)));
    }
  },
};
