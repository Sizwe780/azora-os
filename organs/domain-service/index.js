/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs/promises');
const i18n = require('i18n');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables
const PORT = process.env.PORT || 4096;
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || 'azoraworld.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@azoraworld.com';

// Configure internationalization
i18n.configure({
  locales: ['en', 'fr', 'es', 'zh', 'ar', 'ru', 'pt', 'de', 'ja', 'sw', 'zu', 'xh', 'af'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'en',
  objectNotation: true
});

app.use(i18n.init);

// Configure fake mail transport for development
let mailTransport = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: {
    rejectUnauthorized: false
  }
});

// Initialize domain database
const DOMAIN_DB_PATH = path.join(__dirname, '../../data/domains.json');
const EMAIL_DB_PATH = path.join(__dirname, '../../data/emails.json');
let domains = [];
let emails = [];

async function initDatabase() {
  try {
    await fs.mkdir(path.dirname(DOMAIN_DB_PATH), { recursive: true });
    
    try {
      const domainsData = await fs.readFile(DOMAIN_DB_PATH, 'utf8');
      domains = JSON.parse(domainsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      domains = [];
      await fs.writeFile(DOMAIN_DB_PATH, JSON.stringify(domains, null, 2));
    }
    
    try {
      const emailsData = await fs.readFile(EMAIL_DB_PATH, 'utf8');
      emails = JSON.parse(emailsData);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
      emails = [];
      await fs.writeFile(EMAIL_DB_PATH, JSON.stringify(emails, null, 2));
    }
    
    console.log(`Loaded ${domains.length} domains and ${emails.length} email accounts`);
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// Endpoints for domain management
app.get('/api/domains', async (req, res) => {
  const { limit = 100, offset = 0 } = req.query;
  
  const paginatedDomains = domains.slice(offset, offset + limit);
  
  res.json({
    domains: paginatedDomains,
    total: domains.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

app.post('/api/domains', async (req, res) => {
  const { name, ownerEmail, description } = req.body;
  
  if (!name || !ownerEmail || !isValidDomain(name)) {
    return res.status(400).json({
      error: 'invalid_input',
      message: req.t('errors.invalid_domain')
    });
  }
  
  // Check if domain exists
  if (domains.some(d => d.name === name)) {
    return res.status(409).json({
      error: 'domain_exists',
      message: req.t('errors.domain_exists')
    });
  }
  
  const newDomain = {
    id: uuidv4(),
    name,
    ownerEmail,
    description,
    active: true,
    createdAt: new Date().toISOString(),
    dnsRecords: []
  };
  
  domains.push(newDomain);
  
  // Save to "database"
  await fs.writeFile(DOMAIN_DB_PATH, JSON.stringify(domains, null, 2));
  
  // Send notification email
  try {
    await mailTransport.sendMail({
      from: ADMIN_EMAIL,
      to: ownerEmail,
      subject: req.t('emails.domain_registered.subject'),
      text: req.t('emails.domain_registered.body', { domain: name })
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
  
  res.status(201).json({
    domain: newDomain,
    message: req.t('domains.created_success')
  });
});

// Endpoints for email management
app.get('/api/emails', async (req, res) => {
  const { limit = 100, offset = 0, domain } = req.query;
  
  let filteredEmails = emails;
  if (domain) {
    filteredEmails = emails.filter(e => e.address.endsWith(`@${domain}`));
  }
  
  const paginatedEmails = filteredEmails.slice(offset, offset + limit);
  
  res.json({
    emails: paginatedEmails,
    total: filteredEmails.length,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

app.post('/api/emails', async (req, res) => {
  const { username, password, fullName, language = 'en' } = req.body;
  
  if (!username || !password || !isValidUsername(username)) {
    return res.status(400).json({
      error: 'invalid_input',
      message: req.t('errors.invalid_email_input')
    });
  }
  
  const emailAddress = `${username}@${EMAIL_DOMAIN}`;
  
  // Check if email exists
  if (emails.some(e => e.address === emailAddress)) {
    return res.status(409).json({
      error: 'email_exists',
      message: req.t('errors.email_exists')
    });
  }
  
  const newEmail = {
    id: uuidv4(),
    address: emailAddress,
    fullName,
    passwordHash: 'hash-placeholder', // In production, you'd hash the password
    language,
    active: true,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  
  emails.push(newEmail);
  
  // Save to "database"
  await fs.writeFile(EMAIL_DB_PATH, JSON.stringify(emails, null, 2));
  
  // Send welcome email
  try {
    await mailTransport.sendMail({
      from: ADMIN_EMAIL,
      to: emailAddress,
      subject: req.t('emails.welcome.subject', { locale: language }),
      text: req.t('emails.welcome.body', { name: fullName, email: emailAddress, locale: language })
    });
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
  
  res.status(201).json({
    email: {
      address: newEmail.address,
      fullName: newEmail.fullName,
      language: newEmail.language
    },
    message: req.t('emails.created_success')
  });
});

// Helper functions
function isValidDomain(domain) {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
  return domainRegex.test(domain);
}

function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9._-]{3,30}$/;
  return usernameRegex.test(username);
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'domain-service',
    emailDomain: EMAIL_DOMAIN,
    domains: domains.length,
    emailAccounts: emails.length
  });
});

// Start the server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`Domain service running on port ${PORT}`);
    console.log(`Email domain: ${EMAIL_DOMAIN}`);
  });
}

startServer().catch(console.error);