import { NextResponse } from 'next/server'

const EXECUTOR_URL = process.env.NOTEBOOK_EXECUTOR_URL || ''

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const code = body.code || ''

    if (!EXECUTOR_URL) {
      return NextResponse.json({ error: 'Notebook executor not configured. Set NOTEBOOK_EXECUTOR_URL to proxy to a kernel service.' }, { status: 501 })
    }

    // Proxy the request to external executor (assumes JSON API)
    const resp = await fetch(EXECUTOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })

    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: `Executor error: ${text}` }, { status: resp.status })
    }

    const data = await resp.json()
    return NextResponse.json({ result: data.result || '', raw: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
