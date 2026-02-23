import { NextResponse } from 'next/server'

// In-memory store for specs (for demo purposes)
// In a real app, this would be a database
let specs: any[] = []

export async function GET() {
  return NextResponse.json({ specs })
}

export async function POST(req: Request) {
  try {
    const spec = await req.json()
    
    const newSpec = {
      id: `spec-${Date.now()}`,
      ...spec,
      lastModified: new Date().toISOString(),
      author: 'Current User',
    }
    
    specs.unshift(newSpec)
    
    return NextResponse.json({ success: true, spec: newSpec })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save spec' }, { status: 500 })
  }
}
