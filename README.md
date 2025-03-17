# Codebase Digest

A high-performance, enterprise-grade utility for transforming codebases into structured text digests optimized for Large Language Model (LLM) consumption, documentation generation, and code analysis.

[![npm version](https://img.shields.io/npm/v/codebase-digest.svg)](https://www.npmjs.com/package/codebase-digest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Technical Architecture](#technical-architecture)
- [Installation](#installation)
- [Command-Line Interface](#command-line-interface)
- [Programmatic API](#programmatic-api)
- [Configuration Reference](#configuration-reference)
  - [Core Options](#core-options)
  - [File Selection](#file-selection)
  - [Content Processing](#content-processing)
  - [Output Formatting](#output-formatting)
  - [Performance Tuning](#performance-tuning)
  - [Error Handling](#error-handling)
  - [Advanced Features](#advanced-features)
- [Output Format Specifications](#output-format-specifications)
- [Edge Case Handling](#edge-case-handling)
- [Performance Optimization](#performance-optimization)
- [Use Cases](#use-cases)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

```
codebase-digest/
├── package-lock.json
├── package.json
├── README.md
├── src
│   ├── cli
│   │   └── index.js
│   ├── config
│   │   ├── defaults.js
│   │   └── language-map.js
│   ├── core
│   │   └── processor.js
│   ├── formatters
│   │   ├── csv-formatter.js
│   │   ├── html-formatter.js
│   │   ├── index.js
│   │   ├── json-formatter.js
│   │   ├── markdown-formatter.js
│   │   ├── text-formatter.js
│   │   └── xml-formatter.js
│   ├── index.js
│   └── utils
│       ├── encoding.js
│       ├── escape.js
│       ├── file-detection.js
│       ├── git.js
│       ├── logger.js
│       ├── metadata.js
│       └── progress.js
```

## Overview

Codebase Digest is an advanced tool designed to transform source code repositories into structured text representations optimized for machine learning model ingestion, documentation generation, and code analysis. It offers comprehensive configuration options, parallel processing capabilities, and intelligent handling of diverse file types and encodings.

### Key Capabilities

- **Multi-format Output Generation**: Text, JSON, Markdown, CSV, HTML, and XML
- **Intelligent File Processing**: Binary detection, encoding recognition, and MIME type identification
- **Advanced Filtering System**: Pattern-based inclusion/exclusion with support for standard ignore files
- **Parallel Processing Engine**: Configurable concurrency with intelligent workload distribution
- **Comprehensive Metadata Extraction**: File statistics, cryptographic hashes, and modification timestamps
- **Code Analytics**: Statistical summaries, language detection, and structural analysis
- **Enterprise-grade Error Handling**: Retry mechanisms, timeout protection, and graceful degradation

## Technical Architecture

Codebase Digest employs a modular architecture with the following components:

1. **File Discovery Subsystem**: Identifies relevant files using glob patterns and respects standard ignore files
2. **Content Processing Pipeline**: Handles file reading, encoding detection, and content transformation
3. **Metadata Extraction Engine**: Extracts and computes file metadata including hashes and statistics
4. **Output Formatting System**: Transforms processed content into the requested output format
5. **Concurrency Management**: Orchestrates parallel processing with configurable limits
6. **Error Management Framework**: Provides robust error handling with retry capabilities

### Module Breakdown

- **src/index.js**: Main entry point exposing the public API
- **src/cli/index.js**: Command-line interface implementation
- **src/config/**: Configuration management and defaults
- **src/core/**: Core processing logic
- **src/formatters/**: Output format implementations
- **src/utils/**: Utility functions and helpers

## Installation

### Global Installation

```bash
npm install -g codebase-digest
```

### Local Project Installation

```bash
npm install --save-dev codebase-digest
```

### Requirements

- Node.js 14.16.0 or higher
- NPM 6.14.0 or higher

## Command-Line Interface

### Basic Usage

```bash
codebase-digest <directory> [options]
```

### Common Command Examples

#### Basic Text Output

```bash
codebase-digest ./src
```

#### Generate Markdown with Line Numbers

```bash
codebase-digest ./src -f markdown --line-numbers -o codebase.md
```

#### Process Only JavaScript and TypeScript Files

```bash
codebase-digest ./src --include "**/*.js,**/*.ts" --exclude "**/*.test.js,**/*.spec.ts"
```

#### Include File Metadata

```bash
codebase-digest ./src --byte-size --last-modified --file-hash --mime-type
```

#### Generate Code Statistics

```bash
codebase-digest ./src --code-statistics --file-grouping language
```

#### Process Files in Parallel

```bash
codebase-digest ./src --max-parallel 8
```

#### Handle Binary Files with Hexdump

```bash
codebase-digest ./src --binary-files hexdump
```

#### Use Configuration File

```bash
codebase-digest ./src -c codebase-digest.config.json
```

### Advanced Command Examples

#### Generate Compressed HTML Output with Statistics

```bash
codebase-digest ./src -f html --code-statistics --compress -o codebase.html.gz
```

#### Process Large Codebase with Performance Optimizations

```bash
codebase-digest ./src --max-file-size 524288 --skip-binary-files --max-parallel 12 --timeout 7200000
```

#### Generate Detailed JSON Output for API Consumption

```bash
codebase-digest ./src -f json --byte-size --last-modified --file-hash --hash-algorithm sha256 --mime-type -o codebase.json
```

#### Create Minimal Text Digest for LLM Consumption

```bash
codebase-digest ./src --no-file-header --no-file-separator --comment-stripping --strip-whitespace --max-file-size 102400
```

#### Generate Comprehensive Code Analysis Report

```bash
codebase-digest ./src -f markdown --code-statistics --code-metrics --file-grouping language --sort-by size --sort-direction desc -o code-analysis.md
```

## Programmatic API

### Basic Usage

```javascript
import { processDirectory, defaultConfig } from 'codebase-digest';

async function generateDigest() {
  try {
    const config = {
      ...defaultConfig,
      outputFormat: 'markdown',
      includeLineNumbers: true,
      codeStatistics: true
    };
    
    const digest = await processDirectory('./src', config);
    console.log(digest);
  } catch (error) {
    console.error('Error processing directory:', error);
  }
}

generateDigest();
```

### Advanced Usage

```javascript
import { 
  processDirectory, 
  defaultConfig,
  isBinaryFile,
  detectFileEncoding,
  calculateFileHash,
  formatMarkdown
} from 'codebase-digest';
import fs from 'fs/promises';
import path from 'path';

async function generateCustomDigest() {
  try {
    // Create custom configuration
    const config = {
      ...defaultConfig,
      outputFormat: 'json',
      maxFileSize: 1024 * 1024 * 2, // 2MB
      includePatterns: ['src/**/*.js', 'src/**/*.ts'],
      excludePatterns: ['**/*.test.js', '**/*.spec.ts', '**/node_modules/**'],
      respectGitignore: true,
      includeFileHash: true,
      hashAlgorithm: 'sha256',
      parallel: true,
      maxParallelProcesses: 8,
      codeStatistics: true,
      fileGrouping: 'language'
    };
    
    // Process the directory
    const jsonResult = await processDirectory('./project', config);
    
    // Parse the JSON result
    const fileContents = JSON.parse(jsonResult);
    
    // Custom post-processing
    const filteredContents = fileContents.filter(file => 
      file.size > 1000 && !file.path.includes('vendor')
    );
    
    // Convert to markdown format
    const markdownResult = formatMarkdown(filteredContents, {
      ...config,
      outputFormat: 'markdown'
    });
    
    // Save the result
    await fs.writeFile('custom-digest.md', markdownResult);
    console.log('Custom digest generated successfully');
  } catch (error) {
    console.error('Error generating custom digest:', error);
  }
}

generateCustomDigest();
```

### API Reference

#### Main Functions

- `processDirectory(directory, config)`: Process a directory and return a digest
- `isBinaryFile(filePath, config)`: Check if a file is binary
- `detectFileEncoding(filePath)`: Detect the encoding of a file
- `readFileWithEncoding(filePath, config)`: Read a file with proper encoding
- `calculateFileHash(filePath, algorithm)`: Calculate a file hash
- `getFileMimeType(filePath)`: Get the MIME type of a file

#### Formatting Functions

- `formatText(fileContents, config)`: Format file contents as plain text
- `formatMarkdown(fileContents, config)`: Format file contents as markdown
- `formatJSON(fileContents, config)`: Format file contents as JSON
- `formatCSV(fileContents, config)`: Format file contents as CSV
- `formatHTML(fileContents, config)`: Format file contents as HTML
- `formatXML(fileContents, config)`: Format file contents as XML

## Configuration Reference

### Core Options

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `outputFormat` | `-f, --format <format>` | `text` | Output format: text, json, markdown, csv, html, xml |
| `outputFile` | `-o, --output <file>` | `null` (stdout) | File to write output to |
| `outputEncoding` | N/A | `utf8` | Encoding for output file |
| `verbose` | `-v, --verbose` | `false` | Enable verbose logging |
| `silent` | `-s, --silent` | `false` | Suppress all output except errors |
| `config` | `-c, --config <file>` | `null` | Path to configuration file |

### File Selection

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `includePatterns` | `--include <patterns>` | `["**/*"]` | Glob patterns to include (comma separated) |
| `excludePatterns` | `--exclude <patterns>` | `[]` | Glob patterns to exclude (comma separated) |
| `ignorePatterns` | N/A | *[See default config]* | Additional patterns to ignore |
| `respectGitignore` | `--no-gitignore` | `true` | Respect .gitignore files |
| `respectNpmignore` | `--no-npmignore` | `true` | Respect .npmignore files |
| `respectDockerignore` | `--no-dockerignore` | `true` | Respect .dockerignore files |
| `maxFileSize` | `--max-file-size <size>` | `1048576` (1MB) | Maximum file size in bytes |
| `minFileSize` | `--min-file-size <size>` | `0` | Minimum file size in bytes |
| `skipEmptyFiles` | `--skip-empty-files` | `false` | Skip empty files |
| `skipBinaryFiles` | `--skip-binary-files` | `true` | Skip binary files |
| `includeHidden` | `--no-include-hidden` | `true` | Include hidden files |
| `includeGitSubmodules` | `--include-git-submodules` | `false` | Include git submodules |
| `followSymlinks` | `--follow-symlinks` | `false` | Follow symbolic links |
| `maxDepth` | `--max-depth <depth>` | `Infinity` | Maximum directory depth |
| `fileOrder` | N/A | `[]` | Files to prioritize in output |
| `directoryOrder` | N/A | `[]` | Directories to prioritize in output |

### Content Processing

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `encoding` | `--encoding <encoding>` | `auto` | File encoding (auto, utf8, latin1, etc.) |
| `detectEncoding` | `--no-detect-encoding` | `true` | Detect file encoding |
| `detectBinary` | `--no-detect-binary` | `true` | Detect binary files |
| `binaryFilesAction` | `--binary-files <action>` | `skip` | Action for binary files: skip, include, hexdump |
| `binaryFileExtensions` | N/A | *[See default config]* | Extensions to treat as binary |
| `textFileExtensions` | N/A | *[See default config]* | Extensions to treat as text |
| `truncateLineLength` | `--truncate-line-length <length>` | `0` (no truncation) | Truncate lines to this length |
| `fileContentPreview` | `--file-content-preview <lines>` | `0` (full content) | Number of lines to preview |
| `fileContentTail` | `--file-content-tail <lines>` | `0` (none) | Number of lines to show from the end |
| `commentStripping` | `--comment-stripping` | `false` | Strip comments from code |
| `codeBlocksOnly` | `--code-blocks-only` | `false` | Only include code blocks |
| `stripWhitespace` | `--strip-whitespace` | `false` | Strip unnecessary whitespace |
| `normalizeLineEndings` | N/A | `false` | Normalize line endings |
| `lineEndingStyle` | N/A | `auto` | Line ending style: auto, lf, crlf, cr |

### Output Formatting

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `includeFileHeader` | `--no-file-header` | `true` | Include file headers |
| `includeFileSeparator` | `--no-file-separator` | `true` | Include file separators |
| `includeLineNumbers` | `--line-numbers` | `false` | Include line numbers |
| `includeByteSize` | `--byte-size` | `false` | Include file size |
| `includeMimeType` | `--mime-type` | `false` | Include MIME type |
| `includeLastModified` | `--last-modified` | `false` | Include last modified date |
| `includeFileHash` | `--file-hash` | `false` | Include file hash |
| `hashAlgorithm` | `--hash-algorithm <algorithm>` | `md5` | Hash algorithm: md5, sha1, sha256, sha512 |
| `codeStatistics` | `--code-statistics` | `false` | Include code statistics |
| `codeMetrics` | `--code-metrics` | `false` | Include code metrics |
| `summaryOnly` | `--summary-only` | `false` | Only output summary |
| `fileGrouping` | `--file-grouping <type>` | `none` | Group files: none, extension, directory, language |
| `fileGroupingDepth` | `--file-grouping-depth <depth>` | `1` | Depth for directory grouping |
| `sortBy` | `--sort-by <field>` | `path` | Sort by: path, size, extension, modified |
| `sortDirection` | `--sort-direction <direction>` | `asc` | Sort direction: asc, desc |
| `compress` | `--compress` | `false` | Compress output with gzip |
| `decompress` | `--decompress` | `false` | Decompress input with gunzip |
| `maxOutputSize` | `--max-output-size <size>` | `0` (no limit) | Maximum output size in bytes |
| `colorOutput` | `--no-color-output` | `true` | Use color in output |
| `progressBar` | `--no-progress-bar` | `true` | Show progress bar |

### Performance Tuning

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `parallel` | `--no-parallel` | `true` | Process files in parallel |
| `maxParallelProcesses` | `--max-parallel <count>` | CPU count - 1 | Maximum parallel processes |
| `timeout` | `--timeout <ms>` | `3600000` (1 hour) | Operation timeout in milliseconds |

### Error Handling

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `retryCount` | `--retry-count <count>` | `3` | Number of retries for failed operations |
| `retryDelay` | `--retry-delay <ms>` | `1000` (1 second) | Delay between retries in milliseconds |

### Advanced Features

| Option | CLI Flag | Default | Description |
|--------|----------|---------|-------------|
| `gitStats` | `--git-stats` | `false` | Include git statistics |
| `detectLanguage` | N/A | `true` | Detect file language |
| `detectIndentation` | N/A | `true` | Detect file indentation |
| `detectLineEndings` | N/A | `true` | Detect line endings |
| `mergeAdjacentFiles` | `--merge-adjacent-files` | `false` | Merge adjacent files of the same type |

## Output Format Specifications

### Text Format

Plain text format with configurable headers and separators:

```
================================================

File: src/index.js
Size: 1.25 KB
Modified: 2023-01-01T12:00:00.000Z
MD5: d41d8cd98f00b204e9800998ecf8427e
MIME Type: application/javascript
================================================
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```

### Markdown Format

Structured markdown with syntax highlighting and collapsible metadata:

```markdown
# Code Digest

## Summary

- Total files: 2
- Total size: 1.5 KB
- File types:
  - js: 2 files

## src/index.js

<details>
<summary>File metadata</summary>

- Size: 1.25 KB
- Modified: 2023-01-01T12:00:00.000Z
- SHA256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08
- MIME Type: application/javascript

</details>

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
```
```

### JSON Format

Structured JSON with comprehensive metadata:

```json
[
  {
    "path": "src/index.js",
    "size": 1280,
    "modified": "2023-01-01T12:00:00.000Z",
    "created": "2023-01-01T10:00:00.000Z",
    "extension": "js",
    "isBinary": false,
    "hash": "d41d8cd98f00b204e9800998ecf8427e",
    "mimeType": "application/javascript",
    "content": "import React from 'react';\nimport ReactDOM from 'react-dom';\nimport App from './App';\n\nReactDOM.render(<App />, document.getElementById('root'));"
  }
]
```

### CSV Format

Tabular format for spreadsheet analysis:

```csv
path,size,modified,hash,mimeType,content
"src/index.js",1280,"2023-01-01T12:00:00.000Z","d41d8cd98f00b204e9800998ecf8427e","application/javascript","import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));"
```

### HTML Format

Interactive HTML with syntax highlighting and collapsible sections:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Digest</title>
  <style>
    /* CSS styles omitted for brevity */
  </style>
</head>
<body>
  <h1>Code Digest</h1>
  <h2>src/index.js</h2>
  <details>
    <summary>File metadata</summary>
    <div class="metadata">
      <div>Size: 1.25 KB</div>
      <div>Modified: 2023-01-01T12:00:00.000Z</div>
      <div>MD5: d41d8cd98f00b204e9800998ecf8427e</div>
      <div>MIME Type: application/javascript</div>
    </div>
  </details>
  <pre class="file-content"><code>import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(&lt;App /&gt;, document.getElementById('root'));</code></pre>
</body>
</html>
```

### XML Format

Structured XML with CDATA sections for content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<codeDigest>
  <file path="src/index.js" size="1280" modified="2023-01-01T12:00:00.000Z" hash="d41d8cd98f00b204e9800998ecf8427e" mimeType="application/javascript">
    <content><![CDATA[import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));]]></content>
  </file>
</codeDigest>
```

## Edge Case Handling

Codebase Digest implements sophisticated handling for various edge cases:

### Binary File Processing

- **Detection Algorithm**: Uses a multi-stage detection process combining extension checking and content analysis
- **Configurable Actions**: Skip, include as base64, or generate hexdump
- **Custom Extension Lists**: Configurable lists of binary and text file extensions

### Encoding Management

- **Auto-detection**: Uses statistical analysis to detect file encoding
- **Fallback Mechanism**: Gracefully handles encoding detection failures
- **Conversion Pipeline**: Properly converts between encodings using iconv-lite

### Error Resilience

- **Retry Logic**: Implements exponential backoff for transient failures
- **Timeout Protection**: Prevents hanging on problematic files
- **Partial Success**: Continues processing even when some files fail
- **Detailed Reporting**: Provides comprehensive error information

### Special File Types

- **Symbolic Links**: Configurable following of symbolic links
- **Empty Files**: Optional inclusion or exclusion
- **Large Files**: Size-based filtering with configurable thresholds
- **Hidden Files**: Optional processing of hidden files and directories

### Character Set Handling

- **Special Characters**: Proper escaping in all output formats
- **Line Endings**: Detection and normalization of different line ending styles
- **Non-printable Characters**: Proper handling in hexdump and text outputs

## Performance Optimization

For processing large codebases efficiently:

### Memory Management

- **Streaming Processing**: Uses streams for large file handling
- **Chunked Processing**: Processes files in manageable chunks
- **Garbage Collection**: Minimizes memory pressure during processing

### Concurrency Control

- **Parallel Processing**: Configurable parallel file processing
- **Workload Distribution**: Intelligent distribution of processing tasks
- **Resource Limiting**: Prevents system overload with configurable limits

### Processing Efficiency

- **Early Filtering**: Filters files before content loading
- **Lazy Loading**: Only loads necessary file content
- **Caching**: Caches expensive operations like encoding detection

### Recommended Settings for Large Codebases

```bash
codebase-digest ./large-codebase \
  --max-file-size 524288 \
  --skip-binary-files \
  --skip-empty-files \
  --max-parallel 8 \
  --timeout 7200000 \
  --no-detect-encoding \
  --file-content-preview 100
```

## Use Cases

### LLM Code Analysis

Generate digests optimized for LLM consumption:

```bash
codebase-digest ./src \
  -f markdown \
  --no-file-header \
  --comment-stripping \
  --strip-whitespace \
  --code-statistics \
  --file-grouping language \
  -o llm-digest.md
```

### Documentation Generation

Create comprehensive code documentation:

```bash
codebase-digest ./src \
  -f html \
  --line-numbers \
  --byte-size \
  --last-modified \
  --file-hash \
  --mime-type \
  --code-statistics \
  --code-metrics \
  -o code-documentation.html
```

### Code Auditing

Generate detailed reports for code auditing:

```bash
codebase-digest ./src \
  -f json \
  --byte-size \
  --last-modified \
  --file-hash \
  --hash-algorithm sha256 \
  --mime-type \
  --code-statistics \
  --code-metrics \
  -o audit-report.json
```

### Codebase Comparison

Create digests for comparing different versions:

```bash
# Generate digest for version 1
codebase-digest ./v1 -f json -o v1-digest.json

# Generate digest for version 2
codebase-digest ./v2 -f json -o v2-digest.json

# Compare using jq
jq -d '.' v1-digest.json v2-digest.json | diff -u -
```

### Archival and Preservation

Create comprehensive archives of codebases:

```bash
codebase-digest ./legacy-code \
  -f markdown \
  --line-numbers \
  --byte-size \
  --last-modified \
  --file-hash \
  --hash-algorithm sha256 \
  --mime-type \
  --code-statistics \
  --binary-files hexdump \
  --compress \
  -o legacy-code-archive.md.gz
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/codebase-digest.git
cd codebase-digest

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

### Testing

All new features and bug fixes should include tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### Documentation

Please update the documentation when adding or modifying features:

1. Update the README.md file
2. Update JSDoc comments in the code
3. Update the example configuration if necessary

## License

This project is open-source and available under the [MIT License](./license).
