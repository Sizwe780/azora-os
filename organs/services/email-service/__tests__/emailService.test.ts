import request from 'supertest';
import { EmailService } from '../src/emailService';

describe('EmailService', () => {
  let emailService: EmailService;
  let server: any;

  beforeAll(async () => {
    emailService = new EmailService();
    server = emailService.getApp();
  });

  afterAll(async () => {
    await emailService.close();
  });

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(server).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.service).toBe('email-service');
      expect(response.body.version).toBe('2.0.0');
    });
  });

  describe('POST /api/email/send', () => {
    it('should require to and subject fields', async () => {
      const response = await request(server)
        .post('/api/email/send')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should accept valid email request', async () => {
      const response = await request(server)
        .post('/api/email/send')
        .send({
          to: 'test@example.com',
          subject: 'Test Email',
          text: 'This is a test email'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.emailId).toBeDefined();
    });
  });

  describe('GET /api/email/templates', () => {
    it('should return email templates', async () => {
      const response = await request(server).get('/api/email/templates');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('POST /api/email/templates', () => {
    it('should create email template', async () => {
      const templateData = {
        name: 'Welcome Email',
        subject: 'Welcome to Azora OS',
        htmlContent: '<h1>Welcome {{name}}!</h1>',
        textContent: 'Welcome {{name}}!',
        variables: ['name']
      };

      const response = await request(server)
        .post('/api/email/templates')
        .send(templateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(templateData.name);
      expect(response.body.subject).toBe(templateData.subject);
    });
  });
});