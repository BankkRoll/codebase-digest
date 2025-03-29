/**
 * Example: Analyzing a Project Programmatically
 * 
 * This example demonstrates how to use the codebase-digest API
 * to analyze a project and generate various reports.
 */

import {
    calculateFileHash,
    defaultConfig,
    detectFileEncoding,
    formatJSON,
    formatMarkdown,
    processDirectory,
} from 'codebase-digest';

// Import example plugins
import { complexityFilter } from '../plugins/custom-filter.js';
import { htmlFormatter } from '../plugins/custom-formatter.js';
import { codeTransformer } from '../plugins/custom-transformer.js';

async function analyzeProject(projectPath) {
  try {
    // Configure analysis
    const config = {
      ...defaultConfig,
      includeMetadata: true,
      includeLineNumbers: true,
      parallel: true,
      maxParallelProcesses: 4,
      
      // Add custom plugins
      customFilters: {
        complexity: complexityFilter,
      },
      customFormatters: {
        html: htmlFormatter,
      },
      customTransformers: {
        code: codeTransformer,
      },
      
      // Configure plugins
      complexityFilterConfig: {
        maxComplexity: 15,
        maxFunctions: 20,
      },
      codeTransformerConfig: {
        minify: true,
        addTypes: true,
      },
    };

    // Process the directory
    const files = await processDirectory(projectPath, config);

    // Generate different report formats
    const markdownReport = formatMarkdown(files, config);
    const jsonReport = formatJSON(files, config);
    const htmlReport = htmlFormatter.format(files, config);

    // Calculate additional metrics
    const metrics = await calculateProjectMetrics(files);

    // Generate final report
    const report = {
      summary: metrics,
      markdownOutput: markdownReport,
      jsonOutput: jsonReport,
      htmlOutput: htmlReport,
    };

    return report;
  } catch (error) {
    console.error('Error analyzing project:', error);
    throw error;
  }
}

/**
 * Calculate project-wide metrics
 */
async function calculateProjectMetrics(files) {
  const metrics = {
    totalFiles: files.length,
    totalSize: 0,
    fileTypes: {},
    complexityScores: [],
    encodings: {},
    hashes: {},
  };

  for (const file of files) {
    // Calculate size metrics
    metrics.totalSize += file.size || 0;

    // Track file types
    const ext = file.extension || 'unknown';
    metrics.fileTypes[ext] = (metrics.fileTypes[ext] || 0) + 1;

    // Calculate complexity if available
    if (file.metadata?.complexity) {
      metrics.complexityScores.push({
        file: file.path,
        complexity: file.metadata.complexity,
      });
    }

    // Detect file encoding
    const encoding = await detectFileEncoding(file.path);
    metrics.encodings[file.path] = encoding;

    // Calculate file hash
    const hash = await calculateFileHash(file.path);
    metrics.hashes[file.path] = hash;
  }

  // Sort complexity scores
  metrics.complexityScores.sort((a, b) => b.complexity - a.complexity);

  return metrics;
}

// Example usage
async function main() {
  try {
    const projectPath = process.argv[2] || '.';
    const report = await analyzeProject(projectPath);
    
    // Output summary
    console.log('\nProject Analysis Summary:');
    console.log('------------------------');
    console.log(`Total Files: ${report.summary.totalFiles}`);
    console.log(`Total Size: ${(report.summary.totalSize / 1024 / 1024).toFixed(2)} MB`);
    
    // Output file types
    console.log('\nFile Types:');
    Object.entries(report.summary.fileTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([ext, count]) => {
        console.log(`  ${ext}: ${count} files`);
      });

    // Output complex files
    console.log('\nMost Complex Files:');
    report.summary.complexityScores
      .slice(0, 5)
      .forEach(({ file, complexity }) => {
        console.log(`  ${file}: Complexity score ${complexity}`);
      });

    // Save reports
    const fs = await import('fs/promises');
    await fs.writeFile('report.md', report.markdownOutput);
    await fs.writeFile('report.json', report.jsonOutput);
    await fs.writeFile('report.html', report.htmlOutput);

    console.log('\nReports generated:');
    console.log('- report.md');
    console.log('- report.json');
    console.log('- report.html');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

export { analyzeProject, calculateProjectMetrics };

