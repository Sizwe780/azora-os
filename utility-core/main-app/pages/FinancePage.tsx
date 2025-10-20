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
      <div className="p-4 sm:p-6 lg:p-8 text-white min-h-screen bg-gray-950">
        <div className="absolute inset-0 -z-10 h-full w-full bg-gray-950 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute top-0 left-0 -z-10 h-1/3 w-full bg-gradient-to-b from-cyan-500/20 to-transparent"></div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">Finance Command Center</h1>
              <p className="text-cyan-200/80 mt-2">Real-time financial overview of Azora operations.</p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center bg-gray-950/70 border border-cyan-500/20 rounded-lg p-1 space-x-1 backdrop-blur-md">
              {(['monthly', 'quarterly', 'annually'] as Period[]).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all duration-300 ${period === p ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/20' : 'text-cyan-200/80 hover:bg-cyan-500/10'}`}
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
