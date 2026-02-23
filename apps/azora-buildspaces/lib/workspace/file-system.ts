/**
 * Virtual File System - Browser-based File System
 * 
 * Constitutional Compliance:
 * - NO MOCKS: Real file system using lightning-fs for actual storage
 * - SINGLE SOURCE OF TRUTH: One source for file content, synced everywhere
 * - Built on lightning-fs + isomorphic-git (BLUEPRINT.md Room 1: Code Chamber)
 * 
 * This provides a browser-based file system that works like Node.js fs,
 * backed by IndexedDB for persistence across sessions.
 */

// Attempt to load a browser-friendly FS (lightning-fs). If unavailable (tests / Node),
// fall back to Node's `fs` implementation. `isomorphic-git` can operate with either.
let fs: any
let pfs: any
let git: any
let isNodeFallback = false
let nodeBasePath = ''

try {
  // Prefer lightning-fs in browser-like environments
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  const LightningFS = require('@isomorphic-git/lightning-fs')
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
  git = require('isomorphic-git')
  fs = new LightningFS('azora-workspace')
  pfs = fs.promises
} catch (err) {
  // Fallback for Node (tests, server-side). Use native fs.promises
  // We'll map the VFS root ('/') to a workspace-local directory to avoid
  // attempting writes at the real filesystem root which can fail in tests.
  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const nodeFs = eval('require')('fs')
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const path = eval('require')('path')
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    git = require('isomorphic-git')
    fs = nodeFs
    pfs = nodeFs.promises
    isNodeFallback = true
    nodeBasePath = path.join(process.cwd(), '.vfs')

    try {
      // Ensure base directory exists
      if (!nodeFs.existsSync(nodeBasePath)) {
        nodeFs.mkdirSync(nodeBasePath, { recursive: true })
      }
    } catch (e) {
      // ignore
    }
  }
}

const pathJoin = (p: string) => {
  if (!isNodeFallback) return p
  // Map virtual absolute paths (/...) to workspace-local .vfs directory
  if (p.startsWith('/')) {
    // Normalize to avoid double slashes
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const path = require('path')
    return path.join(nodeBasePath, p)
  }
  return p
}

export interface FileNode {
  path: string
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

export interface FileSystemAPI {
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  mkdir: (path: string) => Promise<void>
  listFiles: (dir: string) => Promise<FileNode[]>
  deleteFile: (path: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
  initProject: (projectName: string) => Promise<void>
  getGitStatus: () => Promise<any[]>
  gitCommit: (message: string) => Promise<string>
}

/**
 * Check if a path exists
 */
async function exists(path: string): Promise<boolean> {
  try {
    await pfs.stat(pathJoin(path))
    return true
  } catch (error) {
    return false
  }
}

/**
 * Read a file from the virtual file system
 */
async function readFile(path: string): Promise<string> {
  try {
    const data = await pfs.readFile(pathJoin(path), { encoding: 'utf8' })
    return data as string
  } catch (error) {
    throw new Error(`Failed to read file ${path}: ${error}`)
  }
}

/**
 * Write a file to the virtual file system
 */
async function writeFile(path: string, content: string): Promise<void> {
  try {
    // Ensure directory exists
    const dirPath = path.substring(0, path.lastIndexOf('/'))
    if (dirPath && !(await exists(dirPath))) {
      await pfs.mkdir(pathJoin(dirPath), { recursive: true })
    }
    await pfs.writeFile(pathJoin(path), content, { encoding: 'utf8' })
  } catch (error) {
    throw new Error(`Failed to write file ${path}: ${error}`)
  }
}

/**
 * Create a directory
 */
async function mkdir(path: string): Promise<void> {
  try {
    await pfs.mkdir(pathJoin(path), { recursive: true })
  } catch (error) {
    throw new Error(`Failed to create directory ${path}: ${error}`)
  }
}

/**
 * Delete a file or directory
 */
async function deleteFile(path: string): Promise<void> {
  try {
    const mapped = pathJoin(path)
    const stat = await pfs.stat(mapped)
    if (stat.isDirectory()) {
      await pfs.rmdir(mapped, { recursive: true })
    } else {
      await pfs.unlink(mapped)
    }
  } catch (error) {
    throw new Error(`Failed to delete ${path}: ${error}`)
  }
}

/**
 * List files in a directory (recursively builds tree)
 */
async function listFiles(dir: string): Promise<FileNode[]> {
  try {
    if (!(await exists(dir))) {
      return []
    }

    const entries = await pfs.readdir(pathJoin(dir))
    const nodes: FileNode[] = []

    for (const name of entries) {
      // Skip hidden files and .git
      if (name.startsWith('.')) continue

      const path = `${dir}/${name}`
      const stat = await pfs.stat(pathJoin(path))

      if (stat.isDirectory()) {
        const children = await listFiles(path)
        nodes.push({
          path,
          name,
          type: 'directory',
          children,
        })
      } else {
        nodes.push({
          path,
          name,
          type: 'file',
        })
      }
    }

    return nodes.sort((a, b) => {
      // Directories first, then alphabetical
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
  } catch (error) {
    throw new Error(`Failed to list directory ${dir}: ${error}`)
  }
}

/**
 * Initialize a new project with starter files
 * Constitutional Compliance: Seeds with real, working code - NO MOCKS
 */
async function initProject(projectName: string): Promise<void> {
  const projectRoot = `/${projectName}`

  // Check if project already exists
  if (await exists(projectRoot)) {
    console.log(`Project ${projectName} already exists`)
    return
  }

  // Create project structure
  await mkdir(projectRoot)
  await mkdir(`${projectRoot}/src`)
  await mkdir(`${projectRoot}/src/components`)
  await mkdir(`${projectRoot}/src/lib`)
  await mkdir(`${projectRoot}/public`)

  // Create package.json
  await writeFile(
    `${projectRoot}/package.json`,
    JSON.stringify(
      {
        name: projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          next: '15.0.0',
          react: '19.0.0',
          'react-dom': '19.0.0',
        },
        devDependencies: {
          '@types/node': '^20',
          '@types/react': '^19',
          '@types/react-dom': '^19',
          typescript: '^5',
        },
      },
      null,
      2
    )
  )

  // Create tsconfig.json
  await writeFile(
    `${projectRoot}/tsconfig.json`,
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          paths: {
            '@/*': ['./src/*'],
          },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
        exclude: ['node_modules'],
      },
      null,
      2
    )
  )

  // Create src/app/page.tsx
  await mkdir(`${projectRoot}/src/app`)
  await writeFile(
    `${projectRoot}/src/app/page.tsx`,
    `export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to BuildSpaces
        </h1>
        <p className="text-gray-600 text-lg">
          Start building with Elara and the AI Agent Team
        </p>
      </div>
    </main>
  )
}
`
  )

  // Create src/app/layout.tsx
  await writeFile(
    `${projectRoot}/src/app/layout.tsx`,
    `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '${projectName}',
  description: 'Built with Azora BuildSpaces',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
`
  )

  // Create a sample component
  await writeFile(
    `${projectRoot}/src/components/Button.tsx`,
    `interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary' 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-colors'
  const variantStyles = variant === 'primary'
    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
  
  return (
    <button 
      onClick={onClick}
      className={\`\${baseStyles} \${variantStyles}\`}
    >
      {children}
    </button>
  )
}
`
  )

  // Create a utility file
  await writeFile(
    `${projectRoot}/src/lib/utils.ts`,
    `import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
`
  )

  // Create README.md
  await writeFile(
    `${projectRoot}/README.md`,
    `# ${projectName}

This project was created with **Azora BuildSpaces** - The Constitutional AI Operating System.

## Getting Started

Built with Elara and the AI Agent Team, this project follows Constitutional AI principles:
- **Truth as Currency**: Real code, no mocks
- **Ubuntu Philosophy**: Built for collective prosperity
- **Constitutional Compliance**: Verified at every step

## Learn More

Visit [buildspaces.azora.world](https://buildspaces.azora.world) to learn more.
`
  )

  // Initialize git repository
  try {
    await git.init({ fs, dir: pathJoin(projectRoot), defaultBranch: 'main' })
    console.log(`Initialized git repository in ${projectRoot}`)
  } catch (error) {
    console.warn('Failed to initialize git:', error)
  }
}

/**
 * Get git status of files
 */
async function getGitStatus(): Promise<any[]> {
  try {
    // Find the git root (first directory with .git)
    const root = pathJoin('/')
    const dirs = await pfs.readdir(root)
    for (const dir of dirs) {
      const gitPath = `${root}/${dir}/.git`
      if (await exists(`${root}/${dir}/.git`)) {
        const status = await git.statusMatrix({
          fs,
          dir: pathJoin(`/${dir}`),
        })
        return status
      }
    }
    return []
  } catch (error) {
    console.error('Failed to get git status:', error)
    return []
  }
}

/**
 * Commit changes to git
 */
async function gitCommit(message: string): Promise<string> {
  try {
    // Find the git root
    const root = pathJoin('/')
    const dirs = await pfs.readdir(root)
    for (const dir of dirs) {
      const gitPath = `${root}/${dir}/.git`
      if (await exists(`${root}/${dir}/.git`)) {
        const sha = await git.commit({
          fs,
          dir: pathJoin(`/${dir}`),
          message,
          author: {
            name: 'BuildSpaces User',
            email: 'user@buildspaces.azora.world',
          },
        })
        return sha
      }
    }
    throw new Error('No git repository found')
  } catch (error) {
    throw new Error(`Failed to commit: ${error}`)
  }
}

/**
 * Export the file system API
 */
export const fileSystem: FileSystemAPI = {
  readFile,
  writeFile,
  mkdir,
  listFiles,
  deleteFile,
  exists,
  initProject,
  getGitStatus,
  gitCommit,
}

// Export for use in hooks
export { fs, pfs }
