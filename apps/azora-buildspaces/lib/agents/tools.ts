/**
 * Agent Tools - Tool-Use Protocol
 * 
 * Constitutional Compliance (Article I, Section 1.3):
 * - "Require human consent for all significant actions"
 * - Every tool execution requires explicit user approval
 * - Tools are traced and logged for transparency
 * 
 * These are the typed interfaces for actions agents can perform
 * on the BuildSpaces workbench.
 */

import { fileSystem } from '@/lib/workspace/file-system'
import { syncFileToFirestore } from '@/lib/agents/persistence'

/**
 * Tool execution status
 */
export type ToolExecutionStatus = 'pending' | 'approved' | 'rejected' | 'executing' | 'completed' | 'error'

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  id: string
  tool: string
  params: Record<string, any>
  requestedBy: string // Agent name
  timestamp: number
  status: ToolExecutionStatus
  requiresApproval: boolean
  approvedBy?: string
  result?: any
  error?: string
}

/**
 * Tool Definition
 */
export interface AgentTool {
  name: string
  description: string
  parameters: {
    name: string
    type: string
    description: string
    required: boolean
  }[]
  requiresApproval: boolean
  dangerLevel: 'safe' | 'moderate' | 'dangerous'
  execute: (params: any, approved: boolean) => Promise<any>
}

/**
 * Tool: Read File
 * Allows agent to read file content from VFS
 */
export const readFileTool: AgentTool = {
  name: 'readFile',
  description: 'Read the contents of a file from the virtual file system',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Absolute path to the file to read',
      required: true,
    },
  ],
  requiresApproval: false, // Reading is safe
  dangerLevel: 'safe',
  async execute(params: { path: string }, approved: boolean) {
    try {
      const content = await fileSystem.readFile(params.path)
      return {
        success: true,
        content,
        lines: content.split('\n').length,
      }
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`)
    }
  },
}

/**
 * Tool: Write File
 * Allows agent to write/modify files in VFS
 * REQUIRES USER APPROVAL (Constitutional compliance)
 */
export const writeFileTool: AgentTool = {
  name: 'writeFile',
  description: 'Write or modify a file in the virtual file system',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Absolute path to the file',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: 'New content for the file',
      required: true,
    },
    {
      name: 'reason',
      type: 'string',
      description: 'Explanation of why this change is needed',
      required: true,
    },
    {
      name: 'projectId',
      type: 'string',
      description: 'Project identifier for persistence syncing',
      required: false,
    },
  ],
  requiresApproval: true, // Writing requires approval
  dangerLevel: 'moderate',
  async execute(params: { path: string; content: string; reason: string; projectId?: string }, approved: boolean) {
    if (!approved) {
      throw new Error('User approval required to write files')
    }

    try {
      await fileSystem.writeFile(params.path, params.content)
      if (params.projectId) {
        await syncFileToFirestore(params.projectId, params.path, params.content)
      }
      return {
        success: true,
        path: params.path,
        message: `File written successfully: ${params.reason}`,
      }
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`)
    }
  },
}

/**
 * Tool: List Files
 * Allows agent to explore directory structure
 */
export const listFilesTool: AgentTool = {
  name: 'listFiles',
  description: 'List files and directories in a path',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Directory path to list',
      required: true,
    },
  ],
  requiresApproval: false,
  dangerLevel: 'safe',
  async execute(params: { path: string }, approved: boolean) {
    try {
      const files = await fileSystem.listFiles(params.path)
      return {
        success: true,
        files,
        count: files.length,
      }
    } catch (error) {
      throw new Error(`Failed to list files: ${error}`)
    }
  },
}

/**
 * Tool: Create File
 * Allows agent to create new files
 * REQUIRES USER APPROVAL
 */
export const createFileTool: AgentTool = {
  name: 'createFile',
  description: 'Create a new file with initial content',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Absolute path for the new file',
      required: true,
    },
    {
      name: 'content',
      type: 'string',
      description: 'Initial content for the file',
      required: false,
    },
    {
      name: 'reason',
      type: 'string',
      description: 'Explanation of why this file is needed',
      required: true,
    },
  ],
  requiresApproval: true,
  dangerLevel: 'moderate',
  async execute(params: { path: string; content?: string; reason: string }, approved: boolean) {
    if (!approved) {
      throw new Error('User approval required to create files')
    }

    try {
      await fileSystem.writeFile(params.path, params.content || '')
      return {
        success: true,
        path: params.path,
        message: `File created: ${params.reason}`,
      }
    } catch (error) {
      throw new Error(`Failed to create file: ${error}`)
    }
  },
}

/**
 * Tool: Delete File
 * Allows agent to delete files
 * REQUIRES USER APPROVAL - DANGEROUS
 */
export const deleteFileTool: AgentTool = {
  name: 'deleteFile',
  description: 'Delete a file from the file system',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Path to the file to delete',
      required: true,
    },
    {
      name: 'reason',
      type: 'string',
      description: 'Explanation of why this file should be deleted',
      required: true,
    },
  ],
  requiresApproval: true,
  dangerLevel: 'dangerous',
  async execute(params: { path: string; reason: string }, approved: boolean) {
    if (!approved) {
      throw new Error('User approval required to delete files')
    }

    try {
      await fileSystem.deleteFile(params.path)
      return {
        success: true,
        path: params.path,
        message: `File deleted: ${params.reason}`,
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`)
    }
  },
}

/**
 * Tool: Run Terminal Command
 * Allows agent to execute terminal commands
 * REQUIRES USER APPROVAL - VERY DANGEROUS
 * 
 * Note: In current implementation, this is simulated.
 * In production, this would connect to a sandboxed Docker container.
 */
export const runTerminalTool: AgentTool = {
  name: 'runTerminal',
  description: 'Execute a terminal command (simulated in browser)',
  parameters: [
    {
      name: 'command',
      type: 'string',
      description: 'The command to execute',
      required: true,
    },
    {
      name: 'reason',
      type: 'string',
      description: 'Explanation of why this command is needed',
      required: true,
    },
  ],
  requiresApproval: true,
  dangerLevel: 'dangerous',
  async execute(params: { command: string; reason: string }, approved: boolean) {
    if (!approved) {
      throw new Error('User approval required to run terminal commands')
    }

    // Simulate command execution
    // In production, this would connect to a real terminal/Docker container
    return {
      success: true,
      command: params.command,
      output: `Simulated output for: ${params.command}\nReason: ${params.reason}\n\n(Real terminal integration coming soon)`,
      exitCode: 0,
    }
  },
}

/**
 * Tool: Apply Diff
 * Allows agent to apply a code diff to a file
 * REQUIRES USER APPROVAL
 */
export const applyDiffTool: AgentTool = {
  name: 'applyDiff',
  description: 'Apply a code diff/patch to a file',
  parameters: [
    {
      name: 'path',
      type: 'string',
      description: 'Path to the file to modify',
      required: true,
    },
    {
      name: 'lineStart',
      type: 'number',
      description: 'Starting line number for the change',
      required: true,
    },
    {
      name: 'lineEnd',
      type: 'number',
      description: 'Ending line number for the change',
      required: true,
    },
    {
      name: 'oldContent',
      type: 'string',
      description: 'Content to replace',
      required: true,
    },
    {
      name: 'newContent',
      type: 'string',
      description: 'New content',
      required: true,
    },
    {
      name: 'reason',
      type: 'string',
      description: 'Explanation of the change',
      required: true,
    },
  ],
  requiresApproval: true,
  dangerLevel: 'moderate',
  async execute(
    params: {
      path: string
      lineStart: number
      lineEnd: number
      oldContent: string
      newContent: string
      reason: string
    },
    approved: boolean
  ) {
    if (!approved) {
      throw new Error('User approval required to apply code changes')
    }

    try {
      // Read current file
      const currentContent = await fileSystem.readFile(params.path)
      const lines = currentContent.split('\n')

      // Verify old content matches
      const targetLines = lines.slice(params.lineStart - 1, params.lineEnd)
      const targetContent = targetLines.join('\n')

      if (targetContent !== params.oldContent) {
        throw new Error('File content has changed - diff no longer applies')
      }

      // Apply change
      const newLines = [
        ...lines.slice(0, params.lineStart - 1),
        ...params.newContent.split('\n'),
        ...lines.slice(params.lineEnd),
      ]

      await fileSystem.writeFile(params.path, newLines.join('\n'))

      return {
        success: true,
        path: params.path,
        linesChanged: params.lineEnd - params.lineStart + 1,
        message: `Applied change: ${params.reason}`,
      }
    } catch (error) {
      throw new Error(`Failed to apply diff: ${error}`)
    }
  },
}

/**
 * All available tools
 */
export const AGENT_TOOLS: Record<string, AgentTool> = {
  readFile: readFileTool,
  writeFile: writeFileTool,
  listFiles: listFilesTool,
  createFile: createFileTool,
  deleteFile: deleteFileTool,
  runTerminal: runTerminalTool,
  applyDiff: applyDiffTool,
  // custom design-to-code tool for converting Figma frames to React components
  designToCode: {
    name: 'designToCode',
    description: 'Generate a React component from a Figma frame using Tailwind',
    parameters: [
      { name: 'figmaUrl', type: 'string', description: 'Figma file/node URL or ID', required: true },
      { name: 'filePath', type: 'string', description: 'Destination path for component', required: true },
      { name: 'reason', type: 'string', description: 'Why we are generating this component', required: false },
      { name: 'projectId', type: 'string', description: 'Project identifier for persistence syncing', required: false },
    ],
    requiresApproval: false,
    dangerLevel: 'safe',
    async execute(params: { figmaUrl: string; filePath: string; reason?: string; projectId?: string }, approved: boolean) {
      // fetch the Figma node using the token and URL/ID
      const figmaToken = process.env.FIGMA_TOKEN
      if (!figmaToken) {
        throw new Error('FIGMA_TOKEN not configured')
      }

      // utility for pulling file key/node id from URL or id string
      const parseFigmaId = (url: string) => {
        // example: https://www.figma.com/file/{fileKey}/{name}?node-id={nodeId}
        const m = /file\/([A-Za-z0-9]+)(?:\/[^?]+)?(?:\?node-id=([0-9:%]+))?/.exec(url)
        return { fileKey: m?.[1] || url, nodeId: m?.[2] }
      }

      const { fileKey, nodeId } = parseFigmaId(params.figmaUrl)
      const nodesQuery = nodeId ? `?ids=${nodeId}` : ''
      const res = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes${nodesQuery}`, {
        headers: { 'X-FIGMA-TOKEN': figmaToken }
      })
      if (!res.ok) {
        throw new Error(`Figma fetch failed: ${res.status}`)
      }
      const json = await res.json()
      const document = nodeId ? json.nodes?.[nodeId]?.document : json.document
      if (!document) {
        throw new Error('Figma document not found')
      }

      // convert to lightweight structure
      const { figmaToJson } = await import('@/lib/utils/figma')
      const cleaned = figmaToJson(document)

      // build prompt
      const systemPrompt = `You are an expert UI engineer writing production-ready React 19 components with Tailwind 4. ` +
        `Use Lucide-React icons, Azora Layered Depth shadows, hover states on buttons. NO PLACEHOLDERS. ` +
        `Do not include any mock data or comments.`
      const userPrompt = `Convert the following Figma structure into a single-file React component (TSX):\n${JSON.stringify(cleaned, null, 2)}`

      const { generateText } = await import('ai')
      const { openai } = await import('@ai-sdk/openai')
      const llm = openai('gpt-4o')
      const { text } = await generateText({ model: llm, system: systemPrompt, prompt: userPrompt })

      // derive component name from cleaned data
      const name = cleaned.name ? String(cleaned.name).replace(/\s+/g, '') : 'Component'
      const finalPath = params.filePath || `components/generated/${name}.tsx`
      await fileSystem.writeFile(finalPath, text)
      if (params.projectId) {
        await syncFileToFirestore(params.projectId, finalPath, text)
      }
      return { success: true, content: text }
    },
  },
}

// debug log when module loads to verify available tools
console.log('[AgentTools] loaded, keys:', Object.keys(AGENT_TOOLS))

/**
 * Get tool by name
 */
export function getTool(name: string): AgentTool | undefined {
  return AGENT_TOOLS[name]
}

/**
 * Check if tool requires approval
 */
export function toolRequiresApproval(name: string): boolean {
  return AGENT_TOOLS[name]?.requiresApproval ?? true
}

/**
 * Execute a tool with approval check
 */
export async function executeTool(
  name: string,
  params: any,
  approved: boolean
): Promise<any> {
  const tool = getTool(name)
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`)
  }

  if (tool.requiresApproval && !approved) {
    throw new Error(`Tool "${name}" requires user approval`)
  }

  return await tool.execute(params, approved)
}

/**
 * List all available tools
 */
export function listTools(): { name: string; description: string }[] {
  return Object.values(AGENT_TOOLS).map((tool) => ({
    name: tool.name,
    description: tool.description,
  }))
}

/**
 * Register a new tool (primarily for testing)
 */
export function registerTool(tool: AgentTool): void {
  AGENT_TOOLS[tool.name] = tool
}
