/**
 * Default Configuration
 *
 * This module defines the default configuration options for the codebase-digest tool.
 * These defaults can be overridden via CLI arguments or a configuration file.
 *
 * @module config/defaults
 */

import { cpus } from "os";

const CPU_COUNT = cpus().length;

/**
 * Default configuration object with comprehensive options for all aspects of processing
 *
 * @type {Object}
 */
export const defaultConfig = {
  // Output options
  outputFormat: "text", // text, json, markdown, tree
  outputFile: null,
  outputEncoding: "utf8",
  maxOutputSize: 0, // 0 means no limit
  compress: false,
  decompress: false,

  // File size limits
  maxFileSize: 1024 * 1024, // 1MB
  minFileSize: 0, // 0 bytes

  // File selection patterns
  ignorePatterns: [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".cache",
    "*.log",
    "*.lock",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    ".DS_Store",
    "Thumbs.db",
    ".env",
    ".env.*",
    "*.min.js",
    "*.min.css",
    "*.map",
    "coverage",
    ".next",
    ".nuxt",
    ".output",
    ".vercel",
    ".vscode",
    ".idea",
  ],
  includePatterns: ["**/*"],
  excludePatterns: [],

  // Respect standard ignore files
  respectGitignore: true,
  respectNpmignore: true,
  respectDockerignore: true,

  // Output formatting options
  includeFileHeader: true,
  includeFileSeparator: true,
  includeLineNumbers: false,
  includeByteSize: false,
  includeMimeType: false,
  includeLastModified: false,
  includeFileHash: false,
  hashAlgorithm: "md5", // md5, sha1, sha256, sha512

  // Processing options
  verbose: false,
  silent: false,
  parallel: true,
  maxParallelProcesses: Math.max(1, CPU_COUNT - 1),
  followSymlinks: false,
  depth: Number.POSITIVE_INFINITY,
  maxDepth: Number.POSITIVE_INFINITY,

  // File encoding options
  encoding: "auto", // auto, utf8, latin1, etc.
  detectEncoding: true,

  // Binary file handling
  binaryFilesAction: "skip", // skip, include, hexdump
  detectBinary: true,
  skipBinaryFiles: true,

  // Binary file extensions (used for quick detection)
  binaryFileExtensions: [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "bmp",
    "ico",
    "webp",
    "tiff",
    "svg",
    "mp3",
    "mp4",
    "wav",
    "ogg",
    "webm",
    "avi",
    "mov",
    "wmv",
    "flv",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "zip",
    "tar",
    "gz",
    "7z",
    "rar",
    "exe",
    "dll",
    "so",
    "dylib",
    "ttf",
    "otf",
    "woff",
    "woff2",
    "eot",
  ],

  // Text file extensions (used for quick detection)
  textFileExtensions: [
    "txt",
    "md",
    "markdown",
    "rst",
    "adoc",
    "tex",
    "js",
    "jsx",
    "ts",
    "tsx",
    "mjs",
    "cjs",
    "py",
    "rb",
    "php",
    "java",
    "c",
    "cpp",
    "cs",
    "go",
    "rs",
    "swift",
    "html",
    "htm",
    "css",
    "scss",
    "sass",
    "less",
    "styl",
    "json",
    "yaml",
    "yml",
    "toml",
    "ini",
    "xml",
    "csv",
    "tsv",
    "sh",
    "bash",
    "zsh",
    "fish",
    "bat",
    "cmd",
    "ps1",
    "sql",
    "graphql",
    "prisma",
    "env",
  ],

  // Git integration
  gitStats: false,
  includeGitSubmodules: false,

  // Sorting and grouping
  sortBy: "path", // path, size, extension, modified
  sortDirection: "asc", // asc, desc
  fileGrouping: "none", // none, extension, directory, language
  fileGroupingDepth: 1,
  fileOrder: [], // Specific files to prioritize in output
  directoryOrder: [], // Specific directories to prioritize in output

  // Error handling and resilience
  timeout: 3600000, // 1 hour in milliseconds
  retryCount: 3,
  retryDelay: 1000, // 1 second

  // Content processing options
  truncateLineLength: 0, // 0 means no truncation
  skipEmptyFiles: false,
  fileContentPreview: 0, // Number of lines to preview (0 means full content)
  fileContentTail: 0, // Number of lines to show from the end (0 means none)
  commentStripping: false,
  codeBlocksOnly: false,
  stripWhitespace: false,
  mergeAdjacentFiles: false,

  // Code analysis options
  detectLanguage: true,
  detectIndentation: true,
  detectLineEndings: true,
  normalizeLineEndings: false,
  lineEndingStyle: "auto", // auto, lf, crlf, cr
  indentationStyle: "auto", // auto, space, tab
  indentationSize: "auto", // auto or number

  // UI options
  includeHidden: true,
  codeStatistics: false,
  codeMetrics: false,
  summaryOnly: false,
  progressBar: true,
  colorOutput: true,

  // Extension points for custom behavior
  customFormatters: {},
  customDetectors: {},
  customTransformers: {},
  customFilters: {},
  customSorters: {},
  customGroupers: {},
  customReporters: {},
  customParsers: {},
  customRenderers: {},
  customProcessors: {},
  customEncoders: {},
  customDecoders: {},
  customHashers: {},
  customCompressors: {},
  customDecompressors: {},
  customNormalizers: {},
  customValidators: {},
  customSanitizers: {},
  customSerializers: {},
  customDeserializers: {},
  customFormatCheckers: {},
  customEncodingDetectors: {},
  customBinaryDetectors: {},
  customLanguageDetectors: {},
  customIndentationDetectors: {},
  customLineEndingDetectors: {},
  customMimeTypeDetectors: {},
  customFileTypeDetectors: {},
  customFileExtensionMappers: {},
  customFileNameMappers: {},
  customFilePathMappers: {},
  customFileContentMappers: {},
  customFileMetadataMappers: {},
  customFileGroupMappers: {},
  customFileSortMappers: {},
  customFileFilterMappers: {},
  customFileTransformMappers: {},
  customFileProcessMappers: {},
  customFileReportMappers: {},
  customFileRenderMappers: {},
  customFileSerializeMappers: {},
  customFileDeserializeMappers: {},
  customFileValidateMappers: {},
  customFileSanitizeMappers: {},
  customFileNormalizeMappers: {},
  customFileCompressMappers: {},
  customFileDecompressMappers: {},
  customFileHashMappers: {},
  customFileEncodeMappers: {},
  customFileDecodeMappers: {},
  customFileFormatCheckMappers: {},
  customFileEncodingDetectMappers: {},
  customFileBinaryDetectMappers: {},
  customFileLanguageDetectMappers: {},
  customFileIndentationDetectMappers: {},
  customFileLineEndingDetectMappers: {},
  customFileMimeTypeDetectMappers: {},
  customFileTypeDetectMappers: {},
};
