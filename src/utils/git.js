/**
 * Git Utilities
 *
 * This module provides utilities for interacting with Git repositories.
 *
 * @module utils/git
 */

import { exec } from "child_process";
import { logger } from "./logger.js";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Checks if a directory is a Git repository
 *
 * @async
 * @param {string} directory - Path to the directory
 * @returns {Promise<boolean>} True if the directory is a Git repository
 */
export async function isGitRepository(directory) {
  try {
    await execAsync("git rev-parse --is-inside-work-tree", { cwd: directory });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets Git statistics for a file
 *
 * @async
 * @param {string} filePath - Path to the file
 * @param {string} directory - Base directory (Git repository root)
 * @returns {Promise<Object|null>} Git statistics or null if not available
 */
export async function getGitStats(filePath, directory) {
  try {
    // Check if the directory is a Git repository
    if (!(await isGitRepository(directory))) {
      return null;
    }

    // Get the relative path to the file from the repository root
    const { stdout: repoRoot } = await execAsync(
      "git rev-parse --show-toplevel",
      {
        cwd: directory,
      },
    );
    const relativePath = filePath
      .replace(repoRoot.trim(), "")
      .replace(/^[/\\]/, "");

    // Get the last commit information
    const { stdout: lastCommit } = await execAsync(
      `git log -1 --pretty=format:"%h|%an|%ae|%ad|%s" -- "${relativePath}"`,
      { cwd: directory },
    );

    if (!lastCommit) {
      return null;
    }

    // Parse the commit information
    const [hash, author, email, date, subject] = lastCommit.split("|");

    // Get the number of commits for this file
    const { stdout: commitCount } = await execAsync(
      `git rev-list --count HEAD -- "${relativePath}"`,
      { cwd: directory },
    );

    // Get the creation date of the file
    const { stdout: creationDate } = await execAsync(
      `git log --follow --format=%ad --date=iso -- "${relativePath}" | tail -1`,
      { cwd: directory },
    );

    return {
      lastCommit: {
        hash,
        author,
        email,
        date: new Date(date),
        subject,
      },
      commitCount: parseInt(commitCount.trim(), 10),
      creationDate: new Date(creationDate.trim()),
    };
  } catch (error) {
    logger.warn(`Error getting Git stats for ${filePath}: ${error.message}`);
    return null;
  }
}
