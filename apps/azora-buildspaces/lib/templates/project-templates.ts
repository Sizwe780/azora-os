/* eslint-disable @typescript-eslint/no-require-imports */
export interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'web' | 'mobile' | 'api' | 'ai' | 'blockchain'
  files: Record<string, { content: string; type: 'file' | 'directory' }>
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'nextjs-app',
    name: 'Next.js App',
    description: 'Full-stack React application with TypeScript',
    icon: '⚛️',
    category: 'web',
    files: {
      'package.json': {
        content: JSON.stringify({
          name: 'my-app',
          version: '0.1.0',
          scripts: {
            dev: 'next dev',
            build: 'next build',
            start: 'next start'
          },
          dependencies: {
            'next': '^14.0.0',
            'react': '^18.0.0',
            'react-dom': '^18.0.0'
          }
        }, null, 2),
        type: 'file'
      },
      'src': { content: '', type: 'directory' },
      'src/app': { content: '', type: 'directory' },
      'src/app/page.tsx': {
        content: `"use client"

import { useState } from 'react'

export default function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to BuildSpaces</h1>
        <p className="text-gray-600 mb-8">Your AI-powered development environment</p>
        <button
          onClick={() => setCount(count + 1)}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Count: {count}
        </button>
      </div>
    </main>
  )
}`,
        type: 'file'
      },
      'src/app/layout.tsx': {
        content: `import './globals.css'

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
}`,
        type: 'file'
      },
      'src/app/globals.css': {
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`,
        type: 'file'
      }
    }
  },
  {
    id: 'express-api',
    name: 'Express API',
    description: 'RESTful API server with Node.js and Express',
    icon: '🚀',
    category: 'api',
    files: {
      'package.json': {
        content: JSON.stringify({
          name: 'api-server',
          version: '1.0.0',
          scripts: {
            start: 'node server.js',
            dev: 'nodemon server.js'
          },
          dependencies: {
            'express': '^4.18.0',
            'cors': '^2.8.5',
            'helmet': '^7.0.0'
          }
        }, null, 2),
        type: 'file'
      },
      'server.js': {
        content: `const express = require('express')
const cors = require('cors')
const helmet = require('helmet')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ])
})

app.post('/api/users', (req, res) => {
  const { name, email } = req.body
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  }
  res.status(201).json(newUser)
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})`,
        type: 'file'
      }
    }
  },
  {
    id: 'react-component',
    name: 'React Component Library',
    description: 'Reusable UI components with TypeScript',
    icon: '🧩',
    category: 'web',
    files: {
      'package.json': {
        content: JSON.stringify({
          name: 'ui-components',
          version: '0.1.0',
          scripts: {
            build: 'tsc',
            dev: 'tsc -w'
          },
          dependencies: {
            'react': '^18.0.0',
            'react-dom': '^18.0.0'
          },
          devDependencies: {
            'typescript': '^5.0.0',
            '@types/react': '^18.0.0'
          }
        }, null, 2),
        type: 'file'
      },
      'src': { content: '', type: 'directory' },
      'src/Button.tsx': {
        content: `import React from 'react'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md'
}) => {
  const baseClasses = 'rounded font-medium transition-colors focus:outline-none focus:ring-2'
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500'
  }
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }

  return (
    <button
      className={\`\${baseClasses} \${variantClasses[variant]} \${sizeClasses[size]}\`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export default Button`,
        type: 'file'
      },
      'src/index.ts': {
        content: `export { Button } from './Button'`,
        type: 'file'
      }
    }
  }
]