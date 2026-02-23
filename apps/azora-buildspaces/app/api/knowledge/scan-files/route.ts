import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { promises as fs } from 'fs'
import path from 'path'

interface KnowledgeItem {
  id: string
  title: string
  type: "file" | "function" | "component" | "api" | "schema" | "doc" | "external"
  path?: string
  description?: string
  relevance?: number
  source?: string
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication for GET
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const workspaceRoot = process.cwd()
    const items: KnowledgeItem[] = []

    // Scan for files recursively
    async function scanDirectory(dirPath: string, relativePath = '') {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)
          const relPath = path.join(relativePath, entry.name)

          // Skip node_modules, .git, .next, etc.
          if (entry.name.startsWith('.') ||
              entry.name === 'node_modules' ||
              entry.name === 'dist' ||
              entry.name === 'build' ||
              entry.name === '.next' ||
              entry.name === '.turbo') {
            continue
          }

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, relPath)
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase()
            const fileName = entry.name

            // Determine file type
            let type: KnowledgeItem['type'] = 'file'
            let description = ''

            if (['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
              type = 'file'
              description = `Source code file (${ext.slice(1).toUpperCase()})`

              // Try to extract functions/components from the file
              try {
                const content = await fs.readFile(fullPath, 'utf-8')

                // Extract function names
                const functionMatches = content.match(/function\s+(\w+)/g) || []
                const arrowFunctionMatches = content.match(/const\s+(\w+)\s*=\s*(?:\([^)]*\)\s*=>|function)/g) || []
                const classMatches = content.match(/class\s+(\w+)/g) || []

                const functions = [
                  ...functionMatches.map(m => m.replace('function ', '')),
                  ...arrowFunctionMatches.map(m => m.replace(/const\s+/, '').replace(/\s*=.*$/, '')),
                  ...classMatches.map(m => m.replace('class ', ''))
                ]

                functions.forEach(funcName => {
                  items.push({
                    id: `${relPath}:${funcName}`,
                    title: funcName,
                    type: 'function',
                    path: relPath,
                    description: `Function defined in ${fileName}`,
                    relevance: 0.8
                  })
                })

                // Check for API routes
                if (relPath.includes('/api/') && fileName === 'route.ts') {
                  const apiPath = relPath.replace('/route.ts', '').replace('app/api', '')
                  items.push({
                    id: `api:${apiPath}`,
                    title: apiPath,
                    type: 'api',
                    path: relPath,
                    description: `API endpoint: ${apiPath}`,
                    relevance: 0.9
                  })
                }

                // Check for components
                if (content.includes('export default') && (fileName.endsWith('.tsx') || fileName.endsWith('.jsx'))) {
                  const componentMatch = content.match(/export default (?:function|const)?\s*(\w+)/)
                  if (componentMatch) {
                    items.push({
                      id: `${relPath}:${componentMatch[1]}`,
                      title: componentMatch[1],
                      type: 'component',
                      path: relPath,
                      description: `React component in ${fileName}`,
                      relevance: 0.85
                    })
                  }
                }

              } catch (error) {
                // Ignore file read errors
              }

            } else if (['.md', '.txt', '.rst'].includes(ext)) {
              type = 'doc'
              description = `Documentation file (${ext.slice(1).toUpperCase()})`
            } else if (['.json', '.yaml', '.yml'].includes(ext)) {
              type = 'schema'
              description = `Configuration/schema file (${ext.slice(1).toUpperCase()})`
            }

            // Add the file itself
            items.push({
              id: relPath,
              title: fileName,
              type,
              path: relPath,
              description,
              relevance: type === 'file' ? 0.6 : 0.7
            })
          }
        }
      } catch (error) {
        // Ignore directory read errors
      }
    }

    await scanDirectory(workspaceRoot)

    return NextResponse.json({
      success: true,
      items,
      total: items.length
    })

  } catch (error) {
    console.error('Error scanning files:', error)
    return NextResponse.json(
      { error: 'Failed to scan files', success: false },
      { status: 500 }
    )
  }
}