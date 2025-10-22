/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * Blockchain-Database Integration Test
 *
 * Tests the integration between blockchain verification and database services
 * Validates transaction verification, data integrity, and cross-chain operations
 */

export async function run() {
  const results = {
    passed: false,
    details: {},
    error: null
  };

  try {
    console.log('  ⛓️  Testing blockchain-database sync...');

    // Test 1: Blockchain service health
    const blockchainHealth = await testEndpoint('http://localhost:3001/health');
    results.details.blockchainHealth = blockchainHealth.success;

    // Test 2: Database service health
    const dbHealth = await testEndpoint('http://localhost:5002/health');
    results.details.dbHealth = dbHealth.success;

    // Test 3: Blockchain verification endpoint
    const verifyResponse = await testEndpoint('http://localhost:3001/verify');
    results.details.blockchainVerify = verifyResponse.success;

    // Test 4: Database transaction storage
    const transactionTest = await testTransactionStorage();
    results.details.transactionStorage = transactionTest.success;

    // Test 5: Cross-service transaction sync
    const syncTest = await testTransactionSync();
    results.details.transactionSync = syncTest.success;

    // Test 6: Data integrity verification
    const integrityTest = await testDataIntegrity();
    results.details.dataIntegrity = integrityTest.success;

    // Test 7: Smart contract interaction
    const contractTest = await testSmartContract();
    results.details.smartContract = contractTest.success;

    // Determine overall pass/fail
    const allTests = Object.values(results.details);
    results.passed = allTests.every(test => test === true);

    if (results.passed) {
      results.details.summary = 'All blockchain-database integration tests passed';
    } else {
      results.details.summary = `Failed tests: ${allTests.filter(t => !t).length}/${allTests.length}`;
    }

  } catch (error) {
    results.error = error.message;
    results.details.error = error.stack;
  }

  return results;
}

async function testEndpoint(url) {
  try {
    const response = await fetch(url, { timeout: 5000 });
    return { success: response.ok };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testTransactionStorage() {
  try {
    // Test storing blockchain transaction in database
    const transactionData = {
      txHash: '0x' + Math.random().toString(36).substr(2, 16),
      blockNumber: Math.floor(Math.random() * 1000000),
      from: '0x' + Math.random().toString(36).substr(2, 40),
      to: '0x' + Math.random().toString(36).substr(2, 40),
      value: '1000000000000000000', // 1 ETH in wei
      gasUsed: '21000',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      network: 'ethereum'
    };

    const response = await fetch('http://localhost:5002/data/mongodb/blockchain_transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        collection: 'blockchain_transactions',
        document: transactionData
      })
    });

    return {
      success: response.ok,
      status: response.status,
      txHash: transactionData.txHash
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testTransactionSync() {
  try {
    // Test syncing transaction data between blockchain and database services
    const syncData = {
      entityType: 'blockchain_transaction',
      entityId: 'sync-test-' + Date.now(),
      data: {
        txHash: '0x' + Math.random().toString(36).substr(2, 16),
        verified: true,
        syncedAt: new Date().toISOString()
      },
      operation: 'sync'
    };

    // Publish sync event
    const publishResponse = await fetch('http://localhost:5002/sync/publish/blockchain_transaction/sync-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });

    // Verify blockchain service can receive sync
    const verifyResponse = await fetch('http://localhost:3001/sync/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });

    return {
      success: publishResponse.ok && verifyResponse.ok,
      publishStatus: publishResponse.status,
      verifyStatus: verifyResponse.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testDataIntegrity() {
  try {
    // Test data integrity verification across services
    const integrityData = {
      data: 'test integrity data',
      hash: 'sha256-' + Math.random().toString(36),
      signature: 'sig-' + Math.random().toString(36),
      timestamp: new Date().toISOString()
    };

    // Store data with integrity check
    const storeResponse = await fetch('http://localhost:5002/data/integrity/store', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(integrityData)
    });

    // Verify integrity via blockchain service
    const verifyResponse = await fetch('http://localhost:3001/integrity/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: integrityData.hash })
    });

    return {
      success: storeResponse.ok && verifyResponse.ok,
      storeStatus: storeResponse.status,
      verifyStatus: verifyResponse.status
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSmartContract() {
  try {
    // Test smart contract interaction through blockchain service
    const contractData = {
      contractAddress: '0x' + Math.random().toString(36).substr(2, 40),
      method: 'transfer',
      params: {
        to: '0x' + Math.random().toString(36).substr(2, 40),
        amount: '1000000'
      },
      network: 'ethereum'
    };

    const response = await fetch('http://localhost:3001/contract/interact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contractData)
    });

    // Store contract interaction result in database
    if (response.ok) {
      const result = await response.json();
      const dbStoreResponse = await fetch('http://localhost:5002/data/mongodb/contract_interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: 'contract_interactions',
          document: {
            ...contractData,
            result: result,
            storedAt: new Date().toISOString()
          }
        })
      });

      return {
        success: dbStoreResponse.ok,
        contractStatus: response.status,
        dbStatus: dbStoreResponse.status
      };
    }

    return { success: false, contractStatus: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}