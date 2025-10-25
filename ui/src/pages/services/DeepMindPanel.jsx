import React, { useState, useEffect } from 'react'
import ServicePanel from '../../components/ServicePanel'
import { useAuth } from '../../contexts/AuthContext'

const DeepMindPanel = () => {
    const { user } = useAuth()
    const [aiData, setAiData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const stats = [
        { label: 'Active Models', value: '12', change: '+2' },
        { label: 'Training Jobs', value: '8', change: '+1' },
        { label: 'Inference Requests', value: '2,847', change: '+15%' },
        { label: 'Model Accuracy', value: '94.2%', change: '+0.8%' }
    ]

    const actions = [
        { label: 'Train Model', onClick: () => console.log('Train model') },
        { label: 'View Analytics', onClick: () => console.log('View analytics') }
    ]

    useEffect(() => {
        fetchAIData()
    }, [])

    const fetchAIData = async () => {
        try {
            setLoading(true)
            // Real API call to Azora Synapse for AI/ML data
            const response = await fetch('http://localhost:4800/api/ai/status', {
                headers: {
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch AI data')
            }

            const data = await response.json()
            setAiData(data)
        } catch (err) {
            setError(err.message)
            // Fallback to mock data
            setAiData({
                activeModels: [
                    { name: 'NLP Processor', status: 'active', accuracy: 0.942, lastTrained: '2024-01-15T08:00:00Z' },
                    { name: 'Image Classifier', status: 'active', accuracy: 0.967, lastTrained: '2024-01-14T16:30:00Z' },
                    { name: 'Recommendation Engine', status: 'training', accuracy: 0.891, lastTrained: '2024-01-15T06:15:00Z' },
                    { name: 'Fraud Detector', status: 'active', accuracy: 0.978, lastTrained: '2024-01-13T22:45:00Z' }
                ],
                trainingJobs: [
                    { id: 'job-001', model: 'Customer Sentiment', status: 'running', progress: 65, eta: '2h 15m' },
                    { id: 'job-002', model: 'Market Predictor', status: 'queued', progress: 0, eta: 'Pending' },
                    { id: 'job-003', model: 'Risk Assessor', status: 'completed', progress: 100, eta: 'Done' }
                ],
                inferenceStats: {
                    totalRequests: 2847,
                    avgResponseTime: 245,
                    successRate: 0.987,
                    activeEndpoints: 8
                }
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <ServicePanel
            title="Deep Mind"
            description="AI/ML model management and inference"
            stats={stats}
            actions={actions}
        >
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-8">Loading AI data...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">Error: {error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Active Models</h3>
                                <div className="space-y-3">
                                    {(aiData?.activeModels || [
                                        { name: 'NLP Processor', status: 'active', accuracy: 0.942, lastTrained: '2024-01-15T08:00:00Z' },
                                        { name: 'Image Classifier', status: 'active', accuracy: 0.967, lastTrained: '2024-01-14T16:30:00Z' },
                                        { name: 'Recommendation Engine', status: 'training', accuracy: 0.891, lastTrained: '2024-01-15T06:15:00Z' },
                                        { name: 'Fraud Detector', status: 'active', accuracy: 0.978, lastTrained: '2024-01-13T22:45:00Z' }
                                    ]).map((model, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                                            <div>
                                                <p className="font-medium text-foreground">{model.name}</p>
                                                <p className="text-sm text-muted-foreground">Accuracy: {(model.accuracy * 100).toFixed(1)}%</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    model.status === 'active' ? 'bg-green-500/10 text-green-500' :
                                                    model.status === 'training' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                    {model.status}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(model.lastTrained).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-foreground mb-4">Training Jobs</h3>
                                <div className="space-y-3">
                                    {(aiData?.trainingJobs || [
                                        { id: 'job-001', model: 'Customer Sentiment', status: 'running', progress: 65, eta: '2h 15m' },
                                        { id: 'job-002', model: 'Market Predictor', status: 'queued', progress: 0, eta: 'Pending' },
                                        { id: 'job-003', model: 'Risk Assessor', status: 'completed', progress: 100, eta: 'Done' }
                                    ]).map((job, index) => (
                                        <div key={index} className="p-3 bg-background border border-border rounded-lg">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1">
                                                    <p className="font-medium text-foreground font-mono text-sm">{job.id}</p>
                                                    <p className="text-sm text-muted-foreground">{job.model}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    job.status === 'running' ? 'bg-blue-500/10 text-blue-500' :
                                                    job.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                                }`}>
                                                    {job.status}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                                                <div
                                                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${job.progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{job.progress}% • ETA: {job.eta}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-foreground mb-4">Inference Statistics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {(aiData?.inferenceStats ? [
                                    { label: 'Total Requests', value: aiData.inferenceStats.totalRequests.toLocaleString(), unit: '' },
                                    { label: 'Avg Response Time', value: aiData.inferenceStats.avgResponseTime, unit: 'ms' },
                                    { label: 'Success Rate', value: (aiData.inferenceStats.successRate * 100).toFixed(1), unit: '%' },
                                    { label: 'Active Endpoints', value: aiData.inferenceStats.activeEndpoints, unit: '' }
                                ] : [
                                    { label: 'Total Requests', value: '2,847', unit: '' },
                                    { label: 'Avg Response Time', value: '245', unit: 'ms' },
                                    { label: 'Success Rate', value: '98.7', unit: '%' },
                                    { label: 'Active Endpoints', value: '8', unit: '' }
                                ]).map((stat, index) => (
                                    <div key={index} className="p-4 bg-background border border-border rounded-lg text-center">
                                        <p className="text-2xl font-bold text-foreground">{stat.value}{stat.unit}</p>
                                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </ServicePanel>
    )
}

export default DeepMindPanel
