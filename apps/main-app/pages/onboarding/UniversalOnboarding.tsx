/* eslint-env browser */
import React from 'react';
/**
 * Universal Onboarding System
 *
 * Onboards anyone - customers, drivers, store staff, vendors, etc.
 * No restrictions on email domain or store name.
 *
 * Copyright (c) 2025 Sizwe Ngwenya (Azora World)
 */

import { useState, useEffect, useMemo } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingData {
  fullName: string;
  email: string;
  phone: string;
  userType: 'customer' | 'driver' | 'store_staff' | 'vendor' | 'partner';
  businessName?: string;
  storeLocation?: string;
  idNumber?: string;
  driverLicense?: string;
}

interface UserType {
  value: OnboardingData['userType'];
  label: string;
  description: string;
}

interface Step {
  id: number;
  name: string;
  icon: string;
}

type StepName = 'userType' | 'personalInfo' | 'businessDetails' | 'documents' | 'agreement';

type UploadFile = globalThis.File;
type InputElement = globalThis.HTMLInputElement;
type OnboardingSetter = Dispatch<SetStateAction<OnboardingData>>;

interface DocumentUploads {
  id?: UploadFile;
  license?: UploadFile;
}

type StepUpdatePayloadMap = {
  userType: { userType: OnboardingData['userType'] };
  personalInfo: { data: OnboardingData };
  businessDetails: { data: OnboardingData };
  documents: { uploads: DocumentUploads };
  agreement: { accepted: boolean };
};

interface WelcomeStepProps {
  onNext: () => void;
  inviteCode: string | null;
}

interface UserTypeStepProps {
  userData: OnboardingData;
  setUserData: OnboardingSetter;
  onNext: () => void;
  onBack: () => void;
}

interface PersonalInfoStepProps {
  userData: OnboardingData;
  setUserData: OnboardingSetter;
  onNext: () => void;
  onBack: () => void;
}

interface BusinessDetailsStepProps {
  userData: OnboardingData;
  setUserData: OnboardingSetter;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

interface DocumentsStepProps {
  userData: OnboardingData;
  onNext: (uploads: DocumentUploads) => Promise<void> | void;
  onBack: () => void;
  onSkip: () => void;
}

interface DocumentUploadFieldProps {
  label: string;
  accept: string;
  onChange: (file: UploadFile) => void;
}

interface AgreementStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface CompletionStepProps {
  userData: OnboardingData;
  onComplete: () => Promise<void> | void;
  loading: boolean;
}

const USER_TYPES: UserType[] = [
  { value: 'customer', label: '🛒 Customer', description: 'Shop and receive deliveries' },
  { value: 'driver', label: '🚗 Driver', description: 'Deliver orders and earn money' },
  { value: 'store_staff', label: '🏪 Store Staff', description: 'Manage store operations' },
  { value: 'vendor', label: '📦 Vendor/Supplier', description: 'Supply products to stores' },
  { value: 'partner', label: '🤝 Partner Business', description: 'Integrate your business' },
];

const steps: Step[] = [
  { id: 1, name: 'Welcome', icon: '👋' },
  { id: 2, name: 'User Type', icon: '👤' },
  { id: 3, name: 'Personal Info', icon: '📝' },
  { id: 4, name: 'Business Details', icon: '🏢' },
  { id: 5, name: 'Documents', icon: '📄' },
  { id: 6, name: 'Agreement', icon: '✍️' },
  { id: 7, name: 'Complete', icon: '✅' },
];

export default function UniversalOnboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteCode = searchParams.get('invite');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);
  const [userData, setUserData] = useState<OnboardingData>({
    fullName: '',
    email: '',
    phone: '',
    userType: 'customer',
    businessName: '',
    storeLocation: '',
    idNumber: '',
    driverLicense: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize onboarding session on mount
  useEffect(() => {
    const initiateOnboarding = async () => {
      try {
  const response = await globalThis.fetch('http://localhost:4070/api/onboarding/universal/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inviteCode: inviteCode,
            timestamp: new Date().toISOString()
          })
        });

        const data = await response.json();
        setOnboardingId(data.onboarding.id);
      } catch (err) {
        console.error('Failed to initiate onboarding:', err);
        // Continue anyway - offline mode
        setOnboardingId(`offline-${Date.now()}`);
      }
    };

    initiateOnboarding();
  }, [inviteCode]);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const updateStep = async <K extends StepName>(stepName: K, stepData: StepUpdatePayloadMap[K]) => {
    if (!onboardingId || onboardingId.startsWith('offline')) return;

    try {
      await globalThis.fetch(`http://localhost:4070/api/onboarding/${onboardingId}/step/${stepName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepData)
      });
    } catch (err) {
      console.error('Failed to update step:', err);
      // Continue anyway
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
  await globalThis.fetch(`http://localhost:4070/api/onboarding/${onboardingId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userData: userData,
          completedAt: new Date().toISOString()
        })
      });

      // Save to localStorage for demo
  globalThis.localStorage.setItem('azoraUser', JSON.stringify(userData));
  globalThis.localStorage.setItem('userEmail', userData.email);
  globalThis.localStorage.setItem('onboardingComplete', 'true');
      
      setLoading(false);
      
      // Navigate based on user type
      switch (userData.userType) {
        case 'driver':
          navigate('/driver/dashboard');
          break;
        case 'store_staff':
          navigate('/staff/dashboard');
          break;
        case 'vendor':
          navigate('/vendor/dashboard');
          break;
        case 'partner':
          navigate('/partner/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError('Failed to complete onboarding. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-400 to-yellow-400">
            Welcome to Azora OS
          </h1>
          <p className="text-white/70 text-lg">The Sovereign Immune System</p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  idx < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300 ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${
                      currentStep > step.id ? 'bg-gradient-to-r from-cyan-500 to-purple-600' : 'bg-gray-800'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-white text-sm">
            Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.name}
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
            {currentStep === 1 && <WelcomeStep onNext={nextStep} inviteCode={inviteCode} />}
            {currentStep === 2 && (
              <UserTypeStep
                userData={userData}
                setUserData={setUserData}
                onNext={async () => {
                  await updateStep('userType', { userType: userData.userType });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 3 && (
              <PersonalInfoStep
                userData={userData}
                setUserData={setUserData}
                onNext={async () => {
                  await updateStep('personalInfo', { data: userData });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 4 && (
              <BusinessDetailsStep
                userData={userData}
                setUserData={setUserData}
                onNext={async () => {
                  await updateStep('businessDetails', { data: userData });
                  nextStep();
                }}
                onBack={prevStep}
                onSkip={() => {
                  nextStep();
                }}
              />
            )}
            {currentStep === 5 && (
              <DocumentsStep
                userData={userData}
                onNext={async uploads => {
                  await updateStep('documents', { uploads });
                  nextStep();
                }}
                onBack={prevStep}
                onSkip={() => nextStep()}
              />
            )}
            {currentStep === 6 && (
              <AgreementStep
                onNext={async () => {
                  await updateStep('agreement', { accepted: true });
                  nextStep();
                }}
                onBack={prevStep}
              />
            )}
            {currentStep === 7 && (
              <CompletionStep
                userData={userData}
                onComplete={completeOnboarding}
                loading={loading}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {error && (
          <div className="mt-4 bg-red-900/30 text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function WelcomeStep({ onNext, inviteCode }: WelcomeStepProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">
        👋 Welcome to Azora OS!
      </h1>
      <p className="text-xl text-white/80 mb-6">
        Join the world&apos;s first Sovereign Immune System.
      </p>
      
      {inviteCode && (
        <div className="bg-green-900/30 border border-green-500/50 rounded-xl p-4 mb-6">
          <p className="text-sm">✓ Invite Code Applied: <strong>{inviteCode}</strong></p>
        </div>
      )}
      
      <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">What you get:</h2>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🚀</span>
            <div>
              <p className="font-semibold">Instant Access</p>
              <p className="text-sm text-gray-300">Start using the platform immediately after onboarding.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-3xl">�</span>
            <div>
              <p className="font-semibold">Reputation & Rewards</p>
              <p className="text-sm text-gray-300">Earn reputation credits and unlock exclusive benefits.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-3xl">🤖</span>
            <div>
              <p className="font-semibold">AI-Powered Platform</p>
              <p className="text-sm text-gray-300">Leverage predictive AI, smart routing, and automation.</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <span className="text-3xl">🇿🇦</span>
            <div>
              <p className="font-semibold">Built for Africa</p>
              <p className="text-sm text-gray-300">Designed for the unique challenges of the African market.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-6 mb-8">
        <p className="text-sm">
          <strong>This process takes about 5 minutes.</strong> We&apos;ll collect some basic
          information to set up your sovereign account.
        </p>
      </div>
      
      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
      >
        Let&apos;s Begin 🚀
      </button>
    </div>
  );
}

function UserTypeStep({ userData, setUserData, onNext, onBack }: UserTypeStepProps) {
  const [selected, setSelected] = useState<OnboardingData['userType']>(userData.userType);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Select Your Role</h2>
      <p className="text-white/70 mb-8">How will you interact with the Azora ecosystem?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {USER_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setSelected(type.value);
              setUserData({ ...userData, userType: type.value });
            }}
            className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
              selected === type.value
                ? 'border-cyan-400 bg-cyan-900/50 shadow-lg shadow-cyan-500/20'
                : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/20'
            }`}
          >
            <div className="flex items-center">
              <span className="text-4xl mr-4">{type.label.split(' ')[0]}</span>
              <div>
                <p className="font-bold text-lg">{type.label.substring(3)}</p>
                <p className="text-sm text-white/70">{type.description}</p>
              </div>
              {selected === type.value && (
                <div className="ml-auto w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                  <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PersonalInfoStep({ userData, setUserData, onNext, onBack }: PersonalInfoStepProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const isValid = useMemo(() => {
    return userData.fullName.length > 2 && 
           userData.email.includes('@') && 
           userData.phone.length >= 10;
  }, [userData.fullName, userData.email, userData.phone]);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">📝 Personal Information</h2>
      <p className="text-white/70 mb-8">Let's get to know you. This helps us tailor your experience.</p>
      
      <div className="space-y-6 mb-8">
        <div className="relative">
          <label htmlFor="fullName" className="absolute -top-2 left-4 bg-gray-900 px-1 text-xs text-cyan-400">Full Name *</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
            placeholder="e.g., Jane Doe"
            className="w-full bg-white/5 border-2 border-white/20 rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none transition"
          />
        </div>
        <div className="relative">
          <label htmlFor="email" className="absolute -top-2 left-4 bg-gray-900 px-1 text-xs text-cyan-400">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            placeholder="e.g., jane.doe@example.com"
            className="w-full bg-white/5 border-2 border-white/20 rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none transition"
          />
        </div>
        <div className="relative">
          <label htmlFor="phone" className="absolute -top-2 left-4 bg-gray-900 px-1 text-xs text-cyan-400">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
            placeholder="e.g., +27 72 123 4567"
            className="w-full bg-white/5 border-2 border-white/20 rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none transition"
          />
        </div>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function BusinessDetailsStep({ userData, setUserData, onNext, onBack, onSkip }: BusinessDetailsStepProps) {
  const needsBusinessDetails = ['store_staff', 'vendor', 'partner'].includes(userData.userType);

  if (!needsBusinessDetails) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">🏢 Business Details</h2>
        <p className="text-white/70 mb-8">This step is not required for your selected role.</p>
        <button
          onClick={onSkip}
          className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
        >
          Skip & Continue →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">🏢 Business Details</h2>
      <p className="text-white/70 mb-8">Provide details about your business or store.</p>
      
      <div className="space-y-6 mb-8">
        <div className="relative">
          <label htmlFor="businessName" className="absolute -top-2 left-4 bg-gray-900 px-1 text-xs text-cyan-400">
            {userData.userType === 'store_staff' ? 'Store Name' : 'Business Name'}
          </label>
          <input
            type="text"
            id="businessName"
            value={userData.businessName || ''}
            onChange={(e) => setUserData({ ...userData, businessName: e.target.value })}
            placeholder="e.g., Azora Market Sandton"
            className="w-full bg-white/5 border-2 border-white/20 rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none transition"
          />
        </div>
        
        {userData.userType === 'store_staff' && (
          <div className="relative">
            <label htmlFor="storeLocation" className="absolute -top-2 left-4 bg-gray-900 px-1 text-xs text-cyan-400">Store Location</label>
            <input
              type="text"
              id="storeLocation"
              value={userData.storeLocation || ''}
              onChange={(e) => setUserData({ ...userData, storeLocation: e.target.value })}
              placeholder="e.g., Johannesburg CBD"
              className="w-full bg-white/5 border-2 border-white/20 rounded-lg px-4 py-3 focus:border-cyan-400 focus:outline-none transition"
            />
          </div>
        )}
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DocumentsStep({ userData, onNext, onBack, onSkip }: DocumentsStepProps) {
  const [uploads, setUploads] = useState<DocumentUploads>({});

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">📄 Document Upload (Optional)</h2>
      <p className="text-white/70 mb-6">
        Upload verification documents to unlock premium features. You can skip this for now
        and upload later.
      </p>
      
      <div className="space-y-4 mb-8">
        <DocumentUploadField
          label="ID Document (Optional)"
          accept=".pdf,.jpg,.png"
          onChange={(file: UploadFile) => setUploads(prev => ({ ...prev, id: file }))}
        />
        
        {userData.userType === 'driver' && (
          <DocumentUploadField
            label="Driver&apos;s License (Optional)"
            accept=".pdf,.jpg,.png"
            onChange={(file: UploadFile) => setUploads(prev => ({ ...prev, license: file }))}
          />
        )}
        
        <div className="bg-yellow-900/30 rounded-lg p-4">
          <p className="text-sm">
            ℹ️ Documents are optional. You can complete onboarding without them and
            upload later to unlock advanced features.
          </p>
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
          onClick={onSkip}
          className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition"
        >
          Skip for Now
        </button>
        <button
          onClick={() => onNext(uploads)}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function DocumentUploadField({ label, accept, onChange }: DocumentUploadFieldProps) {
  const [file, setFile] = useState<UploadFile | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleChange = (event: ChangeEvent<InputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile);
    } else {
      setFile(null);
    }
  };

  return (
    <div 
      className="relative border-2 border-dashed border-white/20 rounded-xl p-6 text-center transition-all duration-300"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center justify-center">
        <svg className={`w-12 h-12 mb-3 transition-transform duration-300 ${isHovering ? 'scale-110' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <label className="font-semibold text-cyan-400">{label}</label>
        {file ? (
          <p className="text-sm text-green-400 mt-2">✓ {file.name} selected</p>
        ) : (
          <p className="text-sm text-white/50 mt-1">Click or drag file to upload</p>
        )}
      </div>
    </div>
  );
}

function AgreementStep({ onNext, onBack }: AgreementStepProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">✍️ Terms & Agreement</h2>
      
      <div className="bg-black/20 rounded-lg p-4 mb-6 max-h-60 overflow-y-auto border border-white/10">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">Azora OS User Agreement</h3>
        <div className="space-y-4 text-sm text-white/80">
          <p><strong>1. Platform Access:</strong> You agree to use Azora OS responsibly and in accordance with South African law.</p>
          <p><strong>2. Data Privacy:</strong> Your data is encrypted and stored securely. We will never sell your personal information.</p>
          <p><strong>3. Earning & Payments:</strong> For drivers and vendors, payments are processed weekly. Standard banking fees may apply.</p>
          <p><strong>4. Reputation System:</strong> Your reputation score is based on your activity. Good standing unlocks premium features.</p>
          <p><strong>5. Account Termination:</strong> You may terminate your account at any time. We reserve the right to suspend accounts that violate our terms.</p>
        </div>
      </div>
      
      <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 mb-8">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="h-5 w-5 rounded bg-white/10 border-white/30 text-cyan-500 focus:ring-cyan-500"
          />
          <span className="ml-3 text-sm">
            I have read and agree to the Azora OS Terms of Service and Privacy Policy.
          </span>
        </label>
      </div>
      
      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!accepted}
          className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
}

function CompletionStep({ userData, onComplete, loading }: CompletionStepProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
        className="text-7xl mb-6"
      >
        🎉
      </motion.div>
      <h1 className="text-4xl font-bold mb-4">Setup Complete!</h1>
      <p className="text-xl text-white/80 mb-8">
        Welcome aboard, {userData.fullName.split(' ')[0]}. Your Azora OS account is ready.
      </p>
      
      <div className="bg-black/20 border border-white/10 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold mb-4 text-cyan-400">Account Summary</h3>
        <ul className="space-y-3 text-sm">
          <li className="flex justify-between"><span>👤 Name:</span> <strong>{userData.fullName}</strong></li>
          <li className="flex justify-between"><span>✉️ Email:</span> <strong>{userData.email}</strong></li>
          <li className="flex justify-between"><span>🚀 Role:</span> <strong>{USER_TYPES.find(t => t.value === userData.userType)?.label}</strong></li>
          <li className="flex justify-between"><span>⭐ Reputation:</span> <strong>100 (Starting Score)</strong></li>
        </ul>
      </div>
      
      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg shadow-cyan-500/30 hover:scale-105 transition-transform disabled:opacity-50"
      >
        {loading ? 'Finalizing...' : 'Go to Your Dashboard 🚀'}
      </button>
      
      <p className="text-xs text-white/50 mt-6">
        The Sovereign Immune System | Built in South Africa 🇿🇦
      </p>
    </div>
  );
}
