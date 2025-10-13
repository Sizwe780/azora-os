/**
 * Digital Onboarding Service
 *
 * Complete recruitment and contract management system with e-signatures.
 * Founder-first approach: Founders sign contracts on first login.
 *
 * @author Autonomous Logistics Team
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

const PORT = 4070;

// ============================================================================
// DATA STORES
// ============================================================================

const contracts = new Map(); // contractId -> contract
const onboardings = new Map(); // onboardingId -> onboarding status
const signatures = new Map(); // signatureId -> signature data
const users = new Map(); // userId -> user data with onboarding status

// ============================================================================
// CONTRACT TEMPLATES
// ============================================================================

const FOUNDER_CONTRACT_TEMPLATE = `
FOUNDERS ONBOARDING CONTRACT

This Agreement is entered into between:

AUTONOMOUS LOGISTICS PLATFORM ("Company")
Registration Number: [TBD]
Domain: autonomous-logistics.com
Represented by: Platform Administrator, Founder & CEO

AND

{{FOUNDER_NAME}} ("Founder")
ID Number: {{ID_NUMBER}}
Email: {{EMAIL}}

1. APPOINTMENT

The Company hereby appoints the Founder as {{ROLE_TITLE}} effective from {{START_DATE}}.

2. EQUITY ALLOCATION

The Founder is allocated {{EQUITY_PERCENTAGE}} equity in Autonomous Logistics Platform.

Vesting Schedule:
- Duration: 4 years
- Cliff: 1 year (25% vests after year 1)
- Remaining: Vests monthly over remaining 3 years

If the Founder leaves before the 1-year cliff, NO equity vests.
If the Founder leaves after the cliff, only VESTED equity is retained.

3. FINANCIAL DISCIPLINE

The Founder agrees to the Financial Discipline Rule:
- Reinvest 60% of net earnings
- Reinvest 30% of gross revenue
- Duration: First 5 years

Allocation of reinvested funds:
- 40% Engineering & Compliance
- 30% Sales & Partnerships
- 20% Infrastructure & Operations
- 10% Research & Development

4. DUTIES & RESPONSIBILITIES

The Founder shall:
- Contribute to strategic direction and execution
- Uphold compliance-first principles
- Perform role-specific responsibilities
- Act in the best interests of the Company

Specific Responsibilities for {{ROLE_TITLE}}:
{{ROLE_RESPONSIBILITIES}}

5. INTELLECTUAL PROPERTY

All work created by the Founder in connection with the platform is the EXCLUSIVE property of the Company.

The Founder hereby assigns all rights, title, and interest in such work to Autonomous Logistics Platform.

6. CONFIDENTIALITY

All Company information, code, designs, and discussions are STRICTLY CONFIDENTIAL.

No materials may be shared externally without written approval.

7. GOVERNANCE

- The Board is chaired by the Founder & CEO
- Each Founder has one vote
- The Chairperson holds a casting vote in case of deadlock

8. TERMINATION

- Founder may resign with 30 days' written notice
- Company may terminate for misconduct, breach of confidentiality, or non-performance
- Upon termination, unvested equity is forfeited

9. GOVERNING LAW

This Agreement shall be governed by applicable law.

SIGNED on {{SIGNING_DATE}} at {{SIGNING_LOCATION}}

For the Company:
_____________________________
Platform Administrator
Founder & CEO, Autonomous Logistics Platform

For the Founder:
_____________________________
{{FOUNDER_NAME}}
{{ROLE_TITLE}}
`;

const FINANCIAL_DISCIPLINE_STATEMENT = `
FINANCIAL DISCIPLINE STATEMENT

This Statement forms part of the Founders Onboarding Contract and is binding on all Founders.

PURPOSE
To ensure Azora maintains strict financial discipline, reinvesting resources into growth, compliance, and sustainability.

REINVESTMENT RULE
The Company shall reinvest:
- 60% of net earnings
- 30% of gross revenue
Into growth for the first FIVE (5) years.

This rule is NON-NEGOTIABLE and binding on all Founders.

ALLOCATION
- 40% Engineering & Compliance
- 30% Sales & Partnerships
- 20% Infrastructure & Operations
- 10% Research & Development

FOUNDER COMPENSATION
Founders shall not draw excessive salaries during the first 5 years.
Compensation shall be reasonable and sustainable.
Any deviation requires Board approval with 2/3 majority.

ENFORCEMENT
Breach of this Statement constitutes grounds for removal from the Board and forfeiture of unvested equity.

I, {{FOUNDER_NAME}}, hereby acknowledge and accept this Financial Discipline Statement.

Signed: _____________________________
Date: {{SIGNING_DATE}}
`;

// ============================================================================
// CONTRACT GENERATION
// ============================================================================

function generateContract(type, fields) {
  let template = '';
  
  if (type === 'founder') {
    template = FOUNDER_CONTRACT_TEMPLATE;
  } else if (type === 'financial_discipline') {
    template = FINANCIAL_DISCIPLINE_STATEMENT;
  }
  
  // Replace placeholders
  Object.keys(fields).forEach(key => {
    const placeholder = `{{${key.toUpperCase()}}}`;
    template = template.replace(new RegExp(placeholder, 'g'), fields[key]);
  });
  
  return template;
}

function generateContractPDF(contractText, signatures, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    
    doc.pipe(stream);
    
    // Header
    doc.fontSize(18).text('AUTONOMOUS LOGISTICS PLATFORM', { align: 'center' });
    doc.fontSize(10).text('autonomous-logistics.com | admin@autonomous-logistics.com', { align: 'center' });
    doc.moveDown(2);
    
    // Contract text
    doc.fontSize(11).text(contractText);
    doc.moveDown(2);
    
    // Signatures
    signatures.forEach((sig) => {
      doc.moveDown();
      doc.fontSize(10).text(`Signed by: ${sig.name}`);
      doc.text(`Role: ${sig.role}`);
      doc.text(`Date: ${sig.timestamp}`);
      doc.text(`IP: ${sig.ipAddress}`);
      doc.text(`Location: ${sig.location}`);
      doc.text(`Signature Hash: ${sig.signatureHash}`);
      
      if (sig.signatureImage) {
        // Add signature image
        doc.moveDown();
        doc.image(Buffer.from(sig.signatureImage, 'base64'), {
          width: 200,
          height: 60
        });
      }
      
      doc.moveDown();
    });
    
    // Footer
    doc.moveDown(2);
    doc.fontSize(8).text(
      'This document is legally binding under South African law. ' +
      'Electronic signatures are valid per the ECT Act, 2002.',
      { align: 'center' }
    );
    
    doc.end();
    
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

// ============================================================================
// SIGNATURE HANDLING
// ============================================================================

function createSignature(contractId, signerInfo, signatureImage) {
  const signatureId = crypto.randomBytes(16).toString('hex');
  const signatureHash = crypto
    .createHash('sha256')
    .update(signatureImage)
    .digest('hex');
  
  const signature = {
    id: signatureId,
    contractId,
    name: signerInfo.name,
    email: signerInfo.email,
    role: signerInfo.role,
    signatureImage,
    signatureHash,
    timestamp: new Date().toISOString(),
    ipAddress: signerInfo.ipAddress,
    location: signerInfo.location || 'Johannesburg, South Africa',
    userAgent: signerInfo.userAgent,
    verified: true
  };
  
  signatures.set(signatureId, signature);
  
  return signature;
}

function verifySignature(signatureId, signatureImage) {
  const signature = signatures.get(signatureId);
  if (!signature) return false;
  
  const hash = crypto
    .createHash('sha256')
    .update(signatureImage)
    .digest('hex');
  
  return hash === signature.signatureHash;
}

// ============================================================================
// ONBOARDING WORKFLOWS
// ============================================================================

function initiateFounderOnboarding(userId, founderData) {
  const onboardingId = crypto.randomBytes(16).toString('hex');
  
  const onboarding = {
    id: onboardingId,
    userId,
    type: 'founder',
    status: 'in_progress',
    currentStep: 1,
    totalSteps: 8,
    steps: {
      welcome: { completed: false, timestamp: null },
      personalInfo: { completed: false, data: null },
      documents: { completed: false, uploads: [] },
      founderContract: { completed: false, contractId: null },
      financialDiscipline: { completed: false, contractId: null },
      boardCharter: { completed: false, acknowledged: false },
      ipAssignment: { completed: false, acknowledged: false },
      confidentiality: { completed: false, acknowledged: false },
      completion: { completed: false, timestamp: null }
    },
    founderData,
    startedAt: new Date().toISOString(),
    completedAt: null
  };
  
  onboardings.set(onboardingId, onboarding);
  
  // Update user record
  const user = users.get(userId) || {};
  user.onboarding = {
    required: true,
    completed: false,
    type: 'founder',
    onboardingId
  };
  users.set(userId, user);
  
  return onboarding;
}

function updateOnboardingStep(onboardingId, stepName, stepData) {
  const onboarding = onboardings.get(onboardingId);
  if (!onboarding) return null;
  
  onboarding.steps[stepName] = {
    ...onboarding.steps[stepName],
    ...stepData,
    completed: true,
    timestamp: new Date().toISOString()
  };
  
  // Calculate current step
  const completedSteps = Object.values(onboarding.steps).filter(s => s.completed).length;
  onboarding.currentStep = completedSteps;
  
  // Check if all steps completed
  if (completedSteps === onboarding.totalSteps) {
    onboarding.status = 'completed';
    onboarding.completedAt = new Date().toISOString();
    
    // Update user
    const user = users.get(onboarding.userId);
    if (user) {
      user.onboarding.completed = true;
      users.set(onboarding.userId, user);
    }
  }
  
  onboardings.set(onboardingId, onboarding);
  return onboarding;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isFounderEmail(email) {
  return email.endsWith('@autonomous-logistics.com');
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Digital Onboarding Service',
    status: 'operational',
    contracts: contracts.size,
    onboardings: onboardings.size,
    signatures: signatures.size
  });
});

// Check if user needs onboarding (by email)
app.get('/api/onboarding/check/:email', (req, res) => {
  const { email } = req.params;
  const decodedEmail = decodeURIComponent(email);
  
  // Check if this is a founder email
  const isFounder = isFounderEmail(decodedEmail);
  
  let user = users.get(decodedEmail);
  
  // Auto-create user entry for founder emails
  if (!user && isFounder) {
    const name = decodedEmail.split('@')[0].split('.').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    user = {
      id: decodedEmail,
      name: name,
      email: decodedEmail,
      role: 'Founder',
      equityPercentage: 0, // To be assigned during onboarding
      isFounder: true,
      needsOnboarding: true
    };
    users.set(decodedEmail, user);
  }
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    needsOnboarding: user.needsOnboarding,
    isFounder: user.isFounder,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      equityPercentage: user.equityPercentage
    }
  });
});

// Initiate founder onboarding
app.post('/api/onboarding/founder/initiate', (req, res) => {
  const { email, founderData } = req.body;
  
  // Verify founder by email domain
  if (!isFounderEmail(email)) {
    return res.status(403).json({ error: 'Email must be @autonomous-logistics.com domain to be a founder' });
  }
  
  let user = users.get(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const onboarding = initiateFounderOnboarding(email, founderData);
  
  res.json({
    success: true,
    onboarding,
    user
  });
});

// Get onboarding status
app.get('/api/onboarding/:onboardingId', (req, res) => {
  const { onboardingId } = req.params;
  const onboarding = onboardings.get(onboardingId);
  
  if (!onboarding) {
    return res.status(404).json({ error: 'Onboarding not found' });
  }
  
  res.json(onboarding);
});

// Update onboarding step
app.put('/api/onboarding/:onboardingId/step/:stepName', (req, res) => {
  const { onboardingId, stepName } = req.params;
  const stepData = req.body;
  
  const onboarding = updateOnboardingStep(onboardingId, stepName, stepData);
  
  if (!onboarding) {
    return res.status(404).json({ error: 'Onboarding not found' });
  }
  
  res.json({
    success: true,
    onboarding
  });
});

// Generate contract
app.post('/api/onboarding/contracts/generate', (req, res) => {
  const { type, fields, signers } = req.body;
  
  const contractId = crypto.randomBytes(16).toString('hex');
  const contractText = generateContract(type, fields);
  
  const contract = {
    id: contractId,
    type,
    templateVersion: '1.0',
    fields,
    signers: signers.map(s => ({ ...s, signed: false, signatureId: null })),
    contractText,
    status: 'pending',
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    pdfUrl: null,
    blockchainHash: null
  };
  
  contracts.set(contractId, contract);
  
  res.json({
    success: true,
    contractId,
    contract
  });
});

// Get contract
app.get('/api/onboarding/contracts/:contractId', (req, res) => {
  const { contractId } = req.params;
  const contract = contracts.get(contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  res.json(contract);
});

// Sign contract
app.post('/api/onboarding/contracts/:contractId/sign', async (req, res) => {
  const { contractId } = req.params;
  const { signerEmail, signatureImage, ipAddress, location, userAgent } = req.body;
  
  const contract = contracts.get(contractId);
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  // Find signer
  const signerIndex = contract.signers.findIndex(s => s.email === signerEmail);
  if (signerIndex === -1) {
    return res.status(400).json({ error: 'Signer not found in contract' });
  }
  
  const signer = contract.signers[signerIndex];
  
  // Create signature
  const signature = createSignature(contractId, {
    name: signer.name,
    email: signer.email,
    role: signer.role,
    ipAddress,
    location,
    userAgent
  }, signatureImage);
  
  // Update contract
  contract.signers[signerIndex].signed = true;
  contract.signers[signerIndex].signatureId = signature.id;
  contract.signers[signerIndex].signedAt = signature.timestamp;
  
  // Check if all signed
  const allSigned = contract.signers.every(s => s.signed);
  if (allSigned) {
    contract.status = 'fully_signed';
    
    // Generate PDF
    const pdfPath = path.join(__dirname, 'contracts', `${contractId}.pdf`);
    fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
    
    const signatureData = contract.signers.map(s => {
      const sig = signatures.get(s.signatureId);
      return {
        name: s.name,
        role: s.role,
        timestamp: s.signedAt,
        ipAddress: sig.ipAddress,
        location: sig.location,
        signatureHash: sig.signatureHash,
        signatureImage: sig.signatureImage
      };
    });
    
    await generateContractPDF(contract.contractText, signatureData, pdfPath);
    contract.pdfUrl = `/contracts/${contractId}.pdf`;
    
    // Blockchain attestation (simulated)
    const blockchainHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(contract))
      .digest('hex');
    contract.blockchainHash = `0x${blockchainHash}`;
  } else {
    contract.status = 'partially_signed';
  }
  
  contracts.set(contractId, contract);
  
  res.json({
    success: true,
    contract,
    signature: {
      id: signature.id,
      hash: signature.signatureHash,
      timestamp: signature.timestamp
    }
  });
});

// Download contract PDF
app.get('/api/onboarding/contracts/:contractId/pdf', (req, res) => {
  const { contractId } = req.params;
  const contract = contracts.get(contractId);
  
  if (!contract || !contract.pdfUrl) {
    return res.status(404).json({ error: 'PDF not found' });
  }
  
  const pdfPath = path.join(__dirname, 'contracts', `${contractId}.pdf`);
  res.download(pdfPath);
});

// Verify signature
app.post('/api/onboarding/signature/verify', (req, res) => {
  const { signatureId, signatureImage } = req.body;
  
  const isValid = verifySignature(signatureId, signatureImage);
  const signature = signatures.get(signatureId);
  
  res.json({
    valid: isValid,
    signature: signature || null
  });
});

// Get audit trail
app.get('/api/onboarding/signature/audit/:contractId', (req, res) => {
  const { contractId } = req.params;
  const contract = contracts.get(contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  const auditTrail = contract.signers.map(signer => {
    if (!signer.signatureId) return null;
    
    const sig = signatures.get(signer.signatureId);
    return {
      signer: signer.name,
      role: signer.role,
      email: signer.email,
      signedAt: signer.signedAt,
      ipAddress: sig.ipAddress,
      location: sig.location,
      signatureHash: sig.signatureHash,
      verified: sig.verified
    };
  }).filter(Boolean);
  
  res.json({
    contractId,
    type: contract.type,
    status: contract.status,
    createdAt: contract.createdAt,
    blockchainHash: contract.blockchainHash,
    auditTrail
  });
});

// ============================================================================
// SEED DATA FOR FOUNDERS
// ============================================================================

// Seed Platform Administrator as founder
const adminUserId = 'admin_001';
users.set(adminUserId, {
  id: adminUserId,
  name: 'Platform Administrator',
  email: 'admin@autonomous-logistics.com',
  github: 'platform-admin',
  role: {
    title: 'Founder, CEO & Chief Architect',
    department: 'Executive',
    type: 'founder',
    equity: '65%'
  },
  onboarding: {
    required: true,
    completed: false,
    type: 'founder',
    onboardingId: null
  }
});

console.log('[Onboarding Service] Seeded founder: Platform Administrator');

// ============================================================================
// SERVER START
// ============================================================================

app.listen(PORT, () => {
  console.log('');
  console.log('🖊️  Digital Onboarding Service');
  console.log('================================');
  console.log(`Port: ${PORT}`);
  console.log('Status: Online');
  console.log('');
  console.log('Features:');
  console.log('  ✅ E-Signature with legal validity');
  console.log('  ✅ Contract generation from templates');
  console.log('  ✅ PDF generation with signatures');
  console.log('  ✅ Blockchain attestation');
  console.log('  ✅ Founder-first onboarding');
  console.log('  ✅ Audit trail & compliance');
  console.log('');
  console.log('Built for autonomous logistics operations');
  console.log('Making employment instant and paperless!');
  console.log('');
});

module.exports = app;
