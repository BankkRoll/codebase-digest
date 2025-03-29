# Codebase Digest

A high-performance, enterprise-grade utility for transforming codebases into structured text digests optimized for Large Language Model (LLM) consumption, documentation generation, and code analysis.

[![npm version](https://img.shields.io/npm/v/codebase-digest.svg)](https://www.npmjs.com/package/codebase-digest)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Output Formats](#output-formats)
- [Common Use Cases](#common-use-cases)
- [Configuration](#configuration)
- [Requirements](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Overview

Codebase Digest transforms source code repositories into structured text representations optimized for:
- LLM model ingestion
- Documentation generation
- Code analysis and metrics
- Security auditing

## Key Features

- **Multiple Output Formats**: Text, JSON, Markdown, and Tree structure
- **Intelligent Processing**: Smart file handling, encoding detection, and metadata extraction
- **High Performance**: Parallel processing with configurable resource management
- **Enterprise Ready**: Comprehensive error handling, retry mechanisms, and detailed logging

## Quick Start

### Installation

```bash
# Global installation
npm install -g codebase-digest
```

```bash
# Local project installation
npm install --save-dev codebase-digest
```

### Basic Usage

```bash
# CLI usage
codebase-digest ./src -f json -o output.json
```

```bash
# Node.js usage
import { processDirectory } from 'codebase-digest';
const result = await processDirectory('./src');
```

## Documentation

Comprehensive documentation is available in:
- [CLI Documentation](./docs/cli.md) - Complete command-line interface guide with examples
- [API Documentation](./docs/api.md) - Detailed programmatic API reference and usage patterns
- [Examples](./examples) - examples

## Project Structure

```
codebase-digest/
├── src/
│   ├── index.js         # Main entry point
│   ├── cli/            # Command-line interface
│   ├── core/           # Core processing logic
│   ├── formatters/     # Output formatters
│   │   ├── json-formatter.js
│   │   ├── markdown-formatter.js
│   │   ├── text-formatter.js
│   │   └── tree-formatter.js
│   └── utils/          # Utility functions
│       ├── encoding.js
│       ├── file-detection.js
│       ├── git.js
│       ├── logger.js
│       └── metadata.js
├── docs/              # Documentation
│   ├── api.md         # API reference
│   ├── cli.md         # CLI usage guide
│   ├── configuration.md # Configuration options
│   └── plugins.md     # Plugin development guide
└── examples/          # Example implementations
    ├── api-usage/     # Programmatic usage examples
    ├── plugins/       # Plugin examples
    └── integrations/  # Third-party integrations
```

The project is organized to provide a clear separation of concerns:
- `src/`: Contains the core implementation
- `docs/`: Comprehensive documentation for all aspects of the tool
- `examples/`: Real-world usage examples and integrations

## Output Formats

### Text
Simple, readable text output with configurable formatting:
```
File: src/index.js
Size: 1.25 KB
Content: ...
```

### JSON
Structured data format for programmatic usage:
```json
  {
    "path": "src/index.js",
    "size": 1280,
  "content": "..."
}
```

### Markdown
Rich documentation with syntax highlighting:
```markdown
## src/index.js
\`\`\`javascript
const code = 'here';
\`\`\`
```

### Tree
Hierarchical view of codebase structure:
```
.
├── src/
│   ├── index.js (1.25 KB)
│   └── utils/
```

## Common Use Cases

1. **LLM Processing**
```bash
   codebase-digest ./src --llm-format --strip-comments
   ```

2. **Documentation**
```bash
   codebase-digest ./src -f markdown --code-statistics
   ```

3. **Code Analysis**
```bash
   codebase-digest ./src --code-metrics --git-stats
   ```

4. **Security Audit**
```bash
   codebase-digest ./src --security-scan --dependency-check
   ```

See [CLI Documentation](CLI.md) for more advanced examples.

## Configuration

Basic configuration via command line:
```bash
codebase-digest ./src --include "**/*.js" --exclude "**/*.test.js"
```

Advanced configuration via JSON:
```json
{
  "outputFormat": "json",
  "maxFileSize": 1048576,
  "parallel": true,
  "maxParallelProcesses": 8
}
```

See [CLI Documentation](CLI.md) and [API Documentation](API.md) for complete configuration options.

## Requirements

- Node.js 14.16.0 or higher
- NPM 6.14.0 or higher

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
