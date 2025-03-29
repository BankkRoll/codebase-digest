/**
 * Advanced Security Analyzer Plugin
 * 
 * This plugin performs security analysis on code, looking for potential
 * security vulnerabilities and bad practices.
 */

/**
 * Security analyzer that checks for various security issues
 */
export const securityAnalyzer = {
  name: 'security-analyzer',
  description: 'Analyzes code for security vulnerabilities',

  // Known vulnerability patterns
  vulnerabilityPatterns: {
    // SQL Injection
    sqlInjection: {
      patterns: [
        /execute\s*\(\s*["'].*?\$\{.*?\}/i,
        /query\s*\(\s*["'].*?\$\{.*?\}/i,
        /sql\s*=.*?\+/i,
      ],
      severity: 'HIGH',
      description: 'Potential SQL injection vulnerability',
      recommendation: 'Use parameterized queries or an ORM',
    },

    // XSS
    xss: {
      patterns: [
        /innerHTML\s*=/,
        /document\.write\s*\(/,
        /eval\s*\(/,
        /dangerouslySetInnerHTML/,
      ],
      severity: 'HIGH',
      description: 'Potential XSS vulnerability',
      recommendation: 'Use safe DOM manipulation methods or sanitize input',
    },

    // Hardcoded Secrets
    secrets: {
      patterns: [
        /(password|secret|key|token|auth).*?=.*?["'][a-z0-9_-]{8,}["']/i,
        /api[_-]?key.*?=.*?["'][a-z0-9_-]{8,}["']/i,
      ],
      severity: 'CRITICAL',
      description: 'Hardcoded secret or credential',
      recommendation: 'Use environment variables or secure secret management',
    },

    // Insecure Cookie Settings
    cookies: {
      patterns: [
        /document\.cookie.*?=/,
        /cookies\.set\s*\([^{]*\{[^}]*secure:\s*false/,
        /cookies\.set\s*\([^{]*\{[^}]*httpOnly:\s*false/,
      ],
      severity: 'MEDIUM',
      description: 'Insecure cookie settings',
      recommendation: 'Set secure and httpOnly flags on cookies',
    },

    // Path Traversal
    pathTraversal: {
      patterns: [
        /require\s*\(\s*.*?\+/,
        /fs\.(read|write)File.*?\+/,
        /path\.join\s*\(.*?\.\./,
      ],
      severity: 'HIGH',
      description: 'Potential path traversal vulnerability',
      recommendation: 'Validate and sanitize file paths',
    },
  },

  // Best practice patterns
  bestPracticePatterns: {
    // Weak Crypto
    weakCrypto: {
      patterns: [
        /crypto\.createHash\s*\(\s*["']md5["']\)/,
        /crypto\.createHash\s*\(\s*["']sha1["']\)/,
      ],
      severity: 'MEDIUM',
      description: 'Use of weak cryptographic algorithm',
      recommendation: 'Use strong algorithms like SHA-256 or better',
    },

    // Insecure Random
    insecureRandom: {
      patterns: [
        /Math\.random\s*\(\s*\)/,
      ],
      severity: 'LOW',
      description: 'Use of insecure random number generator',
      recommendation: 'Use crypto.getRandomValues() for security purposes',
    },
  },

  /**
   * Analyze a file for security issues
   */
  analyze: (file) => {
    const issues = [];

    // Skip non-code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.php', '.rb'];
    if (!codeExtensions.some(ext => file.path.endsWith(ext))) {
      return issues;
    }

    // Check for vulnerabilities
    Object.entries(securityAnalyzer.vulnerabilityPatterns).forEach(([type, config]) => {
      config.patterns.forEach(pattern => {
        const matches = file.content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              type,
              severity: config.severity,
              description: config.description,
              recommendation: config.recommendation,
              line: securityAnalyzer.findLineNumber(file.content, match),
              code: match.trim(),
              file: file.path,
            });
          });
        }
      });
    });

    // Check for best practice violations
    Object.entries(securityAnalyzer.bestPracticePatterns).forEach(([type, config]) => {
      config.patterns.forEach(pattern => {
        const matches = file.content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            issues.push({
              type,
              severity: config.severity,
              description: config.description,
              recommendation: config.recommendation,
              line: securityAnalyzer.findLineNumber(file.content, match),
              code: match.trim(),
              file: file.path,
            });
          });
        }
      });
    });

    return issues;
  },

  /**
   * Find the line number for a match in the content
   */
  findLineNumber: (content, match) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(match)) {
        return i + 1;
      }
    }
    return -1;
  },

  /**
   * Generate a security report
   */
  generateReport: (issues) => {
    if (issues.length === 0) {
      return 'No security issues found.\n';
    }

    let report = '# Security Analysis Report\n\n';

    // Group issues by severity
    const severityGroups = {
      CRITICAL: [],
      HIGH: [],
      MEDIUM: [],
      LOW: [],
    };

    issues.forEach(issue => {
      severityGroups[issue.severity].push(issue);
    });

    // Generate report sections
    Object.entries(severityGroups).forEach(([severity, severityIssues]) => {
      if (severityIssues.length > 0) {
        report += `## ${severity} Severity Issues\n\n`;
        severityIssues.forEach(issue => {
          report += `### ${issue.type}\n`;
          report += `- **File:** ${issue.file}\n`;
          report += `- **Line:** ${issue.line}\n`;
          report += `- **Description:** ${issue.description}\n`;
          report += `- **Code:** \`${issue.code}\`\n`;
          report += `- **Recommendation:** ${issue.recommendation}\n\n`;
        });
      }
    });

    return report;
  }
};

// Usage example in defaults.js:
// 
// import { securityAnalyzer } from './plugins/advanced/security-analyzer.js';
// 
// export const defaultConfig = {
//   ...
//   customAnalyzers: {
//     security: securityAnalyzer
//   }
// }; 