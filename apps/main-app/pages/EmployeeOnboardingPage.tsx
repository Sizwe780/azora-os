import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { UploadCloud, FileText } from 'lucide-react';

import { ONBOARDING_STEPS, initialFormData, generateContractText, FormData } from '../features/employee-onboarding/mockData';
import OnboardingProgress from '../components/employee-onboarding/OnboardingProgress';
import OnboardingStepWrapper from '../components/employee-onboarding/OnboardingStepWrapper';
import { FormInput, FormSelect } from '../components/employee-onboarding/FormControls';
import SignaturePad from '../components/employee-onboarding/SignaturePad';
import CompletionStep from '../components/employee-onboarding/CompletionStep';
import Notification from '../components/employee-onboarding/Notification';

const EmployeeOnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNext = useCallback(() => {
    if (currentStep < ONBOARDING_STEPS.length) {
      setCurrentStep(currentStep + 1);
      showNotification(`${ONBOARDING_STEPS[currentStep - 1].name} step saved!`);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleReset = useCallback(() => {
    setCurrentStep(1);
    setFormData(initialFormData);
  }, []);

  const handleInputChange = (step: keyof FormData, field: string, value: any) => {
    setFormData(prev => {
      const stepData = prev[step];
      if (typeof stepData === 'object' && stepData !== null && !Array.isArray(stepData)) {
        return { ...prev, [step]: { ...stepData, [field]: value } };
      }
      // For non-object properties like 'signature'
      return { ...prev, [step]: value };
    });
  };

  const handleSignatureChange = (data: string | null) => {
    setFormData(prev => ({ ...prev, signature: data }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({ ...prev, documents: [...prev.documents, ...newFiles] }));
      showNotification(`${newFiles.length} document(s) uploaded.`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Personal Info
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="First Name" value={formData.personalInfo.firstName} onChange={e => handleInputChange('personalInfo', 'firstName', e.target.value)} />
            <FormInput label="Last Name" value={formData.personalInfo.lastName} onChange={e => handleInputChange('personalInfo', 'lastName', e.target.value)} />
            <FormInput label="ID Number" value={formData.personalInfo.idNumber} onChange={e => handleInputChange('personalInfo', 'idNumber', e.target.value)} />
            <FormInput label="Email Address" type="email" value={formData.personalInfo.email} onChange={e => handleInputChange('personalInfo', 'email', e.target.value)} />
            <FormInput label="Phone Number" type="tel" value={formData.personalInfo.phone} onChange={e => handleInputChange('personalInfo', 'phone', e.target.value)} />
            <div className="md:col-span-2">
              <FormInput label="Physical Address" value={formData.personalInfo.address} onChange={e => handleInputChange('personalInfo', 'address', e.target.value)} />
            </div>
          </div>
        );
      case 2: // Employment
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect label="Position" value={formData.employmentDetails.position} onChange={e => handleInputChange('employmentDetails', 'position', e.target.value)}>
              <option className="bg-gray-800">Driver</option>
              <option className="bg-gray-800">Operator</option>
              <option className="bg-gray-800">Admin</option>
            </FormSelect>
            <FormInput label="Department" value={formData.employmentDetails.department} onChange={e => handleInputChange('employmentDetails', 'department', e.target.value)} />
            <FormInput label="Start Date" type="date" value={formData.employmentDetails.startDate} onChange={e => handleInputChange('employmentDetails', 'startDate', e.target.value)} />
            <FormInput label="Monthly Salary (ZAR)" type="number" value={formData.employmentDetails.salary} onChange={e => handleInputChange('employmentDetails', 'salary', e.target.value)} />
          </div>
        );
      case 3: // Financials
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Bank Name" value={formData.bankTaxInfo.bankName} onChange={e => handleInputChange('bankTaxInfo', 'bankName', e.target.value)} />
            <FormInput label="Account Number" value={formData.bankTaxInfo.accountNumber} onChange={e => handleInputChange('bankTaxInfo', 'accountNumber', e.target.value)} />
            <FormInput label="Branch Code" value={formData.bankTaxInfo.branchCode} onChange={e => handleInputChange('bankTaxInfo', 'branchCode', e.target.value)} />
            <FormInput label="Tax Number (Optional)" value={formData.bankTaxInfo.taxNumber} onChange={e => handleInputChange('bankTaxInfo', 'taxNumber', e.target.value)} />
          </div>
        );
      case 4: // Emergency
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Contact Full Name" value={formData.emergencyContact.name} onChange={e => handleInputChange('emergencyContact', 'name', e.target.value)} />
            <FormInput label="Relationship" value={formData.emergencyContact.relationship} onChange={e => handleInputChange('emergencyContact', 'relationship', e.target.value)} />
            <FormInput label="Primary Phone" type="tel" value={formData.emergencyContact.phone} onChange={e => handleInputChange('emergencyContact', 'phone', e.target.value)} />
          </div>
        );
      case 5: // Documents
        return (
          <div>
            <label className="block w-full cursor-pointer">
              <div className="border-2 border-dashed border-gray-700/50 rounded-xl p-12 text-center hover:border-blue-500/50 transition-all bg-gray-900/30">
                <UploadCloud className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <p className="text-white font-semibold">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">ID, Driver's License, Proof of Address</p>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" />
              </div>
            </label>
            {formData.documents.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-white">Uploaded files:</h3>
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/60 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-gray-300 flex-1">{file.name}</span>
                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 6: // Contract
        return (
          <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700/30 max-h-[50vh] overflow-y-auto">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm">{generateContractText(formData)}</pre>
          </div>
        );
      case 7: // Signature
        return (
          <div>
            <p className="text-gray-400 mb-4">By signing below, you agree to the terms of the employment contract.</p>
            <SignaturePad onSign={handleSignatureChange} />
          </div>
        );
      case 8: // Complete
        return <CompletionStep firstName={formData.personalInfo.firstName} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>Employee Onboarding | Azora</title>
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-transparent">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">Employee Onboarding</h1>
          <p className="text-gray-400">A streamlined, paperless hiring process for the future of work.</p>
        </motion.div>

        <OnboardingProgress currentStep={currentStep} />

        <OnboardingStepWrapper
          currentStep={currentStep}
          handleNext={handleNext}
          handleBack={handleBack}
        >
          {renderStepContent()}
        </OnboardingStepWrapper>
        
        <Notification message={notification} onClose={() => setNotification(null)} />
      </div>
    </>
  );
};

export default EmployeeOnboardingPage;
