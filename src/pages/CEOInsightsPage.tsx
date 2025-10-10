import React from 'react';
import { useEffect, useState } from 'react';
import { Lightbulb, TrendingUp, Globe, AlertTriangle, Target } from 'lucide-react';

interface Insight {
  id: string;
  type: 'market' | 'strategic' | 'operational' | 'financial';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  dataPoints: string[];
  createdAt: Date;
}

interface Prediction {
  id: string;
  category: string;
  prediction: string;
  confidence: number;
  timeframe: string;
  reasoning: string;
}

interface CEOInsightsData {
  insights: Insight[];
  predictions: Prediction[];
  marketOpportunities: {
    region: string;
    score: number;
    growth: number;
    reasoning: string;
  }[];
}

export default function CEOInsightsPage() {
  const [data, setData] = useState<CEOInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/hr-ai/ceo-assistant/insights');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch CEO insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
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
          <p className="text-red-600 dark:text-red-400">Failed to load CEO insights</p>
        </div>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-300 dark:border-red-700';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-300 dark:border-orange-700';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-300 dark:border-blue-700';
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AZORA CEO Insights</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Strategic recommendations, market analysis, and predictive insights</p>
      </div>

      {/* Market Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5 text-green-500" />
          <span>Market Expansion Opportunities</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.marketOpportunities.map((opportunity, index) => (
            <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{opportunity.region}</h3>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">+{opportunity.growth}%</span>
              </div>
              <div className="mb-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-400 h-2 rounded-full"
                    style={{ width: `${opportunity.score}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Opportunity Score: {opportunity.score}%</p>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">{opportunity.reasoning}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span>Strategic Insights</span>
        </h2>
        <div className="space-y-4">
          {data.insights.map((insight) => (
            <div
              key={insight.id}
              className={`rounded-lg p-4 border-2 ${getImpactColor(insight.impact)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <h3 className="font-bold text-lg">{insight.title}</h3>
                </div>
                <span className="text-xs px-2 py-1 bg-white/50 dark:bg-black/30 rounded">
                  {insight.confidence}% confidence
                </span>
              </div>
              <p className="text-sm mb-3">{insight.description}</p>
              <div className="bg-white/50 dark:bg-black/20 rounded p-3 mb-3">
                <p className="text-sm font-semibold mb-1">💡 Recommendation:</p>
                <p className="text-sm">{insight.recommendation}</p>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1">Data Points:</p>
                <div className="flex flex-wrap gap-2">
                  {insight.dataPoints.map((point, idx) => (
                    <span key={idx} className="text-xs px-2 py-1 bg-white/50 dark:bg-black/30 rounded">
                      {point}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          <span>Predictive Analytics</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.predictions.map((prediction) => (
            <div key={prediction.id} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{prediction.category}</h3>
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {prediction.confidence}% confidence
                </span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{prediction.prediction}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">Timeframe:</span> {prediction.timeframe}
              </p>
              <div className="bg-white/50 dark:bg-black/20 rounded p-2">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{prediction.reasoning}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
