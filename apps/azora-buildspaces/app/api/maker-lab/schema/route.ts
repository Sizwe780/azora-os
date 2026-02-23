import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface TableSchema {
  id: string;
  name: string;
  columns: ColumnSchema[];
  position: { x: number; y: number };
}

interface ColumnSchema {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
}

// In-memory storage for demo - replace with database in production
let projectSchemas: Record<string, { tables: TableSchema[]; updatedAt: string }> = {}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get('project')

    if (!project) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 })
    }

    // Load schema from file system (or database)
    const schemaPath = path.join(process.cwd(), 'data', 'schemas', `${project}.json`)

    try {
      const schemaData = await fs.readFile(schemaPath, 'utf-8')
      const schema = JSON.parse(schemaData)
      return NextResponse.json(schema)
    } catch (error) {
      // Return empty schema if file doesn't exist
      return NextResponse.json({ tables: [], project })
    }

  } catch (error) {
    console.error('Error loading schema:', error)
    return NextResponse.json({ error: 'Failed to load schema' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project, table } = body

    if (!project || !table) {
      return NextResponse.json({ error: 'Project and table data required' }, { status: 400 })
    }

    // Load existing schema
    const schemaPath = path.join(process.cwd(), 'data', 'schemas', `${project}.json`)
    let schema: { tables: TableSchema[], project: string } = { tables: [], project }

    try {
      const schemaData = await fs.readFile(schemaPath, 'utf-8')
      schema = JSON.parse(schemaData)
    } catch (error) {
      // Schema doesn't exist, create directory
      await fs.mkdir(path.dirname(schemaPath), { recursive: true })
    }

    // Add new table
    const newTable: TableSchema = {
      id: `table_${Date.now()}`,
      name: table.name,
      columns: table.columns || [],
      position: table.position || { x: 100, y: 100 }
    }

    schema.tables.push(newTable)

    // Save schema
    await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2))

    return NextResponse.json({ success: true, table: newTable })

  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { project, tables, nodes, edges } = body

    if (!project) {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 })
    }

    // Save schema
    const schemaPath = path.join(process.cwd(), 'data', 'schemas', `${project}.json`)
    await fs.mkdir(path.dirname(schemaPath), { recursive: true })

    const schema = {
      project,
      tables: tables || [],
      nodes: nodes || [],
      edges: edges || [],
      updatedAt: new Date().toISOString()
    }

    await fs.writeFile(schemaPath, JSON.stringify(schema, null, 2))

    return NextResponse.json({ success: true, message: 'Schema saved' })

  } catch (error) {
    console.error('Error saving schema:', error)
    return NextResponse.json({ error: 'Failed to save schema' }, { status: 500 })
  }
}