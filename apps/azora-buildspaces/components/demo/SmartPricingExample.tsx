import React, { useState } from 'react';
const SmartPricing = (props: any) => <div>SmartPricing Placeholder</div>;
import { Button } from '@/components/ui/button';

export const SmartPricingExample: React.FC = () => {
  const [userProfile, setUserProfile] = useState({
    isStudent: false,
    fundContribution: 0,
    teamSize: 1,
    billingCycle: 'monthly' as 'monthly' | 'annual'
  });

  const handlePlanSelect = (tierId: string) => {
    console.log('Selected plan:', tierId);
    // Handle plan selection logic here
  };

  const updateProfile = (updates: Partial<typeof userProfile>) => {
    setUserProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-8">
      {/* Profile Settings */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Your Profile (for discount calculation)</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Student Status</label>
            <Button
              variant={userProfile.isStudent ? "default" : "outline"}
              onClick={() => updateProfile({ isStudent: !userProfile.isStudent })}
              size="sm"
            >
              {userProfile.isStudent ? 'Verified Student' : 'Not a Student'}
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fund Contribution ($USD)</label>
            <input
              type="number"
              value={userProfile.fundContribution}
              onChange={(e) => updateProfile({ fundContribution: Number(e.target.value) })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="0"
              min="0"
            />
            <p className="text-xs text-gray-400 mt-1">
              $100+ gets you 25% discount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Team Size</label>
            <input
              type="number"
              value={userProfile.teamSize}
              onChange={(e) => updateProfile({ teamSize: Number(e.target.value) })}
              className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
              placeholder="1"
              min="1"
            />
            <p className="text-xs text-gray-400 mt-1">
              10+ people get 15% volume discount
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Billing Cycle</label>
            <div className="flex gap-2">
              <Button
                variant={userProfile.billingCycle === 'monthly' ? "default" : "outline"}
                onClick={() => updateProfile({ billingCycle: 'monthly' })}
                size="sm"
              >
                Monthly
              </Button>
              <Button
                variant={userProfile.billingCycle === 'annual' ? "default" : "outline"}
                onClick={() => updateProfile({ billingCycle: 'annual' })}
                size="sm"
              >
                Annual (20% off)
              </Button>
            </div>
          </div>
        </div>

        {/* Current Discounts Summary */}
        <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/30 rounded">
          <h4 className="font-medium text-emerald-400 mb-2">Your Current Discounts:</h4>
          <div className="flex flex-wrap gap-2">
            {userProfile.isStudent && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                50% Student Discount
              </span>
            )}
            {userProfile.fundContribution >= 100 && (
              <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded">
                25% Fund Contributor
              </span>
            )}
            {userProfile.billingCycle === 'annual' && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                20% Annual Discount
              </span>
            )}
            {userProfile.teamSize >= 10 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">
                15% Volume Discount
              </span>
            )}
            {(!userProfile.isStudent && userProfile.fundContribution < 100 && userProfile.billingCycle === 'monthly' && userProfile.teamSize < 10) && (
              <span className="text-gray-400 text-xs">No active discounts</span>
            )}
          </div>
        </div>
      </div>

      {/* Smart Pricing Component */}
      <SmartPricing
        userProfile={userProfile}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
};

export default SmartPricingExample;
