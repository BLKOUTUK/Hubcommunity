/**
 * Test helper utilities for the Community Dashboard project
 *
 * This script provides helper functions for running tests and analyzing test coverage.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get the test coverage summary
 * @returns {Object} Coverage summary
 */
export function getCoverageSummary() {
  try {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      return coverageData.total;
    }
    return null;
  } catch (error) {
    console.error('Error reading coverage data:', error);
    return null;
  }
}

/**
 * Print the test coverage summary to the console
 */
export function printCoverageSummary() {
  const coverage = getCoverageSummary();
  if (!coverage) {
    console.log('No coverage data found. Run tests with coverage first.');
    return;
  }

  console.log('\n=== Test Coverage Summary ===');
  console.log(`Statements: ${coverage.statements.pct.toFixed(2)}%`);
  console.log(`Branches: ${coverage.branches.pct.toFixed(2)}%`);
  console.log(`Functions: ${coverage.functions.pct.toFixed(2)}%`);
  console.log(`Lines: ${coverage.lines.pct.toFixed(2)}%`);
  console.log('=============================\n');

  // Check if coverage meets thresholds
  const thresholds = {
    statements: 80,
    branches: 70,
    functions: 80,
    lines: 80
  };

  let belowThreshold = false;
  Object.entries(thresholds).forEach(([key, threshold]) => {
    if (coverage[key].pct < threshold) {
      console.log(`⚠️ ${key} coverage (${coverage[key].pct.toFixed(2)}%) is below the threshold (${threshold}%)`);
      belowThreshold = true;
    }
  });

  if (!belowThreshold) {
    console.log('✅ All coverage thresholds met!');
  }
}

/**
 * Find files that need tests
 * @param {string} directory - Directory to search
 * @returns {Array<string>} List of files that need tests
 */
export function findFilesNeedingTests(directory = 'src') {
  const basePath = path.join(__dirname, '..', directory);
  const allFiles = [];
  
  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, __tests__, and test directories
        if (!['node_modules', '__tests__', 'test', 'tests'].includes(file)) {
          scanDirectory(filePath);
        }
      } else if (
        // Only include .ts, .tsx files that are not test files
        (file.endsWith('.ts') || file.endsWith('.tsx')) &&
        !file.endsWith('.test.ts') &&
        !file.endsWith('.test.tsx') &&
        !file.endsWith('.spec.ts') &&
        !file.endsWith('.spec.tsx')
      ) {
        const relativePath = path.relative(basePath, filePath);
        allFiles.push(relativePath);
      }
    });
  }
  
  scanDirectory(basePath);
  
  // Check which files have corresponding test files
  const filesNeedingTests = allFiles.filter(file => {
    const dir = path.dirname(file);
    const basename = path.basename(file, path.extname(file));
    
    // Check for test file in __tests__ directory
    const testDirPath = path.join(basePath, dir, '__tests__', `${basename}.test.tsx`);
    const testFilePath = path.join(basePath, dir, `${basename}.test.tsx`);
    
    return !fs.existsSync(testDirPath) && !fs.existsSync(testFilePath);
  });
  
  return filesNeedingTests;
}

/**
 * Print files that need tests
 */
export function printFilesNeedingTests() {
  const files = findFilesNeedingTests();
  
  console.log('\n=== Files Needing Tests ===');
  if (files.length === 0) {
    console.log('All files have corresponding test files! 🎉');
  } else {
    console.log(`Found ${files.length} files without tests:`);
    files.forEach(file => {
      console.log(`- src/${file}`);
    });
  }
  console.log('===========================\n');
}

// If this script is run directly
const args = process.argv.slice(2);

if (args.includes('--coverage')) {
  printCoverageSummary();
}

if (args.includes('--missing-tests')) {
  printFilesNeedingTests();
}

if (args.length === 0) {
  console.log('Usage:');
  console.log('  node test-helpers.js --coverage     Print test coverage summary');
  console.log('  node test-helpers.js --missing-tests List files without tests');
}