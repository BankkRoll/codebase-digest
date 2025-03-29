# Programmatic API Documentation

## Table of Contents

- [Overview](#overview)
- [Core Functions](#core-functions)
  - [Directory Processing](#directory-processing)
  - [File Operations](#file-operations)
  - [Formatting](#formatting)
- [Advanced Usage](#advanced-usage)
  - [Custom Configuration](#custom-configuration)
  - [Parallel Processing](#parallel-processing)
  - [Stream Processing](#stream-processing)
- [Configuration Examples](#configuration-examples)
  - [Documentation Generation](#documentation-generation)
  - [LLM Processing](#llm-processing)
  - [Code Analysis](#code-analysis)
  - [Security Audit](#security-audit)
- [Error Handling](#error-handling)
  - [Basic Error Handling](#basic-error-handling)
  - [Retry Logic](#retry-logic)
  - [Progress and Events](#progress-and-events)
- [Common Use Cases](#common-use-cases)
  - [Generate Documentation](#generate-documentation)
  - [Process for LLM](#process-for-llm)
  - [Code Analysis Report](#code-analysis-report)
  - [Security Audit](#security-audit-1)

## Overview

The Codebase Digest API provides a comprehensive set of functions for processing codebases programmatically. Here are the main exported functions:

```javascript
import {
  processDirectory,    // Process a directory and return a digest
  isBinaryFile,       // Check if a file is binary
  detectFileEncoding, // Detect file encoding
  readFileWithEncoding, // Read file with proper encoding
  calculateFileHash,  // Calculate file hash
  getFileMimeType,   // Get file MIME type
  formatJSON,        // Format as JSON
  formatMarkdown,    // Format as Markdown
  formatText,        // Format as plain text
  formatTree,        // Format as tree structure
  defaultConfig      // Default configuration object
} from 'codebase-digest';
```

## Core Functions

### Directory Processing

```javascript
import { processDirectory, defaultConfig } from 'codebase-digest';

// Basic usage
const result = await processDirectory('./src');

// With configuration
const result = await processDirectory('./src', {
  ...defaultConfig,
  outputFormat: 'json',
  includeLineNumbers: true,
  codeStatistics: true
});

// With progress callback
const result = await processDirectory('./src', {
  onProgress: (processed, total) => {
    console.log(`Processed ${processed} of ${total} files`);
  }
});
```

### File Operations

```javascript
import { 
  isBinaryFile, 
  detectFileEncoding,
  readFileWithEncoding,
  calculateFileHash,
  getFileMimeType 
} from 'codebase-digest';

// Check if file is binary
const isBinary = await isBinaryFile('path/to/file');

// Detect file encoding
const encoding = await detectFileEncoding('path/to/file');

// Read file with auto-detected encoding
const content = await readFileWithEncoding('path/to/file');

// Calculate file hash
const hash = await calculateFileHash('path/to/file', 'sha256');

// Get MIME type
const mimeType = await getFileMimeType('path/to/file');
```

### Formatting

```javascript
import { 
  formatJSON,
  formatMarkdown,
  formatText,
  formatTree
} from 'codebase-digest';

// Format as JSON
const jsonOutput = formatJSON(files, {
  pretty: true,
  includeMetadata: true
});

// Format as Markdown
const markdownOutput = formatMarkdown(files, {
  includeLineNumbers: true,
  syntaxHighlighting: true
});

// Format as plain text
const textOutput = formatText(files, {
  includeHeaders: true,
  includeSeparators: true
});

// Format as tree
const treeOutput = formatTree(files, {
  showSizes: true,
  maxDepth: 3
});
```

## Advanced Usage

### Custom Configuration
```javascript
import { processDirectory, defaultConfig } from 'codebase-digest';

async function generateCustomDigest() {
  const config = {
    ...defaultConfig,
    outputFormat: 'json',
    includeLineNumbers: true,
    codeStatistics: true
  };
  
  try {
    const digest = await processDirectory('./src', config);
    console.log(digest);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Parallel Processing
```javascript
import { processDirectory } from 'codebase-digest';

const result = await processDirectory('./src', {
  parallel: true,
  maxParallelProcesses: 8,
  chunkSize: 100,
  onChunkComplete: (chunkIndex, totalChunks) => {
    console.log(`Completed chunk ${chunkIndex} of ${totalChunks}`);
  }
});
```

### Stream Processing
```javascript
import { createDigestStream } from 'codebase-digest';

const stream = createDigestStream({
  outputFormat: 'json',
  streaming: true
});

stream.on('data', chunk => {
  console.log('Processed:', chunk);
});

stream.on('end', () => {
  console.log('Processing complete');
});

await stream.process('./src');
```

## Configuration Examples

### Documentation Generation
```javascript
const config = {
  outputFormat: 'markdown',
  includeLineNumbers: true,
  syntaxHighlighting: true,
  codeStatistics: true,
  fileGrouping: 'language',
  includeMetadata: true,
  excludePatterns: ['**/node_modules/**', '**/*.test.js'],
  maxFileSize: 1048576
};
```

### LLM Processing
```javascript
const config = {
  outputFormat: 'text',
  commentStripping: true,
  stripWhitespace: true,
  includeFileHeader: false,
  maxFileSize: 102400,
  excludeBinaryFiles: true,
  normalizeLineEndings: true
};
```

### Code Analysis
```javascript
const config = {
  outputFormat: 'json',
  codeStatistics: true,
  codeMetrics: true,
  gitStats: true,
  fileGrouping: 'language',
  sortBy: 'size',
  sortDirection: 'desc',
  includeMetadata: true
};
```

### Security Audit
```javascript
const config = {
  outputFormat: 'json',
  includeFileHash: true,
  hashAlgorithm: 'sha256',
  includeMimeType: true,
  gitStats: true,
  detectBinary: true,
  maxFileSize: 5242880
};
```

## Error Handling

### Basic Error Handling
```javascript
try {
  const result = await processDirectory('./src');
} catch (error) {
  if (error.code === 'MAX_FILE_SIZE_EXCEEDED') {
    console.error('File too large:', error.filePath);
  } else if (error.code === 'INVALID_ENCODING') {
    console.error('Encoding detection failed:', error.filePath);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Retry Logic
```javascript
const config = {
  retryCount: 3,
  retryDelay: 1000,
  onRetry: (error, attempt) => {
    console.log(`Retry attempt ${attempt} due to:`, error);
  }
};

try {
  const result = await processDirectory('./src', config);
} catch (error) {
  console.error('All retries failed:', error);
}
```

### Progress and Events
```javascript
const config = {
  onProgress: (processed, total) => {
    console.log(`Progress: ${(processed / total * 100).toFixed(2)}%`);
  },
  onError: (error, filePath) => {
    console.error(`Error processing ${filePath}:`, error);
  },
  onSkip: (filePath, reason) => {
    console.log(`Skipped ${filePath}:`, reason);
  },
  onComplete: (stats) => {
    console.log('Processing complete:', stats);
  }
};
```

## Common Use Cases

### Generate Documentation
```javascript
import { processDirectory, formatMarkdown } from 'codebase-digest';

async function generateDocs() {
  const files = await processDirectory('./src', {
    includePatterns: ['**/*.{js,ts}'],
    excludePatterns: ['**/*.test.js'],
    codeStatistics: true
  });

  const docs = formatMarkdown(files, {
    includeLineNumbers: true,
    syntaxHighlighting: true,
    tableOfContents: true
  });

  await writeFile('documentation.md', docs);
}
```

### Process for LLM
```javascript
import { processDirectory, formatText } from 'codebase-digest';

async function prepareLLMInput() {
  const files = await processDirectory('./src', {
    maxFileSize: 102400,
    excludeBinaryFiles: true,
    commentStripping: true
  });

  const text = formatText(files, {
    stripWhitespace: true,
    normalizeLineEndings: true
  });

  await writeFile('llm-input.txt', text);
}
```

### Code Analysis Report
```javascript
import { processDirectory, formatJSON } from 'codebase-digest';

async function analyzeCode() {
  const files = await processDirectory('./src', {
    codeStatistics: true,
    codeMetrics: true,
    gitStats: true
  });

  const report = formatJSON(files, {
    pretty: true,
    includeMetadata: true
  });

  await writeFile('analysis.json', report);
}
```

### Security Audit
```javascript
import { processDirectory, calculateFileHash } from 'codebase-digest';

async function securityAudit() {
  const files = await processDirectory('./src');
  
  const auditResults = await Promise.all(
    files.map(async file => ({
      ...file,
      hash: await calculateFileHash(file.path, 'sha256'),
      permissions: await getFilePermissions(file.path)
    }))
  );

  await writeFile('security-audit.json', JSON.stringify(auditResults, null, 2));
}
``` 