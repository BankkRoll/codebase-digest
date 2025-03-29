/**
 * Example Custom HTML Formatter Plugin
 * 
 * This plugin demonstrates how to create a custom formatter that outputs code in HTML format
 * with syntax highlighting using highlight.js-like classes.
 */

/**
 * Custom HTML formatter that converts code to HTML with syntax highlighting classes
 * 
 * @param {Object[]} fileContents - Array of file data objects
 * @param {Object} config - Configuration object
 * @returns {string} HTML formatted output
 */
export const htmlFormatter = {
  name: 'html',
  description: 'Formats code as HTML with syntax highlighting',
  
  format: (fileContents, config = {}) => {
    let html = '<html>\n<head>\n';
    html += '<style>\n';
    html += `
      .code-container { 
        font-family: monospace;
        background: #f5f5f5;
        padding: 1em;
        margin: 1em 0;
        border-radius: 4px;
      }
      .file-header {
        font-weight: bold;
        margin-bottom: 1em;
        padding-bottom: 0.5em;
        border-bottom: 1px solid #ddd;
      }
      .line-number {
        color: #999;
        margin-right: 1em;
        user-select: none;
      }
      .keyword { color: #07a; }
      .string { color: #690; }
      .comment { color: #999; }
    `;
    html += '</style>\n</head>\n<body>\n';

    fileContents.forEach(file => {
      html += `<div class="code-container">\n`;
      html += `<div class="file-header">${file.path}</div>\n`;
      
      if (file.error) {
        html += `<div class="error">${file.error}</div>\n`;
      } else {
        const lines = file.content.split('\n');
        html += '<pre><code>\n';
        
        lines.forEach((line, i) => {
          // Simple syntax highlighting (just an example)
          const highlightedLine = line
            .replace(/\b(const|let|var|function|return|if|else|for|while)\b/g, '<span class="keyword">$1</span>')
            .replace(/(["'])(.*?)\1/g, '<span class="string">$1$2$1</span>')
            .replace(/(\/\/.*$)/g, '<span class="comment">$1</span>');

          html += `<span class="line-number">${String(i + 1).padStart(4)}</span>`;
          html += highlightedLine + '\n';
        });
        
        html += '</code></pre>\n';
      }
      
      html += '</div>\n';
    });

    html += '</body>\n</html>';
    return html;
  }
};

// Usage example in defaults.js:
// 
// import { htmlFormatter } from './plugins/custom-formatter.js';
// 
// export const defaultConfig = {
//   ...
//   customFormatters: {
//     html: htmlFormatter
//   }
// }; 