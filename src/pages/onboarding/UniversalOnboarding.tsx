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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌍 Azora OS</h1>
          <p className="text-white/70">Africa&apos;s First Self-Improving Autonomous Platform</p>
        </div>

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
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                    currentStep >= step.id
                      ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                {idx < steps.length - 1 && (
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
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">
        👋 Welcome to Azora OS!
      </h1>
      <p className="text-xl mb-6">
        Join Africa&apos;s first self-improving autonomous platform. Whether you&apos;re a customer,
        driver, store staff, vendor, or business partner - we&apos;re excited to have you!
      </p>
      
      {inviteCode && (
        <div className="bg-green-900/30 rounded-xl p-4 mb-6">
          <p className="text-sm">✓ Invite Code: <strong>{inviteCode}</strong></p>
        </div>
      )}
      
      <div className="bg-purple-900/30 rounded-xl p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">What You&apos;ll Get:</h2>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🚀</span>
            <div>
              <p className="font-semibold">Instant Access</p>
              <p className="text-sm text-gray-300">Get started immediately after onboarding</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="font-semibold">Earnings & Rewards</p>
              <p className="text-sm text-gray-300">Earn reputation points and unlock benefits</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🤖</span>
            <div>
              <p className="font-semibold">AI-Powered Platform</p>
              <p className="text-sm text-gray-300">Smart routing, predictions, and automation</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <span className="text-2xl mr-3">🇿🇦</span>
            <div>
              <p className="font-semibold">Built for Africa</p>
              <p className="text-sm text-gray-300">Designed for South African businesses</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/30 rounded-xl p-6 mb-8">
        <p className="text-sm">
          <strong>This process takes about 5-10 minutes.</strong> We&apos;ll collect some basic
          information to set up your account and get you started.
        </p>
      </div>
      
      <button
        onClick={onNext}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:scale-105 transition"
      >
        Let&apos;s Get Started! 🚀
      </button>
    </div>
  );
}

function UserTypeStep({ userData, setUserData, onNext, onBack }: UserTypeStepProps) {
  const [selected, setSelected] = useState<OnboardingData['userType']>(userData.userType);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">👤 Select Your Role</h2>
      <p className="text-white/70 mb-6">How do you plan to use Azora OS?</p>
      
      <div className="space-y-3 mb-8">
        {USER_TYPES.map((type) => (
          <button
            key={type.value}
            onClick={() => {
              setSelected(type.value);
              setUserData({ ...userData, userType: type.value });
            }}
            className={`w-full text-left p-4 rounded-lg border-2 transition ${
              selected === type.value
                ? 'border-green-400 bg-green-900/30'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            <div className="flex items-center">
              <span className="text-3xl mr-4">{type.label.split(' ')[0]}</span>
              <div>
                <p className="font-semibold text-lg">{type.label.substring(3)}</p>
                <p className="text-sm text-white/70">{type.description}</p>
              </div>
              {selected === type.value && (
                <span className="ml-auto text-2xl">✓</span>
              )}
            </div>
          </button>
        ))}
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
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function PersonalInfoStep({ userData, setUserData, onNext, onBack }: PersonalInfoStepProps) {
  const isValid = useMemo(() => {
    return userData.fullName.length > 2 && 
           userData.email.includes('@') && 
           userData.phone.length >= 10;
  }, [userData.fullName, userData.email, userData.phone]);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">📝 Personal Information</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name *</label>
          <input
            type="text"
            value={userData.fullName}
            onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
            placeholder="Enter your full legal name"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Email Address *</label>
          <input
            type="email"
            value={userData.email}
            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
            placeholder="your.email@example.com"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
          />
          <p className="text-xs text-white/50 mt-1">Any email works - no restrictions</p>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number *</label>
          <input
            type="tel"
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
            placeholder="+27 XX XXX XXXX"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
          />
        </div>
        
        {(userData.userType === 'driver' || userData.userType === 'store_staff') && (
          <div>
            <label className="block text-sm font-semibold mb-2">ID Number</label>
            <input
              type="text"
              value={userData.idNumber || ''}
              onChange={(e) => setUserData({ ...userData, idNumber: e.target.value })}
              placeholder="e.g., 9501015800083"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
            />
          </div>
        )}
        
        {userData.userType === 'driver' && (
          <div>
            <label className="block text-sm font-semibold mb-2">Driver&apos;s License Number</label>
            <input
              type="text"
              value={userData.driverLicense || ''}
              onChange={(e) => setUserData({ ...userData, driverLicense: e.target.value })}
              placeholder="License number"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
            />
          </div>
        )}
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
          disabled={!isValid}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
    // Skip for customers and drivers
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">🏢 Business Details</h2>
        <p className="mb-6">This step is not required for your role.</p>
        <button
          onClick={onSkip}
          className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-lg hover:scale-105 transition"
        >
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">🏢 Business Details</h2>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-semibold mb-2">
            {userData.userType === 'store_staff' ? 'Store Name' : 'Business Name'}
          </label>
          <input
            type="text"
            value={userData.businessName || ''}
            onChange={(e) => setUserData({ ...userData, businessName: e.target.value })}
            placeholder="e.g., My Store Name or Any Business Name"
            className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
          />
          <p className="text-xs text-white/50 mt-1">Any store name works - no restrictions!</p>
        </div>
        
        {userData.userType === 'store_staff' && (
          <div>
            <label className="block text-sm font-semibold mb-2">Store Location</label>
            <input
              type="text"
              value={userData.storeLocation || ''}
              onChange={(e) => setUserData({ ...userData, storeLocation: e.target.value })}
              placeholder="e.g., Johannesburg CBD, Sandton City, Cape Town V&A"
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40"
            />
          </div>
        )}
        
        <div className="bg-blue-900/30 rounded-lg p-4">
          <p className="text-sm">
            💡 <strong>Note:</strong> You can work with ANY store or business. 
            No need to wait for approval - just enter your details and get started!
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
          onClick={onNext}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition"
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

  const handleChange = (event: ChangeEvent<InputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile) {
      setFile(selectedFile);
      onChange(selectedFile);
      return;
    }

    setFile(null);
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

function AgreementStep({ onNext, onBack }: AgreementStepProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
      <h2 className="text-3xl font-bold mb-6">✍️ Terms & Agreement</h2>
      
      <div className="bg-white/5 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Azora OS User Agreement</h3>
        
        <div className="space-y-4 text-sm">
          <section>
            <h4 className="font-semibold mb-2">1. Platform Access</h4>
            <p>By using Azora OS, you agree to use the platform responsibly and in accordance
            with South African law.</p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">2. Data Privacy</h4>
            <p>We respect your privacy. Your data is encrypted and stored securely. We will
            never sell your personal information to third parties.</p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">3. Earning & Payments</h4>
            <p>For drivers and vendors: Payments are processed weekly. Standard banking fees apply.
            Minimum payout is R100.</p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">4. Reputation System</h4>
            <p>Your reputation score is based on your activity and performance. Maintain good
            standing to unlock premium features.</p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">5. Account Termination</h4>
            <p>You may terminate your account at any time. We reserve the right to suspend
            accounts that violate our terms.</p>
          </section>
          
          <section>
            <h4 className="font-semibold mb-2">6. Changes to Terms</h4>
            <p>We may update these terms. Continued use of the platform constitutes acceptance
            of updated terms.</p>
          </section>
        </div>
      </div>
      
      <div className="bg-yellow-900/30 rounded-lg p-4 mb-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 mr-3"
          />
          <span className="text-sm">
            I have read and agree to the Azora OS Terms of Service, Privacy Policy, and
            User Agreement. I understand that I can use the platform with any email address
            or business name.
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
          disabled={!accepted}
          className="flex-1 bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Accept & Continue
        </button>
      </div>
    </div>
  );
}

function CompletionStep({ userData, onComplete, loading }: CompletionStepProps) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white text-center">
      <div className="text-6xl mb-6">🎉</div>
      <h1 className="text-4xl font-bold mb-4">Welcome to Azora OS!</h1>
      <p className="text-xl mb-8">
        Your account is ready. Let&apos;s get started!
      </p>
      
      <div className="bg-green-900/30 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold mb-4">✅ Account Created:</h3>
        <ul className="space-y-2">
          <li>✓ Name: {userData.fullName}</li>
          <li>✓ Email: {userData.email}</li>
          <li>✓ Role: {USER_TYPES.find(t => t.value === userData.userType)?.label}</li>
          {userData.businessName && <li>✓ Business: {userData.businessName}</li>}
          {userData.storeLocation && <li>✓ Location: {userData.storeLocation}</li>}
          <li>✓ Reputation: 100 (Starting score)</li>
        </ul>
      </div>
      
      <div className="bg-blue-900/30 rounded-xl p-6 mb-8 text-left">
        <h3 className="text-xl font-semibold mb-4">🚀 Next Steps:</h3>
        <ul className="space-y-2">
          <li>• Explore your dashboard</li>
          <li>• Complete your profile (optional)</li>
          <li>• Start using the platform</li>
          <li>• Earn reputation points</li>
        </ul>
      </div>
      
      <button
        onClick={onComplete}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:scale-105 transition disabled:opacity-50"
      >
  {loading ? 'Setting up your account...' : 'Go to Dashboard 🚀'}
      </button>
      
      <p className="text-sm text-gray-400 mt-6">
        Built with ❤️ in South Africa 🇿🇦 | Powered by Azora OS
      </p>
    </div>
  );
}
