/**
 * Prometheus Metrics Endpoint
 * 
 * Constitutional Compliance:
 * - Transparency: Exposes operational metrics for monitoring
 * - Auditability: Tracks system performance and usage
 *
 * Enhanced with:
 * - AI provider circuit breaker metrics (B6)
 * - Constitutional compliance metrics from audit logger (B11)
 * - Rate limiter stats
 */

import { NextResponse } from "next/server"
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getProviderHealth } from '../../../../packages/shared-api/ai-router'
import { auditLogger } from '@/lib/services/centralized-audit-logger'

export const dynamic = "force-dynamic"

interface MetricsData {
  // Process metrics
  process_uptime_seconds: number
  process_memory_heap_used_bytes: number
  process_memory_heap_total_bytes: number
  process_memory_rss_bytes: number

  // HTTP metrics (in-memory counters)
  http_requests_total: number
  http_request_duration_seconds_sum: number
  http_request_duration_seconds_count: number

  // BuildSpaces specific metrics
  buildspaces_active_sessions: number
  buildspaces_code_executions_total: number
  buildspaces_agent_invocations_total: number

  // Constitutional metrics
  constitutional_alignment_score: number
  truth_mandate_score: number
}

// In-memory metrics storage
let metrics: MetricsData = {
  process_uptime_seconds: 0,
  process_memory_heap_used_bytes: 0,
  process_memory_heap_total_bytes: 0,
  process_memory_rss_bytes: 0,
  http_requests_total: 0,
  http_request_duration_seconds_sum: 0,
  http_request_duration_seconds_count: 0,
  buildspaces_active_sessions: 0,
  buildspaces_code_executions_total: 0,
  buildspaces_agent_invocations_total: 0,
  constitutional_alignment_score: 0.99,
  truth_mandate_score: 1.0,
}

/**
 * Update metrics with current values
 */
function updateMetrics(): void {
  const memUsage = process.memoryUsage()
  metrics.process_uptime_seconds = process.uptime()
  metrics.process_memory_heap_used_bytes = memUsage.heapUsed
  metrics.process_memory_heap_total_bytes = memUsage.heapTotal
  metrics.process_memory_rss_bytes = memUsage.rss
  metrics.http_requests_total += 1

  // Pull constitutional stats from the centralized audit logger
  try {
    const stats = auditLogger.getStats()
    metrics.constitutional_alignment_score = stats.avgConstitutionalScore / 100
    metrics.truth_mandate_score = stats.complianceRate / 100
  } catch {
    // audit logger unavailable; keep last known values
  }
}

/**
 * Format metrics in Prometheus text format
 */
function formatPrometheusMetrics(data: MetricsData): string {
  let output = `# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${data.process_uptime_seconds}

# HELP process_memory_heap_used_bytes Heap memory used in bytes
# TYPE process_memory_heap_used_bytes gauge
process_memory_heap_used_bytes ${data.process_memory_heap_used_bytes}

# HELP process_memory_heap_total_bytes Total heap memory in bytes
# TYPE process_memory_heap_total_bytes gauge
process_memory_heap_total_bytes ${data.process_memory_heap_total_bytes}

# HELP process_memory_rss_bytes Resident set size in bytes
# TYPE process_memory_rss_bytes gauge
process_memory_rss_bytes ${data.process_memory_rss_bytes}

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${data.http_requests_total}

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds summary
http_request_duration_seconds_sum ${data.http_request_duration_seconds_sum}
http_request_duration_seconds_count ${data.http_request_duration_seconds_count}

# HELP buildspaces_active_sessions Number of active BuildSpace sessions
# TYPE buildspaces_active_sessions gauge
buildspaces_active_sessions ${data.buildspaces_active_sessions}

# HELP buildspaces_code_executions_total Total number of code executions
# TYPE buildspaces_code_executions_total counter
buildspaces_code_executions_total ${data.buildspaces_code_executions_total}

# HELP buildspaces_agent_invocations_total Total number of agent invocations
# TYPE buildspaces_agent_invocations_total counter
buildspaces_agent_invocations_total ${data.buildspaces_agent_invocations_total}

# HELP constitutional_alignment_score Constitutional alignment score (0-1)
# TYPE constitutional_alignment_score gauge
constitutional_alignment_score ${data.constitutional_alignment_score}

# HELP truth_mandate_score Truth mandate compliance score (0-1)
# TYPE truth_mandate_score gauge
truth_mandate_score ${data.truth_mandate_score}
`

  // Append AI provider circuit breaker metrics (B6)
  try {
    const health = getProviderHealth()
    output += `\n# HELP ai_provider_circuit_state AI provider circuit breaker state (0=CLOSED, 1=HALF_OPEN, 2=OPEN)\n`
    output += `# TYPE ai_provider_circuit_state gauge\n`
    for (const [provider, info] of Object.entries(health)) {
      const stateVal = info.state === 'CLOSED' ? 0 : info.state === 'HALF_OPEN' ? 1 : 2
      output += `ai_provider_circuit_state{provider="${provider}"} ${stateVal}\n`
    }

    output += `\n# HELP ai_provider_failures_total AI provider consecutive failure count\n`
    output += `# TYPE ai_provider_failures_total gauge\n`
    for (const [provider, info] of Object.entries(health)) {
      output += `ai_provider_failures_total{provider="${provider}"} ${info.failures}\n`
    }
  } catch {
    // provider health unavailable
  }

  // Append audit stats
  try {
    const stats = auditLogger.getStats()
    output += `\n# HELP audit_entries_total Total audit log entries in buffer\n`
    output += `# TYPE audit_entries_total gauge\n`
    output += `audit_entries_total ${stats.total}\n`

    output += `\n# HELP audit_compliance_rate Constitutional compliance rate percentage\n`
    output += `# TYPE audit_compliance_rate gauge\n`
    output += `audit_compliance_rate ${stats.complianceRate}\n`

    for (const [severity, count] of Object.entries(stats.bySeverity)) {
      output += `audit_entries_by_severity{severity="${severity}"} ${count}\n`
    }
  } catch {
    // audit stats unavailable
  }

  return output
}

/**
 * GET /api/metrics
 * Returns metrics in Prometheus text format
 */
export async function GET() {
  // SECURITY: require authenticated session to view metrics
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  updateMetrics()

  const metricsText = formatPrometheusMetrics(metrics)

  return new NextResponse(metricsText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  })
}

/**
 * Helper function to increment a counter metric
 * Can be imported and used by other parts of the application
 */
export function incrementMetric(
  metricName: keyof Pick<
    MetricsData,
    | "http_requests_total"
    | "buildspaces_code_executions_total"
    | "buildspaces_agent_invocations_total"
  >
): void {
  if (typeof metrics[metricName] === "number") {
    ;(metrics[metricName] as number) += 1
  }
}

/**
 * Helper function to set a gauge metric
 */
export function setMetric(
  metricName: keyof MetricsData,
  value: number
): void {
  metrics[metricName] = value
}

/**
 * Helper function to observe a duration
 */
export function observeDuration(durationSeconds: number): void {
  metrics.http_request_duration_seconds_sum += durationSeconds
  metrics.http_request_duration_seconds_count += 1
}
