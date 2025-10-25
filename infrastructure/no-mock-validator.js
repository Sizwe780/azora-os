/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * No Mock Protocol Validator
 * Scans entire codebase to ensure ZERO mocks, stubs, or placeholders
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MOCK_PATTERNS = [
  /\bmock\(/gi,
  /\.mock\b/gi,
  /jest\.mock/gi,
  /sinon\.stub/gi,
  /TODO:/gi,
  /FIXME:/gi,
  /PLACEHOLDER/gi,
  /STUB/gi,
  /fake\w+/gi,
  /dummy\w+/gi,
  /\.skip\(/gi,
  /\.only\(/gi,
  /import.*from.*['"].*mock/gi,
];

const ALLOWED_MOCK_PATTERNS = [
  /mockImplementation.*actual implementation/i, // Documented exceptions
];

class NoMockValidator {
  constructor() {
    this.violations = [];
    this.scannedFiles = 0;
  }

  async validate() {
    console.log('🔍 Running No Mock Protocol Validator...\n');

    const files = await glob('**/*.{js,ts,jsx,tsx}', {
      ignore: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/no-mock-validator.js', // Ignore self
      ],
    });

    for (const file of files) {
      // Skip directories
      const stat = await fs.promises.stat(file);
      if (stat.isDirectory()) continue;

      this.scanFile(file);
    }

    this.printReport();

    if (this.violations.length > 0) {
      console.error('\n❌ No Mock Protocol VIOLATED');
      process.exit(1);
    } else {
      console.log('\n✅ No Mock Protocol COMPLIANT\n');
    }
  }

  async scanFile(filePath) {
    this.scannedFiles++;
    const content = await fs.promises.readFile(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of MOCK_PATTERNS) {
        if (pattern.test(line)) {
          // Check if it's an allowed exception
          const isAllowed = ALLOWED_MOCK_PATTERNS.some(allowed =>
            allowed.test(line)
          );

          if (!isAllowed) {
            this.violations.push({
              file: filePath,
              line: index + 1,
              code: line.trim(),
              pattern: pattern.toString(),
            });
          }
        }
      }
    });
  }

  printReport() {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  📜 NO MOCK PROTOCOL VALIDATION REPORT                ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`Files Scanned: ${this.scannedFiles}`);
    console.log(`Violations Found: ${this.violations.length}`);
    console.log('');

    if (this.violations.length > 0) {
      console.log('Violations:');
      console.log('───────────');
      this.violations.forEach((v, i) => {
        console.log(`\n${i + 1}. ${v.file}:${v.line}`);
        console.log(`   Code: ${v.code}`);
        console.log(`   Pattern: ${v.pattern}`);
      });
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new NoMockValidator();
  validator.validate().catch(console.error);
}

export default NoMockValidator;
