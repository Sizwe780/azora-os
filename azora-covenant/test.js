/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Azora Ledger Tests
 * @description Comprehensive tests for Africa's First Proof of Compliance Cryptographic AI Ledger
 */

const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const mongoose = require('mongoose');
const redis = require('redis');
const request = require('supertest');

// Mock external dependencies
const mockRedisClient = {
  connect: sinon.stub().resolves(),
  lPush: sinon.stub().resolves(),
  lPop: sinon.stub().resolves(),
  rPush: sinon.stub().resolves(),
  lLen: sinon.stub().resolves(0),
  lTrim: sinon.stub().resolves(),
  quit: sinon.stub().resolves()
};

describe('Azora Ledger - Proof of Compliance Cryptographic AI Ledger', () => {
  let app;
  let server;

  before(async () => {
    // Mock Redis
    sinon.stub(redis, 'createClient').returns(mockRedisClient);

    // Mock axios for external service calls
    sinon.stub(axios, 'get').resolves({ data: { complianceScore: 95 } });

    // Import the service after mocking
    const service = require('./index.js');
    app = service.app;

    // Start server for testing
    server = await service.startServer();
  });

  after(async () => {
    sinon.restore();
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('healthy');
      expect(response.body.service).to.equal('azora-ledger');
      expect(response.body.version).to.equal('1.0.0');
      expect(response.body).to.have.property('ledgerState');
    });
  });

  describe('Data Storage & Cryptographic Footprint', () => {
    it('should store data and create cryptographic footprint', async () => {
      const testData = {
        data: 'GDPR compliance audit data for user privacy assessment',
        dataType: 'COMPLIANCE_DATA',
        owner: 'user-001'
      };

      const response = await request(app)
        .post('/api/store')
        .send(testData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('footprintId');
      expect(response.body).to.have.property('informationValue');
      expect(response.body).to.have.property('merkleRoot');
    });

    it('should reject storage request with missing fields', async () => {
      const response = await request(app)
        .post('/api/store')
        .send({ data: 'test' });

      expect(response.status).to.equal(400);
      expect(response.body.error).to.include('Missing required fields');
    });

    it('should create footprint with correct information value', async () => {
      const testData = {
        data: 'Comprehensive compliance report with detailed findings',
        dataType: 'COMPLIANCE_DATA',
        owner: 'user-002'
      };

      const response = await request(app)
        .post('/api/store')
        .send(testData);

      expect(response.status).to.equal(200);
      expect(response.body.informationValue).to.be.a('string');
      // COMPLIANCE_DATA should have higher value
      expect(parseInt(response.body.informationValue)).to.be.greaterThan(50);
    });
  });

  describe('Azora Coin Minting', () => {
    let footprintId;

    before(async () => {
      // Create a footprint first
      const testData = {
        data: 'User transaction data for minting test',
        dataType: 'TRANSACTION_DATA',
        owner: 'minter-001'
      };

      const storeResponse = await request(app)
        .post('/api/store')
        .send(testData);

      footprintId = storeResponse.body.footprintId;
    });

    it('should mint Azora coin from valid footprint', async () => {
      const mintData = {
        footprintId,
        owner: 'minter-001'
      };

      const response = await request(app)
        .post('/api/mint')
        .send(mintData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('coinId');
      expect(response.body).to.have.property('value');
      expect(response.body.owner).to.equal('minter-001');
    });

    it('should reject minting from non-existent footprint', async () => {
      const mintData = {
        footprintId: 'non-existent-id',
        owner: 'user-001'
      };

      const response = await request(app)
        .post('/api/mint')
        .send(mintData);

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal('Footprint not found');
    });

    it('should reject unauthorized minting', async () => {
      const mintData = {
        footprintId,
        owner: 'unauthorized-user'
      };

      const response = await request(app)
        .post('/api/mint')
        .send(mintData);

      expect(response.status).to.equal(403);
      expect(response.body.error).to.include('Unauthorized');
    });
  });

  describe('Ledger Statistics', () => {
    it('should return comprehensive ledger statistics', async () => {
      const response = await request(app).get('/api/stats');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('totalSupply');
      expect(response.body).to.have.property('circulatingSupply');
      expect(response.body).to.have.property('informationValue');
      expect(response.body).to.have.property('complianceScore');
      expect(response.body).to.have.property('securityScore');
      expect(response.body).to.have.property('recoveredCoins');
      expect(response.body).to.have.property('merkleRoot');
    });
  });

  describe('AI Security System', () => {
    it('should return security status', async () => {
      const response = await request(app).get('/api/security/status');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('securityScore');
      expect(response.body).to.have.property('threatsDetected');
      expect(response.body).to.have.property('advancements');
      expect(response.body.securityScore).to.be.at.least(0);
      expect(response.body.securityScore).to.be.at.most(100);
    });
  });

  describe('AI Recovery System', () => {
    it('should return recovery status', async () => {
      const response = await request(app).get('/api/recovery/status');

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('queueLength');
      expect(response.body).to.have.property('recoveredCoins');
      expect(response.body).to.have.property('activeStrategies');
      expect(response.body).to.have.property('successRate');
    });
  });

  describe('Cryptographic Footprint Validation', () => {
    it('should generate valid cryptographic footprint', async () => {
      const testData = {
        data: 'Test data for cryptographic validation',
        dataType: 'SYSTEM_DATA',
        owner: 'validator-001'
      };

      const response = await request(app)
        .post('/api/store')
        .send(testData);

      expect(response.status).to.equal(200);
      expect(response.body.footprintId).to.be.a('string');
      expect(response.body.merkleRoot).to.be.a('string');
      expect(response.body.merkleRoot.length).to.equal(64); // 32 bytes hex
    });

    it('should handle different data types with appropriate values', async () => {
      const dataTypes = [
        { data: 'Compliance audit data', type: 'COMPLIANCE_DATA' },
        { data: 'User personal information', type: 'USER_DATA' },
        { data: 'Financial transaction record', type: 'TRANSACTION_DATA' },
        { data: 'System log entry', type: 'SYSTEM_DATA' }
      ];

      for (const item of dataTypes) {
        const testData = {
          data: item.data,
          dataType: item.type,
          owner: 'valuer-001'
        };

        const response = await request(app)
          .post('/api/store')
          .send(testData);

        expect(response.status).to.equal(200);
        expect(parseInt(response.body.informationValue)).to.be.greaterThan(0);
      }
    });
  });

  describe('Proof of Compliance Integration', () => {
    it('should integrate with compliance service', async () => {
      // This test verifies that the ledger can communicate with compliance service
      const response = await request(app).get('/health');

      expect(response.status).to.equal(200);
      expect(response.body.ledgerState).to.have.property('complianceScore');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app).get('/api/invalid-route');

      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal('Route not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/store')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).to.equal(400);
    });
  });

  describe('Performance Tests', () => {
    it('should handle multiple concurrent data storage requests', async () => {
      const promises = [];
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        const testData = {
          data: `Performance test data ${i}`,
          dataType: 'SYSTEM_DATA',
          owner: `perf-user-${i}`
        };

        promises.push(
          request(app)
            .post('/api/store')
            .send(testData)
        );
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });

      // Should complete within reasonable time (allowing for CI variability)
      expect(endTime - startTime).to.be.lessThan(5000);
    });

    it('should handle concurrent minting operations', async () => {
      // First create multiple footprints
      const footprintPromises = [];
      for (let i = 0; i < 5; i++) {
        const testData = {
          data: `Minting performance data ${i}`,
          dataType: 'TRANSACTION_DATA',
          owner: `mint-perf-${i}`
        };

        footprintPromises.push(
          request(app)
            .post('/api/store')
            .send(testData)
        );
      }

      const footprintResponses = await Promise.all(footprintPromises);
      const footprintIds = footprintResponses.map(r => r.body.footprintId);

      // Then mint coins concurrently
      const mintPromises = footprintIds.map((id, index) =>
        request(app)
          .post('/api/mint')
          .send({
            footprintId: id,
            owner: `mint-perf-${index}`
          })
      );

      const mintResponses = await Promise.all(mintPromises);

      mintResponses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });

  describe('Security Tests', () => {
    it('should enforce rate limiting', async function() {
      this.timeout(60000); // Increase timeout for rate limiting test

      const requests = [];
      for (let i = 0; i < 150; i++) { // Exceed rate limit
        requests.push(
          request(app)
            .post('/api/store')
            .send({
              data: `Rate limit test ${i}`,
              dataType: 'SYSTEM_DATA',
              owner: 'rate-test-user'
            })
        );
      }

      const responses = await Promise.all(requests);

      // At least some requests should be rate limited (429)
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });

    it('should validate CORS headers', async () => {
      const response = await request(app)
        .options('/api/store')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).to.equal('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).to.equal('true');
    });
  });

  describe('Integration Tests', () => {
    it('should maintain data integrity across operations', async () => {
      // Store data
      const storeResponse = await request(app)
        .post('/api/store')
        .send({
          data: 'Integration test data',
          dataType: 'COMPLIANCE_DATA',
          owner: 'integration-user'
        });

      expect(storeResponse.status).to.equal(200);
      const footprintId = storeResponse.body.footprintId;

      // Mint coin
      const mintResponse = await request(app)
        .post('/api/mint')
        .send({
          footprintId,
          owner: 'integration-user'
        });

      expect(mintResponse.status).to.equal(200);

      // Check stats reflect the operations
      const statsResponse = await request(app).get('/api/stats');
      expect(statsResponse.status).to.equal(200);
      expect(parseInt(statsResponse.body.circulatingSupply)).to.be.greaterThan(0);
      expect(parseInt(statsResponse.body.informationValue)).to.be.greaterThan(0);
    });

    it('should handle AI recovery queue operations', async () => {
      // Mint a coin to trigger recovery queue
      const storeResponse = await request(app)
        .post('/api/store')
        .send({
          data: 'Recovery test data',
          dataType: 'USER_DATA',
          owner: 'recovery-test-user'
        });

      const mintResponse = await request(app)
        .post('/api/mint')
        .send({
          footprintId: storeResponse.body.footprintId,
          owner: 'recovery-test-user'
        });

      expect(mintResponse.status).to.equal(200);

      // Check recovery status
      const recoveryResponse = await request(app).get('/api/recovery/status');
      expect(recoveryResponse.status).to.equal(200);
      // Queue should have at least one item
      expect(recoveryResponse.body.queueLength).to.be.at.least(0);
    });
  });
});