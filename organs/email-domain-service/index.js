/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Port should be managed by orchestrator
const SERVICE_NAME = 'email-domain-service';

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

// Add service-specific routes below this line

app.listen(PORT, () => {
  console.log();
});

// --- Existing code from original file ---

const express = require('express');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const cors = require('cors');
const i18next = require('i18next');
const { SMTPServer } = require('smtp-server');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4089;
const SMTP_PORT = process.env.SMTP_PORT || 25;
const DATA_DIR = path.join(__dirname, 'data');
const DOMAINS_FILE = path.join(DATA_DIR, 'domains.json');
const EMAILS_DIR = path.join(DATA_DIR, 'emails');
const MAILBOXES_DIR = path.join(DATA_DIR, 'mailboxes');
const COMPLIANCE_URL = process.env.COMPLIANCE_SERVICE_URL || 'http://localhost:4081';

// Create necessary directories
(async () => {
  await fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(EMAILS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(MAILBOXES_DIR, { recursive: true }).catch(console.error);
})();

// Domain and email data storage
let domains = [];
const activeSessions = new Map();

// Initialize i18next for multi-language support
i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: {
      translation: {
        welcome: 'Welcome to Azora Mail!',
        email_created: 'Your email account has been created.',
        login_success: 'You have successfully logged in.',
        invalid_credentials: 'Invalid email or password.',
        email_sent: 'Email sent successfully.',
        email_error: 'Failed to send email.',
        domain_registered: 'Domain registered successfully.',
        domain_error: 'Failed to register domain.',
      }
    },
    // Additional languages would be loaded here
  }
});

// Load language files
async function loadLanguages() {
  try {
    const languageDir = path.join(__dirname, 'translations');
    const files = await fs.readdir(languageDir);
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const lang = file.split('.')[0];
        const content = await fs.readFile(path.join(languageDir, file), 'utf8');
        i18next.addResourceBundle(lang, 'translation', JSON.parse(content));
        console.log(`Loaded language: ${lang}`);
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error loading languages:', err);
    }
  }
}

// Load domain data
async function loadDomains() {
  try {
    const data = await fs.readFile(DOMAINS_FILE, 'utf8');
    domains = JSON.parse(data);
    console.log(`Loaded ${domains.length} domains`);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Error loading domains:', err);
    }
    
    // Initialize with default domain
    domains = [{
      id: uuidv4(),
      name: 'azora.world',
      registeredDate: new Date().toISOString(),
      active: true,
      dnsRecords: [
        { type: 'A', name: '@', value: '192.168.1.1', ttl: 3600 },
        { type: 'MX', name: '@', value: 'mail.azora.world', priority: 10, ttl: 3600 },
        { type: 'TXT', name: '@', value: 'v=spf1 include:_spf.azora.world ~all', ttl: 3600 },
        { type: 'TXT', name: '_dmarc', value: 'v=DMARC1; p=reject; rua=mailto:dmarc@azora.world', ttl: 3600 },
        { type: 'TXT', name: 'dkim._domainkey', value: 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9...', ttl: 3600 }
      ],
      owner: 'system'
    }];
    
    // Save default domain
    await saveDomains();
  }
}

// Persist domains to disk
async function saveDomains() {
  try {
    await fs.writeFile(DOMAINS_FILE, JSON.stringify(domains, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving domains:', err);
    throw err;
  }
}

// Domain API endpoints
app.get('/api/domains', (_req, res) => {
  res.json({ domains });
});

app.get('/api/domains/:id', (req, res) => {
  const domain = domains.find(d => d.id === req.params.id);
  if (!domain) return res.status(404).json({ error: 'Domain not found' });
  res.json(domain);
});

app.post('/api/domains', async (req, res) => {
  try {
    const { name, owner, dnsRecords = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'Domain name is required' });

    if (domains.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ error: 'Domain already exists' });
    }

    const domain = {
      id: uuidv4(),
      name,
      registeredDate: new Date().toISOString(),
      active: true,
      dnsRecords,
      owner: owner || 'unknown'
    };

    domains.push(domain);
    await saveDomains();

    res.status(201).json(domain);
  } catch (err) {
    console.error('Error creating domain:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = domains.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Domain not found' });

    const allowed = ['name', 'active', 'dnsRecords', 'owner'];
    for (const key of Object.keys(req.body)) {
      if (allowed.includes(key)) domains[idx][key] = req.body[key];
    }
    domains[idx].updatedAt = new Date().toISOString();

    await saveDomains();
    res.json(domains[idx]);
  } catch (err) {
    console.error('Error updating domain:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const idx = domains.findIndex(d => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Domain not found' });

    // Soft-delete: mark inactive
    domains[idx].active = false;
    domains[idx].deletedAt = new Date().toISOString();

    await saveDomains();
    res.json({ success: true, domain: domains[idx] });
  } catch (err) {
    console.error('Error deleting domain:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create mailbox
async function createMailbox(email, password) {
  const [username, domain] = email.split('@');
  
  // Check if domain exists
  if (!domains.some(d => d.name === domain && d.active)) {
    throw new Error('domain_not_active');
  }
  
  const mailboxDir = path.join(MAILBOXES_DIR, email);
  
  try {
    // Check if mailbox already exists
    try {
      await fs.access(mailboxDir);
      throw new Error('mailbox_exists');
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    
    // Create mailbox directory
    await fs.mkdir(mailboxDir, { recursive: true });
    
    // Create mailbox data
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    
    const mailboxData = {
      email,
      username,
      domain,
      created: new Date().toISOString(),
      lastLogin: null,
      salt,
      passwordHash,
      settings: {
        signature: '',
        forwardTo: '',
        autoReply: false,
        autoReplyMessage: '',
        language: 'en',
        timezone: 'UTC'
      }
    };
    
    // Save mailbox data
    await fs.writeFile(
      path.join(mailboxDir, 'mailbox.json'),
      JSON.stringify(mailboxData, null, 2)
    );
    
    // Create mail folders
    const folders = ['Inbox', 'Sent', 'Drafts', 'Trash', 'Spam'];
    for (const folder of folders) {
      await fs.mkdir(path.join(mailboxDir, folder), { recursive: true });
    }
    
    // Log to compliance service
    try {
      await fetch(`${COMPLIANCE_URL}/api/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'email',
          action: 'mailbox.created',
          email,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Failed to log to compliance service:', err);
    }
    
    return { success: true, email };
  } catch (err) {
    console.error(`Error creating mailbox for ${email}:`, err);
    throw err;
  }
}

// Add DKIM signing to outbound emails
function addDKIMSignature(email, domain) {
  // In production, this would add actual DKIM signatures
  // For now, we'll simulate it
  const dkimHeader = 'DKIM-Signature: v=1; a=rsa-sha256; d=azora.world; s=default; c=relaxed/relaxed; q=dns/txt; t=1623456789; h=from:subject:to; bh=...;';
  return `${dkimHeader}\r\n${email}`;
}

// Create SMTP server for incoming mail
function setupSMTPServer() {
  const smtpServer = new SMTPServer({
    secure: false,
    authOptional: false,
    size: 25 * 1024 * 1024, // 25 MB max size
    
    onAuth: async (auth, session, callback) => {
      try {
        const [username, domain] = auth.username.split('@');
        const email = auth.username;
        const mailboxPath = path.join(MAILBOXES_DIR, email, 'mailbox.json');
        
        try {
          const data = await fs.readFile(mailboxPath, 'utf8');
          const mailbox = JSON.parse(data);
          
          // Verify password
          const hash = crypto.pbkdf2Sync(auth.password, mailbox.salt, 1000, 64, 'sha512').toString('hex');
          if (hash !== mailbox.passwordHash) {
            return callback(new Error('Invalid username or password'));
          }
          
          // Update last login
          mailbox.lastLogin = new Date().toISOString();
          await fs.writeFile(mailboxPath, JSON.stringify(mailbox, null, 2));
          
          callback(null, { user: email });
        } catch (err) {
          return callback(new Error('Invalid username or password'));
        }
      } catch (err) {
        console.error('SMTP auth error:', err);
        return callback(new Error('Server error'));
      }
    },
    
    onData: async (stream, session, callback) => {
      try {
        const chunks = [];
        
        stream.on('data', chunk => chunks.push(chunk));
        
        stream.on('end', async () => {
          try {
            const message = Buffer.concat(chunks).toString();
            
            // Parse message (in production would use proper email parsing library)
            const recipientMatch = message.match(/^To:.*?<(.*?)>/mi);
            if (!recipientMatch) {
              return callback(new Error('Invalid recipient'));
            }
            
            const recipient = recipientMatch[1].trim();
            const [username, domain] = recipient.split('@');
            
            // Check if domain is managed by us
            if (!domains.some(d => d.name === domain)) {
              return callback(new Error('Domain not managed by this server'));
            }
            
            // Check if mailbox exists
            const mailboxPath = path.join(MAILBOXES_DIR, recipient);
            try {
              await fs.access(mailboxPath);
            } catch (err) {
              return callback(new Error('Mailbox does not exist'));
            }
            
            // Store message
            const messageId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.eml`;
            await fs.writeFile(path.join(mailboxPath, 'Inbox', messageId), message);
            
            callback(null, `Message delivered to ${recipient}`);
            
            // Log to compliance service
            try {
              await fetch(`${COMPLIANCE_URL}/api/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  service: 'email',
                  action: 'email.received',
                  recipient,
                  messageId,
                  timestamp: new Date().toISOString()
                })
              });
            } catch (err) {
              console.error('Failed to log to compliance service:', err);
            }
          } catch (err) {
            console.error('Error processing incoming message:', err);
            callback(new Error('Failed to process message'));
          }
        });
    }
  });
  
  smtpServer.on('error', err => {
    console.error('SMTP server error:', err);
  });
  
  smtpServer.listen(SMTP_PORT, () => {
    console.log(`SMTP server listening on port ${SMTP_PORT}`);
  });
}

// API to create domain
app.post('/api/domains', async (req, res) => {
  const { domainName } = req.body;
  
  if (!domainName) {
    return res.status(400).json({ error: 'Domain name is required' });
  }
  
  try {
    // Check if domain already exists
    if (domains.some(d => d.name === domainName)) {
      return res.status(400).json({ error: 'Domain already exists' });
    }
    
    // Add new domain
    const newDomain = {
      id: uuidv4(),
      name: domainName,
      registeredDate: new Date().toISOString(),
      active: true,
      dnsRecords: [],
      owner: 'system'
    };
    
    domains.push(newDomain);
    await saveDomains();
    
    res.status(201).json({ success: true, domain: newDomain });
  } catch (err) {
    console.error('Error registering domain:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to list domains
app.get('/api/domains', (req, res) => {
  res.json(domains);
});

// API to create email account
app.post('/api/emails', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const result = await createMailbox(email, password);
    res.status(201).json(result);
  } catch (err) {
    if (err.message === 'domain_not_active') {
      return res.status(400).json({ error: 'Domain is not active' });
    } else if (err.message === 'mailbox_exists') {
      return res.status(400).json({ error: 'Mailbox already exists' });
    }
    
    console.error('Error creating email account:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    const emailLower = email.toLowerCase();
    const domain = emailLower.split('@')[1];
    
    // Check if domain exists and is active
    const domainData = domains.find(d => d.name === domain && d.active);
    if (!domainData) {
      return res.status(400).json({ error: 'Domain is not active' });
    }
    
    const mailboxPath = path.join(MAILBOXES_DIR, emailLower, 'mailbox.json');
    try {
      const data = await fs.readFile(mailboxPath, 'utf8');
      const mailbox = JSON.parse(data);
      
      // Verify password
      const hash = crypto.pbkdf2Sync(password, mailbox.salt, 1000, 64, 'sha512').toString('hex');
      if (hash !== mailbox.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Create session
      const sessionId = uuidv4();
      activeSessions.set(sessionId, emailLower);
      
      res.json({ success: true, sessionId });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to logout
app.post('/api/logout', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  activeSessions.delete(sessionId);
  res.json({ success: true });
});

// API to send email
app.post('/api/emails/send', async (req, res) => {
  const { to, subject, text, sessionId } = req.body;
  
  if (!to || !subject || !text || !sessionId) {
    return res.status(400).json({ error: 'To, subject, text and sessionId are required' });
  }
  
  try {
    const from = activeSessions.get(sessionId);
    if (!from) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    // For now, just log the email sending
    console.log(`Sending email from ${from} to ${to} with subject "${subject}"`);
    
    // In production, here you would send the email using SMTP or any email service API
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get mailbox statistics
app.get('/api/stats', async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const email = activeSessions.get(sessionId);
  const mailboxPath = path.join(MAILBOXES_DIR, email, 'mailbox.json');
  
  try {
    const data = await fs.readFile(mailboxPath, 'utf8');
    const mailbox = JSON.parse(data);
    
    // For now, just return some dummy stats
    res.json({
      success: true,
      stats: {
        totalEmails: 100,
        unreadEmails: 10,
        sentEmails: 50,
        spamEmails: 5
      }
    });
  } catch (err) {
    console.error('Error fetching mailbox stats:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get email content (for webmail or client access)
app.get('/api/emails/:id', async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.query;
  
  if (!id || !sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const email = activeSessions.get(sessionId);
  const emailPath = path.join(MAILBOXES_DIR, email, 'Inbox', id);
  
  try {
    const data = await fs.readFile(emailPath, 'utf8');
    res.set('Content-Type', 'message/rfc822');
    res.send(data);
  } catch (err) {
    console.error('Error fetching email content:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to delete email (move to trash)
app.delete('/api/emails/:id', async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.query;
  
  if (!id || !sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const email = activeSessions.get(sessionId);
  const emailPath = path.join(MAILBOXES_DIR, email, 'Inbox', id);
  const trashPath = path.join(MAILBOXES_DIR, email, 'Trash', id);
  
  try {
    // Move email to trash
    await fs.rename(emailPath, trashPath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to restore email from trash
app.post('/api/emails/restore', async (req, res) => {
  const { id } = req.body;
  const { sessionId } = req.query;
  
  if (!id || !sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const email = activeSessions.get(sessionId);
  const trashPath = path.join(MAILBOXES_DIR, email, 'Trash', id);
  const inboxPath = path.join(MAILBOXES_DIR, email, 'Inbox', id);
  
  try {
    // Restore email from trash
    await fs.rename(trashPath, inboxPath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error restoring email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to permanently delete email
app.delete('/api/emails/permanent/:id', async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.query;
  
  if (!id || !sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  
  const email = activeSessions.get(sessionId);
  const permanentPath = path.join(MAILBOXES_DIR, email, 'Trash', id);
  
  try {
    // Permanently delete email
    await fs.unlink(permanentPath);
    res.json({ success: true });
  } catch (err) {
    console.error('Error permanently deleting email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to get user settings
app.get('/api/settings', async (req, res) => {
  const { sessionId } = req.query;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const email = activeSessions.get(sessionId);
  const mailboxPath = path.join(MAILBOXES_DIR, email, 'mailbox.json');
  
  try {
    const data = await fs.readFile(mailboxPath, 'utf8');
    const mailbox = JSON.parse(data);
    
    res.json({
      success: true,
      settings: mailbox.settings
    });
  } catch (err) {
    console.error('Error fetching user settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to update user settings
app.post('/api/settings', async (req, res) => {
  const { sessionId, settings } = req.body;
  
  if (!sessionId || !activeSessions.has(sessionId)) {
    return res.status(400).json({ error: 'Invalid session' });
  }
  
  const email = activeSessions.get(sessionId);
  const mailboxPath = path.join(MAILBOXES_DIR, email, 'mailbox.json');
  
  try {
    const data = await fs.readFile(mailboxPath, 'utf8');
    const mailbox = JSON.parse(data);
    
    // Update settings
    mailbox.settings = { ...mailbox.settings, ...settings };
    
    await fs.writeFile(mailboxPath, JSON.stringify(mailbox, null, 2));
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating user settings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API to test compliance logging
app.post('/api/test-log', async (req, res) => {
  const { service, action, email } = req.body;
  
  try {
    const response = await fetch(`${COMPLIANCE_URL}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service,
        action,
        email,
        timestamp: new Date().toISOString()
      })
    });
    
    const result = await response.json();
    res.json(result);
  } catch (err) {
    console.error('Error testing compliance log:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize runtime (load languages and domains) and start server
(async () => {
  try {
    await loadLanguages();
  } catch (err) {
    console.warn('loadLanguages failed (continuing):', err);
  }

  try {
    await loadDomains();
  } catch (err) {
    console.warn('loadDomains failed (continuing):', err);
  }

  app.listen(PORT, () => {
    console.log(`Email & Domain service running on port ${PORT}`);
    console.log(`SMTP port configured as ${SMTP_PORT}`);
  });
})();
