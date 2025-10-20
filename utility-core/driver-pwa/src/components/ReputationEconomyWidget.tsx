import React, { useState } from 'react';
import { useReputationEconomy } from '../hooks/azora/useReputationEconomy';
import Card from './atoms/Card';
import Heading from './atoms/Heading';
import Skeleton from './atoms/Skeleton';
import { Zap, Users, ShieldCheck } from 'lucide-react';

const Stat = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <div className="text-center">
        {icon}
        <p className="mt-1 text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/60 tracking-wider">{label}</p>
    </div>
);

export function ReputationEconomyWidget({ userId }: { userId: string }) {
  const { balance, status, error, stake, delegate } = useReputationEconomy(userId);
  const [stakeAmount, setStakeAmount] = useState('');
  const [delegateAmount, setDelegateAmount] = useState('');
  const [delegateTo, setDelegateTo] = useState('');

  const handleStake = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(stakeAmount, 10);
    if (amount > 0) {
      stake('proposal_001', amount).then(() => setStakeAmount(''));
    }
  };
  
  const handleDelegate = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(delegateAmount, 10);
    if (amount > 0 && delegateTo) {
      delegate(delegateTo, amount).then(() => {
          setDelegateAmount('');
          setDelegateTo('');
      });
    }
  };

  if (status === 'loading' && !balance) {
      return <Card><Heading>Reputation Economy</Heading><Skeleton lines={3} /></Card>
  }

  if (error) {
       return <Card><Heading>Reputation Economy</Heading><div className="text-red-400 p-4">Error: {error}</div></Card>
  }
  
  const totalRep = (balance?.available ?? 0) + (balance?.staked ?? 0) + (balance?.delegated ?? 0);

  return (
    <Card>
      <Heading>Reputation Economy</Heading>
      <div className="mb-6 p-4 rounded-lg bg-black/20">
        <p className="text-center text-sm text-white/70 mb-2">Total Reputation</p>
        <p className="text-center text-4xl font-bold text-white animate-pulse-quick">{totalRep.toLocaleString()}</p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat icon={<ShieldCheck className="mx-auto h-6 w-6 text-green-400"/>} label="Available" value={balance?.available.toLocaleString() ?? '...'} />
          <Stat icon={<Zap className="mx-auto h-6 w-6 text-cyan-400"/>} label="Staked" value={balance?.staked.toLocaleString() ?? '...'} />
          <Stat icon={<Users className="mx-auto h-6 w-6 text-orange-400"/>} label="Delegated" value={balance?.delegated.toLocaleString() ?? '...'} />
      </div>

      <div className="space-y-6">
        {/* Staking Form */}
        <form onSubmit={handleStake} className="space-y-2">
            <h4 className="font-semibold text-white/90">Stake on Proposal</h4>
            <div className="flex gap-2">
                 <input 
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-grow bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={status === 'loading'}
                 />
                 <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50" disabled={status === 'loading'}>
                    Stake
                 </button>
            </div>
        </form>

        {/* Delegation Form */}
        <form onSubmit={handleDelegate} className="space-y-2">
            <h4 className="font-semibold text-white/90">Delegate Reputation</h4>
            <input 
                type="text"
                value={delegateTo}
                onChange={(e) => setDelegateTo(e.target.value)}
                placeholder="User ID to delegate to"
                className="w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={status === 'loading'}
             />
            <div className="flex gap-2">
                 <input 
                    type="number"
                    value={delegateAmount}
                    onChange={(e) => setDelegateAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-grow bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={status === 'loading'}
                 />
                 <button type="submit" className="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50" disabled={status === 'loading'}>
                    Delegate
                 </button>
            </div>
        </form>
      </div>
    </Card>
  );
}
