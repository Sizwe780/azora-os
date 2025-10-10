import React from 'react';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Upload, FileText, Pencil } from 'lucide-react';
const SignatureCanvas = require('react-signature-canvas').default;
import axios from 'axios';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, name: 'Personal Info', icon: '👤' },
  { id: 2, name: 'Employment Details', icon: '💼' },
  { id: 3, name: 'Bank & Tax', icon: '💳' },
  { id: 4, name: 'Emergency Contacts', icon: '📞' },
  { id: 5, name: 'Documents', icon: '📄' },
  { id: 6, name: 'Contract Preview', icon: '📋' },
  { id: 7, name: 'E-Signature', icon: '✍️' },
  { id: 8, name: 'Complete', icon: '🎉' }
];

export default function EmployeeOnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [flowId, setFlowId] = useState<string | null>(null);
  const signatureRef = useRef<typeof SignatureCanvas>(null);

  // Form state
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: ''
  });

  const [employmentDetails, setEmploymentDetails] = useState({
    position: 'Driver',
    department: 'Operations',
    startDate: '',
    salary: '',
    employmentType: 'Full-time'
  });

  const [bankTaxInfo, setBankTaxInfo] = useState({
    bankName: '',
    accountNumber: '',
    branchCode: '',
    taxNumber: ''
  });

  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    alternatePhone: ''
  });

  const [documents, setDocuments] = useState<File[]>([]);
  const [contract, setContract] = useState<string>('');

  const startOnboarding = async () => {
    try {
      const response = await axios.post('http://localhost:4086/api/onboarding/start', {
        employeeEmail: personalInfo.email,
        employeeName: `${personalInfo.firstName} ${personalInfo.lastName}`
      });
      setFlowId(response.data.flowId);
      toast.success('Onboarding started!');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      // Demo mode
      setFlowId(`flow-${Date.now()}`);
      toast.success('Onboarding started! (Demo Mode)');
    }
  };

  const saveStep = async (stepData: any, stepName: string) => {
    if (!flowId) {
      await startOnboarding();
    }

    try {
      await axios.post(`http://localhost:4086/api/onboarding/${flowId}/step`, {
        step: stepName,
        data: stepData
      });
      toast.success('Step saved!');
    } catch (error) {
      console.error('Failed to save step:', error);
    }
  };

  const handleNext = async () => {
    // Save current step data
    switch (currentStep) {
      case 1:
        await saveStep(personalInfo, 'personalInfo');
        break;
      case 2:
        await saveStep(employmentDetails, 'employmentDetails');
        break;
      case 3:
        await saveStep(bankTaxInfo, 'bankTax');
        break;
      case 4:
        await saveStep(emergencyContact, 'emergencyContact');
        break;
      case 6:
        // Generate contract
        generateContract();
        break;
      case 7:
        // Save signature
        await saveSignature();
        break;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateContract = async () => {
    try {
      const response = await axios.post(`http://localhost:4086/api/onboarding/${flowId}/contract/generate`, {
        employeeName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        position: employmentDetails.position,
        startDate: employmentDetails.startDate,
        salary: employmentDetails.salary
      });
      setContract(response.data.contractText);
    } catch (error) {
      // Demo contract
      setContract(`
EMPLOYMENT CONTRACT

Between: Azora World (Pty) Ltd ("Employer")
And: ${personalInfo.firstName} ${personalInfo.lastName} ("Employee")

1. POSITION: ${employmentDetails.position}
2. START DATE: ${employmentDetails.startDate}
3. SALARY: R${employmentDetails.salary} per month
4. EMPLOYMENT TYPE: ${employmentDetails.employmentType}

This contract is governed by the laws of South Africa.

Employee accepts all terms and conditions.
      `);
    }
  };

  const saveSignature = async () => {
    if (!signatureRef.current) return;

    const signatureData = signatureRef.current.toDataURL();
    
    try {
      await axios.post(`http://localhost:4086/api/onboarding/${flowId}/signature`, {
        signatureData,
        signedAt: new Date().toISOString()
      });
      toast.success('Signature saved! Onboarding complete!');
    } catch (error) {
      toast.error('Failed to save signature');
    }
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDocuments([...documents, ...Array.from(e.target.files)]);
      toast.success(`${e.target.files.length} file(s) added`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">Employee Onboarding</h1>
        <p className="text-purple-200">Hire to Road in Hours - No Paperwork Hassle</p>
      </motion.div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                    currentStep === step.id
                      ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                      : currentStep > step.id
                      ? 'bg-green-500'
                      : 'bg-white/10'
                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6 text-white" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </motion.div>
                <p className="text-xs text-white/70 mt-2 text-center max-w-[80px]">{step.name}</p>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    currentStep > step.id ? 'bg-green-500' : 'bg-white/10'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-center text-white/70">
          Step {currentStep} of {STEPS.length}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-xl p-8 max-w-4xl mx-auto"
      >
        {/* Step 1: Personal Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={personalInfo.firstName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={personalInfo.lastName}
                onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="ID Number"
                value={personalInfo.idNumber}
                onChange={(e) => setPersonalInfo({ ...personalInfo, idNumber: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="date"
                placeholder="Date of Birth"
                value={personalInfo.dateOfBirth}
                onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={personalInfo.phone}
                onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <textarea
              placeholder="Physical Address"
              value={personalInfo.address}
              onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}

        {/* Step 2: Employment Details */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Employment Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <select
                value={employmentDetails.position}
                onChange={(e) => setEmploymentDetails({ ...employmentDetails, position: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="Driver" className="bg-slate-800">Driver</option>
                <option value="Fleet Manager" className="bg-slate-800">Fleet Manager</option>
                <option value="Compliance Officer" className="bg-slate-800">Compliance Officer</option>
                <option value="Dispatcher" className="bg-slate-800">Dispatcher</option>
              </select>
              <input
                type="text"
                placeholder="Department"
                value={employmentDetails.department}
                onChange={(e) => setEmploymentDetails({ ...employmentDetails, department: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="date"
                placeholder="Start Date"
                value={employmentDetails.startDate}
                onChange={(e) => setEmploymentDetails({ ...employmentDetails, startDate: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                placeholder="Monthly Salary (R)"
                value={employmentDetails.salary}
                onChange={(e) => setEmploymentDetails({ ...employmentDetails, salary: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={employmentDetails.employmentType}
                onChange={(e) => setEmploymentDetails({ ...employmentDetails, employmentType: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 col-span-2"
              >
                <option value="Full-time" className="bg-slate-800">Full-time</option>
                <option value="Part-time" className="bg-slate-800">Part-time</option>
                <option value="Contract" className="bg-slate-800">Contract</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Bank & Tax */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Bank & Tax Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Bank Name"
                value={bankTaxInfo.bankName}
                onChange={(e) => setBankTaxInfo({ ...bankTaxInfo, bankName: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Account Number"
                value={bankTaxInfo.accountNumber}
                onChange={(e) => setBankTaxInfo({ ...bankTaxInfo, accountNumber: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Branch Code"
                value={bankTaxInfo.branchCode}
                onChange={(e) => setBankTaxInfo({ ...bankTaxInfo, branchCode: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Tax Number"
                value={bankTaxInfo.taxNumber}
                onChange={(e) => setBankTaxInfo({ ...bankTaxInfo, taxNumber: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Step 4: Emergency Contacts */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Emergency Contact</h2>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Contact Name"
                value={emergencyContact.name}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Relationship"
                value={emergencyContact.relationship}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="tel"
                placeholder="Primary Phone"
                value={emergencyContact.phone}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="tel"
                placeholder="Alternate Phone"
                value={emergencyContact.alternatePhone}
                onChange={(e) => setEmergencyContact({ ...emergencyContact, alternatePhone: e.target.value })}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        )}

        {/* Step 5: Documents */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Upload Documents</h2>
            <label className="block">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-12 text-center hover:border-purple-500 cursor-pointer transition-all">
                <Upload className="w-16 h-16 text-white/50 mx-auto mb-4" />
                <p className="text-white mb-2">Drag & drop files here or click to browse</p>
                <p className="text-white/50 text-sm">ID, Driver's License, Certificates, etc.</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </label>
            {documents.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Uploaded Files:</h3>
                {documents.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="text-white flex-1">{file.name}</span>
                    <span className="text-white/50 text-sm">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 6: Contract Preview */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Contract Preview</h2>
            <div className="bg-white/5 p-6 rounded-lg max-h-96 overflow-y-auto">
              <pre className="text-white whitespace-pre-wrap font-mono text-sm">{contract}</pre>
            </div>
            <p className="text-white/70 text-sm">
              Please review the contract carefully. Click Next to proceed to e-signature.
            </p>
          </div>
        )}

        {/* Step 7: E-Signature */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">Electronic Signature</h2>
            <p className="text-white/70 mb-4">
              Please sign below to acknowledge you have read and accept the terms of employment.
            </p>
            <div className="bg-white rounded-lg p-2">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  className: 'w-full h-64 border-2 border-purple-500 rounded'
                }}
              />
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={clearSignature}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
              >
                Clear Signature
              </button>
              <p className="text-white/50 text-sm">
                Legally binding signature - {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {/* Step 8: Complete */}
        {currentStep === 8 && (
          <div className="text-center space-y-6 py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="w-32 h-32 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-3xl font-bold text-white">Onboarding Complete!</h2>
            <p className="text-white/70 text-lg">
              Welcome to Azora World! Your account has been created and you can now access the system.
            </p>
            <div className="space-y-2">
              <p className="text-white">
                Email: <span className="text-purple-400">{personalInfo.email}</span>
              </p>
              <p className="text-white">
                Role: <span className="text-purple-400">{employmentDetails.position}</span>
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-lg font-semibold transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 8 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-all"
            >
              {currentStep === 7 ? 'Complete Onboarding' : 'Next'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
