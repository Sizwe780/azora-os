/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Nudge Law Compliance Check
 * 
 * Scans the codebase for nudge theory implementation according to:
 * - Transparency requirements
 * - Freedom of choice preservation
 * - User benefit orientation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration settings
const config = {
  transparency: {
    required: true,
    patterns: ['explainChoice', 'transparencyNote', 'disclosureText']
  },
  optOut: {
    required: true,
    patterns: ['optOut', 'disableNudge', 'userPreference']
  },
  userBenefit: {
    required: true,
    patterns: ['forUserBenefit', 'improveUserExperience', 'helpUser']
  }
};

// Run the check
console.log('🔍 Running Nudge Law Compliance Check');
console.log('=====================================');

// Check UI components
console.log('\n📱 Checking UI components for nudge implementations...');
const uiFiles = execSync('find /workspaces/azora-os -path "*/src/components" -name "*.jsx" | grep -v "node_modules"').toString().split('\n').filter(Boolean);

let compliantFiles = 0;
let totalChecked = 0;

uiFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  totalChecked++;
  const content = fs.readFileSync(file, 'utf8');
  let fileCompliance = true;
  
  // Check each compliance aspect
  Object.entries(config).forEach(([aspect, settings]) => {
    const hasMatches = settings.patterns.some(pattern => content.includes(pattern));
    if (settings.required && !hasMatches) {
      fileCompliance = false;
      console.log(`❌ ${file} lacks ${aspect} implementation`);
    }
  });
  
  if (fileCompliance) {
    compliantFiles++;
  }
});

console.log(`\n✅ ${compliantFiles}/${totalChecked} UI components are nudge-compliant`);

// Overall compliance score
const complianceScore = Math.round((compliantFiles / totalChecked) * 100);
console.log(`\n📊 Overall Nudge Law Compliance Score: ${complianceScore}%`);

if (complianceScore < 80) {
  console.log('\n⚠️ Recommendation: Implement more transparent nudge mechanisms');
  console.log('   - Add opt-out options for all nudges');
  console.log('   - Include clear explanation for why choices are presented in a specific way');
  console.log('   - Document the user benefit for each nudge implementation');
} else {
  console.log('\n🎉 Nudge law implementation meets recommended standards');
}
