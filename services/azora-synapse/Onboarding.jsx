import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Onboarding = () => {
  const navigate = useNavigate()
  const { updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    pricing: 'individual',
    userType: 'driver',
    personalInfo: {
      phone: '',
      address: '',
      city: '',
      country: 'South Africa'
    },
    businessDetails: {
      companyName: '',
      industry: '',
      size: ''
    },
    documents: [],
    agreement: false
  })

  const steps = [
    { id: 'pricing', title: 'Choose Your Plan', description: 'Select the plan that fits your needs' },
    { id: 'welcome', title: 'Welcome to Azora', description: 'Your sovereign logistics journey begins' },
    { id: 'userType', title: 'User Type', description: 'Tell us about your role' },
    { id: 'personalInfo', title: 'Personal Information', description: 'Complete your profile' },
    { id: 'businessDetails', title: 'Business Details', description: 'Company information' },
    { id: 'documents', title: 'Document Upload', description: 'Upload required documents' },
    { id: 'agreement', title: 'Terms & Agreement', description: 'Review and accept terms' },
    { id: 'completion', title: 'Setup Complete', description: 'Welcome to Azora OS' }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete onboarding
      updateUser({ onboardingComplete: true })
      navigate('/dashboard')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'pricing':
        return <PricingStep formData={formData} setFormData={setFormData} />
      case 'welcome':
        return <WelcomeStep />
      case 'userType':
        return <UserTypeStep formData={formData} setFormData={setFormData} />
      case 'personalInfo':
        return <PersonalInfoStep formData={formData} setFormData={setFormData} />
      case 'businessDetails':
        return <BusinessDetailsStep formData={formData} setFormData={setFormData} />
      case 'documents':
        return <DocumentsStep formData={formData} setFormData={setFormData} />
      case 'agreement':
        return <AgreementStep formData={formData} setFormData={setFormData} />
      case 'completion':
        return <CompletionStep />
      default:
        return null
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {/* Progress Bar */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            {steps.map((step, index) => (
              <div
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flex: 1
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index <= currentStep ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: index <= currentStep ? 'white' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: index === currentStep ? 'var(--shadow-glow)' : 'none'
                }}>
                  {index < currentStep ? <Check size={16} /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    background: index < currentStep ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    margin: '0 16px'
                  }} />
                )}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
              {steps[currentStep].title}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          className="card"
          style={{ padding: '40px', marginBottom: '32px' }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="btn-secondary"
            style={{
              opacity: currentStep === 0 ? 0.5 : 1,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Step {currentStep + 1} of {steps.length}
          </div>

          <button
            onClick={handleNext}
            className="btn-primary"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            {currentStep !== steps.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// Step Components
const PricingStep = ({ formData, setFormData }) => {
  const plans = [
    { id: 'individual', name: 'Individual', price: 'R99', period: '/month' },
    { id: 'business-starter', name: 'Business Starter', price: 'R299', period: '/month' },
    { id: 'business-pro', name: 'Business Pro', price: 'R599', period: '/month' },
    { id: 'business-elite', name: 'Business Elite', price: 'R999', period: '/month' }
  ]

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
        Choose Your Subscription Plan
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => setFormData(prev => ({ ...prev, pricing: plan.id }))}
            className="card"
            style={{
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              border: formData.pricing === plan.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
              background: formData.pricing === plan.id ? 'var(--bg-glass)' : 'var(--bg-card)'
            }}
          >
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>{plan.name}</h4>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--accent-primary)' }}>
              {plan.price}<span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{plan.period}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const WelcomeStep = () => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '80px',
      height: '80px',
      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: 'var(--shadow-glow)'
    }}>
      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '32px' }}>A</span>
    </div>
    <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
      Welcome to Azora OS
    </h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
      Your sovereign operating system for autonomous logistics, defense, and AI orchestration. 
      Let's get you set up with the tools you need to transform your operations.
    </p>
  </div>
)

const UserTypeStep = ({ formData, setFormData }) => {
  const userTypes = [
    { id: 'driver', name: 'Driver', description: 'Individual driver or operator' },
    { id: 'vendor', name: 'Vendor', description: 'Service provider or supplier' },
    { id: 'partner', name: 'Partner', description: 'Business partner or affiliate' },
    { id: 'admin', name: 'Admin', description: 'System administrator' },
    { id: 'founder', name: 'Founder', description: 'Company founder or owner' }
  ]

  return (
    <div>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
        What best describes your role?
      </h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {userTypes.map((type) => (
          <div
            key={type.id}
            onClick={() => setFormData(prev => ({ ...prev, userType: type.id }))}
            className="card"
            style={{
              padding: '20px',
              cursor: 'pointer',
              border: formData.userType === type.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-primary)',
              background: formData.userType === type.id ? 'var(--bg-glass)' : 'var(--bg-card)'
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{type.name}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{type.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const PersonalInfoStep = ({ formData, setFormData }) => (
  <div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
      Personal Information
    </h3>
    <div style={{ display: 'grid', gap: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Phone Number
        </label>
        <input
          type="tel"
          value={formData.personalInfo.phone}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, phone: e.target.value }
          }))}
          className="input"
          placeholder="Enter your phone number"
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Address
        </label>
        <input
          type="text"
          value={formData.personalInfo.address}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            personalInfo: { ...prev.personalInfo, address: e.target.value }
          }))}
          className="input"
          placeholder="Enter your address"
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            City
          </label>
          <input
            type="text"
            value={formData.personalInfo.city}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, city: e.target.value }
            }))}
            className="input"
            placeholder="Enter your city"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
            Country
          </label>
          <select
            value={formData.personalInfo.country}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              personalInfo: { ...prev.personalInfo, country: e.target.value }
            }))}
            className="input"
          >
            <option value="South Africa">South Africa</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  </div>
)

const BusinessDetailsStep = ({ formData, setFormData }) => (
  <div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
      Business Information
    </h3>
    <div style={{ display: 'grid', gap: '20px' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Company Name
        </label>
        <input
          type="text"
          value={formData.businessDetails.companyName}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessDetails: { ...prev.businessDetails, companyName: e.target.value }
          }))}
          className="input"
          placeholder="Enter your company name"
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Industry
        </label>
        <select
          value={formData.businessDetails.industry}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessDetails: { ...prev.businessDetails, industry: e.target.value }
          }))}
          className="input"
        >
          <option value="">Select industry</option>
          <option value="logistics">Logistics & Transportation</option>
          <option value="retail">Retail</option>
          <option value="manufacturing">Manufacturing</option>
          <option value="technology">Technology</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
          Company Size
        </label>
        <select
          value={formData.businessDetails.size}
          onChange={(e) => setFormData(prev => ({
            ...prev,
            businessDetails: { ...prev.businessDetails, size: e.target.value }
          }))}
          className="input"
        >
          <option value="">Select company size</option>
          <option value="1-10">1-10 employees</option>
          <option value="11-50">11-50 employees</option>
          <option value="51-200">51-200 employees</option>
          <option value="200+">200+ employees</option>
        </select>
      </div>
    </div>
  </div>
)

const DocumentsStep = ({ formData, setFormData }) => (
  <div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
      Document Upload
    </h3>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        border: '2px dashed var(--border-primary)',
        borderRadius: '8px',
        padding: '40px',
        marginBottom: '20px'
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Upload required documents (ID, Business Registration, etc.)
        </p>
        <button className="btn-secondary">
          Choose Files
        </button>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
        Supported formats: PDF, JPG, PNG (Max 10MB each)
      </p>
    </div>
  </div>
)

const AgreementStep = ({ formData, setFormData }) => (
  <div>
    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px', textAlign: 'center' }}>
      Terms & Agreement
    </h3>
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-primary)',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '24px',
      maxHeight: '300px',
      overflow: 'auto'
    }}>
      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
        Azora OS Terms of Service
      </h4>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
        By using Azora OS, you agree to our terms of service and privacy policy. 
        This includes compliance with all applicable laws and regulations, 
        responsible use of our sovereign logistics platform, and adherence to 
        our security and data protection standards.
      </p>
    </div>
    <label style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      cursor: 'pointer'
    }}>
      <input
        type="checkbox"
        checked={formData.agreement}
        onChange={(e) => setFormData(prev => ({ ...prev, agreement: e.target.checked }))}
        style={{ width: '18px', height: '18px' }}
      />
      <span style={{ fontSize: '14px' }}>
        I agree to the Terms of Service and Privacy Policy
      </span>
    </label>
  </div>
)

const CompletionStep = () => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '80px',
      height: '80px',
      background: 'var(--success)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px'
    }}>
      <Check size={32} style={{ color: 'white' }} />
    </div>
    <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px' }}>
      Setup Complete!
    </h3>
    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: 1.6 }}>
      Welcome to Azora OS. Your sovereign logistics platform is ready. 
      You can now access all your services and begin orchestrating your operations.
    </p>
  </div>
)

export default Onboarding
