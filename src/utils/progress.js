/**
 * Progress Bar Utility
 *
 * This module provides a simple progress bar for CLI operations.
 *
 * @module utils/progress
 */

import chalk from "chalk";

/**
 * Creates a progress bar for CLI operations
 */
export class ProgressBar {
  /**
   * Creates a new progress bar
   *
   * @param {Object} options - Progress bar options
   * @param {number} options.total - Total number of items
   * @param {number} [options.width=30] - Width of the progress bar
   * @param {boolean} [options.clear=true] - Whether to clear the bar when complete
   * @param {string} [options.format=':bar :percent :current/:total :eta'] - Format string
   */
  constructor(options) {
    this.total = options.total;
    this.width = options.width || 30;
    this.clear = options.clear !== undefined ? options.clear : true;
    this.format = options.format || ":bar :percent :current/:total :eta";

    this.current = 0;
    this.startTime = Date.now();
    this.lastRender = 0;
  }

  /**
   * Updates the progress bar
   *
   * @param {number} [increment=1] - Amount to increment by
   */
  update(increment = 1) {
    this.current += increment;

    // Throttle rendering to avoid flickering
    const now = Date.now();
    if (now - this.lastRender < 100 && this.current < this.total) {
      return;
    }

    this.render();
    this.lastRender = now;
  }

  /**
   * Renders the progress bar
   */
  render() {
    // Calculate progress
    const percent = Math.min(
      Math.floor((this.current / this.total) * 100),
      100,
    );
    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const eta = rate > 0 ? Math.round((this.total - this.current) / rate) : 0;

    // Create the bar
    const completeWidth = Math.round(this.width * (this.current / this.total));
    const incompleteWidth = this.width - completeWidth;
    const bar =
      chalk.green("█".repeat(completeWidth)) +
      chalk.gray("░".repeat(incompleteWidth));

    // Format the output
    let output = this.format
      .replace(":bar", bar)
      .replace(":percent", `${percent}%`)
      .replace(":current", this.current.toString())
      .replace(":total", this.total.toString())
      .replace(":elapsed", formatTime(elapsed))
      .replace(":eta", formatTime(eta));

    // Clear the line and write the output
    process.stdout.write("\r\x1b[K" + output);

    // If complete, add a newline
    if (this.current >= this.total) {
      if (this.clear) {
        process.stdout.write("\r\x1b[K");
      } else {
        process.stdout.write("\n");
      }
    }
  }

  /**
   * Completes the progress bar
   */
  complete() {
    this.current = this.total;
    this.render();
  }
}

/**
 * Formats time in seconds to a human-readable string
 *
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds)) {
    return "?s";
  }

  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  seconds = Math.round(seconds % 60);

  return `${minutes}m ${seconds}s`;
}
