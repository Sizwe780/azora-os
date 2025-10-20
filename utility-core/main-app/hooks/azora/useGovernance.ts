import { useState } from 'react';

const mockProposals = [
    { id: 'gov_prop_1', title: 'Increase Staking Rewards', description: 'Proposal to increase staking rewards by 5% to incentivize participation.', status: 'open', totalStaked: 150000 },
    { id: 'gov_prop_2', title: 'Fund Community Marketing', description: 'Allocate 1M REP to a community-run marketing fund.', status: 'closed', totalStaked: 2500000 },
];

export function useGovernance(userId: string) {
    const [proposals, setProposals] = useState(mockProposals);
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const vote = (proposalId: string, amount: number) => {
        if (amount <= 0) {
            setError('Vote amount must be greater than zero');
            return;
        }

        console.log(`User ${userId} voting ${amount} on proposal ${proposalId}`);
        setStatus('loading');
        setError(null);
        setTimeout(() => {
            setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, totalStaked: p.totalStaked + amount } : p));
            setStatus('idle');
        }, 1000);
    };

    return { proposals, status, error, vote };
}
