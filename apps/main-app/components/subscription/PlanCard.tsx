import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star } from 'lucide-react';
import { SubscriptionPlan } from '../../features/subscription/mockSubscription';

interface PlanCardProps {
  plan: SubscriptionPlan;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  const cardColorClasses = {
    gray: 'border-gray-700',
    cyan: 'border-cyan-500',
    purple: 'border-purple-500',
  };

  const buttonColorClasses = {
    gray: 'bg-gray-600 hover:bg-gray-500',
    cyan: 'bg-cyan-500 hover:bg-cyan-400',
    purple: 'bg-purple-600 hover:bg-purple-500',
  };

  const textColorClasses = {
    gray: 'text-gray-400',
    cyan: 'text-cyan-400',
    purple: 'text-purple-400',
  };

  return (
    <motion.div
      className={`relative flex flex-col bg-gray-900/50 border-2 ${cardColorClasses[plan.color as keyof typeof cardColorClasses]} rounded-2xl p-8 space-y-6 h-full`}
      whileHover={{ scale: 1.02, boxShadow: `0 0 20px var(--color-${plan.color})` }}
      style={{ '--color-cyan': '#22d3ee', '--color-purple': '#a855f7', '--color-gray': '#6b7280' } as React.CSSProperties}
    >
      {plan.isRecommended && (
        <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
          <Star size={16} />
          Recommended
        </div>
      )}
      
      <div className="flex-grow">
        <h3 className={`text-2xl font-bold ${textColorClasses[plan.color as keyof typeof textColorClasses]}`}>{plan.name}</h3>
        <p className="text-gray-400 mt-2">{plan.description}</p>
        
        <div className="my-6">
          <span className="text-5xl font-bold text-white">{plan.price === 'Custom' ? 'Custom' : `$${plan.price}`}</span>
          {plan.pricePeriod && <span className="text-gray-400">{plan.pricePeriod}</span>}
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              {feature.included ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="text-gray-300">{feature.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-6">
        <button className={`w-full py-3 rounded-lg font-semibold transition-colors ${buttonColorClasses[plan.color as keyof typeof buttonColorClasses]} ${plan.isCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {plan.isCurrent ? 'Current Plan' : plan.cta}
        </button>
      </div>
    </motion.div>
  );
};

export default PlanCard;
