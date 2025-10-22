/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file Advanced Compliance Service Tests
 * @description Comprehensive tests for the enterprise-grade compliance service
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
  lTrim: sinon.stub().resolves(),
  quit: sinon.stub().resolves()
};

// Initialize AI models for testing
async function initializeTestAIModels() {
  const service = require('./index.js');

  // Set up mock AI models using the setter functions
  const mockPrivacyAIModel = {
    analyzeDataFlow: async (dataFlow) => {
      return {
        privacyRisk: 'LOW',
        score: 0.3,
        recommendations: ['Data flow looks good']
      };
    },
    generateRecommendations: (dataFlow, riskScore) => {
      return ['Mock recommendation'];
    }
  };

  const mockRiskAssessmentModel = {
    assessComplianceRisk: async (organization, activities) => {
      return {
        overallRisk: 25,
        riskLevel: 'LOW',
        factors: [],
        recommendations: ['Continue current practices']
      };
    },
    checkFrameworkCompliance: async (org, framework) => {
      return {
        score: 0.85,
        issues: ['Minor documentation gaps']
      };
    },
    assessActivityRisk: async (activity) => {
      return {
        score: 10,
        issues: []
      };
    },
    generateRiskRecommendations: (totalRisk, factors) => {
      return ['Mock risk recommendation'];
    }
  };

  service.setPrivacyAIModel(mockPrivacyAIModel);
  service.setRiskAssessmentModel(mockRiskAssessmentModel);
}

describe('Advanced Compliance Service', () => {
  let app;
  let server;

  before(async () => {
    // Mock Redis
    sinon.stub(redis, 'createClient').returns(mockRedisClient);

    // Mock axios for event bus
    sinon.stub(axios, 'post').resolves({ data: { success: true } });

    // Import the service after mocking
    const service = require('./index.js');
    app = service.app;

    // Initialize AI models manually for testing
    await initializeTestAIModels();

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
      expect(response.body.service).to.equal('compliance-service');
      expect(response.body.version).to.equal('3.0.0');
    });

    it('should return API health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('online');
    });
  });

  describe('Framework Management', () => {
    it('should list all compliance frameworks', async () => {
      const response = await request(app).get('/api/frameworks');
      expect(response.status).to.equal(200);
      expect(response.body.frameworks).to.have.property('GDPR');
      expect(response.body.frameworks).to.have.property('HIPAA');
      expect(response.body.frameworks).to.have.property('CCPA');
    });

    it('should return specific framework details', async () => {
      const response = await request(app).get('/api/frameworks/gdpr');
      expect(response.status).to.equal(200);
      expect(response.body.framework.name).to.equal('General Data Protection Regulation');
    });

    it('should return 404 for unknown framework', async () => {
      const response = await request(app).get('/api/frameworks/unknown');
      expect(response.status).to.equal(404);
    });
  });

  describe('Compliance Assessment', () => {
    it('should perform compliance risk assessment', async () => {
      const assessmentData = {
        organization: { id: 'org-001', industry: 'healthcare' },
        activities: [
          { type: 'data_processing', riskFactors: ['large_dataset'] },
          { type: 'international_transfer', riskFactors: ['third_country'] }
        ]
      };

      const response = await request(app)
        .post('/api/assess')
        .send(assessmentData);

      expect(response.status).to.equal(200);
      expect(response.body.assessment).to.have.property('overallRisk');
      expect(response.body.assessment).to.have.property('riskLevel');
      expect(response.body.assessment).to.have.property('factors');
    });
  });

  describe('Data Subject Rights', () => {
    it('should handle data access requests', async () => {
      const requestData = {
        subjectId: 'user-001',
        dataTypes: ['personal', 'health'],
        justification: 'User requested access to their data'
      };

      const response = await request(app)
        .post('/api/data-rights/access')
        .send(requestData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('requestId');
      expect(response.body.status).to.equal('SUBMITTED');
    });

    it('should handle data erasure requests', async () => {
      const requestData = {
        subjectId: 'user-002',
        dataTypes: ['personal'],
        justification: 'User requested data deletion'
      };

      const response = await request(app)
        .post('/api/data-rights/erasure')
        .send(requestData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('requestId');
    });

    it('should reject invalid data rights', async () => {
      const response = await request(app)
        .post('/api/data-rights/invalid')
        .send({ subjectId: 'user-001' });

      expect(response.status).to.equal(400);
    });
  });

  describe('Privacy Impact Assessment', () => {
    it('should create PIA for data processing activities', async () => {
      const piaData = {
        project: {
          name: 'Customer Analytics Platform',
          description: 'AI-powered customer behavior analysis'
        },
        dataFlows: [
          {
            id: 'flow-001',
            dataTypes: ['personal', 'behavioral'],
            recipients: ['analytics-team', 'marketing'],
            retentionPeriod: 365,
            consentObtained: true,
            encrypted: true
          }
        ]
      };

      const response = await request(app)
        .post('/api/pia')
        .send(piaData);

      expect(response.status).to.equal(200);
      expect(response.body.pia).to.have.property('id');
      expect(response.body.pia).to.have.property('overallRisk');
      expect(response.body.pia.assessments).to.have.lengthOf(1);
    });
  });

  describe('Automated Reporting', () => {
    it('should generate compliance reports', async () => {
      const reportData = {
        type: 'quarterly',
        period: 'Q1-2025',
        frameworks: ['GDPR', 'HIPAA']
      };

      const response = await request(app)
        .post('/api/reports/generate')
        .send(reportData);

      expect(response.status).to.equal(200);
      expect(response.body.report).to.have.property('id');
      expect(response.body.report.type).to.equal('quarterly');
      expect(response.body.report.sections).to.have.length.greaterThan(0);
    });
  });

  describe('Audit Trail', () => {
    it('should log audit events', async () => {
      const auditData = {
        action: 'data_access',
        userId: 'user-001',
        resource: 'customer_database',
        details: { recordsAccessed: 150 },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      };

      const response = await request(app)
        .post('/api/audit/log')
        .send(auditData);

      expect(response.status).to.equal(200);
      expect(response.body.logged).to.be.true;
    });
  });

  describe('Breach Notification', () => {
    it('should handle breach reporting', async () => {
      const breachData = {
        type: 'unauthorized_access',
        affectedUsers: 1500,
        dataTypes: ['personal', 'financial'],
        description: 'Database exposed due to misconfiguration',
        discoveredAt: new Date().toISOString()
      };

      const response = await request(app)
        .post('/api/breach/report')
        .send(breachData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('breachId');
      expect(response.body.notifications).to.have.length.greaterThan(0);
    });
  });

  describe('Legacy API Compatibility', () => {
    it('should support legacy compliance logging', async () => {
      const logData = {
        action: 'policy_check',
        result: 'allowed',
        user: 'test-user'
      };

      const response = await request(app)
        .post('/api/compliance/log')
        .send(logData);

      expect(response.status).to.equal(200);
      expect(response.body.ok).to.be.true;
    });

    it('should return legacy compliance logs', async () => {
      const response = await request(app).get('/api/compliance/logs');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('logs');
    });

    it('should return legacy policy information', async () => {
      const response = await request(app).get('/api/compliance/policy');
      expect(response.status).to.equal(200);
      expect(response.body.policies).to.have.length.greaterThan(0);
    });

    it('should perform legacy policy checks', async () => {
      const policyData = {
        action: 'data_processing',
        dataTypes: ['personal'],
        jurisdiction: 'EU'
      };

      const response = await request(app)
        .post('/api/compliance/policy/check')
        .send(policyData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('allowed');
      expect(response.body).to.have.property('risk');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app).get('/invalid-route');
      expect(response.status).to.equal(404);
      expect(response.body.error).to.equal('Route not found');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/assess')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).to.equal(400);
    });
  });

  describe('Security Tests', () => {
    it('should enforce rate limiting', async () => {
      // Make many requests quickly
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(request(app).get('/api/health'));
      }

      const responses = await Promise.all(promises);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      expect(rateLimitedResponses.length).to.be.greaterThan(0);
    });

    it('should validate CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).to.equal('http://localhost:5173');
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with event bus for data rights requests', async () => {
      const requestData = {
        subjectId: 'user-001',
        dataTypes: ['personal'],
        justification: 'Annual review'
      };

      await request(app)
        .post('/api/data-rights/access')
        .send(requestData);

      // Verify event bus was called
      expect(axios.post.called).to.be.true;
    });

    it('should integrate with event bus for breach reporting', async () => {
      const breachData = {
        type: 'data_breach',
        affectedUsers: 100,
        dataTypes: ['personal'],
        description: 'Security incident',
        discoveredAt: new Date().toISOString()
      };

      await request(app)
        .post('/api/breach/report')
        .send(breachData);

      // Verify event bus was called
      expect(axios.post.called).to.be.true;
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent compliance assessments', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/assess')
            .send({
              organization: { id: `org-${i}` },
              activities: [{ type: 'data_processing' }]
            })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });

    it('should handle multiple data rights requests', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/data-rights/access')
            .send({
              subjectId: `user-${i}`,
              dataTypes: ['personal'],
              justification: 'Bulk test'
            })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).to.equal(200);
      });
    });
  });
});