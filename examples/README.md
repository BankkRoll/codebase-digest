# Codebase Digest Examples

This directory contains comprehensive examples of using the codebase-digest tool in various scenarios. Each subdirectory focuses on a different aspect of the tool's functionality.

## Directory Structure

```
examples/
├── api-usage/           # Examples of using the tool programmatically
│   └── analyze-project.js  # Complete project analysis example
├── plugins/            # Plugin examples and implementations
│   ├── custom-formatter.js     # Custom output formatting
│   ├── custom-filter.js       # Custom file filtering
│   ├── custom-language-detector.js # Language detection
│   ├── custom-transformer.js   # Code transformation
│   └── security-analyzer.js    # Security analysis plugin
└── integrations/       # Integration examples with other tools
    └── github-action.yml      # GitHub Actions integration
```

## API Usage Examples

The `api-usage` directory demonstrates how to use codebase-digest programmatically in your Node.js applications:

- `analyze-project.js`: Complete example of analyzing a project with custom configuration, including:
  - Custom report generation
  - Metrics calculation
  - Plugin integration
  - Error handling and logging

## Plugin Examples

The `plugins` directory contains various plugin implementations showcasing different capabilities:

- **Custom Formatter**: Demonstrates how to create custom output formats
- **Custom Filter**: Shows how to implement custom file filtering logic
- **Language Detector**: Example of adding support for new languages
- **Code Transformer**: Implements custom code transformation logic
- **Security Analyzer**: Advanced plugin for security vulnerability detection

## Integration Examples

The `integrations` directory shows how to integrate codebase-digest with popular development tools:

- **GitHub Actions**: Complete workflow for automated code analysis in CI/CD pipelines

## Getting Started

1. Install codebase-digest:
```bash
npm install -g codebase-digest
```

2. Try the API example:
```bash
cd api-usage
node analyze-project.js /path/to/project
```

3. Test a plugin:
```bash
cd plugins
node custom-formatter.js
```

4. Set up GitHub Actions integration:
   - Copy the `github-action.yml` to your project's `.github/workflows` directory
   - Customize the configuration as needed

## Contributing

Feel free to contribute your own examples:

1. Create a new example in the appropriate directory
2. Add clear documentation and comments
3. Include sample input/output
4. Submit a pull request

## Best Practices

When using these examples:

1. Always review the configuration options
2. Test plugins in a development environment first
3. Monitor performance impact
4. Follow security best practices
5. Keep dependencies updated

## Related Documentation

- [Main Documentation](../README.md)
- [Plugin Development Guide](../docs/plugins.md)
- [API Reference](../docs/api.md)
- [Configuration Guide](../docs/configuration.md)

## License

These examples are licensed under the same terms as the main project. See the [LICENSE](../LICENSE) file for details. 