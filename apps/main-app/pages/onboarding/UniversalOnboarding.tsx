import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressIndicator from '../../components/ProgressIndicator'
import NavigationButtons from '../../components/NavigationButtons'

import PricingStep from '../../components/steps/PricingStep'
import WelcomeStep from '../../components/steps/WelcomeStep'
import RepresentationStep from '../../components/steps/RepresentationStep'
import PersonalInfoStep from '../../components/steps/PersonalInfoStep'
import BusinessDetailsStep from '../../components/steps/BusinessDetailsStep'
import DocumentsStep from '../../components/steps/DocumentsStep'
import AgreementStep from '../../components/steps/AgreementStep'
import CompletionStep from '../../components/steps/CompletionStep'


const STEPS = [
  { id: 'pricing', title: 'Pricing', component: PricingStep },
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'representation', title: 'User Type', component: RepresentationStep },
  { id: 'personal', title: 'Personal Info', component: PersonalInfoStep },
  { id: 'business', title: 'Business Details', component: BusinessDetailsStep },
  { id: 'documents', title: 'Documents', component: DocumentsStep },
  { id: 'agreement', title: 'Agreement', component: AgreementStep },
  { id: 'completion', title: 'Complete', component: CompletionStep }
]

export default function UniversalOnboarding() {
  const [currentStep, setCurrentStep] = useState(0)
  const [onboardingId, setOnboardingId] = useState<string | null>(null)
  const [userData, setUserData] = useState({
    userType: '',
    personalInfo: { fullName: '', email: '', phone: '' },
    businessDetails: { businessName: '', location: '', businessType: '' },
    documents: [],
    agreementAccepted: false
  })

  useEffect(() => {
    const initiateOnboarding = async () => {
      try {
        const res = await fetch('/api/onboarding/universal/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ timestamp: new Date().toISOString() })
        })
        const data = await res.json()
        setOnboardingId(data.onboarding.id)
      } catch {
        setOnboardingId(`offline-${Date.now()}`)
      }
    }
    initiateOnboarding()
  }, [])

  const shouldShowBusinessDetails = () => {
    return ['company', 'store-staff', 'vendor', 'partner'].includes(userData.userType)
  }

  const visibleSteps = shouldShowBusinessDetails()
    ? STEPS
    : STEPS.filter(step => step.id !== 'business')

  const currentStepData = visibleSteps[currentStep]
  const CurrentStepComponent = currentStepData.component

  const updateStep = async (stepId: string) => {
    if (!onboardingId || onboardingId.startsWith('offline')) return
    let payload: any = {}

    switch (stepId) {
      case 'representation':
        payload = { userType: userData.userType }
        break
      case 'personal':
        payload = { ...userData.personalInfo }
        break
      case 'business':
        payload = { ...userData.businessDetails }
        break
      case 'agreement':
        payload = { accepted: userData.agreementAccepted }
        break
      default:
        payload = { userData }
    }

    await fetch(`/api/onboarding/${onboardingId}/step/${stepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  }

  const nextStep = async () => {
    await updateStep(currentStepData.id)
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'representation':
        return userData.userType !== ''
      case 'personal':
        const { fullName, email, phone } = userData.personalInfo
        return fullName.trim() && email.includes('@') && phone.trim().length >= 10
      case 'business':
        const { businessName, location } = userData.businessDetails
        return businessName.trim() && location.trim()
      case 'agreement':
        return userData.agreementAccepted
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col">
      <ProgressIndicator steps={visibleSteps} currentStep={currentStep} />

      <div className="flex-1 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl"
          >
            <CurrentStepComponent
              userData={userData}
              setUserData={setUserData}
              nextStep={nextStep}
              prevStep={prevStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {currentStepData.id !== 'completion' && (
        <NavigationButtons
          currentStep={currentStep}
          totalSteps={visibleSteps.length}
          onNext={nextStep}
          onPrev={prevStep}
          canProceed={canProceed()}
        />
      )}
    </div>
  )
}
