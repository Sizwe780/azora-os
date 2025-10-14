import React from 'react'
import { motion } from 'framer-motion'

const PricingStep = ({ nextStep }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      features: ['Basic onboarding', 'Email support', 'Standard templates', '5 team members'],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      features: ['Advanced onboarding', 'Priority support', 'Custom templates', '25 team members', 'Analytics dashboard'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      features: ['Full customization', '24/7 support', 'Unlimited templates', 'Unlimited team members', 'Advanced analytics', 'API access'],
      popular: false
    }
  ]

  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: '48px',
          fontWeight: 'bold',
          marginBottom: '16px',
          background: 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Choose Your Plan
      </motion.h1>
      
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '60px'
        }}
      >
        Select the perfect plan for your onboarding needs
      </motion.p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={nextStep}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              padding: '40px 30px',
              cursor: 'pointer',
              position: 'relative',
              border: plan.popular ? '2px solid #22c55e' : '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: plan.popular 
                ? '0 0 40px rgba(34, 197, 94, 0.3)' 
                : '0 0 20px rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: plan.popular 
                ? '0 0 50px rgba(34, 197, 94, 0.5)' 
                : '0 0 30px rgba(139, 92, 246, 0.3)'
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(45deg, #22c55e, #16a34a)',
                color: '#ffffff',
                padding: '6px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Most Popular
              </div>
            )}
            
            <h3 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#ffffff'
            }}>
              {plan.name}
            </h3>
            
            <div style={{ marginBottom: '30px' }}>
              <span style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: plan.popular ? '#22c55e' : '#8b5cf6'
              }}>
                {plan.price}
              </span>
              <span style={{
                fontSize: '18px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
                {plan.period}
              </span>
            </div>
            
            <ul style={{
              listStyle: 'none',
              textAlign: 'left',
              marginBottom: '30px'
            }}>
              {plan.features.map((feature, idx) => (
                <li key={idx} style={{
                  padding: '8px 0',
                  color: 'rgba(255, 255, 255, 0.8)',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{
                    color: '#22c55e',
                    marginRight: '10px',
                    fontSize: '18px'
                  }}>
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            
            <button style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: plan.popular 
                ? 'linear-gradient(45deg, #22c55e, #16a34a)' 
                : 'rgba(139, 92, 246, 0.2)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default PricingStep
