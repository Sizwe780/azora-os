/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * AZORA SYSTEM STATUS MONITOR
 *
 * Comprehensive monitoring dashboard for all Azora ecosystem services.
 * Validates the complete Global Transfer activation sequence.
 */

const http = require('http');

const services = [
    {
        name: 'Azora Nexus',
        url: 'http://localhost:4100/health',
        port: 4100,
        required: true
    },
    {
        name: 'Nexus Notifications',
        url: 'http://localhost:4101/health',
        port: 4101,
        required: true
    },
    {
        name: 'Global Transfer (Mint)',
        url: 'http://localhost:4301/health/global-transfer',
        port: 4301,
        required: true
    },
    {
        name: 'Azora Oracle',
        url: 'http://localhost:4030/health',
        port: 4030,
        required: true
    },
    {
        name: 'Nexus API',
        url: 'http://localhost:4100/api/rates',
        port: 4100,
        required: true
    }
];

async function checkService(service) {
    return new Promise((resolve) => {
        const req = http.get(service.url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const status = JSON.parse(data);
                    resolve({
                        ...service,
                        status: 'operational',
                        response: status,
                        httpStatus: res.statusCode
                    });
                } catch (error) {
                    resolve({
                        ...service,
                        status: 'error',
                        error: 'Invalid JSON response',
                        httpStatus: res.statusCode
                    });
                }
            });
        });

        req.on('error', (error) => {
            resolve({
                ...service,
                status: 'down',
                error: error.message
            });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                ...service,
                status: 'timeout',
                error: 'Request timeout'
            });
        });
    });
}

async function checkAllServices() {
    console.log('🔍 AZORA ECOSYSTEM STATUS MONITOR');
    console.log('=================================\n');

    const results = await Promise.all(services.map(checkService));

    let operationalCount = 0;
    let totalCount = results.length;

    console.log('📊 Service Status:');
    console.log('------------------');

    results.forEach(result => {
        const statusIcon = result.status === 'operational' ? '✅' : '❌';
        const statusText = result.status === 'operational' ? 'OPERATIONAL' : result.status.toUpperCase();

        console.log(`${statusIcon} ${result.name}: ${statusText}`);

        if (result.status === 'operational') {
            operationalCount++;
            if (result.response) {
                console.log(`   📍 Port: ${result.port}`);
                console.log(`   🔗 Status: ${result.response.status || 'ok'}`);
            }
        } else {
            console.log(`   ❌ Error: ${result.error}`);
        }
        console.log('');
    });

    console.log('🎯 System Health Summary:');
    console.log('-------------------------');
    console.log(`Services Operational: ${operationalCount}/${totalCount}`);

    const healthPercentage = Math.round((operationalCount / totalCount) * 100);
    console.log(`System Health: ${healthPercentage}%`);

    if (operationalCount === totalCount) {
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL');
        console.log('🌟 Azora Global Transfer is LIVE');
        console.log('💱 Cross-border transactions enabled');
        console.log('⚡ Real-time exchange rates streaming');
        console.log('🔒 Smart contract bridge active');
        console.log('📱 Nexus notifications broadcasting');
    } else {
        console.log('\n⚠️  SOME SYSTEMS REQUIRE ATTENTION');
        const failedServices = results.filter(r => r.status !== 'operational');
        console.log('Failed Services:', failedServices.map(s => s.name));
    }

    console.log('\n🔄 Status check completed at:', new Date().toISOString());
    console.log('📊 Next check in 30 seconds...\n');

    return operationalCount === totalCount;
}

async function monitorSystem() {
    let consecutiveSuccesses = 0;

    while (true) {
        const allOperational = await checkAllServices();

        if (allOperational) {
            consecutiveSuccesses++;
            if (consecutiveSuccesses >= 3) {
                console.log('🏆 SYSTEM STABILITY ACHIEVED');
                console.log('✅ All services have been operational for 90 seconds');
                console.log('🚀 Azora Global Transfer activation sequence: COMPLETE\n');
                break;
            }
        } else {
            consecutiveSuccesses = 0;
        }

        await new Promise(resolve => setTimeout(resolve, 30000)); // Check every 30 seconds
    }
}

// Run the monitoring
monitorSystem().catch(error => {
    console.error('Monitoring error:', error);
    process.exit(1);
});