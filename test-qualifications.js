/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { AzoraSapiens } from './azora-sapiens';

// Simple test to verify qualification updates
async function testQualifications() {
    console.log('Testing Azora Sapiens qualification updates...');

    const azora = new AzoraSapiens('test-key');

    // Test that we have the expected number of qualifications
    const qualCount = azora.getSystemAnalytics().totalQualifications;
    console.log(`Total qualifications: ${qualCount}`);

    // Test specific qualifications
    const adcs = azora.getQualification('adcs');
    if (adcs) {
        console.log('✓ ADCS qualification found');
        console.log(`  Description: ${adcs.description.substring(0, 100)}...`);
        console.log(`  NQF Level mentioned: ${adcs.description.includes('NQF Level 6')}`);
        console.log(`  Azora OS mentioned: ${adcs.description.includes('Azora OS')}`);
    }

    const adds = azora.getQualification('adds');
    if (adds) {
        console.log('✓ ADDS qualification found');
        console.log(`  Description: ${adds.description.substring(0, 100)}...`);
    }

    const adee = azora.getQualification('adee');
    if (adee) {
        console.log('✓ ADEE qualification found');
        console.log(`  Description: ${adee.description.substring(0, 100)}...`);
    }

    console.log('Qualification update test completed.');
}

// Run the test
testQualifications().catch(console.error);