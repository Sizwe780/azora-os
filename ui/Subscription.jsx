import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Star, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Subscription = () => {
  const { user, updateUser } = useAuth()
  const [currency, setCurrency] = useState('ZAR')
  const [billingCycle, setBillingCycle] = useState('monthly')

  const plans = [
    {
      id: 'individual',
      name: 'Individual',
      description: 'Perfect for individual drivers and operators',
      price: { ZAR: 99, USD: 6 },
      icon: <Zap size={24} />,
      color: 'var(--accent-primary)',
      features: [
        'Basic trip planning',
        'Document storage',
        'Compliance tracking',
        'Mobile app access',
        'Email support'
      ]
    },
    {
      id: 'business-starter',
      name: 'Business Starter',
      description: 'Great for small businesses and startups',
      price: { ZAR: 299, USD: 18 },
      icon: <Star size={24} />,
      color: 'var(--success)',
      features: [
        'Everything in Individual',
        'Fleet management (up to 10 vehicles)',
        'Advanced analytics',
        'API access',
        'Priority support',
        'Custom branding'
      ]
    },
    {
      id: 'business-pro',
      name: 'Business Pro',
      description: 'Advanced features for growing businesses',
      price: { ZAR: 599, USD: 36 },
      icon: <Crown size={24} />,
      color: 'var(--warning)',
      popular: true,
      features: [
        'Everything in Business Starter',
        'Unlimited fleet management',
        'AI-powered optimization',
        'Advanced compliance tools',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee'
      ]
    },
    {
      id: 'business-elite',
      name: 'Business Elite',
      description: 'Complete solution for large enterprises',
      price: { ZAR: 999, USD: 60 },
      icon: <Crown size={24} />,
      color: 'var(--accent-secondary)',
      features: [
        'Everything in Business Pro',
        'White-label solution',
        'Custom AI models',
        'Blockchain attestation',
        'Multi-region deployment',
        'On-premise options',
        '24/7 phone support'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Tailored solutions for large organizations',
      price: { ZAR: 'Custom', USD: 'Custom' },
      icon: <Star size={24} />,
      color: 'var(--text-primary)',
      features: [
        'Everything in Business Elite',
        'Custom development',
        'Dedicated infrastructure',
        'Compliance certification',
        'Training and onboarding',
        'Strategic consulting',
        'Custom SLA'
      ]
    }
  ]

  const handleUpgrade = (planId) => {
    updateUser({ subscription: planId })
    // Mock payment process
    alert(`Upgraded to ${plans.find(p => p.id === planId)?.name} plan!`)
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: '48px' }}
      >
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: '700', 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Choose Your Azora Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
          Unlock the full power of sovereign logistics with our flexible subscription plans
        </p>
      </motion.div>

      {/* Promo Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card glow"
        style={{
          padding: '24px',
          marginBottom: '40px',
          background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
          border: 'none',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
          Limited Time Offer
        </h3>
        <p style={{ opacity: 0.9, fontSize: '16px' }}>
          First month free, 50% off next 2 months on all plans
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '32px',
          marginBottom: '40px'
        }}
      >
        {/* Currency Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Currency:</span>
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            {['ZAR', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                style={{
                  background: currency === curr ? 'var(--accent-primary)' : 'transparent',
                  color: currency === curr ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Billing:</span>
          <div style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderRadius: '8px',
            padding: '4px'
          }}>
            {[
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly', badge: '20% off' }
            ].map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => setBillingCycle(cycle.id)}
                style={{
                  background: billingCycle === cycle.id ? 'var(--accent-primary)' : 'transparent',
                  color: billingCycle === cycle.id ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  position: 'relative'
                }}
              >
                {cycle.label}
                {cycle.badge && billingCycle !== cycle.id && (
                  <span style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: 'var(--success)',
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {cycle.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}
      >
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="card"
            style={{
              padding: '32px',
              position: 'relative',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid var(--border-primary)',
              background: plan.popular ? 'var(--bg-glass)' : 'var(--bg-card)',
              transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
              boxShadow: plan.popular ? 'var(--shadow-glow)' : 'var(--shadow-card)'
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: plan.color,
                color: 'white',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                Most Popular
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                background: plan.color,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'white'
              }}>
                {plan.icon}
              </div>
              
              <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {plan.name}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                {plan.description}
              </p>
              
              <div style={{ fontSize: '36px', fontWeight: '700', color: plan.color }}>
                {typeof plan.price[currency] === 'number' ? (
                  <>
                    {currency === 'ZAR' ? 'R' : '$'}{plan.price[currency]}
                    <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
                      /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </span>
                  </>
                ) : (
                  plan.price[currency]
                )}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              {plan.features.map((feature, featureIndex) => (
                <div
                  key={featureIndex}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <Check size={16} style={{ color: 'var(--success)' }} />
                  <span style={{ fontSize: '14px' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleUpgrade(plan.id)}
              className={user?.subscription === plan.id ? 'btn-secondary' : 'btn-primary'}
              disabled={user?.subscription === plan.id}
              style={{
                width: '100%',
                justifyContent: 'center',
                background: user?.subscription === plan.id ? 'var(--bg-tertiary)' : undefined
              }}
            >
              {user?.subscription === plan.id ? (
                'Current Plan'
              ) : (
                <>
                  {plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ textAlign: 'center' }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
          Have questions? We're here to help.
        </p>
        
        <div style={{ display: 'grid', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
          {[
            {
              question: 'Can I change my plan anytime?',
              answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'We accept all major credit cards, bank transfers, and cryptocurrency payments.'
            },
            {
              question: 'Is there a free trial?',
              answer: 'Yes, all plans come with a free first month and 50% off the next 2 months.'
            },
            {
              question: 'Do you offer refunds?',
              answer: 'We offer a 30-day money-back guarantee on all plans.'
            }
          ].map((faq, index) => (
            <div key={index} className="card" style={{ padding: '20px', textAlign: 'left' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {faq.question}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

export default Subscription
