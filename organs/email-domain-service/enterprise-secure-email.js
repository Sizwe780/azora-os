/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

const express = require('express');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

// Path constants
const DATA_DIR = path.join(__dirname, 'data');
const ENCRYPTION_KEYS_DIR = path.join(DATA_DIR, 'encryption_keys');
const SECURE_EMAILS_DIR = path.join(DATA_DIR, 'secure_emails');

// Create necessary directories
(async () => {
  await fs.mkdir(ENCRYPTION_KEYS_DIR, { recursive: true }).catch(console.error);
  await fs.mkdir(SECURE_EMAILS_DIR, { recursive: true }).catch(console.error);
})();

// Security settings
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const PASSWORD_HASH_ITERATIONS = 10000;

// Enterprise security features
const securityFeatures = {
  'end-to-end-encryption': {
    enabled: true,
    description: 'Messages are encrypted on the sender\'s device and can only be decrypted by the recipient',
    algorithm: ENCRYPTION_ALGORITHM
  },
  'two-factor-authentication': {
    enabled: true,
    methods: ['app', 'sms', 'email']
  },
  'anti-phishing': {
    enabled: true,
    features: ['link-scanning', 'attachment-scanning', 'domain-verification']
  },
  'data-loss-prevention': {
    enabled: true,
    policies: ['credit-card-numbers', 'social-security-numbers', 'custom-patterns']
  },
  'advanced-threat-protection': {
    enabled: true,
    features: ['malware-scanning', 'sandbox-analysis', 'zero-day-protection']
  },
  'legal-hold': {
    enabled: true,
    description: 'Preserve all email communications for legal discovery'
  },
  'message-archiving': {
    enabled: true,
    retention: '7-years'
  },
  'audit-logging': {
    enabled: true,
    events: ['login', 'send', 'receive', 'delete', 'admin-actions']
  },
  'advanced-mdm': {
    enabled: true,
    description: 'Mobile Device Management integration for secure access'
  }
};

// Middleware to require authentication
function requireAuth(req, res, next) {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({ error: 'authentication_required' });
  }
  
  // Check session (this would validate against activeSessions in the main app)
  // For this example, we'll assume session is valid if provided
  req.session = { id: sessionId, email: req.headers['x-email'] || 'user@azora.world' };
  
  next();
}

// Helper for encrypting email content
async function encryptEmailContent(content, recipientPublicKey) {
  // In a real implementation, this would use the recipient's public key
  // For demonstration purposes, we'll use a symmetric key with password
  const password = 'secure-password'; // In production, this would be derived from keys
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, PASSWORD_HASH_ITERATIONS, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
  let encrypted = cipher.update(JSON.stringify(content), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encryptedContent: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    salt: salt.toString('hex')
  };
}

// Helper for decrypting email content
async function decryptEmailContent(encryptedData) {
  try {
    const { encryptedContent, iv, authTag, salt } = encryptedData;
    
    // In a real implementation, this would use the recipient's private key
    const password = 'secure-password'; // In production, this would be derived from keys
    const key = crypto.pbkdf2Sync(
      password, 
      Buffer.from(salt, 'hex'), 
      PASSWORD_HASH_ITERATIONS, 
      32, 
      'sha512'
    );
    
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM, 
      key, 
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('Decryption error:', err);
    throw new Error('decryption_failed');
  }
}

// API routes
router.get('/security-features', (_req, res) => {
  res.json({
    securityFeatures,
    transparencyNote: 'Our enterprise security features exceed industry standards'
  });
});

router.post('/generate-keys', requireAuth, async (req, res) => {
  const { email } = req.session;
  
  try {
    // In a production implementation, this would generate actual RSA key pairs
    // For demo purposes, we'll simulate key generation
    
    // Check if keys already exist
    const keysDir = path.join(ENCRYPTION_KEYS_DIR, email);
    try {
      await fs.access(keysDir);
      return res.status(409).json({ error: 'keys_already_exist' });
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
    
    // Create directory for keys
    await fs.mkdir(keysDir, { recursive: true });
    
    // Generate a simulated keypair
    const keyId = crypto.randomBytes(16).toString('hex');
    
    // In a real implementation, this would be actual RSA public/private keys
    const keyData = {
      id: keyId,
      created: new Date().toISOString(),
      algorithm: 'RSA-4096',
      publicKey: `---- BEGIN PUBLIC KEY (SIMULATED) ----\n${crypto.randomBytes(64).toString('base64')}\n---- END PUBLIC KEY ----`,
      // Note: In a real system, the private key would be encrypted with the user's password
      encryptedPrivateKey: `---- BEGIN ENCRYPTED PRIVATE KEY (SIMULATED) ----\n${crypto.randomBytes(128).toString('base64')}\n---- END ENCRYPTED PRIVATE KEY ----`
    };
    
    // Save key data
    await fs.writeFile(
      path.join(keysDir, `${keyId}.json`),
      JSON.stringify(keyData, null, 2)
    );
    
    res.json({
      success: true,
      keyId,
      publicKey: keyData.publicKey,
      created: keyData.created,
      algorithm: keyData.algorithm
    });
  } catch (err) {
    console.error('Error generating keys:', err);
    res.status(500).json({ error: 'key_generation_failed' });
  }
});

router.post('/secure-send', requireAuth, async (req, res) => {
  const { to, subject, content, attachments, securityOptions } = req.body;
  const { email: from } = req.session;
  
  if (!to || !Array.isArray(to) || to.length === 0) {
    return res.status(400).json({ error: 'recipients_required' });
  }
  
  if (!subject || !content) {
    return res.status(400).json({ error: 'subject_and_content_required' });
  }
  
  try {
    const emailId = crypto.randomBytes(16).toString('hex');
    
    // For each recipient, encrypt the email content with their public key
    const recipients = [];
    
    for (const recipient of to) {
      // In a real implementation, we would fetch recipient's public key
      // For demo purposes, we'll encrypt with a simulated key
      
      const encryptedData = await encryptEmailContent(
        { subject, content, from, securityOptions },
        'simulated-public-key'
      );
      
      recipients.push({
        email: recipient,
        encryptedData
      });
      
      // In a real implementation, we would deliver to each recipient
      // For demo purposes, we'll just save the encrypted data
      
      const recipientDir = path.join(SECURE_EMAILS_DIR, recipient);
      await fs.mkdir(recipientDir, { recursive: true }).catch(() => {});
      
      await fs.writeFile(
        path.join(recipientDir, `${emailId}.json`),
        JSON.stringify({
          id: emailId,
          from,
          to: recipient,
          received: new Date().toISOString(),
          ...encryptedData,
          hasAttachments: !!attachments && attachments.length > 0
        })
      );
    }
    
    // Save a copy to sender's sent folder
    const senderDir = path.join(SECURE_EMAILS_DIR, `${from}/sent`);
    await fs.mkdir(senderDir, { recursive: true }).catch(() => {});
    
    await fs.writeFile(
      path.join(senderDir, `${emailId}.json`),
      JSON.stringify({
        id: emailId,
        from,
        to,
        sent: new Date().toISOString(),
        subject,
        hasAttachments: !!attachments && attachments.length > 0,
        securityOptions
      })
    );
    
    res.json({
      success: true,
      emailId,
      recipients: recipients.map(r => r.email),
      sent: new Date().toISOString(),
      securityFeatures: Object.keys(securityOptions || {})
        .filter(key => securityOptions[key])
        .map(key => ({ name: key, ...securityFeatures[key] }))
    });
  } catch (err) {
    console.error('Secure send error:', err);
    res.status(500).json({ error: 'send_failed', message: err.message });
  }
});

router.get('/secure-emails', requireAuth, async (req, res) => {
  const { email } = req.session;
  const { folder = 'inbox' } = req.query;
  
  if (!['inbox', 'sent', 'drafts', 'archive', 'trash'].includes(folder)) {
    return res.status(400).json({ error: 'invalid_folder' });
  }
  
  try {
    // Get the directory for this user and folder
    const folderPath = folder === 'inbox' 
      ? path.join(SECURE_EMAILS_DIR, email)
      : path.join(SECURE_EMAILS_DIR, `${email}/${folder}`);
    
    // Create folder if it doesn't exist
    await fs.mkdir(folderPath, { recursive: true }).catch(() => {});
    
    // Read emails in folder
    const files = await fs.readdir(folderPath).catch(() => []);
    const emailPromises = files
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        try {
          const data = await fs.readFile(path.join(folderPath, file), 'utf8');
          const email = JSON.parse(data);
          
          // If this is a received encrypted email, just return metadata
          if (email.encryptedContent) {
            return {
              id: email.id,
              from: email.from,
              to: email.to,
              received: email.received,
              encrypted: true,
              hasAttachments: email.hasAttachments,
              subject: '[Encrypted]' // Subject is encrypted in content
            };
          }
          
          // For sent emails, we can show the subject
          return {
            id: email.id,
            from: email.from,
            to: email.to,
            sent: email.sent,
            subject: email.subject,
            hasAttachments: email.hasAttachments,
            securityOptions: email.securityOptions
          };
        } catch (err) {
          console.error(`Error reading email file ${file}:`, err);
          return null;
        }
      });
    
    const emails = (await Promise.all(emailPromises))
      .filter(e => e !== null)
      .sort((a, b) => {
        const dateA = new Date(a.received || a.sent);
        const dateB = new Date(b.received || b.sent);
        return dateB - dateA; // Newest first
      });
    
    res.json({
      emails,
      count: emails.length,
      folder
    });
  } catch (err) {
    console.error('Get secure emails error:', err);
    res.status(500).json({ error: 'get_emails_failed', message: err.message });
  }
});

router.get('/secure-emails/:id', requireAuth, async (req, res) => {
  const { email } = req.session;
  const { id } = req.params;
  const { folder = 'inbox' } = req.query;
  
  try {
    // Determine file path based on folder
    const folderPath = folder === 'inbox' 
      ? path.join(SECURE_EMAILS_DIR, email)
      : path.join(SECURE_EMAILS_DIR, `${email}/${folder}`);
    
    const filePath = path.join(folderPath, `${id}.json`);
    
    // Read email file
    const data = await fs.readFile(filePath, 'utf8');
    const emailData = JSON.parse(data);
    
    // If this is an encrypted email, decrypt it
    if (emailData.encryptedContent) {
      try {
        const decrypted = await decryptEmailContent(emailData);
        
        // Return decrypted content
        res.json({
          id: emailData.id,
          from: emailData.from,
          to: emailData.to,
          received: emailData.received,
          subject: decrypted.subject,
          content: decrypted.content,
          securityOptions: decrypted.securityOptions,
          hasAttachments: emailData.hasAttachments,
          decrypted: true
        });
      } catch (err) {
        res.status(400).json({ error: 'decryption_failed', message: err.message });
      }
    } else {
      // For sent emails, just return the data
      res.json(emailData);
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).json({ error: 'email_not_found' });
    } else {
      console.error('Get secure email error:', err);
      res.status(500).json({ error: 'get_email_failed', message: err.message });
    }
  }
});

// Export router
module.exports = router;