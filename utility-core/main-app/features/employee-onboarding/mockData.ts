/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { User, Briefcase, Banknote, Phone, UploadCloud, FileText, Pen, CheckCircle } from 'lucide-react';

export const ONBOARDING_STEPS = [
  { id: 1, name: 'Personal Info', icon: User },
  { id: 2, name: 'Employment', icon: Briefcase },
  { id: 3, name: 'Financials', icon: Banknote },
  { id: 4, name: 'Emergency', icon: Phone },
  { id: 5, name: 'Documents', icon: UploadCloud },
  { id: 6, name: 'Contract', icon: FileText },
  { id: 7, name: 'Signature', icon: Pen },
  { id: 8, name: 'Complete', icon: CheckCircle },
];

export const initialFormData = {
  personalInfo: { firstName: '', lastName: '', idNumber: '', phone: '', email: '', address: '' },
  employmentDetails: { position: 'Driver', department: 'Operations', startDate: '', salary: '', employmentType: 'Full-time' },
  bankTaxInfo: { bankName: '', accountNumber: '', branchCode: '', taxNumber: '' },
  emergencyContact: { name: '', relationship: '', phone: '' },
  documents: [] as File[],
  signature: null as string | null,
};

export type FormData = typeof initialFormData;

export const generateContractText = (formData: FormData) => `
  EMPLOYMENT AGREEMENT
  ====================
  This agreement is made on ${new Date().toLocaleDateString('en-ZA')}.
  
  BETWEEN:
  Azora World (Pty) Ltd ("The Company")
  
  AND:
  ${formData.personalInfo.firstName || '[First Name]'} ${formData.personalInfo.lastName || '[Last Name]'} ("The Employee")
  
  1. POSITION: ${formData.employmentDetails.position}
  2. START DATE: ${formData.employmentDetails.startDate || 'Not specified'}
  3. REMUNERATION: ZAR ${formData.employmentDetails.salary || '0.00'} per month
  
  The Employee agrees to the terms and conditions of employment. This is a legally binding digital contract.
`;
