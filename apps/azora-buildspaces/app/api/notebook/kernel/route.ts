import { NextRequest, NextResponse } from 'next/server'

/**
 * Notebook — Kernel Management (Jupyter parity)
 * GET/POST /api/notebook/kernel
 *
 * Manages the notebook execution kernel: status, restart, interrupt.
 * Tracks variables in scope for the variable inspector.
 *
 * Industry parity: Jupyter Kernel, Google Colab Runtime
 */

interface KernelState {
  id: string
  status: 'idle' | 'busy' | 'starting' | 'error' | 'dead'
  language: string
  startedAt: string
  executionCount: number
  variables: Record<string, { type: string; value: string; size?: number }>
  memoryUsage: { used: number; limit: number }
}

// In-memory kernel store
const kernels = new Map<string, KernelState>()

function getOrCreateKernel(kernelId: string): KernelState {
  let kernel = kernels.get(kernelId)
  if (!kernel) {
    kernel = {
      id: kernelId,
      status: 'idle',
      language: 'typescript',
      startedAt: new Date().toISOString(),
      executionCount: 0,
      variables: {},
      memoryUsage: { used: 0, limit: 512 * 1024 * 1024 }, // 512MB
    }
    kernels.set(kernelId, kernel)
  }
  return kernel
}

export async function GET(req: NextRequest) {
  const kernelId = req.nextUrl.searchParams.get('kernelId') || 'default'
  const kernel = getOrCreateKernel(kernelId)

  return NextResponse.json({
    kernel: {
      id: kernel.id,
      status: kernel.status,
      language: kernel.language,
      startedAt: kernel.startedAt,
      executionCount: kernel.executionCount,
      memoryUsage: kernel.memoryUsage,
    },
    variables: Object.entries(kernel.variables).map(([name, info]) => ({
      name,
      ...info,
    })),
    variableCount: Object.keys(kernel.variables).length,
  })
}

export async function POST(req: NextRequest) {
  try {
    const { action, kernelId = 'default', code, variableName } = await req.json()

    const kernel = getOrCreateKernel(kernelId)

    if (action === 'restart') {
      kernel.status = 'starting'
      kernel.executionCount = 0
      kernel.variables = {}
      kernel.startedAt = new Date().toISOString()
      kernel.memoryUsage.used = 0
      // Simulate restart
      setTimeout(() => {
        kernel.status = 'idle'
      }, 100)
      return NextResponse.json({ success: true, message: 'Kernel restarting', kernel })
    }

    if (action === 'interrupt') {
      kernel.status = 'idle'
      return NextResponse.json({ success: true, message: 'Execution interrupted', kernel })
    }

    if (action === 'execute') {
      if (!code) {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 })
      }

      kernel.status = 'busy'
      kernel.executionCount += 1
      const startTime = Date.now()

      // Sandboxed execution using Function constructor (safer than eval)
      let output: string
      let outputType: 'text' | 'error' = 'text'

      try {
        const safeCode = code.trim()
        // Block access to Node.js internals and module system
        const BLOCKED_TOKENS = [
          'require', 'import', 'process', '__dirname', '__filename',
          'child_process', 'globalThis', 'global.', 'Buffer',
        ]
        const isRestricted = BLOCKED_TOKENS.some((t) => safeCode.includes(t))

        if (isRestricted) {
          output = `[Security] Restricted operation. Use the Code Chamber for full execution.`
          outputType = 'error'
        } else {
          // Use Function constructor instead of eval for slightly better isolation.
          // In production, this should be replaced with isolated-vm or QuickJS WASM.
          const fn = new Function(`"use strict"; return (${safeCode})`)
          const result = fn()
          output = result !== undefined ? String(result) : '(no output)'
          // Track variable assignments (basic heuristic)
          const assignMatch = safeCode.match(/^(?:const|let|var)\s+(\w+)\s*=/)
          if (assignMatch) {
            const serialized = JSON.stringify(result)
            kernel.variables[assignMatch[1]] = {
              type: typeof result,
              value: (serialized ?? String(result)).slice(0, 200),
            }
          }
        }
      } catch (e: any) {
        output = e.message || String(e)
        outputType = 'error'
      }

      const executionTime = Date.now() - startTime
      kernel.status = 'idle'
      kernel.memoryUsage.used = Math.min(
        kernel.memoryUsage.limit,
        kernel.memoryUsage.used + 1024,
      )

      return NextResponse.json({
        success: true,
        output: {
          type: outputType,
          content: output,
          executionCount: kernel.executionCount,
          executionTime,
        },
        kernel: {
          status: kernel.status,
          executionCount: kernel.executionCount,
        },
      })
    }

    if (action === 'inspect') {
      if (!variableName) {
        return NextResponse.json({ error: 'variableName is required' }, { status: 400 })
      }
      const variable = kernel.variables[variableName]
      if (!variable) {
        return NextResponse.json({ error: `Variable "${variableName}" not found` }, { status: 404 })
      }
      return NextResponse.json({ name: variableName, ...variable })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
