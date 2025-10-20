# 🖊️ Azora OS - Digital Onboarding & Recruitment System

**Automated Contract Management & E-Signature Platform**

---

## System Overview

A complete digital recruitment and onboarding system that allows:
- **Instant online contract signing** with legal e-signatures
- **Automated employment processing** from home
- **Founder-first approach** - founders sign their contracts upon first login
- **Print & scan option** for traditional signing
- **Real-time verification** and compliance tracking
- **POPIA compliant** with full audit trails

---

## Features

### 1. Digital Signature System
- ✅ Legally binding e-signatures (South African ECT Act compliant)
- ✅ IP address tracking
- ✅ Timestamp verification
- ✅ Identity verification (ID number + face verification optional)
- ✅ PDF generation with embedded signatures
- ✅ Blockchain attestation for immutability

### 2. Contract Management
- ✅ Template-based contracts (Founder, Employee, Contractor, NDA)
- ✅ Dynamic field population (name, role, equity, salary)
- ✅ Multi-party signing workflows
- ✅ Automated reminders
- ✅ Version control
- ✅ Archive & retrieval system

### 3. Onboarding Workflow
- ✅ Role-specific onboarding paths
- ✅ Document upload (ID, proof of address, tax number)
- ✅ Banking details capture
- ✅ Emergency contacts
- ✅ Equipment requests
- ✅ Access provisioning (email, Slack, GitHub, etc.)

### 4. Founder-Specific Flow
- ✅ First login triggers founder contract signature
- ✅ Equity allocation confirmation
- ✅ Vesting schedule acceptance
- ✅ Financial discipline statement agreement
- ✅ Board charter acknowledgment
- ✅ Compliance training completion

---

## Architecture

### Frontend (React)
```
src/
├── pages/
│   ├── onboarding/
│   │   ├── OnboardingWizard.tsx       # Main onboarding flow
│   │   ├── FounderOnboarding.tsx      # Founder-specific flow
│   │   ├── ContractReview.tsx         # Contract review page
│   │   ├── ESignature.tsx             # E-signature component
│   │   ├── DocumentUpload.tsx         # ID/docs upload
│   │   └── OnboardingComplete.tsx     # Completion page
│   └── contracts/
│       ├── ContractDashboard.tsx      # View all contracts
│       ├── ContractTemplate.tsx       # Template management
│       └── SigningHistory.tsx         # Audit trail
├── components/
│   ├── signature/
│   │   ├── SignaturePad.tsx           # Canvas signature
│   │   ├── SignatureVerification.tsx  # Verification UI
│   │   └── SignaturePreview.tsx       # Preview component
│   └── contracts/
│       ├── ContractPDF.tsx            # PDF viewer
│       ├── ContractFields.tsx         # Dynamic form fields
│       └── ContractStatus.tsx         # Status badges
└── hooks/
    ├── useContractSigning.ts          # Signing logic
    ├── useOnboarding.ts               # Onboarding state
    └── useFounderStatus.ts            # Check founder status
```

### Backend (Node.js)
```
services/
├── onboarding-service/
│   ├── index.js                       # Main service
│   ├── contracts/
│   │   ├── generator.js               # PDF generation
│   │   ├── templates.js               # Contract templates
│   │   ├── signing.js                 # E-signature logic
│   │   └── verification.js            # Signature verification
│   ├── workflows/
│   │   ├── founder.js                 # Founder workflow
│   │   ├── employee.js                # Employee workflow
│   │   └── contractor.js              # Contractor workflow
│   ├── documents/
│   │   ├── upload.js                  # Document handling
│   │   ├── ocr.js                     # ID verification
│   │   └── storage.js                 # Secure storage
│   └── notifications/
│       ├── email.js                   # Email notifications
│       └── sms.js                     # SMS reminders
└── blockchain-service/
    └── attestation.js                 # Contract attestation
```

---

## Database Schema

### Contracts Collection
```javascript
{
  _id: ObjectId,
  type: 'founder' | 'employee' | 'contractor' | 'nda',
  templateVersion: '1.0',
  parties: [
    {
      name: 'Sizwe Ngwenya',
      email: 'sizwe.ngwenya@azora.world',
      role: 'Founder & CEO',
      signedAt: Date,
      ipAddress: '192.168.1.1',
      signature: 'base64_image',
      signatureHash: 'sha256_hash'
    }
  ],
  fields: {
    equity: '65%',
    vestingYears: 4,
    cliff: 1,
    salary: 'R50,000',
    // ... dynamic fields
  },
  status: 'pending' | 'partially_signed' | 'fully_signed' | 'expired',
  pdfUrl: '/contracts/signed/123.pdf',
  blockchainHash: '0x...',
  createdAt: Date,
  expiresAt: Date,
  metadata: {
    ipAddress: '...',
    userAgent: '...',
    location: 'Johannesburg, ZA'
  }
}
```

### Onboarding Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: 'founder' | 'employee' | 'contractor',
  status: 'started' | 'in_progress' | 'completed',
  currentStep: 1,
  totalSteps: 8,
  steps: {
    personalInfo: { completed: true, data: {...} },
    documents: { completed: false, data: {...} },
    contract: { completed: false, contractId: ObjectId },
    banking: { completed: false, data: {...} },
    equipment: { completed: false, data: {...} },
    access: { completed: false, data: {...} },
    training: { completed: false, data: {...} },
    final: { completed: false, data: {...} }
  },
  startedAt: Date,
  completedAt: Date
}
```

### Users Collection (Extension)
```javascript
{
  _id: ObjectId,
  // ... existing fields
  onboarding: {
    required: true,
    completed: false,
    type: 'founder' | 'employee' | 'contractor',
    contractId: ObjectId,
    onboardingId: ObjectId
  },
  contracts: [
    {
      contractId: ObjectId,
      type: 'founder_agreement',
      signedAt: Date,
      version: '1.0'
    }
  ],
  role: {
    title: 'Founder & CEO',
    department: 'Executive',
    equity: '65%',
    vestingSchedule: {...}
  }
}
```

---

## API Endpoints

### Contract Management
```
POST   /api/onboarding/contracts/generate          # Generate contract
GET    /api/onboarding/contracts/:id               # Get contract
POST   /api/onboarding/contracts/:id/sign          # Sign contract
GET    /api/onboarding/contracts/:id/pdf           # Download PDF
POST   /api/onboarding/contracts/:id/verify        # Verify signature
GET    /api/onboarding/contracts/user/:userId      # User's contracts
```

### Onboarding Workflow
```
POST   /api/onboarding/start                       # Start onboarding
GET    /api/onboarding/:id                         # Get onboarding status
PUT    /api/onboarding/:id/step/:stepName          # Update step
POST   /api/onboarding/:id/documents               # Upload documents
POST   /api/onboarding/:id/complete                # Complete onboarding
GET    /api/onboarding/user/:userId                # User's onboarding
```

### Founder-Specific
```
GET    /api/onboarding/founder/check               # Check founder status
POST   /api/onboarding/founder/initiate            # Initiate founder flow
GET    /api/onboarding/founder/contract            # Get founder contract
POST   /api/onboarding/founder/accept              # Accept all terms
```

### E-Signature
```
POST   /api/signature/create                       # Create signature
POST   /api/signature/verify                       # Verify signature
GET    /api/signature/audit/:contractId            # Get audit trail
POST   /api/signature/blockchain-attest            # Attest on blockchain
```

---

## Founder Onboarding Flow

### Step 1: Login Detection
```javascript
// On first login, check founder status
if (user.role === 'founder' && !user.onboarding.completed) {
  redirect('/onboarding/founder/welcome');
}
```

### Step 2: Welcome & Overview
- Explain the founder contract process
- Show what needs to be signed
- Estimated time: 15 minutes

### Step 3: Personal Information
- Confirm full legal name
- ID number
- Contact details
- Next of kin

### Step 4: Document Upload
- ID document (front & back)
- Proof of address (last 3 months)
- Tax number certificate
- Bank statement

### Step 5: Contract Review
- Display full founder contract
- Highlight key terms:
  - Equity allocation (e.g., 65%)
  - Vesting schedule (4 years, 1-year cliff)
  - Financial discipline rules
  - IP assignment
- Allow download for review
- "I have read and understood" checkbox

### Step 6: E-Signature
- Digital signature pad
- Type name for typed signature
- Upload signature image option
- Capture metadata (IP, timestamp, location)

### Step 7: Additional Agreements
- Financial Discipline Statement
- Board Charter acknowledgment
- Confidentiality agreement
- Code of conduct

### Step 8: Verification & Completion
- Verify all documents
- Generate signed PDF
- Attest on blockchain
- Send confirmation email
- Grant full system access

---

## UI Components

### SignaturePad Component
```typescript
interface SignaturePadProps {
  onSign: (signature: string) => void;
  contractType: 'founder' | 'employee' | 'contractor';
  signerName: string;
  signerRole: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  onSign,
  contractType,
  signerName,
  signerRole
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  const handleSign = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const signature = canvas.toDataURL('image/png');
    setSignatureData(signature);
    onSign(signature);
  };

  return (
    <div className="signature-pad">
      <div className="signature-header">
        <h3>Sign Your {contractType} Agreement</h3>
        <p>{signerName} - {signerRole}</p>
      </div>
      
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="signature-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
      />
      
      <div className="signature-actions">
        <button onClick={handleClear}>Clear</button>
        <button onClick={handleSign} disabled={!signatureData}>
          Sign Document
        </button>
      </div>
      
      <div className="signature-metadata">
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>IP: {userIP}</p>
        <p>Location: Johannesburg, South Africa</p>
      </div>
    </div>
  );
};
```

### ContractReview Component
```typescript
interface ContractReviewProps {
  contract: Contract;
  onAccept: () => void;
  onDecline: () => void;
}

const ContractReview: React.FC<ContractReviewProps> = ({
  contract,
  onAccept,
  onDecline
}) => {
  const [hasRead, setHasRead] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  return (
    <div className="contract-review">
      <div className="contract-header">
        <h2>{contract.title}</h2>
        <p>Version {contract.version} - {contract.date}</p>
      </div>
      
      <div 
        className="contract-content"
        onScroll={handleScroll}
      >
        <ContractPDF url={contract.pdfUrl} />
      </div>
      
      <div className="contract-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${scrollProgress}%` }}
        />
        <p>{scrollProgress === 100 ? 'Fully reviewed' : 'Keep reading...'}</p>
      </div>
      
      <div className="contract-acknowledgment">
        <label>
          <input
            type="checkbox"
            checked={hasRead}
            onChange={(e) => setHasRead(e.target.checked)}
            disabled={scrollProgress < 100}
          />
          I have read and understood this agreement
        </label>
      </div>
      
      <div className="contract-actions">
        <button onClick={onDecline} className="btn-secondary">
          Decline
        </button>
        <button 
          onClick={onAccept} 
          className="btn-primary"
          disabled={!hasRead || scrollProgress < 100}
        >
          Accept & Continue to Sign
        </button>
      </div>
    </div>
  );
};
```

---

## Security Features

### 1. Identity Verification
- ID number validation (RSA format)
- Face verification (optional, using AI)
- OTP verification via SMS/email
- Two-factor authentication

### 2. Signature Security
- SHA-256 hash of signature image
- Encrypted storage
- Tamper detection
- Blockchain attestation for immutability

### 3. Document Security
- End-to-end encryption
- Access control (only parties can view)
- Download tracking
- Watermarking

### 4. Audit Trail
- Every action logged
- IP address tracking
- Timestamp verification
- Geographic location
- Device fingerprinting

### 5. Compliance
- POPIA compliant (data minimization, purpose limitation)
- ECT Act compliant (electronic signatures)
- GDPR ready (for international employees)
- Automated data retention policies

---

## Legal Validity

### South African Electronic Communications and Transactions Act (ECT Act)

**Section 13: Legal Recognition of Electronic Signatures**
- E-signatures are legally binding in South Africa
- Requirements:
  ✅ Method to identify the person
  ✅ Indication of approval
  ✅ Method is reliable
  ✅ Consenting party agrees

**Our Implementation:**
- ✅ Identity verification (ID, OTP)
- ✅ Clear indication (signature pad, timestamp)
- ✅ Reliable method (SHA-256 hash, blockchain)
- ✅ Explicit consent (checkboxes, acknowledgments)

---

## Notification System

### Email Notifications
1. **Onboarding Started** - Welcome email with instructions
2. **Contract Ready** - Link to review contract
3. **Signature Required** - Reminder to sign
4. **Contract Signed** - Confirmation with PDF attachment
5. **Onboarding Complete** - Welcome to the team

### SMS Notifications
1. **OTP for verification**
2. **Signature reminder** (if not signed in 24 hours)
3. **Contract signed confirmation**

### In-App Notifications
1. **Next steps** in onboarding
2. **Document upload status**
3. **Signature verification status**
4. **Access provisioning updates**

---

## Founder Experience

### Day 1: First Login
```
1. Login with GitHub (@Sizwe780)
2. System detects: Founder status, no contract signed
3. Redirect to: /onboarding/founder/welcome
4. See: "Welcome, Sizwe! Let's get your founder agreement signed."
```

### Welcome Screen
```
🎉 Welcome to Azora OS, Founder!

Before you can access the full system, we need to complete
your founder onboarding and get your agreements signed.

This process will take approximately 15 minutes.

What you'll sign today:
✅ Founders Onboarding Contract
✅ Financial Discipline Statement
✅ Board Charter Acknowledgment
✅ Intellectual Property Assignment
✅ Confidentiality Agreement

Your equity allocation: 65%
Vesting schedule: 4 years with 1-year cliff

Ready? Let's begin! 🚀
```

### Contract Preview
```
FOUNDERS ONBOARDING CONTRACT

Between: Azora World (Pty) Ltd
And: Sizwe Ngwenya

1. APPOINTMENT
   You are appointed as Founder, CEO & Chief Architect
   effective October 10, 2025.

2. EQUITY ALLOCATION
   You are allocated 65% equity in Azora World.
   Vesting: 4 years with 1-year cliff.

3. FINANCIAL DISCIPLINE
   You agree to reinvest 60% of net earnings and 30%
   of gross revenue for the first 5 years.

[Full contract text...]

☐ I have read and understood this agreement

[Decline] [Accept & Sign]
```

### Signature Screen
```
✍️ Sign Your Founder Agreement

Draw your signature below:
┌─────────────────────────────────────────────┐
│                                             │
│        [Signature canvas]                   │
│                                             │
└─────────────────────────────────────────────┘

Or type your name:
[Sizwe Ngwenya                              ]

Signing as: Sizwe Ngwenya
Role: Founder, CEO & Chief Architect
Date: October 10, 2025, 14:23 CAT
IP: 102.65.123.45
Location: Johannesburg, South Africa

[Clear] [Sign Document]
```

### Completion Screen
```
🎊 Congratulations, Founder!

Your founder agreement has been signed and verified.

✅ Contract signed and stored
✅ Blockchain attestation: 0x7a9f3b2e...
✅ PDF sent to sizwe.ngwenya@azora.world
✅ Full system access granted

Next steps:
→ Complete your profile
→ Set up 2FA
→ Invite your team
→ Review the founder dashboard

Welcome to Azora World! Let's build something amazing. 🚀🇿🇦

[Go to Dashboard]
```

---

## Print & Scan Option

For users who prefer traditional signing:

1. **Generate PDF** - Download unsigned contract
2. **Print** - Print on letterhead
3. **Sign physically** - Blue ink signature
4. **Scan** - High-quality scan (PDF, 300dpi minimum)
5. **Upload** - Upload via portal
6. **Verify** - Admin verifies signature
7. **Approve** - Contract activated

---

## Integration Points

### GitHub Integration
- Auto-provision GitHub access upon contract signing
- Add to @azoraworld organization
- Assign to relevant repositories
- Grant role-based permissions

### Email Integration
- Auto-create @azora.world email
- Send welcome email
- Add to mailing lists
- Calendar invites for onboarding sessions

### Slack Integration
- Auto-invite to workspace
- Add to channels based on role
- Welcome message from CEO
- Assign buddy/mentor

### Payroll Integration
- Send banking details to payroll system
- Set up tax information
- Schedule first payment
- Benefits enrollment

---

## Admin Dashboard

### Contract Management
- View all contracts
- Filter by status, type, date
- Send reminders
- Bulk operations
- Export reports

### Onboarding Progress
- Track all onboarding in progress
- Identify blockers
- Send automated reminders
- Manual intervention when needed

### Analytics
- Time to complete onboarding
- Drop-off points
- Document verification delays
- Signature compliance rates

---

## Compliance & Audit

### Regular Audits
- Quarterly contract review
- Signature verification
- Document retention compliance
- Access log review

### Reports
- Monthly onboarding report
- Contract status report
- Compliance report
- Audit trail export

---

## Future Enhancements

### Phase 2
- [ ] Video verification (liveness check)
- [ ] Biometric signatures (fingerprint on mobile)
- [ ] Multi-language contracts
- [ ] Advanced e-ID integration (Smart ID)

### Phase 3
- [ ] DocuSign integration (for enterprise clients)
- [ ] Automated background checks
- [ ] Reference checking system
- [ ] Skills assessment integration

---

## Cost Breakdown

### Free Tier (First 10 contracts)
- Basic e-signature
- PDF generation
- Email notifications
- Audit trail

### Pro Tier (R99/contract)
- Blockchain attestation
- SMS notifications
- Advanced verification
- Custom branding

### Enterprise Tier (Custom)
- White-label solution
- API access
- Custom workflows
- Dedicated support

---

## Implementation Timeline

### Week 1-2: Core Backend
- Contract generation service
- E-signature API
- Database schema
- Authentication flow

### Week 3-4: Frontend
- Onboarding wizard
- Contract review UI
- Signature pad
- Document upload

### Week 5: Founder Flow
- Founder-specific logic
- First-login detection
- Equity visualization
- Completion flow

### Week 6: Testing & Launch
- Security testing
- Legal review
- Founder testing
- Production deployment

---

**Built in South Africa by Sizwe Ngwenya for Azora World**  
**Making employment instant and paperless 🇿🇦**
