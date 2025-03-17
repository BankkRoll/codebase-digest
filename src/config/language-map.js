/**
 * Language Mapping
 *
 * This module provides mappings from file extensions to language identifiers
 * for syntax highlighting and language-specific processing.
 *
 * @module config/language-map
 */

/**
 * Maps file extensions to language identifiers for syntax highlighting
 * and language-specific processing.
 *
 * @type {Object.<string, string>}
 */
export const languageMap = {
  // JavaScript and TypeScript
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "tsx",
  mjs: "javascript",
  cjs: "javascript",

  // Python
  py: "python",
  pyc: "python",
  pyd: "python",
  pyo: "python",
  pyw: "python",
  ipynb: "jupyter",

  // Ruby
  rb: "ruby",
  rbw: "ruby",
  rake: "ruby",
  gemspec: "ruby",

  // PHP
  php: "php",
  phtml: "php",
  php3: "php",
  php4: "php",
  php5: "php",
  php7: "php",
  phps: "php",

  // Java and JVM languages
  java: "java",
  class: "java",
  jsp: "jsp",
  jspx: "jsp",
  kt: "kotlin",
  kts: "kotlin",
  groovy: "groovy",
  gvy: "groovy",
  gy: "groovy",
  gsh: "groovy",
  scala: "scala",
  sc: "scala",

  // C-family languages
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  "c++": "cpp",
  hpp: "cpp",
  hxx: "cpp",
  "h++": "cpp",
  cs: "csharp",

  // Go
  go: "go",

  // Rust
  rs: "rust",

  // Swift
  swift: "swift",

  // Web technologies
  html: "html",
  htm: "html",
  xhtml: "html",
  css: "css",
  scss: "scss",
  sass: "sass",
  less: "less",
  styl: "stylus",

  // Data formats
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  ini: "ini",
  xml: "xml",
  csv: "csv",
  tsv: "tsv",

  // Shell scripts
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  fish: "fish",
  bat: "batch",
  cmd: "batch",
  ps1: "powershell",

  // SQL
  sql: "sql",

  // GraphQL
  graphql: "graphql",
  gql: "graphql",

  // Prisma
  prisma: "prisma",

  // Markdown and documentation
  md: "markdown",
  markdown: "markdown",
  rst: "restructuredtext",
  adoc: "asciidoc",
  tex: "latex",

  // Configuration files
  env: "dotenv",
  editorconfig: "editorconfig",
  gitignore: "gitignore",
  dockerignore: "dockerignore",
  npmignore: "npmignore",

  // Other languages
  dart: "dart",
  elm: "elm",
  erl: "erlang",
  ex: "elixir",
  exs: "elixir",
  fs: "fsharp",
  fsx: "fsharp",
  hs: "haskell",
  lhs: "haskell",
  lua: "lua",
  pl: "perl",
  pm: "perl",
  r: "r",
  clj: "clojure",
  cljs: "clojure",
  cljc: "clojure",

  // Config files
  conf: "config",
  config: "config",

  // Docker
  dockerfile: "dockerfile",

  // Terraform
  tf: "terraform",
  tfvars: "terraform",

  // Kubernetes
  yaml: "yaml",
  yml: "yaml",
};

/**
 * Gets the language identifier for a given file extension
 *
 * @param {string} extension - The file extension (without the dot)
 * @returns {string} The language identifier or an empty string if not found
 */
export function getLanguageForExtension(extension) {
  if (!extension) return "";

  // Normalize extension by removing leading dot and converting to lowercase
  const normalizedExt = extension.startsWith(".")
    ? extension.substring(1).toLowerCase()
    : extension.toLowerCase();

  return languageMap[normalizedExt] || "";
}

/**
 * Gets the language identifier for a given file path
 *
 * @param {string} filePath - The file path
 * @returns {string} The language identifier or an empty string if not found
 */
export function getLanguageForFile(filePath) {
  if (!filePath) return "";

  // Extract extension from path
  const extension = filePath.split(".").pop();
  return getLanguageForExtension(extension);
}
