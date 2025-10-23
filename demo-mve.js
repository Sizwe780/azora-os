/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

// Demo script for Azora MVE (Minimum Viable Ecosystem)
// Tests the full event-driven flow

const demo = async () => {
  console.log('🌾 Azora MVE Demo - Farmer Pest Report Flow\n');

  // Simulate farmer submitting a pest report
  const pestReport = {
    farmId: 'FARM-001',
    pestName: 'Fall Armyworm',
    timestamp: new Date().toISOString()
  };

  console.log('🐛 Farmer submits pest report:', pestReport);

  try {
    // Make the API call
    const response = await fetch('http://localhost:3001/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pestReport),
    });

    if (response.ok) {
      console.log('✅ Pest report processed successfully!');
      console.log('\n🔄 Simulated Event Flow:');
      console.log('1. 📡 Synapse Gateway received report');
      console.log('2. 🛰️ Oracle fetched weather data');
      console.log('3. 🔍 Nexus analyzed pest + weather');
      console.log('4. 📜 Covenant stamped recommendation');
      console.log('5. 🧬 Genome logged all events');
      console.log('6. 📱 Real-time push sent to farmer app');

      console.log('\n🎯 Expected Result:');
      console.log('- Farmer app shows: "Apply neem oil immediately (High urgency)"');
      console.log('- Based on Fall Armyworm + low rainfall conditions');

      console.log('\n🚀 Demo complete! Open http://localhost:3001/farmer to see the UI');
    } else {
      console.error('❌ Failed to process report');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}

export { demo };