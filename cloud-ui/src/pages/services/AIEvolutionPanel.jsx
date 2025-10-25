import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ServicePanel from '../../components/ServicePanel'

const AIEvolutionPanel = () => {
  const [agentStatus, setAgentStatus] = useState(null)
  const [evolutionMetrics, setEvolutionMetrics] = useState(null)
  const [activeTasks, setActiveTasks] = useState([])
  const [learningData, setLearningData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [evolving, setEvolving] = useState(false)

  useEffect(() => {
    fetchAgentStatus()
    fetchEvolutionMetrics()
  }, [])

  const fetchAgentStatus = async () => {
    try {
      // Try to connect to genome agent-tools system
      const response = await axios.get('http://localhost:3000/api/genome/agents/status')
      setAgentStatus(response.data)
    } catch (err) {
      console.error('Error fetching agent status:', err)
      setError('Genome system unavailable. Using simulated data.')

      setAgentStatus({
        totalAgents: 47,
        activeAgents: 23,
        evolutionLevel: 4.7,
        consciousnessIndex: 0.89,
        learningRate: 0.034,
        adaptationScore: 0.92
      })
    }
  }

  const fetchEvolutionMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.get('http://localhost:3000/api/genome/evolution/metrics')
      setEvolutionMetrics(response.data)

      const tasksResponse = await axios.get('http://localhost:3000/api/genome/tasks/active')
      setActiveTasks(tasksResponse.data.tasks || [])

      const learningResponse = await axios.get('http://localhost:3000/api/genome/learning/progress')
      setLearningData(learningResponse.data)
    } catch (err) {
      console.error('Error fetching evolution metrics:', err)
      setError('Evolution metrics unavailable. Using simulated data.')

      setEvolutionMetrics({
        generations: 1247,
        fitnessScore: 0.94,
        mutationRate: 0.023,
        survivalRate: 0.87,
        adaptationVelocity: 1.23,
        neuralComplexity: 8920000
      })

      setActiveTasks([
        { id: 'task-1', type: 'learning', description: 'Processing market data patterns', progress: 67, priority: 'high' },
        { id: 'task-2', type: 'adaptation', description: 'Optimizing trading algorithms', progress: 43, priority: 'medium' },
        { id: 'task-3', type: 'evolution', description: 'Evolving neural architectures', progress: 89, priority: 'critical' }
      ])

      setLearningData({
        totalPatterns: 1542000,
        learnedPatterns: 1423000,
        learningEfficiency: 0.923,
        knowledgeRetention: 0.956,
        skillAcquisition: 0.789
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerEvolution = async () => {
    try {
      setEvolving(true)
      setError(null)

      const response = await axios.post('http://localhost:3000/api/genome/evolution/trigger', {
        evolutionType: 'adaptive',
        parameters: {
          mutationRate: 0.025,
          selectionPressure: 0.8,
          populationSize: 100
        }
      })

      if (response.data.success) {
        await fetchEvolutionMetrics()
        await fetchAgentStatus()
      }
    } catch (err) {
      console.error('Error triggering evolution:', err)
      setError('Failed to trigger evolution cycle.')
    } finally {
      setEvolving(false)
    }
  }

  const stats = agentStatus ? [
    { label: 'Active Agents', value: agentStatus.activeAgents.toString(), change: '+3' },
    { label: 'Evolution Level', value: agentStatus.evolutionLevel.toFixed(1), change: '+0.2' },
    { label: 'Consciousness Index', value: `${(agentStatus.consciousnessIndex * 100).toFixed(0)}%`, change: '+2%' },
    { label: 'Adaptation Score', value: `${(agentStatus.adaptationScore * 100).toFixed(0)}%`, change: '+1%' }
  ] : []

  const actions = [
    { label: 'Refresh Metrics', onClick: fetchEvolutionMetrics },
    { label: 'Trigger Evolution', onClick: triggerEvolution, disabled: evolving },
    { label: 'View Agent Logs', onClick: () => console.log('View agent logs') }
  ]

  if (loading) {
    return (
      <ServicePanel
        title="AI Evolution System"
        description="Autonomous AI evolution and consciousness development"
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
      title="AI Evolution System"
      description="Autonomous AI evolution and consciousness development"
      stats={stats}
      actions={actions}
    >
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Evolution Overview */}
        {evolutionMetrics && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Evolution Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Generations</h4>
                <p className="text-2xl font-bold">{evolutionMetrics.generations.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total evolution cycles</p>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Fitness Score</h4>
                <p className="text-2xl font-bold">{(evolutionMetrics.fitnessScore * 100).toFixed(1)}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${evolutionMetrics.fitnessScore * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Neural Complexity</h4>
                <p className="text-2xl font-bold">{(evolutionMetrics.neuralComplexity / 1000000).toFixed(1)}M</p>
                <p className="text-sm text-muted-foreground">Parameters</p>
              </div>
            </div>
          </div>
        )}

        {/* Learning Progress */}
        {learningData && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Learning Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Pattern Recognition</h4>
                <p className="text-lg">{learningData.learnedPatterns.toLocaleString()} / {learningData.totalPatterns.toLocaleString()}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(learningData.learnedPatterns / learningData.totalPatterns) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Learning Efficiency</h4>
                <p className="text-2xl font-bold">{(learningData.learningEfficiency * 100).toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Knowledge retention: {(learningData.knowledgeRetention * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Active Tasks */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Evolution Tasks</h3>
          <div className="space-y-3">
            {activeTasks.map(task => (
              <div key={task.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{task.description}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    task.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${task.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{task.progress}%</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">Type: {task.type}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evolution Controls */}
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Evolution Controls</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mutation Rate</label>
                <input
                  type="range"
                  min="0.01"
                  max="0.1"
                  step="0.005"
                  defaultValue="0.025"
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">0.025</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Selection Pressure</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  defaultValue="0.8"
                  className="w-full"
                />
                <span className="text-xs text-muted-foreground">0.8</span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Population Size</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full p-2 border border-border rounded"
                />
              </div>
            </div>

            <button
              onClick={triggerEvolution}
              disabled={evolving}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50"
            >
              {evolving ? 'Evolution in Progress...' : 'Trigger Evolution Cycle'}
            </button>
          </div>
        </div>
      </div>
    </ServicePanel>
  )
}

export default AIEvolutionPanel