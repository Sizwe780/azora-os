#!/usr/bin/env node

/**
 * Buildspaces Launch Script
 * Executes the final integration and launch sequence
 */

const { FinalIntegrationLaunchService } = require('../lib/services/final-integration-launch');

async function launchBuildspaces() {
  console.log('🚀 Starting Azora Buildspaces Launch Sequence...\n');
  
  try {
    const launchService = new FinalIntegrationLaunchService();
    
    // Initialize all services
    console.log('📋 Initializing all services...');
    const serviceInit = await launchService.initializeAllServices();
    console.log(`✅ ${serviceInit.services.length} services initialized`);
    console.log(`✅ ${serviceInit.integrations.length} service integrations completed\n`);
    
    // Run pre-launch checks
    console.log('🔍 Running pre-launch validation...');
    const preLaunchChecks = await launchService.runPreLaunchChecks();
    console.log(`📊 Overall Status: ${preLaunchChecks.overallStatus.toUpperCase()}`);
    console.log(`⚠️  Issues Found: ${preLaunchChecks.issues.length}`);
    console.log(`💡 Recommendations: ${preLaunchChecks.recommendations.length}\n`);
    
    // Validate deployment readiness
    console.log('🎯 Validating deployment readiness...');
    const deploymentReadiness = await launchService.validateDeploymentReadiness();
    console.log(`🏗️  Infrastructure: ${deploymentReadiness.infrastructure.status} (${deploymentReadiness.infrastructure.score}%)`);
    console.log(`🔒 Security: ${deploymentReadiness.security.status} (${deploymentReadiness.security.score}%)`);
    console.log(`⚡ Performance: ${deploymentReadiness.performance.status} (${deploymentReadiness.performance.score}%)`);
    console.log(`📜 Compliance: ${deploymentReadiness.compliance.status} (${deploymentReadiness.compliance.score}%)`);
    console.log(`🎯 Overall Ready: ${deploymentReadiness.overall.ready ? 'YES' : 'NO'} (${deploymentReadiness.overall.score}%)\n`);
    
    // Execute launch sequence
    console.log('🚀 Executing launch sequence...');
    const launchResult = await launchService.executeLaunch();
    
    if (launchResult.success) {
      console.log('🎉 LAUNCH SUCCESSFUL!');
      console.log(`🆔 Launch ID: ${launchResult.launchId}`);
      console.log(`⏱️  Duration: ${launchResult.duration}ms`);
      console.log(`📅 Timestamp: ${launchResult.timestamp.toISOString()}\n`);
      
      console.log('📋 Launch Results:');
      launchResult.results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.step}: ${result.status.toUpperCase()}`);
        console.log(`     ${result.details}`);
      });
      
      console.log('\n🌟 Azora Buildspaces is now LIVE!');
      console.log('🔗 Platform URL: https://buildspaces.azora.world');
      console.log('📊 Monitoring Dashboard: https://monitor.azora.world');
      
    } else {
      console.log('❌ LAUNCH FAILED!');
      console.log(`🆔 Launch ID: ${launchResult.launchId}`);
      console.log(`⏱️  Duration: ${launchResult.duration}ms\n`);
      
      console.log('❌ Failed Steps:');
      launchResult.results.forEach((result, index) => {
        if (result.status === 'failed') {
          console.log(`  ${index + 1}. ${result.step}: ${result.details}`);
        }
      });
    }
    
    // Setup post-launch monitoring
    console.log('\n📊 Setting up post-launch monitoring...');
    const monitoring = await launchService.setupPostLaunchMonitoring();
    console.log(`📈 Dashboards: ${monitoring.dashboards.length}`);
    console.log(`🚨 Alerts: ${monitoring.alerts.length}`);
    console.log(`📊 Metrics: ${monitoring.metrics.length}`);
    
    console.log('\n🏁 Launch sequence completed!');
    
  } catch (error) {
    console.error('💥 Launch failed with error:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Execute launch
launchBuildspaces().catch(console.error);
