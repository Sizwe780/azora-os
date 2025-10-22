/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * @file AI Security Monitoring Service Tests
 * @description Comprehensive tests for the advanced AI security monitoring service
 */

const { expect } = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const { MongoClient } = require('mongodb');
const redis = require('redis');
const request = require('supertest');

// Mock external dependencies
const mockMongoClient = {
  connect: sinon.stub().resolves(),
  db: sinon.stub().returns({
    collection: sinon.stub().returns({
      createIndex: sinon.stub().resolves(),
      insertOne: sinon.stub().resolves(),
      find: sinon.stub().returns({
        sort: sinon.stub().returns({
          limit: sinon.stub().returns({
            toArray: sinon.stub().resolves([])
          })
        })
      }),
      aggregate: sinon.stub().returns({
        toArray: sinon.stub().resolves([])
      })
    })
  }),
  close: sinon.stub().resolves()
};

const mockRedisClient = {
  connect: sinon.stub().resolves(),
  setEx: sinon.stub().resolves(),
  get: sinon.stub().resolves(),
  quit: sinon.stub().resolves()
};

describe('AI Security Monitoring Service', () => {
  let app;
  let server;
  let mongoStub;
  let redisStub;

  before(async () => {
    // Mock MongoDB and Redis
    mongoStub = sinon.stub(MongoClient.prototype, 'constructor').returns(mockMongoClient);
    redisStub = sinon.stub(redis, 'createClient').returns(mockRedisClient);

    // Import the service after mocking
    const service = require('./index.js');
    app = service.app;
    server = service.server;
  });

  after(() => {
    mongoStub.restore();
    redisStub.restore();
    if (server) server.close();
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('healthy');
      expect(response.body.service).to.equal('ai-security-monitoring');
      expect(response.body.version).to.equal('2.0.0');
    });

    it('should return API health status', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).to.equal(200);
      expect(response.body.status).to.equal('online');
    });
  });

  describe('Analysis Submission', () => {
    it('should accept analysis job submission', async () => {
      const analysisData = {
        source_id: 'camera-001',
        media_url: 'http://example.com/frame.jpg',
        location: { lat: 40.7128, lng: -74.0060 },
        analysis_config: { detect_faces: true, detect_objects: true }
      };

      const response = await request(app)
        .post('/v1/analyze/submit')
        .send(analysisData);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('job_id');
      expect(response.body.status).to.equal('QUEUED');
      expect(response.body).to.have.property('estimated_cost_azr');
    });

    it('should handle analysis job status queries', async () => {
      // First submit a job
      const submitResponse = await request(app)
        .post('/v1/analyze/submit')
        .send({ source_id: 'test-camera' });

      const jobId = submitResponse.body.job_id;

      // Then check status
      const statusResponse = await request(app).get(`/v1/analyze/job/${jobId}`);
      expect(statusResponse.status).to.equal(200);
      expect(statusResponse.body).to.have.property('status');
    });
  });

  describe('Camera Management', () => {
    it('should register cameras', async () => {
      const cameraData = {
        cameraId: 'cam-001',
        location: { lat: 40.7128, lng: -74.0060, description: 'Main Entrance' },
        config: { resolution: '1080p', fps: 30, nightVision: true }
      };

      const response = await request(app)
        .post('/api/camera/register')
        .send(cameraData);

      expect(response.status).to.equal(200);
      expect(response.body.message).to.equal('Camera registered successfully');
    });

    it('should list active cameras', async () => {
      const response = await request(app).get('/api/camera/active');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('cameras');
      expect(Array.isArray(response.body.cameras)).to.be.true;
    });

    it('should retrieve camera analysis history', async () => {
      const response = await request(app).get('/api/camera/cam-001/analysis');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('analyses');
      expect(Array.isArray(response.body.analyses)).to.be.true;
    });
  });

  describe('Threat Analytics', () => {
    it('should provide threat analytics', async () => {
      const response = await request(app).get('/api/analytics/threats?timeframe=24h');
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('analytics');
      expect(response.body).to.have.property('timeframe');
    });

    it('should handle different timeframes', async () => {
      const timeframes = ['1h', '24h', '7d', '1w'];

      for (const timeframe of timeframes) {
        const response = await request(app).get(`/api/analytics/threats?timeframe=${timeframe}`);
        expect(response.status).to.equal(200);
      }
    });
  });

  describe('Computer Vision Analysis', () => {
    it('should handle file uploads for analysis', async () => {
      const mockFile = Buffer.from('mock image data');
      const formData = {
        media: {
          buffer: mockFile,
          mimetype: 'image/jpeg',
          originalname: 'test.jpg'
        },
        cameraId: 'upload-test',
        location: JSON.stringify({ lat: 40.7128, lng: -74.0060 })
      };

      // Mock multer upload
      const multerStub = sinon.stub();
      multerStub.returns((req, res, next) => {
        req.file = formData.media;
        req.body = {
          cameraId: formData.cameraId,
          location: formData.location
        };
        next();
      });

      const response = await request(app)
        .post('/v1/analyze/upload')
        .attach('media', mockFile, 'test.jpg')
        .field('cameraId', 'upload-test')
        .field('location', JSON.stringify({ lat: 40.7128, lng: -74.0060 }));

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('jobId');
      expect(response.body.status).to.equal('QUEUED');
    });

    it('should reject invalid file types', async () => {
      const invalidFile = Buffer.from('invalid file content');
      const response = await request(app)
        .post('/v1/analyze/upload')
        .attach('media', invalidFile, 'test.txt')
        .field('cameraId', 'test');

      expect(response.status).to.equal(400);
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
        .post('/v1/analyze/submit')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).to.equal(400);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/v1/analyze/upload')
        .send({}); // Missing media file

      expect(response.status).to.equal(400);
    });
  });

  describe('WebSocket Integration', () => {
    it('should handle WebSocket connections', (done) => {
      const io = require('socket.io-client');
      const socket = io(`http://localhost:${server.address().port}`);

      socket.on('connect', () => {
        socket.emit('join-camera', 'test-camera');
        socket.disconnect();
        done();
      });

      socket.on('connect_error', (error) => {
        done(error);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should integrate with event bus for threat publishing', async () => {
      // Mock axios for event bus communication
      const axiosStub = sinon.stub(axios, 'post').resolves({ status: 200 });

      const analysisData = {
        source_id: 'integration-test',
        media_url: null // Will trigger mock frame generation
      };

      await request(app)
        .post('/v1/analyze/submit')
        .send(analysisData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify event bus was called
      expect(axiosStub.called).to.be.true;
      axiosStub.restore();
    });

    it('should store analysis results in database', async () => {
      const analysisData = {
        source_id: 'db-test'
      };

      await request(app)
        .post('/v1/analyze/submit')
        .send(analysisData);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify database insertion was called
      expect(mockMongoClient.db().collection().insertOne.called).to.be.true;
    });

    it('should cache analysis results in Redis', async () => {
      const analysisData = {
        source_id: 'cache-test'
      };

      await request(app)
        .post('/v1/analyze/submit')
        .send(analysisData);

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify Redis caching was called
      expect(mockRedisClient.setEx.called).to.be.true;
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent analysis requests', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/v1/analyze/submit')
            .send({ source_id: `perf-test-${i}` })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('QUEUED');
      });
    });

    it('should handle large file uploads', async () => {
      // Create a large mock file (10MB)
      const largeFile = Buffer.alloc(10 * 1024 * 1024, 'x');

      const response = await request(app)
        .post('/v1/analyze/upload')
        .attach('media', largeFile, 'large.jpg')
        .field('cameraId', 'large-file-test');

      expect(response.status).to.equal(200);
    });
  });

  describe('Security Tests', () => {
    it('should enforce rate limiting', async () => {
      // Make many requests quickly
      const promises = [];
      for (let i = 0; i < 150; i++) {
        promises.push(
          request(app).get('/api/health')
        );
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

    it('should handle malformed file uploads securely', async () => {
      const maliciousContent = Buffer.from('<script>alert("xss")</script>');
      const response = await request(app)
        .post('/v1/analyze/upload')
        .attach('media', maliciousContent, 'malicious.html')
        .field('cameraId', 'security-test');

      expect(response.status).to.equal(400);
    });
  });
});