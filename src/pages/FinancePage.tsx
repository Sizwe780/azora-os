import React from 'react';
import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText, Calculator, CheckCircle } from 'lucide-react';

interface ProfitAndLoss {
  revenue: number;
  expenses: number;
  netProfit: number;
  profitMargin: number;
  breakdown: {
    category: string;
    amount: number;
  }[];
}

interface BalanceSheet {
  assets: number;
  liabilities: number;
  equity: number;
  balanced: boolean;
  breakdown: {
    category: string;
    amount: number;
  }[];
}

interface CashFlow {
  operating: number;
  investing: number;
  financing: number;
  netChange: number;
  endingBalance: number;
}

interface TaxCalculation {
  type: string;
  base: number;
  rate: number;
  amount: number;
  paid: number;
  outstanding: number;
}

interface FinanceData {
  profitAndLoss: ProfitAndLoss;
  balanceSheet: BalanceSheet;
  cashFlow: CashFlow;
  taxes: TaxCalculation[];
  auditReadiness: 'ready' | 'pending' | 'not-ready';
  lastAudit: Date;
  nextAudit: Date;
}

export default function FinancePage() {
  const [data, setData] = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const response = await fetch('/api/hr-ai/finance/status');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch finance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Failed to load finance data</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `R${(amount / 1000000).toFixed(2)}M`;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">P&L, Balance Sheet, Cash Flow, Tax calculations, and audit readiness</p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Net Profit</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data.profitAndLoss.netProfit)}</p>
          <p className="text-sm opacity-90 mt-1">{data.profitAndLoss.profitMargin}% margin</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
          <DollarSign className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Total Assets</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data.balanceSheet.assets)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Cash Flow</p>
          <p className="text-3xl font-bold mt-2">{formatCurrency(data.cashFlow.netChange)}</p>
        </div>

        <div className={`rounded-lg shadow-lg p-6 text-white ${
          data.auditReadiness === 'ready'
            ? 'bg-gradient-to-br from-green-500 to-green-600'
            : data.auditReadiness === 'pending'
            ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
        }`}>
          <CheckCircle className="w-8 h-8 mb-2" />
          <p className="text-sm opacity-90">Audit Status</p>
          <p className="text-2xl font-bold mt-2 uppercase">{data.auditReadiness.replace('-', ' ')}</p>
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Profit & Loss Statement</span>
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <span className="font-semibold text-gray-900 dark:text-white">Total Revenue</span>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(data.profitAndLoss.revenue)}</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white mb-2">Expense Breakdown</p>
            <div className="space-y-2">
              {data.profitAndLoss.breakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/30 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{item.category}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <span className="font-semibold text-gray-900 dark:text-white">Total Expenses</span>
            <span className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.profitAndLoss.expenses)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <span className="font-bold text-gray-900 dark:text-white">Net Profit</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.profitAndLoss.netProfit)}</span>
          </div>
        </div>
      </div>

      {/* Balance Sheet & Cash Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Sheet */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Balance Sheet</span>
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Assets</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(data.balanceSheet.assets)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Liabilities</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(data.balanceSheet.liabilities)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Equity</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(data.balanceSheet.equity)}</p>
            </div>
            <div className={`p-3 rounded-lg ${
              data.balanceSheet.balanced
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
            }`}>
              <div className="flex items-center space-x-2">
                {data.balanceSheet.balanced ? (
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-bold ${
                  data.balanceSheet.balanced
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {data.balanceSheet.balanced ? 'BALANCED' : 'IMBALANCED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Flow */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Cash Flow Statement</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Operating Activities</span>
              <span className={`font-bold ${data.cashFlow.operating >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.cashFlow.operating)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Investing Activities</span>
              <span className={`font-bold ${data.cashFlow.investing >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.cashFlow.investing)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded">
              <span className="text-gray-700 dark:text-gray-300">Financing Activities</span>
              <span className={`font-bold ${data.cashFlow.financing >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.cashFlow.financing)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-300 dark:border-blue-700">
              <span className="font-bold text-gray-900 dark:text-white">Net Change</span>
              <span className={`text-xl font-bold ${data.cashFlow.netChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(data.cashFlow.netChange)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-bold text-gray-900 dark:text-white">Ending Balance</span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">{formatCurrency(data.cashFlow.endingBalance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Calculations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tax Calculations</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/30">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tax Type</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Base</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Rate</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Amount</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Paid</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Outstanding</th>
              </tr>
            </thead>
            <tbody>
              {data.taxes.map((tax, index) => (
                <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{tax.type}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{formatCurrency(tax.base)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">{tax.rate}%</td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-white">{formatCurrency(tax.amount)}</td>
                  <td className="px-4 py-3 text-sm text-right text-green-600 dark:text-green-400">{formatCurrency(tax.paid)}</td>
                  <td className="px-4 py-3 text-sm text-right font-bold text-red-600 dark:text-red-400">{formatCurrency(tax.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Audit Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Audit</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(data.lastAudit).toLocaleDateString()}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Audit</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{new Date(data.nextAudit).toLocaleDateString()}</p>
          </div>
          <div className={`rounded-lg p-4 ${
            data.auditReadiness === 'ready'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700'
              : data.auditReadiness === 'pending'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
          }`}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Audit Readiness</p>
            <p className={`text-lg font-bold uppercase ${
              data.auditReadiness === 'ready'
                ? 'text-green-600 dark:text-green-400'
                : data.auditReadiness === 'pending'
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {data.auditReadiness.replace('-', ' ')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
