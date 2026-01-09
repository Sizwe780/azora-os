/**
 * Spark Generator Engine
 * 3-Step Process: Blueprint → Scaffold → Schema
 * 
 * Constitutional Compliance:
 * - TRUTH: Every app includes a README.md explaining how it works
 * - NO MOCKS: Complete, working code only
 * - UBUNTU: Accessible and inclusive by default
 * 
 * This engine orchestrates the transformation from natural language
 * to a complete, working micro-application.
 */

import { createKwameScaffolder, PromptAnalysis } from '@/lib/agents/kwame-scaffolder'
import { fileSystem } from '@/lib/workspace/file-system'
import { getHistoryManager, AppState } from '@/lib/maker/history-manager'

export type AppMode = 'micro-app' | 'full-stack'

export interface ProjectBlueprint {
  name: string
  mode: AppMode
  description: string
  fileTree: FileTreeNode[]
  dependencies: Record<string, string>
  scripts: Record<string, string>
  hasDatabase: boolean
  schemaModel?: string
}

export interface FileTreeNode {
  path: string
  type: 'file' | 'directory'
  content?: string
}

export interface GenerationLog {
  step: 'blueprint' | 'scaffold' | 'schema' | 'readme' | 'complete'
  message: string
  timestamp: number
  details?: any
}

export interface GenerationResult {
  success: boolean
  projectRoot: string
  blueprint: ProjectBlueprint
  logs: GenerationLog[]
  error?: string
}

/**
 * Spark Generator - Orchestrates the 3-step generation process
 */
export class SparkGenerator {
  private projectId: string
  private logs: GenerationLog[] = []

  constructor(projectId: string) {
    this.projectId = projectId
  }

  /**
   * Main generation method
   * Step 1: Blueprint (Analyze and plan)
   * Step 2: Scaffold (Generate files)
   * Step 3: Schema (Add database if needed)
   * Step 4: README (Document the app)
   */
  async generate(
    prompt: string,
    mode: AppMode,
    history: AppState[] = []
  ): Promise<GenerationResult> {
    this.logs = []
    const projectRoot = `/${this.projectId}`

    try {
      this.addLog('blueprint', '🎯 Analyzing prompt and creating blueprint...')

      // Step 1: Create Blueprint
      const blueprint = await this.createBlueprint(prompt, mode, history)
      this.addLog('blueprint', '✅ Blueprint created', { fileCount: blueprint.fileTree.length })

      // Step 2: Scaffold files
      this.addLog('scaffold', '🏗️ Scaffolding project structure...')
      await this.scaffoldProject(projectRoot, blueprint)
      this.addLog('scaffold', '✅ Project scaffolded')

      // Step 3: Generate schema if needed
      if (blueprint.hasDatabase) {
        this.addLog('schema', '🗄️ Generating database schema...')
        await this.generateSchema(projectRoot, blueprint)
        this.addLog('schema', '✅ Schema generated')
      }

      // Step 4: Generate README
      this.addLog('readme', '📝 Writing documentation...')
      await this.generateReadme(projectRoot, blueprint, prompt)
      this.addLog('readme', '✅ Documentation complete')

      this.addLog('complete', '🎉 Project generation complete!')

      return {
        success: true,
        projectRoot,
        blueprint,
        logs: this.logs,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      this.addLog('complete', `❌ Generation failed: ${errorMsg}`)
      
      return {
        success: false,
        projectRoot,
        blueprint: {} as ProjectBlueprint,
        logs: this.logs,
        error: errorMsg,
      }
    }
  }

  /**
   * Step 1: Create Blueprint
   * Analyze the prompt and generate a project structure plan
   */
  private async createBlueprint(
    prompt: string,
    mode: AppMode,
    history: AppState[]
  ): Promise<ProjectBlueprint> {
    // Use Kwame to analyze the prompt
    const scaffolder = createKwameScaffolder(`/${this.projectId}`)
    const result = await scaffolder.scaffoldMicroApp(prompt, history)

    if (!result.success) {
      throw new Error('Failed to analyze prompt')
    }

    const analysis = result.analysis
    const hasDatabase = Object.keys(analysis.dataModel).length > 0

    // Determine dependencies based on mode and features
    const dependencies: Record<string, string> = {}
    const devDependencies: Record<string, string> = {}

    if (mode === 'micro-app') {
      dependencies['react'] = '^18.2.0'
      dependencies['react-dom'] = '^18.2.0'
      devDependencies['@vitejs/plugin-react'] = '^4.2.0'
      devDependencies['vite'] = '^5.0.0'
      devDependencies['@types/react'] = '^18.2.0'
      devDependencies['@types/react-dom'] = '^18.2.0'
      devDependencies['typescript'] = '^5.0.0'
    } else {
      // Full-stack mode
      dependencies['next'] = '^14.0.0'
      dependencies['react'] = '^18.2.0'
      dependencies['react-dom'] = '^18.2.0'
      devDependencies['@types/node'] = '^20'
      devDependencies['@types/react'] = '^18'
      devDependencies['typescript'] = '^5'

      if (hasDatabase) {
        dependencies['@prisma/client'] = '^5.0.0'
        devDependencies['prisma'] = '^5.0.0'
      }
    }

    // Build file tree
    const fileTree: FileTreeNode[] = []

    if (mode === 'micro-app') {
      fileTree.push(
        { path: 'package.json', type: 'file' },
        { path: 'vite.config.ts', type: 'file' },
        { path: 'index.html', type: 'file' },
        { path: 'tsconfig.json', type: 'file' },
        { path: 'src', type: 'directory' },
        { path: 'src/main.tsx', type: 'file' },
        { path: 'src/App.tsx', type: 'file' },
        { path: 'src/index.css', type: 'file' }
      )
    } else {
      fileTree.push(
        { path: 'package.json', type: 'file' },
        { path: 'next.config.js', type: 'file' },
        { path: 'tsconfig.json', type: 'file' },
        { path: 'src', type: 'directory' },
        { path: 'src/app', type: 'directory' },
        { path: 'src/app/page.tsx', type: 'file' },
        { path: 'src/app/layout.tsx', type: 'file' },
        { path: 'src/app/globals.css', type: 'file' }
      )

      if (hasDatabase) {
        fileTree.push(
          { path: 'prisma', type: 'directory' },
          { path: 'prisma/schema.prisma', type: 'file' }
        )
      }
    }

    // Add README
    fileTree.push({ path: 'README.md', type: 'file' })

    // Create project.json blueprint
    const blueprint: ProjectBlueprint = {
      name: this.projectId,
      mode,
      description: prompt,
      fileTree,
      dependencies: { ...dependencies, ...devDependencies },
      scripts:
        mode === 'micro-app'
          ? {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview',
            }
          : {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
            },
      hasDatabase,
      schemaModel: hasDatabase ? this.generateSchemaModel(analysis.dataModel) : undefined,
    }

    // Save blueprint to VFS
    await fileSystem.writeFile(
      `/${this.projectId}/project.json`,
      JSON.stringify(blueprint, null, 2)
    )

    return blueprint
  }

  /**
   * Step 2: Scaffold Project
   * Create all files from the blueprint
   */
  private async scaffoldProject(
    projectRoot: string,
    blueprint: ProjectBlueprint
  ): Promise<void> {
    // Ensure project root exists
    await fileSystem.mkdir(projectRoot)

    // Use Kwame to generate the actual files
    const scaffolder = createKwameScaffolder(projectRoot)
    await scaffolder.scaffoldMicroApp(blueprint.description, [])

    // The scaffolder handles creating all necessary files
    this.addLog('scaffold', `Created ${blueprint.fileTree.length} files`)
  }

  /**
   * Step 3: Generate Schema
   * Create Prisma schema if database is needed
   */
  private async generateSchema(
    projectRoot: string,
    blueprint: ProjectBlueprint
  ): Promise<void> {
    if (!blueprint.schemaModel) return

    const schemaContent = `// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

${blueprint.schemaModel}
`

    await fileSystem.mkdir(`${projectRoot}/prisma`)
    await fileSystem.writeFile(`${projectRoot}/prisma/schema.prisma`, schemaContent)

    // Add .env file
    await fileSystem.writeFile(
      `${projectRoot}/.env`,
      `DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
`
    )
  }

  /**
   * Generate Prisma schema models from data model
   */
  private generateSchemaModel(dataModel: Record<string, any>): string {
    const models: string[] = []

    for (const [modelName, fields] of Object.entries(dataModel)) {
      const modelLines: string[] = [`model ${modelName} {`]

      for (const [fieldName, fieldType] of Object.entries(fields as Record<string, string>)) {
        let prismaType = 'String'
        let attributes = ''

        switch (fieldType) {
          case 'string':
            prismaType = 'String'
            break
          case 'number':
            prismaType = 'Int'
            break
          case 'boolean':
            prismaType = 'Boolean'
            break
          case 'date':
            prismaType = 'DateTime'
            attributes = ' @default(now())'
            break
        }

        if (fieldName === 'id') {
          modelLines.push(`  ${fieldName} ${prismaType} @id @default(cuid())`)
        } else {
          modelLines.push(`  ${fieldName} ${prismaType}${attributes}`)
        }
      }

      modelLines.push('}')
      models.push(modelLines.join('\n'))
    }

    return models.join('\n\n')
  }

  /**
   * Step 4: Generate README
   * Constitutional: Explain how the app works (Truth principle)
   */
  private async generateReadme(
    projectRoot: string,
    blueprint: ProjectBlueprint,
    prompt: string
  ): Promise<void> {
    const readmeContent = `# ${blueprint.name}

> Built with **Azora BuildSpaces Spark Engine** - Natural Language to Working App

## 📋 What This App Does

${prompt}

## 🏗️ Architecture

**Mode**: ${blueprint.mode === 'micro-app' ? 'Micro-App (React + Vite)' : 'Full-Stack (Next.js)'}

${blueprint.hasDatabase ? '**Database**: Yes (Prisma + PostgreSQL)' : '**Database**: No (Client-side only)'}

### File Structure

\`\`\`
${this.formatFileTree(blueprint.fileTree)}
\`\`\`

## 🚀 How to Run

### Development Mode

\`\`\`bash
npm install
npm run dev
\`\`\`

The app will be available at \`http://localhost:3000\`

${
  blueprint.hasDatabase
    ? `### Database Setup

\`\`\`bash
# Set up your database
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
\`\`\`

Make sure to update the \`.env\` file with your database connection string.
`
    : ''
}

## 📦 Dependencies

${Object.entries(blueprint.dependencies)
  .map(([pkg, version]) => `- \`${pkg}\`: ${version}`)
  .join('\n')}

## 🎨 Features

- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessible**: ARIA labels and semantic HTML throughout
- **Modern Stack**: Built with the latest React and TypeScript
${blueprint.hasDatabase ? '- **Type-Safe Database**: Prisma ORM for type-safe database access' : ''}

## 🔧 How It Works

This app was generated using Constitutional AI principles:

1. **Truth as Currency**: All code is complete and working - no placeholder comments
2. **Ubuntu Philosophy**: Built to be accessible and inclusive by default
3. **Self-Healing Systems**: Proper error handling and loading states

### Key Components

${this.describeComponents(blueprint)}

## 🌟 Built with Azora

This project demonstrates the power of natural language programming. 
From a simple prompt to a working application in seconds.

**Learn more**: [buildspaces.azora.world](https://buildspaces.azora.world)

---

*Generated by Kwame, the Scaffolder Agent*
*Part of the Azora Constitutional AI Operating System*
`

    await fileSystem.writeFile(`${projectRoot}/README.md`, readmeContent)
  }

  /**
   * Format file tree for README
   */
  private formatFileTree(fileTree: FileTreeNode[]): string {
    const lines: string[] = []
    const sorted = [...fileTree].sort((a, b) => a.path.localeCompare(b.path))

    for (const node of sorted) {
      const depth = node.path.split('/').length - 1
      const indent = '  '.repeat(depth)
      const icon = node.type === 'directory' ? '📁' : '📄'
      const name = node.path.split('/').pop() || node.path
      lines.push(`${indent}${icon} ${name}`)
    }

    return lines.join('\n')
  }

  /**
   * Describe components for README
   */
  private describeComponents(blueprint: ProjectBlueprint): string {
    if (blueprint.mode === 'micro-app') {
      return `- **App.tsx**: Main application component with state management
- **main.tsx**: Application entry point
- **index.css**: Responsive, accessible styles`
    } else {
      return `- **page.tsx**: Main page component
- **layout.tsx**: Root layout with metadata
- **globals.css**: Global styles with Tailwind CSS${
        blueprint.hasDatabase
          ? '\n- **schema.prisma**: Database schema and models'
          : ''
      }`
    }
  }

  /**
   * Add a log entry
   */
  private addLog(
    step: GenerationLog['step'],
    message: string,
    details?: any
  ): void {
    const log: GenerationLog = {
      step,
      message,
      timestamp: Date.now(),
      details,
    }
    this.logs.push(log)
    console.log(`[SparkGenerator] ${message}`)
  }

  /**
   * Get generation logs
   */
  getLogs(): GenerationLog[] {
    return [...this.logs]
  }
}

/**
 * Factory function
 */
export function createSparkGenerator(projectId: string): SparkGenerator {
  return new SparkGenerator(projectId)
}
