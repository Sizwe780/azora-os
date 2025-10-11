import React from 'react';
import { Landmark, Scale, CheckCircle } from 'lucide-react';

interface BalanceSheetOverviewProps {
  assets: number;
  liabilities: number;
  equity: number;
  formatCurrency: (amount: number) => string;
}

const InfoBox: React.FC<{ icon: React.ElementType; title: string; value: string; color: string }> = ({ icon: Icon, title, value, color }) => (
  <div className="bg-gray-800/50 p-6 rounded-lg border border-white/10">
    <Icon className={`mx-auto w-8 h-8 ${color} mb-2`}/>
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-2xl font-bold text-white">{value}</p>
  </div>
);

const BalanceSheetOverview: React.FC<BalanceSheetOverviewProps> = ({ assets, liabilities, equity, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
      <InfoBox icon={Landmark} title="Total Assets" value={formatCurrency(assets)} color="text-blue-400" />
      <InfoBox icon={Scale} title="Total Liabilities" value={formatCurrency(liabilities)} color="text-red-400" />
      <InfoBox icon={CheckCircle} title="Net Equity" value={formatCurrency(equity)} color="text-green-400" />
    </div>
  );
};

export default BalanceSheetOverview;
