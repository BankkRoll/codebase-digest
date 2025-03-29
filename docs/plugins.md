# Plugin Development Guide

## Table of Contents
- [Overview](#overview)
- [Plugin Types](#plugin-types)
- [Creating Plugins](#creating-plugins)
- [Plugin API Reference](#plugin-api-reference)
- [Examples](#examples)
- [Best Practices](#best-practices)

## Overview

Codebase Digest supports a flexible plugin system that allows you to extend its functionality in various ways:

- Custom formatters for new output formats
- File filters for custom file selection logic
- Language detectors for new file types
- Code transformers for custom processing
- Security analyzers for custom security checks

## Plugin Types

### Formatter Plugins

Formatter plugins allow you to create custom output formats:

```javascript
// custom-formatter.js
export default class CustomFormatter {
  constructor(options = {}) {
    this.options = options;
  }

  format(files) {
    // Transform files into custom format
    return customOutput;
  }
}
```

### Filter Plugins

Filter plugins provide custom file filtering logic:

```javascript
// custom-filter.js
export default class CustomFilter {
  constructor(options = {}) {
    this.options = options;
  }

  shouldInclude(file) {
    // Return true/false based on custom logic
    return customCondition;
  }
}
```

### Language Detector Plugins

Language detector plugins add support for new file types:

```javascript
// custom-language-detector.js
export default class CustomLanguageDetector {
  constructor(options = {}) {
    this.options = options;
  }

  detect(file) {
    // Return language info based on custom logic
    return {
      language: 'customLang',
      confidence: 0.9
    };
  }
}
```

### Transformer Plugins

Transformer plugins modify file content:

```javascript
// custom-transformer.js
export default class CustomTransformer {
  constructor(options = {}) {
    this.options = options;
  }

  transform(content, file) {
    // Transform content based on custom logic
    return transformedContent;
  }
}
```

### Security Analyzer Plugins

Security analyzer plugins perform custom security checks:

```javascript
// security-analyzer.js
export default class SecurityAnalyzer {
  constructor(options = {}) {
    this.options = options;
  }

  analyze(file) {
    // Perform security analysis
    return {
      vulnerabilities: [],
      riskLevel: 'low'
    };
  }
}
```

## Creating Plugins

1. Create a new JavaScript file for your plugin
2. Export a class that implements the appropriate plugin interface
3. Register your plugin with Codebase Digest

```javascript
import { registerPlugin } from 'codebase-digest';
import CustomFormatter from './custom-formatter';

registerPlugin('formatter', 'custom', CustomFormatter);
```

## Plugin API Reference

### Base Plugin Interface

All plugins must implement:

```javascript
class BasePlugin {
  constructor(options = {}) {
    this.options = options;
  }

  initialize() {
    // Optional initialization
  }

  cleanup() {
    // Optional cleanup
  }
}
```

### Formatter Plugin Interface

```javascript
class FormatterPlugin extends BasePlugin {
  format(files) {
    // Required: Transform files into output format
    return output;
  }

  getExtension() {
    // Optional: Return preferred file extension
    return '.custom';
  }
}
```

### Filter Plugin Interface

```javascript
class FilterPlugin extends BasePlugin {
  shouldInclude(file) {
    // Required: Return true/false
    return boolean;
  }

  getPriority() {
    // Optional: Return filter priority (higher runs first)
    return 0;
  }
}
```

### Language Detector Interface

```javascript
class LanguageDetectorPlugin extends BasePlugin {
  detect(file) {
    // Required: Return language info
    return {
      language: string,
      confidence: number
    };
  }

  getSupportedExtensions() {
    // Optional: Return supported file extensions
    return ['.custom'];
  }
}
```

### Transformer Interface

```javascript
class TransformerPlugin extends BasePlugin {
  transform(content, file) {
    // Required: Transform content
    return transformedContent;
  }

  getSupportedLanguages() {
    // Optional: Return supported languages
    return ['javascript', 'typescript'];
  }
}
```

### Security Analyzer Interface

```javascript
class SecurityAnalyzerPlugin extends BasePlugin {
  analyze(file) {
    // Required: Perform security analysis
    return {
      vulnerabilities: Array,
      riskLevel: string
    };
  }

  getSeverityLevels() {
    // Optional: Return custom severity levels
    return ['low', 'medium', 'high', 'critical'];
  }
}
```

## Examples

### Custom HTML Formatter

```javascript
// html-formatter.js
export default class HTMLFormatter {
  constructor(options = {}) {
    this.options = {
      syntaxHighlight: true,
      lineNumbers: true,
      ...options
    };
  }

  format(files) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Code Digest</title>
          <style>${this.getStyles()}</style>
        </head>
        <body>
          ${this.formatFiles(files)}
        </body>
      </html>
    `;
  }

  formatFiles(files) {
    return files.map(file => this.formatFile(file)).join('\n');
  }

  formatFile(file) {
    return `
      <div class="file">
        <h2>${file.path}</h2>
        <pre><code>${this.highlightCode(file.content)}</code></pre>
      </div>
    `;
  }

  getStyles() {
    return `
      .file { margin: 20px 0; }
      .file h2 { color: #333; }
      pre { background: #f5f5f5; padding: 15px; }
    `;
  }

  highlightCode(content) {
    // Implement syntax highlighting
    return content;
  }
}
```

### Custom Security Analyzer

```javascript
// security-analyzer.js
export default class SecurityAnalyzer {
  constructor(options = {}) {
    this.options = {
      severityThreshold: 'medium',
      ...options
    };
  }

  analyze(file) {
    const vulnerabilities = [];

    // Check for hardcoded secrets
    this.checkSecrets(file, vulnerabilities);

    // Check for security anti-patterns
    this.checkAntiPatterns(file, vulnerabilities);

    return {
      vulnerabilities,
      riskLevel: this.calculateRiskLevel(vulnerabilities)
    };
  }

  checkSecrets(file, vulnerabilities) {
    const secretPatterns = [
      /api[_-]key\s*[:=]\s*['"][^'"]+['"]/i,
      /password\s*[:=]\s*['"][^'"]+['"]/i,
      /secret\s*[:=]\s*['"][^'"]+['"]/i
    ];

    for (const pattern of secretPatterns) {
      const matches = file.content.match(pattern);
      if (matches) {
        vulnerabilities.push({
          type: 'hardcoded_secret',
          severity: 'high',
          line: this.findLineNumber(file.content, matches[0]),
          description: 'Hardcoded secret detected'
        });
      }
    }
  }

  checkAntiPatterns(file, vulnerabilities) {
    const antiPatterns = [
      {
        pattern: /eval\s*\(/,
        severity: 'high',
        type: 'dangerous_eval'
      },
      {
        pattern: /innerHTML\s*=/,
        severity: 'medium',
        type: 'xss_risk'
      }
    ];

    for (const {pattern, severity, type} of antiPatterns) {
      const matches = file.content.match(pattern);
      if (matches) {
        vulnerabilities.push({
          type,
          severity,
          line: this.findLineNumber(file.content, matches[0]),
          description: `Security anti-pattern: ${type}`
        });
      }
    }
  }

  calculateRiskLevel(vulnerabilities) {
    const severityScores = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    const maxSeverity = vulnerabilities.reduce((max, vuln) => {
      return Math.max(max, severityScores[vuln.severity] || 0);
    }, 0);

    return Object.keys(severityScores).find(
      key => severityScores[key] === maxSeverity
    ) || 'low';
  }

  findLineNumber(content, match) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return 0;
  }
}
```

## Best Practices

1. **Error Handling**
   - Implement proper error handling in your plugins
   - Provide meaningful error messages
   - Never throw unhandled exceptions

2. **Performance**
   - Optimize for large files and codebases
   - Implement caching when appropriate
   - Use streaming when possible for large files

3. **Configuration**
   - Make plugins configurable via options
   - Provide sensible defaults
   - Validate configuration options

4. **Documentation**
   - Document your plugin's purpose and functionality
   - Provide usage examples
   - Document all configuration options

5. **Testing**
   - Write unit tests for your plugin
   - Test with different file types and sizes
   - Test error conditions and edge cases 