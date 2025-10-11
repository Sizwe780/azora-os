import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { getFinancePageData, Period } from '../features/finance/mockData';

import StatCard from '../components/finance/StatCard';
import Section from '../components/finance/Section';
import RevenueChart from '../components/finance/RevenueChart';
import ExpenseBreakdown from '../components/finance/ExpenseBreakdown';
import BalanceSheetOverview from '../components/finance/BalanceSheetOverview';
import CashFlowChart from '../components/finance/CashFlowChart';

const FinancePage = () => {
  const [period, setPeriod] = useState<Period>('monthly');
  const data = useMemo(() => getFinancePageData(period), [period]);

  return (
    <>
      <Helmet>
        <title>Finance Command Center | Azora</title>
      </Helmet>
      <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-transparent">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Finance Command Center</h1>
              <p className="text-gray-400 mt-1">Real-time financial overview of Azora operations.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center bg-gray-800/60 border border-gray-700/30 rounded-lg p-1 space-x-1">
              {(['monthly', 'quarterly', 'annually'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${period === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700/50'}`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          animate="show"
        >
          {data.statCards.map(card => <StatCard key={card.id} {...card} />)}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Section title="Revenue vs. Expenses" className="lg:col-span-2">
            <RevenueChart data={data.revenueVsExpenses} formatCurrency={data.formatCurrency} />
          </Section>

          <Section title="Expense Breakdown">
            <ExpenseBreakdown data={data.expensesBreakdown} total={data.totalExpenses} formatCurrency={data.formatCurrency} />
          </Section>

          <Section title="Balance Sheet Overview" className="lg:col-span-3">
            <BalanceSheetOverview {...data.balanceSheet} formatCurrency={data.formatCurrency} />
          </Section>

          <Section title="Cash Flow" className="lg:col-span-3">
            <CashFlowChart data={data.revenueVsExpenses} formatCurrency={data.formatCurrency} />
          </Section>
        </div>
      </div>
    </>
  );
};

export default FinancePage;
