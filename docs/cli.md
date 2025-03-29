# Command Line Interface (CLI)

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [Command Options](#command-options)
- [Output Formats](#output-formats)
- [Advanced Usage](#advanced-usage)
- [Environment Variables](#environment-variables)
- [Examples](#examples)

## Installation

```bash
# Global installation
npm install -g codebase-digest
```

```bash
# Local project installation
npm install --save-dev codebase-digest
```

## Basic Usage

```bash
# Basic directory processing
codebase-digest ./src
```

```bash
# Specify output format and file
codebase-digest ./src -f json -o output.json
```

```bash
# Process with specific configuration
codebase-digest ./src --config digest.config.json
```

## Command Options

### Input/Output Options
```bash
# Input directory
-i, --input <dir>          Input directory to process

# Output options
-o, --output <file>        Output file path
-f, --format <format>      Output format (json|text|markdown|tree)
--pretty                   Pretty print output (JSON format)
```

### File Selection
```bash
# File patterns
--include <pattern>        Include file pattern (glob)
--exclude <pattern>        Exclude file pattern (glob)
--max-size <bytes>        Maximum file size to process

# File types
--binary                   Process binary files
--no-binary               Skip binary files
--detect-encoding         Auto-detect file encoding
```

### Processing Options
```bash
# Performance
--parallel                Enable parallel processing
--max-processes <num>     Maximum parallel processes
--chunk-size <num>        Files per processing chunk

# Content processing
--strip-comments          Remove code comments
--normalize-endings       Normalize line endings
--strip-whitespace       Remove extra whitespace
```

### Analysis Options
```bash
# Code analysis
--statistics             Include code statistics
--metrics               Include complexity metrics
--git-stats            Include git history

# Security
--security-scan        Perform security analysis
--hash-files          Include file hashes
--hash-algo <algo>    Hash algorithm (md5|sha1|sha256)
```

### Output Formatting
```bash
# Common options
--line-numbers         Include line numbers
--syntax-highlight    Enable syntax highlighting
--metadata           Include file metadata

# Format specific
--tree-depth <num>    Maximum tree depth (tree format)
--group-by <field>    Group output by field
--sort-by <field>    Sort output by field
```

### Logging and Debug
```bash
# Logging
--quiet               Minimal output
--verbose            Detailed output
--debug             Debug level logging
--log-file <file>   Write logs to file

# Progress
--progress          Show progress bar
--no-progress      Hide progress bar
```

## Output Formats

### JSON Format
```bash
codebase-digest ./src -f json --pretty --metadata
```

Example output:
```json
{
  "files": [
    {
      "path": "src/index.js",
      "size": 1280,
      "hash": "sha256:abc...",
      "content": "..."
    }
  ],
  "statistics": {
    "totalFiles": 10,
    "totalSize": 15000
  }
}
```

### Markdown Format
```bash
codebase-digest ./src -f markdown --line-numbers --syntax-highlight
```

Example output:
```markdown
# Source Code Digest

## src/index.js
```javascript
1  const main = () => {
2    console.log('Hello');
3  };
```
```

### Text Format
```bash
codebase-digest ./src -f text --headers --separators
```

Example output:
```
File: src/index.js
Size: 1.25 KB
---
Content:
const main = () => {
  console.log('Hello');
};
```

### Tree Format
```bash
codebase-digest ./src -f tree --show-sizes
```

Example output:
```
.
├── src/
│   ├── index.js (1.25 KB)
│   └── utils/
```

## Advanced Usage

### Using Configuration Files
```bash
# Create default config
codebase-digest init > digest.config.json
```

```bash
# Use config file
codebase-digest ./src --config digest.config.json
```

### Processing Large Codebases
```bash
# Parallel processing with memory limits
codebase-digest ./src \
  --parallel \
  --max-processes 8 \
  --chunk-size 100 \
  --max-size 1048576
```

### Security Auditing
```bash
# Full security scan
codebase-digest ./src \
  --security-scan \
  --hash-files \
  --hash-algo sha256 \
  --detect-secrets
```

### Documentation Generation
```bash
# Generate comprehensive docs
codebase-digest ./src \
  -f markdown \
  --line-numbers \
  --syntax-highlight \
  --metadata \
  --statistics \
  -o docs/codebase.md
```

## Environment Variables

```bash
# Configuration
DIGEST_CONFIG_PATH=./config.json
DIGEST_OUTPUT_FORMAT=json

# Performance
DIGEST_MAX_PROCESSES=8
DIGEST_CHUNK_SIZE=100

# Security
DIGEST_HASH_ALGO=sha256
DIGEST_IGNORE_PATTERNS=node_modules,dist

# Logging
DIGEST_LOG_LEVEL=debug
DIGEST_LOG_FILE=digest.log
```

## Examples

### Basic Examples
```bash
# Process current directory
codebase-digest .
```

```bash
# Process specific directory with output
codebase-digest ./src -o digest.json
```

```bash
# Use specific format
codebase-digest ./src -f markdown
```

### Advanced Examples
```bash
# Generate documentation
codebase-digest ./src \
  -f markdown \
  --line-numbers \
  --syntax-highlight \
  --metadata \
  -o DOCUMENTATION.md
```

```bash
# Security audit
codebase-digest ./src \
  -f json \
  --security-scan \
  --hash-files \
  --detect-secrets \
  -o security-report.json
```

```bash
# Code analysis
codebase-digest ./src \
  --statistics \
  --metrics \
  --git-stats \
  -o analysis.json
``` 