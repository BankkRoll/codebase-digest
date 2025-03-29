# Command Line Interface (CLI) Documentation

## Table of Contents

- [Overview](#overview)
- [Basic Usage](#basic-usage)
- [Quick Examples](#quick-examples)
- [Advanced Examples](#advanced-examples)
  - [File Selection](#file-selection)
  - [Code Analysis](#code-analysis)
  - [Performance Optimization](#performance-optimization)
  - [Git Integration](#git-integration)
  - [Security Analysis](#security-analysis)
  - [Output Formatting](#output-formatting)
  - [Documentation Generation](#documentation-generation)
  - [Special Use Cases](#special-use-cases)
- [Configuration](#configuration)
  - [Core Options](#core-options)
  - [File Selection Options](#file-selection-options)
  - [Content Processing Options](#content-processing-options)
  - [Output Formatting Options](#output-formatting-options)
  - [Performance Options](#performance-options)
  - [Error Handling Options](#error-handling-options)
  - [Advanced Features](#advanced-features)
- [Environment Variables](#environment-variables)
- [Configuration File Examples](#configuration-file-examples)

## Overview

The Codebase Digest CLI provides a powerful command-line interface for processing codebases. The tool supports various output formats, advanced filtering, parallel processing, and extensive configuration options.

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
| `truncateLineLength` | `--truncate-line-length <length>` | `0` (no truncation) | Truncate lines to this 
length |
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

## Basic Usage

```bash
codebase-digest <directory> [options]
```

## Quick Examples

```bash
# Basic directory processing
codebase-digest .
codebase-digest ./src
codebase-digest ./src -f json

# Output formats
codebase-digest ./src -f text -o output.txt
codebase-digest ./src -f json -o output.json
codebase-digest ./src -f markdown -o docs.md
codebase-digest ./src -f tree -o tree.txt
```

## Advanced Examples by Category

### File Selection

```bash
# File patterns
codebase-digest ./src --include "**/*.js" --exclude "**/*.test.js"
codebase-digest ./src --include "**/*.{js,ts,jsx,tsx}" --exclude "**/{test,spec,mock}.*"
codebase-digest ./src --include "src/{components,utils}/**/*.js"
codebase-digest ./src --include "**/*.{js,ts}" --exclude "**/node_modules/**,**/dist/**"

# Size filters
codebase-digest ./src --max-file-size 1048576 --min-file-size 1024
codebase-digest ./src --skip-empty-files --max-file-size 5242880

# Time-based filters
codebase-digest ./src --modified-since "24h" --sort-by modified
codebase-digest ./src --modified-since "7d" --exclude "**/*.{log,tmp}"
codebase-digest ./src --created-after "2024-01-01" --created-before "2024-03-01"

# Complex patterns
codebase-digest ./src --include "**/*.{js,ts}" --exclude "**/{test,spec,__tests__}/**" --exclude "**/node_modules/**" --max-file-size 1048576
codebase-digest ./src --include "src/{core,lib}/**/*.js" --exclude "**/*.{spec,test}.js" --modified-since "48h"
```

### Code Analysis

```bash
# Basic analysis
codebase-digest ./src --code-statistics --file-grouping language
codebase-digest ./src --code-metrics --sort-by complexity
codebase-digest ./src --code-statistics --include "**/*.js" --exclude "**/*.test.js"

# Advanced metrics
codebase-digest ./src --code-metrics --complexity-threshold 15 --sort-by complexity --file-grouping language
codebase-digest ./src --code-statistics --loc-threshold 1000 --sort-by size --include "**/*.{js,ts}"
codebase-digest ./src --code-metrics --cyclomatic-complexity --cognitive-complexity --maintainability-index

# Language-specific analysis
codebase-digest ./src --include "**/*.js" --code-metrics --javascript-specific-metrics
codebase-digest ./src --include "**/*.py" --code-metrics --python-specific-metrics
codebase-digest ./src --include "**/*.{java,kt}" --code-metrics --jvm-specific-metrics

# Quality checks
codebase-digest ./src --code-quality --eslint-rules --sort-by violations
codebase-digest ./src --code-metrics --threshold-violations-only --fail-on-violation
codebase-digest ./src --code-duplication --min-duplicate-tokens 100
```

### Performance Optimization

```bash
# Parallel processing
codebase-digest ./src --max-parallel 8 --chunk-size 100
codebase-digest ./src --max-parallel 12 --memory-limit 4096
codebase-digest ./large-project --max-parallel 16 --timeout 7200000 --chunk-size 50

# Resource management
codebase-digest ./src --max-parallel 8 --cpu-priority low --io-priority low
codebase-digest ./src --memory-limit 2048 --disk-cache-size 512
codebase-digest ./src --streaming --max-buffer-size 1024

# Large project optimization
codebase-digest ./src --skip-binary-files --skip-empty-files --no-detect-encoding --max-file-size 1048576 --max-parallel 8
codebase-digest ./src --fast-mode --skip-complexity-calculation --skip-git-stats
codebase-digest ./src --incremental --cache-dir .digest-cache --skip-unchanged
```

### Git Integration

```bash
# Basic git features
codebase-digest ./src --git-stats --include-git-submodules
codebase-digest ./src --git-blame --git-history-depth 50
codebase-digest ./src --git-changes-since "1 week ago"

# Advanced git analysis
codebase-digest ./src --git-stats --author-stats --commit-frequency
codebase-digest ./src --git-complexity-evolution --time-window "6 months"
codebase-digest ./src --git-blame --ignore-revs-file .git-blame-ignore-revs
codebase-digest ./src --git-stats --branch-comparison main..feature
codebase-digest ./src --git-stats --contributor-analysis --exclude-merges
```

### Security Analysis

```bash
# Basic security checks
codebase-digest ./src --security-scan --include "**/*.{js,py,java}"
codebase-digest ./src --vulnerability-check --severity-threshold medium
codebase-digest ./src --secret-detection --ignore-false-positives

# Advanced security
codebase-digest ./src --security-scan --custom-rules security-rules.json --fail-on-critical
codebase-digest ./src --dependency-check --include-dev-dependencies --vulnerability-threshold high
codebase-digest ./src --license-check --allowed-licenses MIT,Apache-2.0 --fail-on-violation
codebase-digest ./src --security-scan --sast --dast --export-sarif
```

### Output Formatting

```bash
# Basic formatting
codebase-digest ./src --line-numbers --syntax-highlight
codebase-digest ./src --no-file-header --no-file-separator --compact
codebase-digest ./src --truncate-line-length 120 --tab-width 2

# Advanced formatting
codebase-digest ./src -f markdown --toc --section-depth 3 --code-fence-style ```
codebase-digest ./src -f json --pretty --metadata-only --exclude-content
codebase-digest ./src -f tree --max-depth 4 --show-size --show-permissions
```

### Documentation Generation

```bash
# API documentation
codebase-digest ./src --doc-generator api --include "**/*.{js,ts}" --exclude "**/*.test.js"
codebase-digest ./src --api-docs --type-inference --example-extraction
codebase-digest ./src --doc-generator jsdoc --template custom-template.js

# Architecture documentation
codebase-digest ./src --architecture-diagram --include-dependencies
codebase-digest ./src --module-graph --group-by-layer --exclude-externals
codebase-digest ./src --dependency-graph --circular-dependency-check
```

### Special Use Cases

```bash
# LLM optimization
codebase-digest ./src --llm-format --max-tokens 8192 --context-window 4096 --strip-comments
codebase-digest ./src --llm-chunking --chunk-size 1000 --overlap 100 --preserve-context
codebase-digest ./src --semantic-chunking --chunk-by function --preserve-imports

# Migration analysis
codebase-digest ./src --migration-report --from javascript --to typescript
codebase-digest ./src --deprecation-check --suggest-replacements
codebase-digest ./src --compatibility-check --target-version node18

# Quality assurance
codebase-digest ./src --test-coverage-analysis --min-coverage 80
codebase-digest ./src --code-review-checklist --best-practices-check
codebase-digest ./src --maintainability-score --technical-debt-calculation

# Compliance
codebase-digest ./src --compliance-check --standard pci-dss --export-report
codebase-digest ./src --license-compliance --dependency-license-check
codebase-digest ./src --gdpr-scan --phi-detection --pii-identification
```

## Environment Variables

```bash
# Basic configuration
export CODEBASE_DIGEST_CONFIG=/path/to/config.json
export CODEBASE_DIGEST_FORMAT=json
export CODEBASE_DIGEST_OUTPUT=/path/to/output

# Advanced settings
export CODEBASE_DIGEST_MAX_PARALLEL=8
export CODEBASE_DIGEST_MEMORY_LIMIT=4096
export CODEBASE_DIGEST_CACHE_DIR=/path/to/cache
export CODEBASE_DIGEST_IGNORE_FILE=/path/to/.digestignore
export CODEBASE_DIGEST_RULES_DIR=/path/to/rules
export CODEBASE_DIGEST_TEMPLATES_DIR=/path/to/templates
export CODEBASE_DIGEST_LOG_LEVEL=debug
```

## Configuration File Examples

### Basic Configuration
```json
{
  "outputFormat": "markdown",
  "includeLineNumbers": true,
  "codeStatistics": true,
  "maxParallelProcesses": 4
}
```

### Advanced Configuration
```json
{
  "outputFormat": "json",
  "maxFileSize": 2097152,
  "includePatterns": ["src/**/*.js", "src/**/*.ts"],
  "excludePatterns": ["**/*.test.js", "**/*.spec.ts", "**/node_modules/**"],
  "respectGitignore": true,
  "includeFileHash": true,
  "hashAlgorithm": "sha256",
  "parallel": true,
  "maxParallelProcesses": 8,
  "codeStatistics": true,
  "fileGrouping": "language",
  "cacheEnabled": true,
  "cacheDir": ".digest-cache",
  "incrementalProcessing": true,
  "errorHandling": {
    "continueOnError": true,
    "retryCount": 3,
    "retryDelay": 1000
  },
  "performance": {
    "chunkSize": 100,
    "memoryLimit": 4096,
    "ioThrottling": true
  },
  "security": {
    "secretDetection": true,
    "vulnerabilityScan": true,
    "licenseCheck": true
  }
}
``` 