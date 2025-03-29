/**
 * Example Custom Language Detector Plugin
 * 
 * This plugin demonstrates how to create a custom language detector
 * that can identify specific file types based on content patterns and extensions.
 */

/**
 * Custom language detector that can identify various template languages and custom formats
 */
export const templateLanguageDetector = {
  name: 'template-detector',
  description: 'Detects template languages and custom file formats',
  
  detect: (fileContent, fileName) => {
    // Check file extensions first
    if (fileName.endsWith('.njk')) return 'Nunjucks';
    if (fileName.endsWith('.hbs')) return 'Handlebars';
    if (fileName.endsWith('.liquid')) return 'Liquid';
    if (fileName.endsWith('.twig')) return 'Twig';
    
    // Check content patterns
    const patterns = {
      // Nunjucks patterns
      nunjucks: [
        /\{%\s*extends\s+['"].*?['"]\s*%\}/,
        /\{%\s*block\s+\w+\s*%\}/,
        /\{%\s*include\s+['"].*?['"]\s*%\}/
      ],
      
      // Handlebars patterns
      handlebars: [
        /\{\{#\s*each\s+.*?\}\}/,
        /\{\{#\s*if\s+.*?\}\}/,
        /\{\{\s*>\s*[\w-]+\s*\}\}/
      ],
      
      // Liquid patterns
      liquid: [
        /\{%\s*assign\s+\w+\s*=.*?%\}/,
        /\{%\s*capture\s+\w+\s*%\}/,
        /\{\{\s*\w+\s*\|\s*\w+\s*\}\}/
      ],
      
      // Twig patterns
      twig: [
        /\{%\s*set\s+\w+\s*=.*?%\}/,
        /\{%\s*for\s+\w+\s+in\s+.*?%\}/,
        /\{\{\s*\w+\|.*?\}\}/
      ]
    };

    // Check each language's patterns
    for (const [lang, langPatterns] of Object.entries(patterns)) {
      if (langPatterns.some(pattern => pattern.test(fileContent))) {
        return lang.charAt(0).toUpperCase() + lang.slice(1);
      }
    }

    return null; // Language not detected
  },

  // Optional: Provide syntax highlighting rules
  getSyntaxRules: (language) => {
    const rules = {
      Nunjucks: {
        keywords: ['extends', 'block', 'include', 'if', 'for', 'macro'],
        delimiters: ['{%', '%}', '{{', '}}'],
        // Add more rules as needed
      },
      Handlebars: {
        keywords: ['each', 'if', 'unless', 'with'],
        delimiters: ['{{', '}}', '{{#', '{{/'],
        // Add more rules as needed
      }
      // Add rules for other languages
    };

    return rules[language] || null;
  }
};

// Usage example in defaults.js:
// 
// import { templateLanguageDetector } from './plugins/custom-language-detector.js';
// 
// export const defaultConfig = {
//   ...
//   customLanguageDetectors: {
//     template: templateLanguageDetector
//   }
// }; 