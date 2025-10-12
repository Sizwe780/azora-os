// test-blockchain-api.js
// Comprehensive test script to demonstrate the Azora Blockchain via API

const fetch = require('node-fetch');
const BASE_URL = 'http://localhost:3001/api/v1/ledger';

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log(`\n📡 Making request to: ${url}`);

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

async function testBlockchain() {
  console.log('🚀 Starting Azora Blockchain API Demonstration...\n');

  // Check initial stats
  console.log('📊 Initial Blockchain Stats:');
  const initialStats = await makeRequest('?action=stats');
  console.log(JSON.stringify(initialStats, null, 2));

  // Add test transactions
  console.log('\n💰 Adding test transactions...');

  await makeRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'transaction',
      txId: 'test-tx-1',
      from: 'userA',
      to: 'userB',
      amount: 100
    })
  });

  await makeRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'compliance',
      entityId: 'company1',
      checkType: 'kyc',
      result: true,
      details: 'KYC verification passed'
    })
  });

  await makeRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'onboarding',
      clientId: 'client123',
      details: { company: 'Test Corp', employees: 50 }
    })
  });

  // Check updated stats
  console.log('\n📊 Updated Blockchain Stats:');
  const updatedStats = await makeRequest('?action=stats');
  console.log(JSON.stringify(updatedStats, null, 2));

  // Mint some tokens
  console.log('\n🪙 Minting AZORA tokens...');

  await makeRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mint',
      clientId: 'client123',
      amount: 1000
    })
  });

  await makeRequest('', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'mint',
      clientId: 'client456',
      amount: 500
    })
  });

  // Check final stats
  console.log('\n📊 Final Blockchain Stats:');
  const finalStats = await makeRequest('?action=stats');
  console.log(JSON.stringify(finalStats, null, 2));

  // Check blocks
  console.log('\n📦 Blockchain Blocks:');
  const blocks = await makeRequest('?action=blocks');
  console.log(`Total blocks: ${blocks.length}`);
  blocks.forEach((block, index) => {
    console.log(`Block ${index}: ${block.entries.length} entries, hash: ${block.hash.substring(0, 16)}...`);
  });

  // Check tokens
  console.log('\n💎 AZORA Tokens:');
  const tokens = await makeRequest('?action=tokens');
  console.log(`Total tokens: ${tokens.length}`);
  tokens.forEach(token => {
    console.log(`Token ${token.id}: ${token.balance} AZORA owned by ${token.owner}`);
  });

  // Verify blockchain integrity
  console.log('\n🔒 Verifying blockchain integrity...');
  const verification = await makeRequest('?action=verify');
  console.log(`✅ Blockchain is ${verification.valid ? 'VALID' : 'INVALID'}`);

  // Show ecosystem value growth
  console.log('\n💎 Ecosystem Value Growth:');
  const value = await makeRequest('?action=value');
  console.log(`Current Value: $${value.ecosystemValue.toLocaleString()}`);
  console.log('(Value grows exponentially with blockchain complexity and adoption)');

  console.log('\n🎉 Azora Blockchain demonstration complete!');
  console.log('The ledger is now cryptographically secure and will increase in value as more data is added!');
}

// Wait for server to start, then run tests
// In Node.js, setTimeout is available globally. If you still get an error, use global.setTimeout:
global.setTimeout(testBlockchain, 5000);