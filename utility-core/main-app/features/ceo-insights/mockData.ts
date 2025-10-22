/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { subDays } from 'date-fns';

export interface Insight {
  id: string;
  type: 'market' | 'strategic' | 'operational' | 'financial';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  dataPoints: { icon: any; text: string }[];
  createdAt: string;
}

export interface Prediction {
  id: string;
  category: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

export interface MarketOpportunity {
  region: string;
  score: number;
  growth: number;
  reasoning: string;
}

export interface CEOInsightsData {
  insights: Insight[];
  predictions: Prediction[];
  marketOpportunities: MarketOpportunity[];
}

export const mockCEOInsightsData: CEOInsightsData = {
  marketOpportunities: [
    {
      region: 'East Africa Corridor',
      score: 92,
      growth: 18,
      reasoning: 'Strong logistics demand and digital transformation in supply chain.',
    },
    {
      region: 'West Africa Trade Route',
      score: 85,
      growth: 15,
      reasoning: 'Rapid urbanization and e-commerce growth driving last-mile delivery needs.',
    },
    {
      region: 'Southern Africa Mining Belt',
      score: 80,
      growth: 12,
      reasoning: 'High demand for specialized, secure transport for high-value materials.',
    },
  ],
  insights: [
    {
      id: '1',
      type: 'strategic',
      title: 'Expand Fleet Electrification to Reduce Long-Term OPEX',
      description: 'A phased transition to electric vehicles for urban and semi-urban routes will significantly reduce operational expenditure on fuel and maintenance, while improving our ESG score.',
      confidence: 92,
      impact: 'high',
      recommendation: 'Initiate a pilot program with 50 EVs in the Gauteng urban area. Focus on last-mile delivery routes to maximize efficiency gains and gather performance data.',
      dataPoints: [
        { icon: 'DollarSign', text: 'Projected 30% OPEX reduction' },
        { icon: 'Leaf', text: 'Improved ESG Score' },
        { icon: 'Zap', text: 'Government Green-Tech Incentives' },
      ],
      createdAt: subDays(new Date(), 2).toISOString(),
    },
    {
      id: '2',
      type: 'market',
      title: 'Leverage Quantum-Secured Corridors for High-Value Cargo',
      description: 'There is a growing market for ultra-secure logistics for sensitive cargo (e.g., pharmaceuticals, electronics, precious metals). Our quantum tech provides a unique competitive advantage.',
      confidence: 88,
      impact: 'critical',
      recommendation: 'Market and launch "Azora Quantum Shield" as a premium service. Target pharmaceutical companies and electronics manufacturers in key trade zones.',
      dataPoints: [
        { icon: 'Shield', text: 'Quantum Encryption Advantage' },
        { icon: 'TrendingUp', text: 'High-Value Cargo Market Growth' },
        { icon: 'Target', text: 'Untapped Premium Market Segment' },
      ],
      createdAt: subDays(new Date(), 5).toISOString(),
    },
    {
      id: '3',
      type: 'operational',
      title: 'AI-Powered Predictive Maintenance to Maximize Fleet Uptime',
      description: 'Implementing an AI-driven predictive maintenance schedule can reduce vehicle downtime by up to 40% and cut emergency repair costs.',
      confidence: 95,
      impact: 'medium',
      recommendation: 'Integrate the predictive maintenance module with our existing fleet management system. Start with the 100 oldest vehicles in the fleet to prove efficacy.',
      dataPoints: [
        { icon: 'Wrench', text: 'Reduced Maintenance Costs' },
        { icon: 'Truck', text: 'Increased Fleet Availability' },
        { icon: 'Activity', text: 'Real-time Vehicle Health Data' },
      ],
      createdAt: subDays(new Date(), 10).toISOString(),
    },
  ],
  predictions: [
    {
      id: '1',
      category: 'Revenue Growth',
      prediction: 'A 15-20% increase in revenue in the next fiscal year, driven by new service offerings and market expansion.',
      confidence: 85,
      timeframe: '12 months',
      reasoning: 'Based on successful pilot programs and strong pre-launch interest in Quantum Shield services.',
    },
    {
      id: '2',
      category: 'Fleet Efficiency',
      prediction: 'A 10% improvement in overall fleet efficiency through AI-powered route optimization and predictive maintenance.',
      confidence: 90,
      timeframe: '6 months',
      reasoning: 'Data from the AI pilot shows significant reductions in fuel consumption and idle time.',
    },
  ],
};
