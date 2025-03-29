# Configuration Guide

## Table of Contents
- [Overview](#overview)
- [Configuration Methods](#configuration-methods)
- [Configuration Options](#configuration-options)
- [Environment Variables](#environment-variables)
- [Examples](#examples)
- [Basic Configuration](#basic-configuration)
- [Advanced Configuration](#advanced-configuration)
- [Language Support](#language-support)
- [Performance Tuning](#performance-tuning)
- [Output Formatting](#output-formatting)
- [Security Options](#security-options)

## Overview

Codebase Digest can be configured through multiple methods:
1. Command-line arguments
2. Configuration files
3. Environment variables
4. Programmatic configuration

## Configuration Methods

### 1. Command-line Arguments
```bash
codebase-digest ./src \
  --format markdown \
  --output report.md \
  --include "**/*.js" \
  --exclude "**/*.test.js"
```

### 2. Configuration File (.codedigest.json)
```json
{
  "format": "markdown",
  "output": "report.md",
  "include": ["**/*.js"],
  "exclude": ["**/*.test.js"],
  "plugins": {
    "security": {
      "enabled": true,
      "severity": "high"
    }
  }
}
```

### 3. Environment Variables
```bash
export CODEDIGEST_FORMAT=markdown
export CODEDIGEST_OUTPUT=report.md
export CODEDIGEST_INCLUDE="**/*.js"
export CODEDIGEST_EXCLUDE="**/*.test.js"
```

### 4. Programmatic Configuration
```js
import { processDirectory, defaultConfig } from 'codebase-digest';

const config = {
  ...defaultConfig,
  format: 'markdown',
  output: 'report.md',
  include: ['**/*.js'],
  exclude: ['**/*.test.js']
};

await processDirectory('./src', config);
```

## Configuration Options

### Core Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | string | 'text' | Output format (text, json, markdown) |
| `output` | string | null | Output file path |
| `include` | string[] | ['**/*'] | Files to include |
| `exclude` | string[] | [] | Files to exclude |

### Processing Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `parallel` | boolean | true | Enable parallel processing |
| `maxParallel` | number | CPU count | Max parallel processes |
| `cacheEnabled` | boolean | true | Enable result caching |
| `timeout` | number | 3600000 | Processing timeout (ms) |

### Plugin Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `plugins` | object | {} | Plugin configurations |
| `customAnalyzers` | object | {} | Custom analyzers |
| `customFormatters` | object | {} | Custom formatters |

### Output Options
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `lineNumbers` | boolean | false | Include line numbers |
| `metadata` | boolean | false | Include metadata |
| `statistics` | boolean | false | Include statistics |

## Environment Variables

### Core Variables
- `CODEDIGEST_FORMAT`: Output format
- `CODEDIGEST_OUTPUT`: Output file
- `CODEDIGEST_CONFIG`: Config file path
- `CODEDIGEST_VERBOSE`: Enable verbose logging

### Processing Variables
- `CODEDIGEST_PARALLEL`: Enable parallel processing
- `CODEDIGEST_MAX_PARALLEL`: Max parallel processes
- `CODEDIGEST_TIMEOUT`: Processing timeout
- `CODEDIGEST_CACHE_DIR`: Cache directory

### Plugin Variables
- `CODEDIGEST_PLUGINS`: Enabled plugins
- `CODEDIGEST_PLUGIN_CONFIG`: Plugin configurations
- `CODEDIGEST_CUSTOM_RULES`: Custom rule definitions

## Examples

### Basic Configuration
```json
{
  "format": "markdown",
  "output": "docs/report.md",
  "include": ["src/**/*.js", "lib/**/*.js"],
  "exclude": ["**/*.test.js", "**/*.spec.js"]
}
```

### Advanced Configuration
```json
{
  "format": "json",
  "output": "analysis.json",
  "include": ["src/**/*.{js,ts}"],
  "exclude": ["**/*.test.ts", "**/node_modules/**"],
  "parallel": true,
  "maxParallel": 8,
  "plugins": {
    "security": {
      "enabled": true,
      "severity": "high",
      "rules": ["sql-injection", "xss", "csrf"]
    },
    "complexity": {
      "enabled": true,
      "threshold": 15,
      "metrics": ["cyclomatic", "cognitive"]
    }
  },
  "output": {
    "lineNumbers": true,
    "metadata": true,
    "statistics": true,
    "format": {
      "indent": 2,
      "color": true
    }
  }
}
```

### CI/CD Configuration
```json
{
  "format": "json",
  "output": "ci-report.json",
  "parallel": true,
  "failOnIssues": true,
  "thresholds": {
    "complexity": 20,
    "coverage": 80,
    "duplications": 5
  },
  "reporters": ["json", "html", "gitlab"],
  "plugins": {
    "security": { "enabled": true },
    "coverage": { "enabled": true },
    "duplication": { "enabled": true }
  }
}
```

## Basic Configuration

```js
{
  // Output format: 'json', 'text', 'markdown', or 'tree'
  outputFormat: 'json',
  
  // File patterns to include/exclude
  includePatterns: ['**/*'],
  excludePatterns: ['**/node_modules/**', '**/.git/**'],
  
  // Maximum file size to process (in bytes)
  maxFileSize: 1048576, // 1MB
  
  // Whether to process files in parallel
  parallel: true,
  
  // Maximum number of parallel processes
  maxParallelProcesses: 8
}
```

## Advanced Configuration

```js
{
  // Code analysis options
  codeStatistics: true,    // Include code statistics
  codeMetrics: true,       // Include complexity metrics
  gitStats: true,          // Include git history
  
  // Processing options
  detectBinary: true,      // Detect binary files
  normalizeLineEndings: true, // Normalize line endings
  stripWhitespace: false,  // Remove extra whitespace
  commentStripping: false, // Remove comments
  
  // Output options
  includeLineNumbers: true,
  syntaxHighlighting: true,
  includeMetadata: true,
  
  // Progress tracking
  onProgress: (processed, total) => {},
  onError: (error, file) => {},
  onComplete: (result) => {}
}
```

## Language Support

The following languages are supported with syntax highlighting and special processing:

```js
{
  // Core languages
  javascript: ['.js', '.jsx', '.mjs'],
  typescript: ['.ts', '.tsx'],
  python: ['.py', '.pyw'],
  java: ['.java'],
  
  // Web technologies
  html: ['.html', '.htm'],
  css: ['.css', '.scss', '.sass', '.less'],
  
  // Configuration files
  json: ['.json'],
  yaml: ['.yml', '.yaml'],
  
  // Documentation
  markdown: ['.md', '.markdown'],
  
  // And many more...
}
```

## Performance Tuning

```js
{
  // Parallel processing
  parallel: true,
  maxParallelProcesses: 8,
  chunkSize: 100,
  
  // Memory management
  maxFileSize: 1048576,
  maxTotalSize: 1073741824, // 1GB
  
  // Caching
  enableCache: true,
  cacheDirectory: '.digest-cache',
  cacheTTL: 3600 // 1 hour
}
```

## Output Formatting

### JSON Format
```js
{
  outputFormat: 'json',
  pretty: true,
  includeMetadata: true,
  metadataFields: ['size', 'hash', 'mimeType', 'gitStats']
}
```

### Markdown Format
```js
{
  outputFormat: 'markdown',
  includeLineNumbers: true,
  syntaxHighlighting: true,
  includeTableOfContents: true,
  groupByDirectory: true
}
```

### Text Format
```js
{
  outputFormat: 'text',
  includeHeaders: true,
  includeSeparators: true,
  lineNumbering: true
}
```

### Tree Format
```js
{
  outputFormat: 'tree',
  showSizes: true,
  maxDepth: 3,
  sortBy: 'size',
  sortDirection: 'desc'
}
```

## Security Options

```js
{
  // File security
  includeFileHash: true,
  hashAlgorithm: 'sha256',
  includeMimeType: true,
  
  // Content security
  stripSecrets: true,
  secretPatterns: [
    /api[_-]key/i,
    /password/i,
    /secret/i
  ],
  
  // Access control
  restrictedPaths: [
    '**/node_modules/**',
    '**/.git/**',
    '**/secrets/**'
  ],
  
  // Validation
  validateContent: true,
  maxLineLength: 1000,
  maxFileCount: 10000
}
``` 