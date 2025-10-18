/**
 * Azora Email Service
 * Enterprise-grade email service for azo.raworld domain
 */
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const { promisify } = require('util');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4093;
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
(async () => {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
})();

// DNS lookup promisified
const dnsLookup = promisify(dns.lookup);
const dnsResolveMx = promisify(dns.resolveMx);
const dnsResolveTxt = promisify(dns.resolveTxt);

// Email database simulation (would use a real database in production)
let emailAccounts = new Map();

// Load existing accounts from disk
async function loadAccounts() {
  try {
    const filePath = path.join(DATA_DIR, 'email-accounts.json');
    const data = await fs.readFile(filePath, 'utf8');
    const accounts = JSON.parse(data);
    
    accounts.forEach(account => {
      emailAccounts.set(account.email, account);
    });
    
    console.log(`Loaded ${emailAccounts.size} email accounts`);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error loading email accounts:', error);
    }
  }
}

// Save accounts to disk
async function saveAccounts() {
  try {
    const filePath = path.join(DATA_DIR, 'email-accounts.json');
    const accounts = Array.from(emailAccounts.values());
    await fs.writeFile(filePath, JSON.stringify(accounts, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving email accounts:', error);
  }
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Generate email account hash
function generateEmailHash(email) {
  return crypto
    .createHash('sha256')
    .update(email + Date.now().toString())
    .digest('hex');
}

// Check DNS configuration
async function checkDnsConfiguration(domain) {
  try {
    // Check A record
    const addressInfo = await dnsLookup(domain);
    
    // Check MX records
    const mxRecords = await dnsResolveMx(domain);
    
    // Check SPF and DKIM records
    const txtRecords = await dnsResolveTxt(domain);
    const spfRecord = txtRecords.find(record => record[0].startsWith('v=spf1'));
    const dkimRecord = txtRecords.find(record => record[0].includes('v=DKIM1'));
    
    return {
      configured: true,
      ip: addressInfo.address,
      mxRecords: mxRecords,
      spfConfigured: Boolean(spfRecord),
      dkimConfigured: Boolean(dkimRecord)
    };
  } catch (error) {
    console.error(`DNS check failed for ${domain}:`, error);
    return {
      configured: false,
      error: error.message
    };
  }
}

// API endpoints
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'email-service' });
});

// Check domain availability
app.get('/api/email/domain/check/:domain', async (req, res) => {
  const { domain } = req.params;
  
  if (!domain || domain.length < 3) {
    return res.status(400).json({ error: 'invalid_domain' });
  }
  
  try {
    // Try to resolve the domain
    await dnsLookup(domain);
    
    // Domain exists
    res.json({
      domain,
      available: false,
      message: `Domain ${domain} is already registered`
    });
  } catch (error) {
    // If error is ENOTFOUND, domain might be available
    if (error.code === 'ENOTFOUND') {
      res.json({
        domain,
        available: true,
        message: `Domain ${domain} appears to be available`
      });
    } else {
      res.status(500).json({
        error: 'domain_check_failed',
        message: error.message
      });
    }
  }
});

// Check email configuration for a domain
app.get('/api/email/domain/configuration/:domain', async (req, res) => {
  const { domain } = req.params;
  
  if (!domain || domain.length < 3) {
    return res.status(400).json({ error: 'invalid_domain' });
  }
  
  try {
    const configuration = await checkDnsConfiguration(domain);
    res.json({
      domain,
      configuration
    });
  } catch (error) {
    res.status(500).json({
      error: 'configuration_check_failed',
      message: error.message
    });
  }
});

// Create a new email account
app.post('/api/email/accounts', async (req, res) => {
  const { email, password, fullName, allowForwarding } = req.body;
  
  if (!email || !password || !fullName) {
    return res.status(400).json({ 
      error: 'missing_required_fields',
      message: 'Email, password and fullName are required'
    });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'invalid_email_format',
      message: 'Email address is not valid'
    });
  }
  
  if (emailAccounts.has(email)) {
    return res.status(409).json({ 
      error: 'email_exists',
      message: 'This email address is already in use'
    });
  }
  
  // Hash the password (in production would use a proper password hashing library)
  const passwordHash = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');
  
  // Create account
  const account = {
    email,
    passwordHash,
    fullName,
    accountHash: generateEmailHash(email),
    allowForwarding: Boolean(allowForwarding),
    createdAt: new Date().toISOString(),
    status: 'active'
  };
  
  // Save account
  emailAccounts.set(email, account);
  await saveAccounts();
  
  res.status(201).json({
    email,
    fullName,
    accountHash: account.accountHash,
    createdAt: account.createdAt,
    status: account.status
  });
});

// Get account information
app.get('/api/email/accounts/:email', async (req, res) => {
  const { email } = req.params;
  
  if (!emailAccounts.has(email)) {
    return res.status(404).json({ 
      error: 'account_not_found',
      message: 'Email account not found'
    });
  }
  
  const account = emailAccounts.get(email);
  
  res.json({
    email: account.email,
    fullName: account.fullName,
    accountHash: account.accountHash,
    createdAt: account.createdAt,
    status: account.status,
    allowForwarding: account.allowForwarding
  });
});

// Update account settings
app.put('/api/email/accounts/:email', async (req, res) => {
  const { email } = req.params;
  const { fullName, newPassword, allowForwarding, status } = req.body;
  
  if (!emailAccounts.has(email)) {
    return res.status(404).json({ 
      error: 'account_not_found',
      message: 'Email account not found'
    });
  }
  
  const account = emailAccounts.get(email);
  
  // Update fields
  if (fullName) account.fullName = fullName;
  if (allowForwarding !== undefined) account.allowForwarding = Boolean(allowForwarding);
  if (status && ['active', 'suspended', 'disabled'].includes(status)) {
    account.status = status;
  }
  
  // Update password if provided
  if (newPassword) {
    account.passwordHash = crypto
      .createHash('sha256')
      .update(newPassword)
      .digest('hex');
  }
  
  // Save changes
  emailAccounts.set(email, account);
  await saveAccounts();
  
  res.json({
    email: account.email,
    fullName: account.fullName,
    accountHash: account.accountHash,
    status: account.status,
    updatedAt: new Date().toISOString()
  });
});

// Generate DNS configuration guide
app.get('/api/email/domain/guide/:domain', (req, res) => {
  const { domain } = req.params;
  
  if (!domain || domain.length < 3) {
    return res.status(400).json({ error: 'invalid_domain' });
  }
  
  const guide = {
    domain,
    mx: [
      { priority: 10, exchange: `mail.${domain}` },
      { priority: 20, exchange: `backup-mail.${domain}` }
    ],
    a: [
      { name: `mail.${domain}`, address: '1.2.3.4' },
      { name: `backup-mail.${domain}`, address: '5.6.7.8' }
    ],
    txt: [
      { name: domain, record: `v=spf1 mx a:mail.${domain} a:backup-mail.${domain} ~all` },
      { name: `dkim._domainkey.${domain}`, record: 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...' }
    ],
    dmarc: [
      { name: `_dmarc.${domain}`, record: `v=DMARC1; p=none; rua=mailto:dmarc-reports@${domain}` }
    ],
    steps: [
      "Log in to your domain registrar's DNS management console",
      "Add the MX records with the priorities shown above",
      "Add the A records for your mail servers",
      "Add the TXT records for SPF authentication",
      "Add the DKIM record for email signing",
      "Add the DMARC record for reporting and policy"
    ],
    notes: "After making DNS changes, it may take up to 48 hours for them to propagate globally."
  };
  
  res.json({
    guide,
    timestamp: new Date().toISOString()
  });
});

// Server startup
loadAccounts().then(() => {
  app.listen(PORT, () => console.log(`Email service listening on port ${PORT}`));
});