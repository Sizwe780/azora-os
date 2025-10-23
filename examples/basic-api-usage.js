// examples/basic-api-usage.js
const axios = require('axios');

/**
 * Basic API usage examples for Azora OS
 * These examples demonstrate how to interact with Azora OS services
 */

// Configuration
const AZORA_SERVICES = {
  aegis: 'http://localhost:4099',
  sapiens: 'http://localhost:4200',
  mint: 'http://localhost:4300',
  oracle: 'http://localhost:4030'
};

/**
 * Example: Get economic intelligence from Azora Oracle
 */
async function getEconomicData() {
  try {
    console.log('📊 Fetching economic intelligence from Azora Oracle...');

    const response = await axios.get(`${AZORA_SERVICES.oracle}/api/oracle/economic-data`);

    console.log('✅ Economic Intelligence Retrieved:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching economic data:', error.message);
    throw error;
  }
}

/**
 * Example: Submit education content to Azora Sapiens
 */
async function submitEducationContent(content) {
  try {
    console.log('📚 Submitting education content to Azora Sapiens...');

    const response = await axios.post(`${AZORA_SERVICES.sapiens}/api/education/content`, {
      title: content.title,
      description: content.description,
      category: content.category,
      content: content.body,
      author: content.author || 'Anonymous'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AZORA_API_KEY || 'demo-key'}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Content submitted successfully:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Error submitting content:', error.message);
    throw error;
  }
}

/**
 * Example: Check wallet balance with Azora Mint
 */
async function getWalletBalance(walletAddress) {
  try {
    console.log(`💰 Checking wallet balance for ${walletAddress}...`);

    const response = await axios.get(`${AZORA_SERVICES.mint}/api/wallet/${walletAddress}/balance`);

    console.log('✅ Wallet Balance Retrieved:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching balance:', error.message);
    throw error;
  }
}

/**
 * Example: Get system health status from Aegis Citadel
 */
async function getSystemHealth() {
  try {
    console.log('🏥 Checking system health from Aegis Citadel...');

    const response = await axios.get(`${AZORA_SERVICES.aegis}/api/health`);

    console.log('✅ System Health Status:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching system health:', error.message);
    throw error;
  }
}

/**
 * Example: Get real-time exchange rates from Azora Oracle
 */
async function getExchangeRates() {
  try {
    console.log('💱 Fetching exchange rates from Azora Oracle...');

    const response = await axios.get(`${AZORA_SERVICES.oracle}/api/oracle/exchange-rates`);

    console.log('✅ Exchange Rates Retrieved:');
    console.log(JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching exchange rates:', error.message);
    throw error;
  }
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    console.log('🚀 Running Azora OS API Examples\n');

    // Check system health first
    await getSystemHealth();
    console.log('');

    // Get economic data
    await getEconomicData();
    console.log('');

    // Get exchange rates
    await getExchangeRates();
    console.log('');

    // Example wallet balance check (using a demo address)
    const demoWallet = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    await getWalletBalance(demoWallet);
    console.log('');

    // Example content submission
    const sampleContent = {
      title: 'Introduction to Azora OS',
      description: 'A comprehensive guide to the Azora OS platform',
      category: 'Technology',
      body: 'Azora OS is a planetary-scale economic intelligence platform...',
      author: 'Azora Community'
    };
    await submitEducationContent(sampleContent);
    console.log('');

    console.log('🎉 All examples completed successfully!');

  } catch (error) {
    console.error('💥 Example execution failed:', error.message);
    console.log('\nNote: Make sure Azora OS services are running before running these examples.');
    console.log('Start services with: npm run dev');
  }
}

// Export functions for use in other modules
module.exports = {
  getEconomicData,
  submitEducationContent,
  getWalletBalance,
  getSystemHealth,
  getExchangeRates,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}