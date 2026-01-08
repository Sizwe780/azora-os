"use client"

import { useEffect, useState } from 'react'

export default function FramesList() {
  const [frames, setFrames] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await fetch('/api/design/frames')
      if (!resp.ok) {
        const body = await resp.json()
        throw new Error(body?.error || 'Failed to load')
      }
      const body = await resp.json()
      setFrames(body.frames || [])
    } catch (err: any) {
      setError(err?.message || String(err))
      setFrames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-4">Loading frames…</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!frames || frames.length === 0) return <div className="p-4">No saved frames yet.</div>

  return (
    <div className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-medium">Saved Frames</h3>
        <button className="text-xs text-sky-500" onClick={load}>Refresh</button>
      </div>
      <ul className="space-y-2">
        {frames.map((f: any) => (
          <li key={f.id} className="p-2 border rounded">
            <div className="text-sm font-semibold">{f.name}</div>
            <div className="text-xs text-muted-foreground">{f.width || '—'} × {f.height || '—'}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
