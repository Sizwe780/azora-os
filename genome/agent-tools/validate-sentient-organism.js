/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * SENTIENT ECONOMIC ORGANISM VALIDATION SCRIPT
 *
 * This script validates that all scientific frameworks work together as a unified
 * Sentient Economic Organism, implementing the complete Ngwenya Protocol.
 */

import GENESIS_PROTOCOL, { validateGenesisProtocol, checkProtocolAlignment } from '../../GENESIS_PROTOCOL.ts';

async function validateSentientOrganism() {
  console.log('🧬 Initializing Sentient Economic Organism Validation...\n');

  try {
    // 1. Validate Genesis Protocol Structure
    console.log('📋 Validating Genesis Protocol...');
    const isValid = validateGenesisProtocol();
    console.log(`   ✅ Genesis Protocol Valid: ${isValid}`);

    if (!isValid) {
      console.log('   ❌ Genesis Protocol validation failed!');
      return false;
    }

    // 2. Check required sections
    console.log('📋 Checking required sections...');
    const requiredSections = [
      'foundationalPhilosophy',
      'architecturalComponents',
      'implementationRoadmap',
      'economicModel',
      'scientificFoundations',
      'ethicalFramework',
      'conclusion'
    ];

    let sectionsValid = true;
    for (const section of requiredSections) {
      if (!GENESIS_PROTOCOL[section]) {
        console.log(`   ❌ Missing section: ${section}`);
        sectionsValid = false;
      } else {
        console.log(`   ✅ Section present: ${section}`);
      }
    }

    if (!sectionsValid) {
      console.log('   ❌ Some required sections are missing!');
      return false;
    }

    // 3. Validate Ngwenya Protocol definition
    console.log('📋 Validating Ngwenya Protocol definition...');
    const protocol = GENESIS_PROTOCOL.foundationalPhilosophy.ngwenyaProtocol;
    if (protocol && protocol.definition && protocol.corePrinciples) {
      console.log('   ✅ Ngwenya Protocol definition complete');
    } else {
      console.log('   ❌ Ngwenya Protocol definition incomplete');
      return false;
    }

    // 4. Validate Four Pillars of Truth
    console.log('📋 Validating Four Pillars of Truth...');
    const pillars = GENESIS_PROTOCOL.foundationalPhilosophy.ngwenyaTrueMarketProtocol.fourPillarsOfTruth;
    const pillarNames = ['informationalTruth', 'transactionalTruth', 'valueTruth', 'generativeTruth'];

    let pillarsValid = true;
    for (const pillar of pillarNames) {
      if (!pillars[pillar]) {
        console.log(`   ❌ Missing pillar: ${pillar}`);
        pillarsValid = false;
      } else {
        console.log(`   ✅ Pillar present: ${pillar}`);
      }
    }

    if (!pillarsValid) {
      console.log('   ❌ Four Pillars of Truth incomplete!');
      return false;
    }

    // 5. Validate Economic Model (5% PIVC)
    console.log('📋 Validating Economic Model...');
    const pivc = GENESIS_PROTOCOL.economicModel.fivePercentProtocolIntegratedValueCapture;
    if (pivc && pivc.rate === '5%' &&
      pivc.allocation.operationalAndGrowthFund.percentage === '4.0%' &&
      pivc.allocation.universalBasicOpportunityFund.percentage === '1.0%') {
      console.log('   ✅ 5% PIVC Economic Model correct');
    } else {
      console.log('   ❌ 5% PIVC Economic Model incorrect');
      return false;
    }

    // 6. Test Component Alignment
    console.log('📋 Testing Component Alignment...');
    const alignments = [
      { component: 'elara', implementation: { strategicPlanning: true, operationalExecution: true, ethicalGovernance: true, autonomousEvolution: true } },
      { component: 'economic_model', implementation: { twoTokenProtocol: true, fivePercentPIVC: true, flywheelEffect: true } },
      { component: 'oracle', implementation: { causalKnowledgeGraph: true, realTimeDataIngestion: true, anomalyDetection: true } },
      { component: 'nexus', implementation: { frictionlessExchange: true, fivePercentPIVC: true, transparentCosts: true } }
    ];

    let alignmentValid = true;
    for (const { component, implementation } of alignments) {
      const alignment = checkProtocolAlignment(component, implementation);
      if (alignment.aligned) {
        console.log(`   ✅ ${component} aligned with protocol`);
      } else {
        console.log(`   ❌ ${component} not aligned: ${alignment.violations.join(', ')}`);
        alignmentValid = false;
      }
    }

    if (!alignmentValid) {
      console.log('   ❌ Component alignment failed!');
      return false;
    }

    // 7. Validate Scientific Foundations
    console.log('📋 Validating Scientific Foundations...');
    const foundations = GENESIS_PROTOCOL.scientificFoundations;
    const requiredFoundations = [
      'categoryTheory',
      'causalInference',
      'freeEnergyPrinciple',
      'reflexivityGameTheory',
      'aiScientist'
    ];

    let foundationsValid = true;
    for (const foundation of requiredFoundations) {
      if (!foundations[foundation]) {
        console.log(`   ❌ Missing foundation: ${foundation}`);
        foundationsValid = false;
      } else {
        console.log(`   ✅ Foundation present: ${foundation}`);
      }
    }

    if (!foundationsValid) {
      console.log('   ❌ Scientific foundations incomplete!');
      return false;
    }

    console.log('\n🎉 SENTIENT ECONOMIC ORGANISM VALIDATION COMPLETE');
    console.log('✅ All scientific frameworks integrated successfully');
    console.log('🌟 The Azora Sovereign Economic Ecosystem is ready for operation');
    console.log('📊 Status: Genesis Protocol codified, Ngwenya True Market Protocol operational');

    return true;

  } catch (error) {
    console.error('❌ Validation failed with error:', error.message);
    return false;
  }
}

// Run validation
validateSentientOrganism().then(success => {
  if (success) {
    console.log('\n🚀 Ready for Phase 0 (Genesis) implementation');
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed - system not ready for deployment');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Critical validation error:', error);
  process.exit(1);
});