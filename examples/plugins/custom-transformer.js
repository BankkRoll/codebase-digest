/**
 * Example Custom Transformer Plugin
 * 
 * This plugin demonstrates how to create a custom transformer that can
 * modify code content, such as minifying, prettifying, or converting between formats.
 */

/**
 * Custom transformer that can perform various code transformations
 */
export const codeTransformer = {
  name: 'code-transformer',
  description: 'Transforms code content with various operations',
  
  /**
   * Minify JavaScript code (simple example)
   * @param {string} content - JavaScript code
   * @returns {string} Minified code
   */
  minifyJS: (content) => {
    return content
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
      // Remove whitespace around operators
      .replace(/\s*([+\-*/%=<>!&|,{}()[\];])\s*/g, '$1')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      // Remove newlines
      .replace(/\n/g, '')
      .trim();
  },

  /**
   * Convert CoffeeScript-like syntax to JavaScript (simple example)
   * @param {string} content - CoffeeScript-like code
   * @returns {string} JavaScript code
   */
  coffeeToJS: (content) => {
    return content
      // Convert function arrows
      .replace(/(\w+)\s*->\s*/g, 'function($1) ')
      // Convert if statements
      .replace(/if\s+([^then]+)\s+then/g, 'if ($1)')
      // Convert unless to if !
      .replace(/unless\s+([^then]+)\s+then/g, 'if (!$1)')
      // Convert @ to this.
      .replace(/@(\w+)/g, 'this.$1');
  },

  /**
   * Add type annotations (simple example)
   * @param {string} content - JavaScript code
   * @returns {string} TypeScript code
   */
  addTypeAnnotations: (content) => {
    return content
      // Add types to function parameters
      .replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (match, name, params) => {
        const typedParams = params
          .split(',')
          .map(param => param.trim())
          .map(param => `${param}: any`)
          .join(', ');
        return `function ${name}(${typedParams}): any`;
      })
      // Add types to variables
      .replace(/(const|let|var)\s+(\w+)\s*=/g, '$1 $2: any =');
  },

  /**
   * Transform code based on specified operations
   * @param {Object} file - File object with content and metadata
   * @param {Object} config - Transformer configuration
   * @returns {Object} Transformed file object
   */
  transform: (file, config = {}) => {
    const {
      minify = false,
      convertCoffee = false,
      addTypes = false,
    } = config;

    let { content } = file;
    const isJavaScript = file.path.endsWith('.js') || file.path.endsWith('.jsx');
    const isCoffee = file.path.endsWith('.coffee');

    // Apply transformations in sequence
    if (convertCoffee && isCoffee) {
      content = codeTransformer.coffeeToJS(content);
      file.path = file.path.replace('.coffee', '.js');
    }

    if (addTypes && isJavaScript) {
      content = codeTransformer.addTypeAnnotations(content);
      file.path = file.path.replace('.js', '.ts');
    }

    if (minify && isJavaScript) {
      content = codeTransformer.minifyJS(content);
      file.path = file.path.replace('.js', '.min.js');
    }

    return {
      ...file,
      content,
      metadata: {
        ...file.metadata,
        transformed: true,
        transformations: {
          minified: minify,
          convertedFromCoffee: convertCoffee,
          typesAdded: addTypes,
        },
      },
    };
  }
};

// Usage example in defaults.js:
// 
// import { codeTransformer } from './plugins/custom-transformer.js';
// 
// export const defaultConfig = {
//   ...
//   customTransformers: {
//     code: codeTransformer
//   },
//   // Configure the transformer
//   codeTransformerConfig: {
//     minify: true,
//     convertCoffee: true,
//     addTypes: true
//   }
// }; 