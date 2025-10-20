export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  pricePeriod: string;
  description: string;
  features: PlanFeature[];
  isCurrent?: boolean;
  isRecommended?: boolean;
  cta: string;
  color: string;
}

export const getMockSubscriptionData = (): SubscriptionPlan[] => [
  {
    id: 'starter',
    name: 'Starter',
    price: '0',
    pricePeriod: '/ month',
    description: 'For individuals and small teams getting started with Azora.',
    features: [
      { name: 'Core AI Features', included: true },
      { name: 'Basic Route Optimization', included: true },
      { name: '1GB Document Storage', included: true },
      { name: 'Community Support', included: true },
      { name: 'Quantum-Resistant Encryption', included: false },
      { name: 'Advanced Compliance Engine', included: false },
      { name: 'Dedicated HR AI Deputy', included: false },
    ],
    cta: 'Get Started',
    color: 'gray',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '99',
    pricePeriod: '/ user / month',
    description: 'For growing businesses that need more power and support.',
    features: [
      { name: 'Core AI Features', included: true },
      { name: 'Advanced Route Optimization', included: true },
      { name: '1TB Document Storage', included: true },
      { name: 'Priority Email Support', included: true },
      { name: 'Quantum-Resistant Encryption', included: true },
      { name: 'Advanced Compliance Engine', included: false },
      { name: 'Dedicated HR AI Deputy', included: false },
    ],
    isCurrent: true,
    cta: 'Manage Plan',
    color: 'cyan',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    pricePeriod: '',
    description: 'For large organizations requiring enterprise-grade features.',
    features: [
      { name: 'Core AI Features', included: true },
      { name: 'Advanced Route Optimization', included: true },
      { name: 'Unlimited Document Storage', included: true },
      { name: '24/7 Dedicated Support', included: true },
      { name: 'Quantum-Resistant Encryption', included: true },
      { name: 'Advanced Compliance Engine', included: true },
      { name: 'Dedicated HR AI Deputy', included: true },
    ],
    isRecommended: true,
    cta: 'Contact Sales',
    color: 'purple',
  },
];
