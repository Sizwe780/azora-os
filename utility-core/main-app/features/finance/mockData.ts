/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Banknote } from 'lucide-react';

const formatCurrency = (amount: number, compact = false) => {
    if (compact) {
        if (amount >= 1_000_000_000) return `R${(amount / 1_000_000_000).toFixed(1)}B`;
        if (amount >= 1_000_000) return `R${(amount / 1_000_000).toFixed(1)}M`;
        if (amount >= 1_000) return `R${(amount / 1_000).toFixed(1)}K`;
        return `R${amount.toFixed(0)}`;
    }
    return `R ${new Intl.NumberFormat('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
};

const generateFinanceData = (period: 'monthly' | 'quarterly' | 'annually') => {
    const multiplier = period === 'monthly' ? 1 : period === 'quarterly' ? 3 : 12;
    const revenue = 4850000 * multiplier;
    const expenses = 3120000 * multiplier;
    const netProfit = revenue - expenses;

    return {
        profitAndLoss: { revenue, expenses, netProfit, profitMargin: (netProfit / revenue) * 100 },
        balanceSheet: { assets: 25500000, liabilities: 9800000, equity: 15700000 },
        cashFlow: { 
            operating: 2100000 * multiplier, 
            investing: -500000 * multiplier, 
            financing: -300000 * multiplier, 
            netChange: (2100000 - 500000 - 300000) * multiplier,
            endingBalance: 8900000 + (1300000 * (multiplier -1))
        },
        expensesBreakdown: [
            { name: 'Salaries', value: 1500000 * multiplier, color: '#3B82F6' },
            { name: 'Fuel', value: 800000 * multiplier, color: '#10B981' },
            { name: 'Maintenance', value: 450000 * multiplier, color: '#F97316' },
            { name: 'Admin', value: 220000 * multiplier, color: '#8B5CF6' },
            { name: 'Other', value: 150000 * multiplier, color: '#EF4444' },
        ],
        revenueVsExpenses: period === 'monthly' 
            ? [
                { name: 'Week 1', revenue: 1200000, expenses: 780000 },
                { name: 'Week 2', revenue: 1150000, expenses: 750000 },
                { name: 'Week 3', revenue: 1300000, expenses: 820000 },
                { name: 'Week 4', revenue: 1200000, expenses: 770000 },
            ]
            : period === 'quarterly'
            ? [
                { name: 'Month 1', revenue: 4850000, expenses: 3120000 },
                { name: 'Month 2', revenue: 4750000, expenses: 3080000 },
                { name: 'Month 3', revenue: 4950000, expenses: 3160000 },
            ]
            : [
                { name: 'Q1', revenue: 14550000, expenses: 9360000 },
                { name: 'Q2', revenue: 14250000, expenses: 9240000 },
                { name: 'Q3', revenue: 14850000, expenses: 9480000 },
                { name: 'Q4', revenue: 14550000, expenses: 9360000 },
            ],
    };
};

export const getFinancePageData = (period: 'monthly' | 'quarterly' | 'annually') => {
    const data = generateFinanceData(period);
    const totalExpenses = data.expensesBreakdown.reduce((sum, item) => sum + item.value, 0);

    const statCards = [
        { id: 'revenue', icon: DollarSign, title: "Total Revenue", value: formatCurrency(data.profitAndLoss.revenue), change: "+5.2%", color: "green" },
        { id: 'expenses', icon: TrendingDown, title: "Total Expenses", value: formatCurrency(data.profitAndLoss.expenses), change: "+3.1%", color: "red" },
        { id: 'profit', icon: PiggyBank, title: "Net Profit", value: formatCurrency(data.profitAndLoss.netProfit), change: `${data.profitAndLoss.profitMargin.toFixed(1)}% margin`, color: "blue" },
        { id: 'cash', icon: Banknote, title: "Cash on Hand", value: formatCurrency(data.cashFlow.endingBalance), change: "+12.5%", color: "purple" },
    ];

    return { ...data, totalExpenses, statCards, formatCurrency };
};

export type FinanceData = ReturnType<typeof getFinancePageData>;
export type Period = 'monthly' | 'quarterly' | 'annually';
