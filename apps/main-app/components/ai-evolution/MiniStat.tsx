import React from 'react';

interface MiniStatProps {
  label: string;
  value: string | number;
}

const MiniStat: React.FC<MiniStatProps> = ({ label, value }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-gray-400">{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

export default MiniStat;
