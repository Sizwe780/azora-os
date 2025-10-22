/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Router } from 'express';
import { EmailService } from './emailService';

export function createEmailRoutes(emailService: EmailService): Router {
  const router = Router();

  // Send email endpoint
  router.post('/send', async (req, res) => {
    try {
      const { to, subject, text, html, templateId, variables } = req.body;

      if (!to || !subject) {
        return res.status(400).json({ error: 'Missing required fields: to, subject' });
      }

      let content = text || html;
      let finalSubject = subject;

      // If template is specified, load and process it
      if (templateId) {
        const template = await emailService.getTemplate(templateId);
        if (!template) {
          return res.status(404).json({ error: 'Email template not found' });
        }

        finalSubject = emailService.processTemplate(template.subject, variables || {});
        content = emailService.processTemplate(template.htmlContent, variables || {});
      }

      // Queue the email for sending
      const emailId = await emailService.queueEmail(to, finalSubject, content || '', req.body.priority || 1);

      res.json({
        success: true,
        emailId,
        message: 'Email queued for sending'
      });

    } catch (error) {
      res.status(500).json({ error: 'Failed to queue email' });
    }
  });

  // Get email templates
  router.get('/templates', async (req, res) => {
    try {
      const templates = await emailService.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Create email template
  router.post('/templates', async (req, res) => {
    try {
      const template = await emailService.createTemplate(req.body);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  return router;
}