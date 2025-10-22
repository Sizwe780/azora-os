import React, { useState, useEffect } from 'react';
import { SuperAI } from '../../../genome/ai-hierarchy';
import { MintAgent } from '../../../genome/ai-hierarchy/specialized-agents/mint-agent';
import { AgentMessenger } from '../../../genome/ai-hierarchy/communication/agent-communication';

interface MintUIProps {
  superAI: SuperAI;
  mintAgent: MintAgent;
  messenger: AgentMessenger;
}

interface CreditApplication {
  amount: number;
  purpose: string;
  trustScore?: number;
  approved?: boolean;
  maxAmount?: number;
}

interface LoanStatus {
  loanId?: string;
  amount?: number;
  status?: string;
  nextPaymentDue?: Date;
}

export const MintUI: React.FC<MintUIProps> = ({ superAI, mintAgent, messenger }) => {
  const [activeTab, setActiveTab] = useState<'credit' | 'loans' | 'trust' | 'collateral'>('credit');
  const [creditApplication, setCreditApplication] = useState<CreditApplication>({
    amount: 0,
    purpose: ''
  });
  const [loanStatus, setLoanStatus] = useState<LoanStatus>({});
  const [trustScore, setTrustScore] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const agentInsights = await mintAgent.generateInsights();
      setInsights(agentInsights);
    } catch (error) {
      console.error('Failed to load mint insights:', error);
    }
  };

  const handleCreditApplication = async () => {
    if (!creditApplication.amount || !creditApplication.purpose) return;

    setIsLoading(true);
    try {
      // Use Super AI to process credit application through Mint Agent
      const result = await superAI.processUserQuery(
        `Process credit application for ${creditApplication.amount} AZR for ${creditApplication.purpose}`,
        { domain: 'mint', action: 'credit_application', data: creditApplication }
      );

      // Update UI with results
      if (result.insights && result.insights.length > 0) {
        const creditResult = result.insights[0].data;
        setCreditApplication(prev => ({
          ...prev,
          trustScore: creditResult.trustScore,
          approved: creditResult.approved,
          maxAmount: creditResult.maxAmount
        }));
      }
    } catch (error) {
      console.error('Credit application failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoanRequest = async () => {
    if (!creditApplication.amount) return;

    setIsLoading(true);
    try {
      const result = await superAI.processUserQuery(
        `Create loan for ${creditApplication.amount} AZR`,
        { domain: 'mint', action: 'create_loan', data: { amount: creditApplication.amount } }
      );

      if (result.insights && result.insights.length > 0) {
        const loanData = result.insights[0].data;
        setLoanStatus({
          loanId: loanData.loanId,
          amount: loanData.amount,
          status: loanData.status,
          nextPaymentDue: new Date(loanData.nextPaymentDue)
        });
      }
    } catch (error) {
      console.error('Loan creation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTrustScore = async () => {
    setIsLoading(true);
    try {
      const result = await superAI.processUserQuery(
        'Check my trust score',
        { domain: 'mint', action: 'trust_score' }
      );

      if (result.insights && result.insights.length > 0) {
        setTrustScore(result.insights[0].data);
      }
    } catch (error) {
      console.error('Trust score check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏦 Anti-Bank Protocol
          </h1>
          <p className="text-lg text-gray-600">
            Trust-based lending powered by AI agents
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1">
            {[
              { id: 'credit', label: 'Credit Analysis', icon: '📊' },
              { id: 'loans', label: 'Active Loans', icon: '💰' },
              { id: 'trust', label: 'Trust Score', icon: '⭐' },
              { id: 'collateral', label: 'Collateral', icon: '🔒' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {activeTab === 'credit' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Credit Application</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loan Amount (AZR)
                  </label>
                  <input
                    type="number"
                    value={creditApplication.amount}
                    onChange={(e) => setCreditApplication(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose
                  </label>
                  <select
                    value={creditApplication.purpose}
                    onChange={(e) => setCreditApplication(prev => ({
                      ...prev,
                      purpose: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select purpose</option>
                    <option value="business">Business Investment</option>
                    <option value="education">Education</option>
                    <option value="personal">Personal Use</option>
                    <option value="real_estate">Real Estate</option>
                    <option value="technology">Technology Development</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCreditApplication}
                  disabled={isLoading || !creditApplication.amount || !creditApplication.purpose}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Analyzing...' : 'Analyze Credit'}
                </button>

                {creditApplication.approved && (
                  <button
                    onClick={handleLoanRequest}
                    disabled={isLoading}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Request Loan'}
                  </button>
                )}
              </div>

              {creditApplication.trustScore && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Credit Analysis Results</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-indigo-600">
                        {creditApplication.trustScore}/100
                      </div>
                      <div className="text-sm text-gray-600">Trust Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {creditApplication.maxAmount}
                      </div>
                      <div className="text-sm text-gray-600">Max Loan (AZR)</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        creditApplication.approved ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {creditApplication.approved ? 'Approved' : 'Denied'}
                      </div>
                      <div className="text-sm text-gray-600">Status</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'loans' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Active Loans</h2>

              {loanStatus.loanId ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-4">Loan Active</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Loan ID</div>
                      <div className="font-mono text-sm">{loanStatus.loanId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Amount</div>
                      <div className="font-semibold">{loanStatus.amount} AZR</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="font-semibold text-green-600">{loanStatus.status}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Next Payment</div>
                      <div className="font-semibold">
                        {loanStatus.nextPaymentDue?.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Loans</h3>
                  <p className="text-gray-600">Apply for credit to get started with trust-based lending</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'trust' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Trust Score</h2>

              <div className="text-center">
                <button
                  onClick={checkTrustScore}
                  disabled={isLoading}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                >
                  {isLoading ? 'Calculating...' : 'Check My Trust Score'}
                </button>
              </div>

              {trustScore && (
                <div className="bg-indigo-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Your Trust Profile</h3>

                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">
                      {trustScore.overall}/100
                    </div>
                    <div className="text-lg text-gray-600">Overall Trust Score</div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(trustScore.factors).map(([factor, score]) => (
                      <div key={factor} className="flex justify-between items-center">
                        <span className="capitalize text-gray-700">
                          {factor.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                        <span className="font-semibold">{score}/100</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <div className={`text-lg font-semibold ${
                      trustScore.eligible ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trustScore.eligible ? '✅ Eligible for Credit' : '❌ Not Eligible for Credit'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'collateral' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Collateral Management</h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">🔒</div>
                  <h3 className="text-lg font-semibold text-yellow-900">Collateral Required</h3>
                </div>
                <p className="text-yellow-800 mb-4">
                  All loans in the Anti-Bank protocol require 120% collateralization in AZR tokens.
                  This ensures the stability and trustworthiness of the lending system.
                </p>
                <div className="bg-white rounded p-4">
                  <div className="text-sm text-gray-600 mb-2">Current Collateral Status</div>
                  <div className="text-2xl font-bold text-green-600">Available</div>
                  <div className="text-sm text-gray-500">Ready for loan collateralization</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Insights Panel */}
        {insights.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">AI Insights</h2>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border-l-4 border-indigo-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{insight.description}</p>
                  <div className="flex items-center mt-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                      insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {insight.impact} impact
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {Math.round(insight.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MintUI;