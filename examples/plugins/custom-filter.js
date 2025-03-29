/**
 * Example Custom Filter Plugin
 * 
 * This plugin demonstrates how to create a custom filter that can analyze
 * and filter files based on code complexity metrics.
 */

/**
 * Custom filter that analyzes code complexity and filters files
 * based on various metrics like cyclomatic complexity, length, etc.
 */
export const complexityFilter = {
  name: 'complexity-filter',
  description: 'Filters files based on code complexity metrics',
  
  /**
   * Calculate cyclomatic complexity (a simplified version)
   * @param {string} content - File content
   * @returns {number} Complexity score
   */
  calculateComplexity: (content) => {
    let complexity = 1; // Base complexity

    // Count decision points
    const decisions = [
      /if\s*\(/g,          // if statements
      /else\s+if\s*\(/g,   // else if
      /while\s*\(/g,       // while loops
      /for\s*\(/g,         // for loops
      /\?\s*\w+\s*:/g,     // ternary operators
      /case\s+\w+:/g,      // case statements
      /catch\s*\(/g,       // catch blocks
      /&&|\|\|/g,          // logical operators
    ];

    decisions.forEach(pattern => {
      const matches = content.match(pattern) || [];
      complexity += matches.length;
    });

    return complexity;
  },

  /**
   * Count the number of functions
   * @param {string} content - File content
   * @returns {number} Function count
   */
  countFunctions: (content) => {
    const functionPatterns = [
      /function\s+\w+\s*\(/g,      // Named functions
      /const\s+\w+\s*=\s*\([^)]*\)\s*=>/g,  // Arrow functions
      /\w+\s*:\s*function\s*\(/g,  // Object methods
    ];

    return functionPatterns.reduce((count, pattern) => {
      const matches = content.match(pattern) || [];
      return count + matches.length;
    }, 0);
  },

  /**
   * Filter function that decides whether to include a file
   * @param {Object} file - File object with content and metadata
   * @param {Object} config - Filter configuration
   * @returns {boolean} Whether to include the file
   */
  filter: (file, config = {}) => {
    const {
      maxComplexity = 10,
      maxFunctions = 20,
      maxLines = 500,
      minComplexity = 0,
    } = config;

    // Skip non-code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.cs'];
    if (!codeExtensions.some(ext => file.path.endsWith(ext))) {
      return true; // Include non-code files by default
    }

    const complexity = complexityFilter.calculateComplexity(file.content);
    const functionCount = complexityFilter.countFunctions(file.content);
    const lineCount = file.content.split('\n').length;

    // Store metrics in file metadata for later use
    file.metadata = {
      ...file.metadata,
      complexity,
      functionCount,
      lineCount,
    };

    // Apply filters
    return (
      complexity <= maxComplexity &&
      complexity >= minComplexity &&
      functionCount <= maxFunctions &&
      lineCount <= maxLines
    );
  },

  /**
   * Generate a report of complexity metrics
   * @param {Object} file - File object with content and metadata
   * @returns {string} Formatted report
   */
  generateReport: (file) => {
    const { complexity, functionCount, lineCount } = file.metadata || {};
    
    return `
File Complexity Report: ${file.path}
--------------------------------
Cyclomatic Complexity: ${complexity || 'N/A'}
Function Count: ${functionCount || 'N/A'}
Line Count: ${lineCount || 'N/A'}
Risk Level: ${
      complexity > 15 ? 'High' :
      complexity > 10 ? 'Medium' :
      'Low'
    }
`;
  }
};

// Usage example in defaults.js:
// 
// import { complexityFilter } from './plugins/custom-filter.js';
// 
// export const defaultConfig = {
//   ...
//   customFilters: {
//     complexity: complexityFilter
//   },
//   // Configure the filter
//   complexityFilterConfig: {
//     maxComplexity: 15,
//     maxFunctions: 25,
//     maxLines: 1000,
//     minComplexity: 0
//   }
// }; 