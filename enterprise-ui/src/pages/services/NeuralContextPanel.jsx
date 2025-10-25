import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const NeuralContextPanel = () => {
  const [contextMetrics, setContextMetrics] = useState(null)
  const [activeContexts, setActiveContexts] = useState([])
  const [processingQueue, setProcessingQueue] = useState([])
  const [neuralNetworks, setNeuralNetworks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [newContext, setNewContext] = useState('')

  useEffect(() => {
    fetchContextMetrics()
  }, [])

  const fetchContextMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to connect to azora-synapse
      const response = await axios.get('http://localhost:3007/api/synapse/context/metrics')
      setContextMetrics(response.data)

      const contextsResponse = await axios.get('http://localhost:3007/api/synapse/contexts/active')
      setActiveContexts(contextsResponse.data.contexts || [])

      const queueResponse = await axios.get('http://localhost:3007/api/synapse/processing/queue')
      setProcessingQueue(queueResponse.data.queue || [])

      const networksResponse = await axios.get('http://localhost:3007/api/synapse/networks/status')
      setNeuralNetworks(networksResponse.data.networks || [])
    } catch (err) {
      console.error('Error fetching context metrics:', err)
      setError('Synapse system unavailable. Using simulated data.')

      setContextMetrics({
        totalContexts: 1247,
        activeContexts: 89,
        processingCapacity: 0.76,
        contextAccuracy: 0.94,
        neuralEfficiency: 0.87,
        memoryUtilization: 0.68
      })

      setActiveContexts([
        { id: 'ctx-1', type: 'market-analysis', complexity: 0.85, confidence: 0.92, lastUpdated: '2024-01-20T10:30:00Z' },
        { id: 'ctx-2', type: 'user-behavior', complexity: 0.72, confidence: 0.88, lastUpdated: '2024-01-20T10:25:00Z' },
        { id: 'ctx-3', type: 'system-optimization', complexity: 0.91, confidence: 0.95, lastUpdated: '2024-01-20T10:20:00Z' }
      ])

      setProcessingQueue([
        { id: 'proc-1', contextType: 'real-time-analysis', priority: 'high', estimatedTime: 45 },
        { id: 'proc-2', contextType: 'batch-processing', priority: 'medium', estimatedTime: 120 },
        { id: 'proc-3', contextType: 'deep-learning', priority: 'low', estimatedTime: 300 }
      ])

      setNeuralNetworks([
        { id: 'net-1', type: 'transformer', status: 'active', utilization: 0.89, accuracy: 0.96 },
        { id: 'net-2', type: 'recurrent', status: 'active', utilization: 0.67, accuracy: 0.91 },
        { id: 'net-3', type: 'convolutional', status: 'training', utilization: 0.45, accuracy: 0.78 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const processNewContext = async () => {
    if (!newContext.trim()) return

    try {
      setProcessing(true)
      setError(null)

      const response = await axios.post('http://localhost:3007/api/synapse/context/process', {
        contextData: newContext,
        processingType: 'real-time',
        priority: 'medium'
      })

      if (response.data.success) {
        setNewContext('')
        await fetchContextMetrics()
      }
    } catch (err) {
      console.error('Error processing context:', err)
      setError('Failed to process new context.')
    } finally {
      setProcessing(false)
    }
  }

  const optimizeNetworks = async () => {
    try {
      setProcessing(true)
      setError(null)

      const response = await axios.post('http://localhost:3007/api/synapse/networks/optimize', {
        optimizationType: 'performance',
        targetMetrics: ['accuracy', 'efficiency', 'latency']
      })

      if (response.data.success) {
        await fetchContextMetrics()
      }
    } catch (err) {
      console.error('Error optimizing networks:', err)
      setError('Failed to optimize neural networks.')
    } finally {
      setProcessing(false)
    }
  }

  const stats = contextMetrics ? [
    { label: 'Active Contexts', value: contextMetrics.activeContexts.toString(), change: '+5' },
    { label: 'Processing Capacity', value: `${(contextMetrics.processingCapacity * 100).toFixed(0)}%`, change: '+2%' },
    { label: 'Context Accuracy', value: `${(contextMetrics.contextAccuracy * 100).toFixed(0)}%`, change: '+1%' },
    { label: 'Neural Efficiency', value: `${(contextMetrics.neuralEfficiency * 100).toFixed(0)}%`, change: '+3%' }
  ] : []

  const actions = [
    { label: 'Refresh Metrics', onClick: fetchContextMetrics },
    { label: 'Optimize Networks', onClick: optimizeNetworks, disabled: processing },
    { label: 'View Context Logs', onClick: () => console.log('View context logs') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="Neural Context Engine"
        description="AI-powered context understanding and processing"
        stats={stats}
        actions={actions}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </ServicePanel>
    )
  }

  return (
    <ServicePanel
      title="Neural Context Engine"
      description="AI-powered context understanding and processing"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Context Processing Input */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Process New Context</h3>
          <div className="space-y-3">
            <textarea
              value={newContext}
              onChange={(e) => setNewContext(e.target.value)}
              placeholder="Enter context data for neural processing..."
              className="w-full p-3 border border-border rounded-md resize-none"
              rows={4}
            />
            <button
              onClick={processNewContext}
              disabled={processing || !newContext.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Process Context'}
            </button>
          </div>
        </div>

        {/* Active Contexts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Neural Contexts</h3>
          <div className="space-y-3">
            {activeContexts.map(context => (
              <div key={context.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{context.type.replace('-', ' ').toUpperCase()}</h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Active
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {(context.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Complexity</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${context.complexity * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{new Date(context.lastUpdated).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Processing Queue */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Processing Queue</h3>
          <div className="space-y-2">
            {processingQueue.map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">{item.contextType.replace('-', ' ')}</p>
                    <p className="text-sm text-muted-foreground">Est. {item.estimatedTime}s</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.priority === 'high' ? 'bg-red-100 text-red-800' :
                  item.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {item.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Neural Networks Status */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Neural Network Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {neuralNetworks.map(network => (
              <div key={network.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{network.type}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    network.status === 'active' ? 'bg-green-100 text-green-800' :
                    network.status === 'training' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {network.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Utilization</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${network.utilization * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-sm">Accuracy: {(network.accuracy * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default NeuralContextPanel