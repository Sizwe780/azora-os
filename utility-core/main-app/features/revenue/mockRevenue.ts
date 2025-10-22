/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

export interface RevenueAllocation {
  category: string;
  percentage: number;
  amount: number;
  color: string;
  // Adding index signature for compatibility with recharts
  [key: string]: string | number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface RevenueData {
  mrr: number;
  arr: number;
  growthRate: number;
  allocations: RevenueAllocation[];
  trends: MonthlyRevenue[];
}

export const getMockRevenueData = (): RevenueData => {
  const allocations: RevenueAllocation[] = [
    { category: 'R&D', percentage: 40, amount: 2000000, color: '#8884d8' },
    { category: 'Operations', percentage: 30, amount: 1500000, color: '#82ca9d' },
    { category: 'Marketing', percentage: 15, amount: 750000, color: '#ffc658' },
    { category: 'Sales', percentage: 10, amount: 500000, color: '#ff8042' },
    { category: 'G&A', percentage: 5, amount: 250000, color: '#0088FE' },
  ];

  const trends: MonthlyRevenue[] = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return {
      month: date.toLocaleString('default', { month: 'short' }),
      revenue: 5000000 * (1 + i * 0.1 + Math.random() * 0.1),
    };
  });

  const mrr = trends[trends.length - 1].revenue;

  return {
    mrr: mrr,
    arr: mrr * 12,
    growthRate: 12.5,
    allocations,
    trends,
  };
};
