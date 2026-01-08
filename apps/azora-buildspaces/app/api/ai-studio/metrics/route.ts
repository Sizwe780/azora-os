import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface AgentMetricsData {
  agentUsageData: Array<{
    name: string;
    tokens: number;
    cost: number;
    latency: number;
  }>;
  tokenHistory: Array<{
    hour: string;
    tokens: number;
  }>;
  summary: {
    totalCost: number;
    totalTokens: number;
    avgLatency: number;
    activeAgents: number;
  };
}

// In-memory metrics storage - replace with database in production
let metricsData: AgentMetricsData = {
  agentUsageData: [
    { name: 'Sankofa', tokens: 4500, cost: 0.12, latency: 1.2 },
    { name: 'Themba', tokens: 3200, cost: 0.08, latency: 1.5 },
    { name: 'Jabari', tokens: 1200, cost: 0.03, latency: 0.8 },
    { name: 'Nia', tokens: 2800, cost: 0.07, latency: 2.1 },
    { name: 'Imani', tokens: 1500, cost: 0.04, latency: 1.1 },
    { name: 'Elara', tokens: 8500, cost: 0.25, latency: 0.5 },
  ],
  tokenHistory: Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    tokens: Math.floor(Math.random() * 5000) + 1000,
  })),
  summary: {
    totalCost: 12.45,
    totalTokens: 1200000,
    avgLatency: 1.4,
    activeAgents: 6
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try to load real metrics from file system
    const metricsPath = path.join(process.cwd(), 'data', 'metrics', 'ai-studio.json')

    try {
      const metricsContent = await fs.readFile(metricsPath, 'utf-8')
      const realMetrics = JSON.parse(metricsContent)
      return NextResponse.json(realMetrics)
    } catch (error) {
      // File doesn't exist, return mock data with some randomization
      // Simulate real-time updates
      const updatedMetrics = {
        ...metricsData,
        tokenHistory: Array.from({ length: 24 }, (_, i) => ({
          hour: `${i}:00`,
          tokens: Math.floor(Math.random() * 5000) + 1000,
        })),
        summary: {
          ...metricsData.summary,
          totalTokens: metricsData.summary.totalTokens + Math.floor(Math.random() * 1000),
          totalCost: metricsData.summary.totalCost + (Math.random() * 0.1),
          avgLatency: metricsData.summary.avgLatency + (Math.random() - 0.5) * 0.2
        }
      }

      return NextResponse.json(updatedMetrics)
    }

  } catch (error) {
    console.error('Error loading metrics:', error)
    return NextResponse.json(
      { error: 'Failed to load metrics', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { agentName, tokens, cost, latency } = body

    if (!agentName || typeof tokens !== 'number') {
      return NextResponse.json({ error: 'Invalid metrics data' }, { status: 400 })
    }

    // Update in-memory metrics
    const agentIndex = metricsData.agentUsageData.findIndex(a => a.name === agentName)
    if (agentIndex >= 0) {
      metricsData.agentUsageData[agentIndex].tokens += tokens
      metricsData.agentUsageData[agentIndex].cost += cost || 0
      if (latency) {
        metricsData.agentUsageData[agentIndex].latency = latency
      }
    } else {
      metricsData.agentUsageData.push({
        name: agentName,
        tokens,
        cost: cost || 0,
        latency: latency || 1.0
      })
    }

    // Update summary
    metricsData.summary.totalTokens += tokens
    metricsData.summary.totalCost += cost || 0
    metricsData.summary.activeAgents = metricsData.agentUsageData.length

    // Save to file system
    const metricsPath = path.join(process.cwd(), 'data', 'metrics', 'ai-studio.json')
    await fs.mkdir(path.dirname(metricsPath), { recursive: true })
    await fs.writeFile(metricsPath, JSON.stringify(metricsData, null, 2))

    return NextResponse.json({ success: true, message: 'Metrics updated' })

  } catch (error) {
    console.error('Error updating metrics:', error)
    return NextResponse.json({ error: 'Failed to update metrics' }, { status: 500 })
  }
}