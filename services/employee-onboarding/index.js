/**
 * Azora OS - Employee Onboarding Service
 * 
 * Autonomous employee onboarding with e-signature contracts,
 * automated document generation, and quick setup.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 * Email: sizwe.ngwenya@azora.world
 */

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const PORT = 8097;

// ============================================================================
// DATA STORES
// ============================================================================

const employees = new Map(); // employeeId -> employee data
const onboardingFlows = new Map(); // flowId -> onboarding flow
const contracts = new Map(); // contractId -> contract
const documents = new Map(); // documentId -> document

// ============================================================================
// ONBOARDING FLOW
// ============================================================================

function createOnboardingFlow(employeeData) {
  const flowId = `ONBOARD-${Date.now()}`;
  const employeeId = `EMP-${Date.now()}`;
  
  const flow = {
    id: flowId,
    employeeId,
    status: 'in_progress',
    currentStep: 1,
    
    steps: [
      { step: 1, name: 'Personal Information', completed: false, data: null },
      { step: 2, name: 'Employment Details', completed: false, data: null },
      { step: 3, name: 'Bank & Tax Information', completed: false, data: null },
      { step: 4, name: 'Emergency Contacts', completed: false, data: null },
      { step: 5, name: 'Document Upload', completed: false, data: null },
      { step: 6, name: 'Contract Review', completed: false, data: null },
      { step: 7, name: 'E-Signature', completed: false, data: null },
      { step: 8, name: 'System Access', completed: false, data: null }
    ],
    
    employee: {
      id: employeeId,
      ...employeeData
    },
    
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  
  onboardingFlows.set(flowId, flow);
  
  return flow;
}

function updateOnboardingStep(flowId, stepNumber, stepData) {
  const flow = onboardingFlows.get(flowId);
  if (!flow) return { error: 'Onboarding flow not found' };
  
  const step = flow.steps.find(s => s.step === stepNumber);
  if (!step) return { error: 'Step not found' };
  
  step.completed = true;
  step.data = stepData;
  step.completedAt = new Date().toISOString();
  
  // Move to next step
  if (stepNumber < flow.steps.length) {
    flow.currentStep = stepNumber + 1;
  } else {
    flow.status = 'completed';
    flow.completedAt = new Date().toISOString();
    
    // Create employee record
    createEmployeeRecord(flow);
  }
  
  onboardingFlows.set(flowId, flow);
  
  return flow;
}

function createEmployeeRecord(flow) {
  const employee = {
    id: flow.employeeId,
    
    // Personal Information (Step 1)
    personalInfo: flow.steps[0].data,
    
    // Employment Details (Step 2)
    employment: flow.steps[1].data,
    
    // Bank & Tax (Step 3)
    financial: flow.steps[2].data,
    
    // Emergency Contacts (Step 4)
    emergencyContacts: flow.steps[3].data,
    
    // Documents (Step 5)
    documents: flow.steps[4].data,
    
    // Contract (Step 6)
    contract: flow.steps[5].data,
    
    // E-Signature (Step 7)
    signature: flow.steps[6].data,
    
    // System Access (Step 8)
    systemAccess: flow.steps[7].data,
    
    status: 'active',
    onboardedAt: flow.completedAt,
    createdAt: flow.createdAt
  };
  
  employees.set(employee.id, employee);
  
  return employee;
}

// ============================================================================
// CONTRACT GENERATION
// ============================================================================

function generateEmploymentContract(employeeData) {
  const contractId = `CONTRACT-${Date.now()}`;
  
  const contract = {
    id: contractId,
    employeeId: employeeData.employeeId,
    type: 'employment',
    
    parties: {
      employer: {
        name: 'Azora World (Pty) Ltd',
        registration: 'PTY123456789',
        address: 'Johannesburg, South Africa',
        representative: 'Sizwe Ngwenya'
      },
      employee: {
        name: employeeData.name,
        id: employeeData.idNumber,
        address: employeeData.address
      }
    },
    
    terms: {
      position: employeeData.position,
      department: employeeData.department,
      startDate: employeeData.startDate,
      employmentType: employeeData.employmentType, // permanent, contract, intern
      probationPeriod: employeeData.probationPeriod || 90, // days
      
      compensation: {
        salary: employeeData.salary,
        paymentFrequency: 'monthly',
        benefits: employeeData.benefits || []
      },
      
      workingHours: {
        hoursPerWeek: 40,
        daysPerWeek: 5,
        flexibleHours: employeeData.flexibleHours || false
      },
      
      leave: {
        annualLeave: 21, // days
        sickLeave: 30, // days over 3 years
        maternityLeave: 120, // days
        familyResponsibility: 3 // days
      },
      
      confidentiality: true,
      nonCompete: employeeData.nonCompete || false,
      intellectualProperty: true,
      
      terminationNotice: {
        employeeNotice: 30, // days
        employerNotice: 30 // days
      }
    },
    
    content: generateContractText(employeeData),
    
    signatures: {
      employer: { signed: false, signedAt: null, signedBy: null },
      employee: { signed: false, signedAt: null }
    },
    
    status: 'pending',
    generatedAt: new Date().toISOString(),
    expiresAt: null // Only for fixed-term contracts
  };
  
  contracts.set(contractId, contract);
  
  return contract;
}

function generateContractText(employeeData) {
  return `
EMPLOYMENT CONTRACT

This Employment Contract ("Contract") is entered into on ${new Date().toLocaleDateString()} 
between:

EMPLOYER: Azora World (Pty) Ltd
Registration Number: PTY123456789
Address: Johannesburg, South Africa
Represented by: Sizwe Ngwenya (CEO)

AND

EMPLOYEE: ${employeeData.name}
ID Number: ${employeeData.idNumber}
Address: ${employeeData.address}

1. POSITION AND DUTIES
The Employee is employed as ${employeeData.position} in the ${employeeData.department} 
department. The Employee shall perform duties as reasonably assigned by the Employer.

2. COMMENCEMENT AND DURATION
This employment commences on ${employeeData.startDate} and is subject to a probationary 
period of ${employeeData.probationPeriod || 90} days.

3. REMUNERATION
The Employee shall receive a gross monthly salary of R${employeeData.salary.toLocaleString()}, 
payable on the last working day of each month.

4. WORKING HOURS
Standard working hours are 40 hours per week, typically Monday to Friday, 08:00 - 17:00.

5. LEAVE
- Annual Leave: 21 days per annum
- Sick Leave: 30 days over 3-year cycle
- Maternity/Paternity Leave: As per Labour Relations Act

6. CONFIDENTIALITY
The Employee agrees to maintain strict confidentiality regarding all proprietary information,
trade secrets, and business operations of the Employer.

7. INTELLECTUAL PROPERTY
All work product, inventions, and intellectual property created during employment shall be
the sole property of the Employer.

8. TERMINATION
Either party may terminate this Contract by providing 30 days written notice to the other party.

9. GOVERNING LAW
This Contract is governed by the laws of the Republic of South Africa.

SIGNATURES:

_________________________          _________________________
Sizwe Ngwenya (CEO)                ${employeeData.name}
Azora World (Pty) Ltd              Employee
Date: ______________               Date: ______________
  `.trim();
}

function signContract(contractId, signatureData) {
  const contract = contracts.get(contractId);
  if (!contract) return { error: 'Contract not found' };
  
  if (signatureData.party === 'employee') {
    contract.signatures.employee = {
      signed: true,
      signedAt: new Date().toISOString(),
      signature: signatureData.signature,
      ipAddress: signatureData.ipAddress
    };
  } else if (signatureData.party === 'employer') {
    contract.signatures.employer = {
      signed: true,
      signedAt: new Date().toISOString(),
      signedBy: signatureData.signedBy,
      signature: signatureData.signature,
      ipAddress: signatureData.ipAddress
    };
  }
  
  // Check if both parties have signed
  if (contract.signatures.employee.signed && contract.signatures.employer.signed) {
    contract.status = 'executed';
  }
  
  contracts.set(contractId, contract);
  
  return contract;
}

// ============================================================================
// DOCUMENT GENERATION
// ============================================================================

function generateWelcomeLetter(employeeData) {
  const docId = `DOC-WELCOME-${Date.now()}`;
  
  const document = {
    id: docId,
    type: 'welcome_letter',
    employeeId: employeeData.employeeId,
    
    content: `
Dear ${employeeData.name},

Welcome to Azora World!

We are thrilled to have you join our team as ${employeeData.position}. Your skills and 
experience will be invaluable as we continue to revolutionize the logistics and fleet 
management industry across Africa.

Your start date is ${employeeData.startDate}. Please report to our office at 08:00 AM.

On your first day, you will receive:
- Your employee ID badge
- System access credentials
- Welcome pack and company handbook
- Introduction to your team

If you have any questions before your start date, please don't hesitate to reach out.

We look forward to working with you!

Best regards,

Sizwe Ngwenya
CEO, Azora World (Pty) Ltd
sizwe.ngwenya@azora.world
    `.trim(),
    
    generatedAt: new Date().toISOString()
  };
  
  documents.set(docId, document);
  
  return document;
}

function generateOfferLetter(employeeData) {
  const docId = `DOC-OFFER-${Date.now()}`;
  
  const document = {
    id: docId,
    type: 'offer_letter',
    employeeId: employeeData.employeeId,
    
    content: `
OFFER OF EMPLOYMENT

Date: ${new Date().toLocaleDateString()}

${employeeData.name}
${employeeData.address}

Dear ${employeeData.name},

We are pleased to offer you the position of ${employeeData.position} at Azora World (Pty) Ltd.

POSITION DETAILS:
- Position: ${employeeData.position}
- Department: ${employeeData.department}
- Start Date: ${employeeData.startDate}
- Employment Type: ${employeeData.employmentType}

COMPENSATION:
- Gross Monthly Salary: R${employeeData.salary.toLocaleString()}
- Benefits: Medical aid, provident fund, group life cover

WORKING HOURS:
- 40 hours per week (Monday to Friday, 08:00 - 17:00)

This offer is subject to:
- Satisfactory reference checks
- Verification of qualifications
- Completion of probationary period (90 days)

Please confirm your acceptance of this offer by signing and returning this letter by 
${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}.

We look forward to welcoming you to the team!

Yours sincerely,

Sizwe Ngwenya
CEO, Azora World (Pty) Ltd

ACCEPTANCE:
I, ${employeeData.name}, accept the above offer of employment.

Signature: ________________  Date: ______________
    `.trim(),
    
    generatedAt: new Date().toISOString()
  };
  
  documents.set(docId, document);
  
  return document;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    service: 'Employee Onboarding Service',
    status: 'operational',
    employees: employees.size,
    activeFlows: Array.from(onboardingFlows.values()).filter(f => f.status === 'in_progress').length
  });
});

// Start onboarding
app.post('/api/onboarding/start', (req, res) => {
  const flow = createOnboardingFlow(req.body);
  
  res.json({
    success: true,
    flow
  });
});

// Get onboarding flow
app.get('/api/onboarding/:flowId', (req, res) => {
  const { flowId } = req.params;
  const flow = onboardingFlows.get(flowId);
  
  if (!flow) {
    return res.status(404).json({ error: 'Onboarding flow not found' });
  }
  
  res.json(flow);
});

// Update onboarding step
app.post('/api/onboarding/:flowId/step/:stepNumber', (req, res) => {
  const { flowId, stepNumber } = req.params;
  const stepData = req.body;
  
  const flow = updateOnboardingStep(flowId, parseInt(stepNumber), stepData);
  
  if (flow.error) {
    return res.status(404).json(flow);
  }
  
  res.json({
    success: true,
    flow
  });
});

// Generate contract
app.post('/api/onboarding/contract/generate', (req, res) => {
  const contract = generateEmploymentContract(req.body);
  
  res.json({
    success: true,
    contract
  });
});

// Get contract
app.get('/api/onboarding/contract/:contractId', (req, res) => {
  const { contractId } = req.params;
  const contract = contracts.get(contractId);
  
  if (!contract) {
    return res.status(404).json({ error: 'Contract not found' });
  }
  
  res.json(contract);
});

// Sign contract
app.post('/api/onboarding/contract/:contractId/sign', (req, res) => {
  const { contractId } = req.params;
  const signatureData = req.body;
  
  const contract = signContract(contractId, signatureData);
  
  if (contract.error) {
    return res.status(404).json(contract);
  }
  
  res.json({
    success: true,
    contract
  });
});

// Generate documents
app.post('/api/onboarding/documents/welcome', (req, res) => {
  const document = generateWelcomeLetter(req.body);
  
  res.json({
    success: true,
    document
  });
});

app.post('/api/onboarding/documents/offer', (req, res) => {
  const document = generateOfferLetter(req.body);
  
  res.json({
    success: true,
    document
  });
});

// Get employee
app.get('/api/onboarding/employee/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const employee = employees.get(employeeId);
  
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  
  res.json(employee);
});

// Get all employees
app.get('/api/onboarding/employees', (req, res) => {
  const allEmployees = Array.from(employees.values());
  
  res.json({
    employees: allEmployees,
    total: allEmployees.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Employee Onboarding Service running on port ${PORT}`);
  console.log(`📝 Autonomous Onboarding: ACTIVE`);
  console.log(`📄 Contract Generation: ACTIVE`);
  console.log(`✍️ E-Signature: ACTIVE`);
  console.log(`📧 Document Generation: ACTIVE`);
});

module.exports = app;
