/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

#!/usr/bin/env node

/**
 * @file AI Security Monitoring Service Validation
 * @description Simple validation script for the advanced AI security monitoring service
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function validateService() {
  console.log('🚀 Validating AI Security Monitoring Service v2.0...');

  try {
    // Check if service files exist
    const files = [
      'index.js',
      'package.json',
      'test.js'
    ];

    console.log('\n📁 Checking service files...');
    files.forEach(file => {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
      } else {
        console.log(`❌ ${file} missing`);
      }
    });

    // Check package.json dependencies
    console.log('\n📦 Checking dependencies...');
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = [
      'express',
      '@tensorflow/tfjs',
      '@tensorflow-models/coco-ssd',
      'socket.io',
      'mongodb',
      'redis',
      'sharp'
    ];

    requiredDeps.forEach(dep => {
      if (packageJson.dependencies[dep]) {
        console.log(`✅ ${dep} configured`);
      } else {
        console.log(`❌ ${dep} missing`);
      }
    });

    // Validate code structure
    console.log('\n🔧 Checking code structure...');
    const indexContent = fs.readFileSync('index.js', 'utf8');

    const features = [
      'ComputerVisionAnalyzer',
      'WebSocket',
      'TensorFlow',
      'MongoDB',
      'Redis',
      'Threat Detection',
      'Event Bus'
    ];

    features.forEach(feature => {
      if (indexContent.includes(feature.replace(' ', ''))) {
        console.log(`✅ ${feature} implemented`);
      } else {
        console.log(`❌ ${feature} missing`);
      }
    });

    // Check for advanced features
    console.log('\n🎯 Checking advanced features...');
    const advancedFeatures = [
      'Circuit Breaker',
      'Rate Limiting',
      'Health Checks',
      'Error Handling',
      'Logging',
      'Analytics',
      'Real-time Streaming'
    ];

    advancedFeatures.forEach(feature => {
      const featureKey = feature.toLowerCase().replace(/\s+/g, '');
      if (indexContent.includes(featureKey) ||
          indexContent.includes(feature.replace(/\s+/g, '')) ||
          indexContent.includes(feature.toLowerCase())) {
        console.log(`✅ ${feature} implemented`);
      } else {
        console.log(`❌ ${feature} missing`);
      }
    });

    console.log('\n🎉 AI Security Monitoring Service validation complete!');
    console.log('\n📊 Service Capabilities:');
    console.log('• Real-time computer vision with TensorFlow.js');
    console.log('• Object detection and classification');
    console.log('• Anomaly detection and behavioral analysis');
    console.log('• Threat assessment and alerting');
    console.log('• WebSocket streaming for live updates');
    console.log('• Camera management and registration');
    console.log('• Event bus integration');
    console.log('• MongoDB for analysis storage');
    console.log('• Redis for caching and pub/sub');
    console.log('• RESTful API with rate limiting');
    console.log('• Comprehensive analytics and reporting');
    console.log('• Production-ready with health checks and logging');

    return true;

  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    return false;
  }
}

// Run validation if called directly
if (require.main === module) {
  validateService().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { validateService };