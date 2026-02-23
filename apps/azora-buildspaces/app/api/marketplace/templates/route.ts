import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  author: string;
  rating: number;
  downloads: number;
  price: string;
  tags: string[];
  icon: string;
  color: string;
  content?: any;
  createdAt: string;
  updatedAt: string;
}

// Default templates
const defaultTemplates: Template[] = [
  {
    id: '1',
    name: 'SaaS Starter Kit',
    description: 'Next.js 14 + Prisma + NextAuth + Stripe integration.',
    category: 'Full-Stack',
    author: 'Azora Team',
    rating: 4.9,
    downloads: 1200,
    price: 'Free',
    tags: ['Next.js', 'Prisma', 'Stripe'],
    icon: 'Code2',
    color: 'text-blue-500',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'AI Agent Workflow',
    description: 'Pre-configured Elara workflow for automated code reviews.',
    category: 'AI',
    author: 'Sankofa',
    rating: 5.0,
    downloads: 850,
    price: '50 AZR',
    tags: ['AI', 'Elara', 'Automation'],
    icon: 'Sparkles',
    color: 'text-purple-500',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Modern Dashboard UI',
    description: 'Beautiful Tailwind CSS dashboard with 50+ components.',
    category: 'Design',
    author: 'Naledi',
    rating: 4.8,
    downloads: 2500,
    price: 'Free',
    tags: ['Tailwind', 'React', 'UI'],
    icon: 'Palette',
    color: 'text-pink-500',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'E-commerce Schema',
    description: 'Optimized PostgreSQL schema for high-scale retail.',
    category: 'Database',
    author: 'Themba',
    rating: 4.7,
    downloads: 600,
    price: '20 AZR',
    tags: ['Postgres', 'SQL', 'Schema'],
    icon: 'Database',
    color: 'text-orange-500',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Try to load templates from file system
    const templatesPath = path.join(process.cwd(), 'data', 'marketplace', 'templates.json')

    let templates: Template[] = defaultTemplates

    try {
      const templatesData = await fs.readFile(templatesPath, 'utf-8')
      const loadedTemplates = JSON.parse(templatesData)
      if (Array.isArray(loadedTemplates)) {
        templates = loadedTemplates
      }
    } catch (error) {
      // Use default templates if file doesn't exist
      await fs.mkdir(path.dirname(templatesPath), { recursive: true })
      await fs.writeFile(templatesPath, JSON.stringify(defaultTemplates, null, 2))
    }

    // Filter templates
    let filteredTemplates = templates

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category.toLowerCase() === category.toLowerCase())
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredTemplates = filteredTemplates.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.description.toLowerCase().includes(searchLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return NextResponse.json({
      templates: filteredTemplates,
      total: filteredTemplates.length
    })

  } catch (error) {
    console.error('Error loading templates:', error)
    return NextResponse.json(
      { error: 'Failed to load templates', success: false },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, category, tags, content, price = 'Free' } = body

    if (!name || !description || !category) {
      return NextResponse.json({ error: 'Name, description, and category are required' }, { status: 400 })
    }

    // Load existing templates
    const templatesPath = path.join(process.cwd(), 'data', 'marketplace', 'templates.json')
    let templates: Template[] = defaultTemplates

    try {
      const templatesData = await fs.readFile(templatesPath, 'utf-8')
      templates = JSON.parse(templatesData)
    } catch (error) {
      // Use defaults
    }

    // Determine author from session
    const author = (session.user as any).email || (session.user as any).id

    // Create new template
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      name,
      description,
      category,
      author,
      rating: 0,
      downloads: 0,
      price,
      tags: tags || [],
      icon: 'Code2',
      color: 'text-blue-500',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    templates.push(newTemplate)

    // Save templates
    await fs.mkdir(path.dirname(templatesPath), { recursive: true })
    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2))

    return NextResponse.json({ success: true, template: newTemplate })

  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}