import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

const Onboarding = () => {
  const [step, setStep] = useState(1)
  const [preferences, setPreferences] = useState({
    industry: '',
    companySize: '',
    useCase: '',
    features: []
  })
  const { user } = useAuth()
  const navigate = useNavigate()

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing',
    'Transportation', 'Education', 'Government', 'Non-profit', 'Other'
  ]

  const companySizes = [
    '1-10 employees', '11-50 employees', '51-200 employees',
    '201-1000 employees', '1000+ employees'
  ]

  const useCases = [
    'AI Automation', 'Data Analytics', 'Customer Service', 'Operations',
    'Compliance', 'Security', 'Supply Chain', 'HR Management'
  ]

  const features = [
    'AI Agents', 'Analytics Dashboard', 'API Integration', 'Real-time Monitoring',
    'Automated Reporting', 'Custom Workflows', 'Multi-tenant Support', 'Mobile Access'
  ]

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Complete onboarding
      const updatedUser = { ...user, onboardingComplete: true }
      localStorage.setItem('azora-user', JSON.stringify(updatedUser))
      navigate('/dashboard')
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleFeatureToggle = (feature) => {
    setPreferences(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Azora OS</h2>
              <p className="text-muted-foreground">Let's set up your sovereign operating system</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">What industry are you in?</h3>
              <div className="grid grid-cols-2 gap-3">
                {industries.map((industry) => (
                  <button
                    key={industry}
                    onClick={() => handlePreferenceChange('industry', industry)}
                    className={`p-3 border border-border rounded-lg text-left hover:bg-accent transition-colors ${
                      preferences.industry === industry ? 'bg-primary text-primary-foreground' : 'bg-card'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Company Size</h2>
              <p className="text-muted-foreground">How many people work at your organization?</p>
            </div>
            <div className="space-y-4">
              {companySizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handlePreferenceChange('companySize', size)}
                  className={`w-full p-4 border border-border rounded-lg text-left hover:bg-accent transition-colors ${
                    preferences.companySize === size ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Primary Use Case</h2>
              <p className="text-muted-foreground">What will you use Azora OS for?</p>
            </div>
            <div className="space-y-4">
              {useCases.map((useCase) => (
                <button
                  key={useCase}
                  onClick={() => handlePreferenceChange('useCase', useCase)}
                  className={`w-full p-4 border border-border rounded-lg text-left hover:bg-accent transition-colors ${
                    preferences.useCase === useCase ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {useCase}
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Key Features</h2>
              <p className="text-muted-foreground">Which features are most important to you?</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature) => (
                <button
                  key={feature}
                  onClick={() => handleFeatureToggle(feature)}
                  className={`p-3 border border-border rounded-lg text-left hover:bg-accent transition-colors ${
                    preferences.features.includes(feature) ? 'bg-primary text-primary-foreground' : 'bg-card'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-lg p-8"
      >
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {stepNum}
              </div>
            ))}
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {renderStep()}

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 border border-border rounded-md hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            {step === 4 ? 'Complete Setup' : 'Next'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Onboarding