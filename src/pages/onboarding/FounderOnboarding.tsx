import React from 'react';
/**
 * Founder Onboarding Wizard
 * 
 * Complete onboarding flow for founders including contract signing.
 * Triggered on first login for founders who haven't completed onboarding.
 * 
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SignaturePad from '../../components/signature/SignaturePad';

interface FounderData {
  name: string;
  email: string;
  role: string;
  equity: string;
  idNumber: string;
}

const steps = [
  { id: 1, name: 'Welcome', icon: '🎉' },
  { id: 2, name: 'Personal Info', icon: '👤' },
  { id: 3, name: 'Documents', icon: '📄' },
  { id: 4, name: 'Founder Contract', icon: '📝' },
  { id: 5, name: 'Financial Discipline', icon: '💰' },
  { id: 6, name: 'IP Assignment', icon: '🔒' },
  { id: 7, name: 'Confidentiality', icon: '🤐' },
  { id: 8, name: 'Complete', icon: '✅' },
];

export default function FounderOnboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [founderData, setFounderData] = useState({
    name: '',
    email: '',
    role: 'Founder',
    equity: 0,
    idNumber: ''
  });
  const [contracts, setContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is founder and initialize onboarding
  useEffect(() => {
    checkFounderStatus();
  }, []);

  const checkFounderStatus = async () => {
    try {
      // Get user email from auth context or localStorage
      const userEmail = localStorage.getItem('userEmail') || 'sizwe.ngwenya@azora.world';
      
      // Check if email is @azora.world
      if (!userEmail.toLowerCase().endsWith('@azora.world')) {
        setError('Only @azora.world email addresses can access founder onboarding');
        setLoading(false);
        return;
      }

      // Check onboarding status
      const response = await fetch(`http://localhost:4070/api/onboarding/check/${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (!data.isFounder) {
        setError('Access denied: Not a founder');
        setLoading(false);
        return;
      }

      // Set founder data from backend
      setFounderData(prev => ({
        ...prev,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        equity: data.user.equityPercentage || 0
      }));

      if (data.needsOnboarding) {
        await initiateOnboarding(userEmail);
      } else {
        navigate('/dashboard');
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to verify founder status');
      setLoading(false);
      console.error(err);
    }
  };

  const initiateOnboarding = async (email: string) => {
    try {
      const response = await fetch('http://localhost:4070/api/onboarding/founder/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          founderData: founderData
        })
      });
      
      const data = await response.json();
      setOnboardingId(data.onboarding.id);
    } catch (err) {
      console.error('Failed to initiate onboarding:', err);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateStep = async (stepName: string, stepData: any) => {
    if (!onboardingId) return;

    await fetch(`http://localhost:4070/api/onboarding/${onboardingId}/step/${stepName}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stepData)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Verifying founder status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="bg-red-900/30 text-white p-8 rounded-lg max-w-md">
          <h2 className="text-2xl font-bold mb-4">❌ Access Denied</h2>
          <p className="mb-4">{error}</p>
          <p className="text-sm text-gray-300">Founder onboarding requires an @azora.world email address.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  step.id < steps.length ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                {step.id < steps.length && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-white text-sm">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name || ''}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <WelcomeStep founderData={founderData} onNext={nextStep} />}
            {currentStep === 2 && (
              <PersonalInfoStep
                founderData={founderData}
                setFounderData={setFounderData}
                onNext={async () => {
                  await updateStep('personalInfo', { data: founderData });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <DocumentsStep
                onNext={async (uploads: any) => {
                  await updateStep('documents', { uploads });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 4 && (
                            <ContractSigningStep
                contractType="Founder Contract"
                founderData={founderData}
                onNext={async (contractId: string) => {
                  await updateStep('founderContract', { contractId });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 5 && (
                            <ContractSigningStep
                contractType="Financial Discipline Statement"
                founderData={founderData}
                onNext={async (contractId: string) => {
                  await updateStep('financialDiscipline', { contractId });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 6 && (
              <AcknowledgmentStep
                title="Intellectual Property Assignment"
                content="All work created in connection with Azora is the exclusive property of the Company."
                onNext={async () => {
                  await updateStep('ipAssignment', { acknowledged: true });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 7 && (
              <AcknowledgmentStep
                title="Confidentiality Agreement"
                content="All Company information is strictly confidential and may not be shared externally."
                onNext={async () => {
                  await updateStep('confidentiality', { acknowledged: true });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 8 && (
              <CompletionStep
                founderData={founderData}
                onComplete={async () => {
                  await updateStep('completion', { timestamp: new Date().toISOString() });
                  navigate('/dashboard');
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function WelcomeStep({ founderData, onNext }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">
        🎉 Welcome to Azora OS, Founder!
      </h1>
      <p className="text-xl mb-6">
        Hi {founderData.name}, before you can access the full system, we need to complete
        your founder onboarding and get your agreements signed.
      </p>
      
      <div className="bg-purple-900/30 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">This process will take ~15 minutes</h2>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="font-semibold">Founders Onboarding Contract</p>
              <p className="text-sm text-gray-300">Your role, equity, and responsibilities</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="font-semibold">Financial Discipline Statement</p>
              <p className="text-sm text-gray-300">Reinvestment rules for the first 5 years</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔒</span>
            <div>
              <p className="font-semibold">Intellectual Property Assignment</p>
              <p className="text-sm text-gray-300">All work belongs to Azora</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤐</span>
            <div>
              <p className="font-semibold">Confidentiality Agreement</p>
              <p className="text-sm text-gray-300">Protect company information</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-green-900/30 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold mb-2">Your Details:</h3>
        <p><strong>Name:</strong> {founderData.name}</p>
        <p><strong>Role:</strong> {founderData.role}</p>
        <p><strong>Equity:</strong> {founderData.equity}</p>
        <p><strong>Vesting:</strong> 4 years with 1-year cliff</p>
      </div>
      
      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:scale-105 transition"
      >
        Let's Begin! 🚀
      </button>
    </div>
  );
}

function PersonalInfoStep({ founderData, setFounderData, onNext, onBack }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Personal Information</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Full Legal Name</label>
          <input
            type="text"
            value={founderData.name}
            onChange={(e) => setFounderData({ ...founderData, name: e.target.value })}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">ID Number</label>
          <input
            type="text"
            value={founderData.idNumber}
            onChange={(e) => setFounderData({ ...founderData, idNumber: e.target.value })}
            placeholder="e.g., 9501015800083"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={founderData.email}
            onChange={(e) => setFounderData({ ...founderData, email: e.target.value })}
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Role</label>
          <input
            type="text"
            value={founderData.role}
            readOnly
            className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-gray-400"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!founderData.idNumber}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DocumentsStep({ onNext, onBack }: any) {
  const [uploads, setUploads] = useState<any>({
    id: null,
    proofOfAddress: null,
    taxCert: null
  });

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">📄 Document Upload</h2>
      
      <div className="space-y-4 mb-8">
        <DocumentUploadField
          label="ID Document (Front & Back)"
          accept=".pdf,.jpg,.png"
          onChange={(file: File) => setUploads({ ...uploads, id: file })}
        />
        
        <DocumentUploadField
          label="Proof of Address (Last 3 months)"
          accept=".pdf,.jpg,.png"
          onChange={(file: File) => setUploads({ ...uploads, proofOfAddress: file })}
        />
        
        <DocumentUploadField
          label="Tax Number Certificate"
          accept=".pdf"
          onChange={(file: File) => setUploads({ ...uploads, taxCert: file })}
        />
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back
        </button>
        <button
          onClick={() => onNext(uploads)}
          disabled={!uploads.id || !uploads.proofOfAddress || !uploads.taxCert}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DocumentUploadField({ label, accept, onChange }: any) {
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile);
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <label className="block text-sm font-semibold mb-2">{label}</label>
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="w-full text-sm text-gray-300"
      />
      {file && (
        <p className="text-sm text-green-400 mt-2">✓ {file.name} uploaded</p>
      )}
    </div>
  );
}

function ContractSigningStep({ title, contractType, founderData, onNext, onBack }: any) {
  const [contract, setContract] = useState<any>(null);
  const [hasRead, setHasRead] = useState(false);
  const [showSignature, setShowSignature] = useState(false);

  useEffect(() => {
    generateContract();
  }, []);

  const generateContract = async () => {
    const response = await fetch('http://localhost:4070/api/onboarding/contracts/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: contractType,
        fields: {
          founder_name: founderData.name,
          id_number: founderData.idNumber,
          email: founderData.email,
          role_title: founderData.role,
          equity_percentage: founderData.equity,
          start_date: new Date().toLocaleDateString(),
          signing_date: new Date().toLocaleDateString(),
          signing_location: 'Johannesburg, South Africa',
          role_responsibilities: 'Vision, Strategy, AI Architecture, Product Design'
        },
        signers: [
          { name: 'Sizwe Ngwenya', email: 'sizwe.ngwenya@azora.world', role: 'Founder & CEO' },
          { name: founderData.name, email: founderData.email, role: founderData.role }
        ]
      })
    });

    const data = await response.json();
    setContract(data.contract);
  };

  const handleSign = async (signature: string) => {
    const response = await fetch(`http://localhost:4070/api/onboarding/contracts/${contract.id}/sign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        signerEmail: founderData.email,
        signatureImage: signature,
        ipAddress: '102.65.123.45', // Get real IP
        location: 'Johannesburg, South Africa',
        userAgent: navigator.userAgent
      })
    });

    const data = await response.json();
    if (data.success) {
      onNext(contract.id);
    }
  };

  if (!contract) {
    return <div className="text-white text-center">Generating contract...</div>;
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">📝 {title}</h2>
      
      {!showSignature ? (
        <>
          <div className="bg-white text-black rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-sm">
              {contract.contractText}
            </pre>
          </div>
          
          <div className="bg-yellow-900/30 rounded-lg p-4 mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={hasRead}
                onChange={(e) => setHasRead(e.target.checked)}
                className="mt-1 mr-3"
              />
              <span className="text-sm">
                I have read and understood this agreement. I accept the terms and conditions outlined above.
              </span>
            </label>
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={onBack}
              className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
            >
              Back
            </button>
            <button
              onClick={() => setShowSignature(true)}
              disabled={!hasRead}
              className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
            >
              Accept & Sign
            </button>
          </div>
        </>
      ) : (
        <SignaturePad
          onSign={handleSign}
          contractType={contractType}
          signerName={founderData.name}
          signerRole={founderData.role}
          onBack={() => setShowSignature(false)}
        />
      )}
    </div>
  );
}

function AcknowledgmentStep({ title, content, onNext, onBack }: any) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">{title}</h2>
      
      <div className="bg-white/5 rounded-lg p-6 mb-6">
        <p className="text-lg">{content}</p>
      </div>
      
      <div className="bg-yellow-900/30 rounded-lg p-4 mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 mr-3"
          />
          <span>
            I acknowledge and accept this agreement.
          </span>
        </label>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!acknowledged}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function CompletionStep({ founderData, onComplete }: any) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center">
      <div className="text-6xl mb-6">🎊</div>
      <h1 className="text-4xl font-bold mb-4">Congratulations, Founder!</h1>
      <p className="text-xl mb-8">
        Your founder agreement has been signed and verified.
      </p>
      
      <div className="bg-green-900/30 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold mb-4">✅ Completed:</h3>
        <ul className="space-y-2">
          <li>✓ Contract signed and stored</li>
          <li>✓ Blockchain attestation recorded</li>
          <li>✓ PDF sent to {founderData.email}</li>
          <li>✓ Full system access granted</li>
          <li>✓ {founderData.equity} equity allocated</li>
        </ul>
      </div>
      
      <div className="bg-blue-900/30 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold mb-4">→ Next Steps:</h3>
        <ul className="space-y-2">
          <li>• Complete your profile</li>
          <li>• Set up 2FA</li>
          <li>• Invite your team</li>
          <li>• Review the founder dashboard</li>
        </ul>
      </div>
      
      <button
        onClick={onComplete}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:scale-105 transition"
      >
        Go to Dashboard 🚀
      </button>
      
      <p className="text-sm text-gray-400 mt-6">
        Welcome to Azora World! Let's build something amazing. 🇿🇦
      </p>
    </div>
  );
}
