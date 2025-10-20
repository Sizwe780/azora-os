import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';

import { SubscriptionPlan, getMockSubscriptionData } from '../features/subscription/mockSubscription';
import PlanCard from '../components/subscription/PlanCard';

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    setPlans(getMockSubscriptionData());
  }, []);

  return (
    <motion.div 
      className="p-6 bg-gray-950 text-white min-h-full"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 mb-8">
          <CreditCard className="w-10 h-10 text-purple-400" />
          <div>
            <h1 className="text-4xl font-bold text-white">Subscription</h1>
            <p className="text-purple-300">Choose the plan that's right for you</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={itemVariants}
      >
        {plans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="mt-12 p-6 bg-gray-900/50 rounded-2xl border border-gray-800">
        <h3 className="text-xl font-bold text-cyan-300 mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4 text-gray-300">
          <div>
            <h4 className="font-semibold text-white">Can I change my plan later?</h4>
            <p>Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white">What is Quantum-Resistant Encryption?</h4>
            <p>It's an advanced security measure to protect your data against future threats from quantum computers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white">What does a Dedicated HR AI Deputy do?</h4>
            <p>It's a specialized AI assistant that provides expert-level HR support, compliance monitoring, and employee relations management, fully integrated into your workflow.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
