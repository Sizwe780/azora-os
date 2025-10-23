/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Test script for Elara Phase 1
import { elaraAgent } from './agent-tools/elara-agent.js';

async function testElara() {
  try {
    console.log('Testing Elara Voss - Phase 1...');
    const result = await elaraAgent('Sizwe, check swarm.');
    console.log('Elara Response:', result);
    console.log('Phase 1 Complete: Elara pulses!');
  } catch (error) {
    console.error('Error:', error);
  }
}

testElara();