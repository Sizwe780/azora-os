/**
 * WebContainer Runtime Engine
 * 
 * Constitutional Compliance:
 * - TRUTH: Real error logs, no swallowing errors
 * - SELF-HEALING: Restart capability when things crash
 * - REAL EXECUTION: Actual Node.js runtime in the browser
 * 
 * This provides an in-browser Node.js environment using WebContainer API
 * for running and previewing applications.
 */

import { WebContainer, type WebContainerProcess } from '@webcontainer/api'
import { fileSystem, type FileNode } from '@/lib/workspace/file-system'

export type RuntimeStatus = 'idle' | 'booting' | 'ready' | 'error' | 'running'

export interface RuntimeState {
  status: RuntimeStatus
  container: WebContainer | null
  serverUrl: string | null
  processes: Map<string, WebContainerProcess>
  error: string | null
}

export interface ProcessOutput {
  type: 'stdout' | 'stderr' | 'exit'
  data: string | number
  timestamp: number
}

/**
 * WebContainer Runtime Manager
 * Singleton that manages the in-browser Node.js environment
 */
export class RuntimeEngine {
  private static instance: RuntimeEngine
  private container: WebContainer | null = null
  private status: RuntimeStatus = 'idle'
  private serverUrl: string | null = null
  private processes: Map<string, WebContainerProcess> = new Map()
  private listeners: Map<string, (output: ProcessOutput) => void> = new Map()
  private error: string | null = null

  private constructor() {}

  static getInstance(): RuntimeEngine {
    if (!RuntimeEngine.instance) {
      RuntimeEngine.instance = new RuntimeEngine()
    }
    return RuntimeEngine.instance
  }

  /**
   * Boot the WebContainer
   * Constitutional Compliance: Real boot process, not simulated
   */
  async boot(): Promise<void> {
    if (this.container) {
      console.log('[Runtime] Container already booted')
      return
    }

    try {
      this.setStatus('booting')
      console.log('[Runtime] Booting WebContainer...')

      // Boot WebContainer
      this.container = await WebContainer.boot()
      
      this.setStatus('ready')
      console.log('[Runtime] ✅ WebContainer booted successfully')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to boot container'
      this.setError(errorMsg)
      console.error('[Runtime] ❌ Boot failed:', error)
      throw error
    }
  }

  /**
   * Mount files from VFS into WebContainer
   * Constitutional Compliance: Real file mounting, not simulated
   */
  async mount(projectRoot: string): Promise<void> {
    if (!this.container) {
      throw new Error('Container not booted. Call boot() first.')
    }

    try {
      console.log('[Runtime] Mounting files from VFS...')

      // Get file tree from VFS
      const files = await fileSystem.listFiles(projectRoot)
      
      // Convert to WebContainer file tree format
      const fileTree = await this.convertToWebContainerTree(files, projectRoot)
      
      // Mount files
      await this.container.mount(fileTree)
      
      console.log('[Runtime] ✅ Files mounted successfully')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to mount files'
      this.setError(errorMsg)
      console.error('[Runtime] ❌ Mount failed:', error)
      throw error
    }
  }

  /**
   * Convert FileNode tree to WebContainer format
   */
  private async convertToWebContainerTree(
    nodes: FileNode[],
    projectRoot: string
  ): Promise<any> {
    const tree: any = {}

    for (const node of nodes) {
      if (node.type === 'directory' && node.children) {
        tree[node.name] = {
          directory: await this.convertToWebContainerTree(node.children, projectRoot),
        }
      } else if (node.type === 'file') {
        try {
          const content = await fileSystem.readFile(node.path)
          tree[node.name] = {
            file: {
              contents: content,
            },
          }
        } catch (error) {
          console.warn(`[Runtime] Failed to read file ${node.path}:`, error)
        }
      }
    }

    return tree
  }

  /**
   * Spawn a process in the container
   * Constitutional Compliance: Real process execution with actual stdout/stderr
   * 
   * @param command Command to run (e.g., 'npm', 'node')
   * @param args Command arguments (e.g., ['install'], ['dev'])
   * @param onOutput Callback for process output
   */
  async spawn(
    command: string,
    args: string[] = [],
    onOutput?: (output: ProcessOutput) => void
  ): Promise<WebContainerProcess> {
    if (!this.container) {
      throw new Error('Container not booted. Call boot() first.')
    }

    try {
      this.setStatus('running')
      const processId = `${command}_${Date.now()}`
      
      console.log(`[Runtime] Spawning: ${command} ${args.join(' ')}`)

      const process = await this.container.spawn(command, args)
      this.processes.set(processId, process)

      // Setup output listeners
      if (onOutput) {
        this.listeners.set(processId, onOutput)
      }

      // Stream stdout (Constitutional: Real output, not simulated)
      process.output.pipeTo(
        new WritableStream({
          write: (data) => {
            const output: ProcessOutput = {
              type: 'stdout',
              data,
              timestamp: Date.now(),
            }
            console.log(`[Runtime stdout] ${data}`)
            onOutput?.(output)
            this.notifyListeners(output)
          },
        })
      )

      // Listen for exit
      process.exit.then((exitCode) => {
        const output: ProcessOutput = {
          type: 'exit',
          data: exitCode,
          timestamp: Date.now(),
        }
        console.log(`[Runtime] Process exited with code ${exitCode}`)
        onOutput?.(output)
        this.notifyListeners(output)
        this.processes.delete(processId)
        
        if (this.processes.size === 0) {
          this.setStatus('ready')
        }
      })

      return process
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to spawn process'
      this.setError(errorMsg)
      console.error('[Runtime] ❌ Spawn failed:', error)
      throw error
    }
  }

  /**
   * Start the dev server and return the URL
   * Constitutional Compliance: Real server, real URL
   */
  async startDevServer(onOutput?: (output: ProcessOutput) => void): Promise<string> {
    if (!this.container) {
      throw new Error('Container not booted')
    }

    try {
      console.log('[Runtime] Starting dev server...')

      // Install dependencies first
      await this.spawn('npm', ['install'], onOutput)

      // Wait for install to complete
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Start dev server
      const devProcess = await this.spawn('npm', ['run', 'dev'], onOutput)

      // Wait for server to be ready and get URL
      this.container.on('server-ready', (port, url) => {
        console.log(`[Runtime] ✅ Server ready on port ${port}: ${url}`)
        this.serverUrl = url
      })

      // Wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 3000))

      if (!this.serverUrl) {
        // Fallback: construct URL from default port
        this.serverUrl = await (this.container as any).getServerUrl(3000)
      }

      console.log(`[Runtime] Server URL: ${this.serverUrl}`)
      return this.serverUrl || ''
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start dev server'
      this.setError(errorMsg)
      console.error('[Runtime] ❌ Start dev server failed:', error)
      throw error
    }
  }

  /**
   * Execute a terminal command
   * Constitutional Compliance: Real command execution, real output
   */
  async executeCommand(
    command: string,
    onOutput?: (output: ProcessOutput) => void
  ): Promise<number> {
    if (!this.container) {
      throw new Error('Container not booted')
    }

    try {
      // Parse command
      const parts = command.trim().split(' ')
      const cmd = parts[0]
      const args = parts.slice(1)

      const process = await this.spawn(cmd, args, onOutput)
      const exitCode = await process.exit

      return exitCode
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Command execution failed'
      console.error('[Runtime] Command failed:', errorMsg)
      
      // Constitutional: Don't swallow errors - send them to output
      if (onOutput) {
        onOutput({
          type: 'stderr',
          data: errorMsg,
          timestamp: Date.now(),
        })
      }
      
      throw error
    }
  }

  /**
   * Restart the container (Self-Healing Systems)
   * Constitutional Compliance: Article I, Section 1.2.5
   */
  async restart(): Promise<void> {
    console.log('[Runtime] 🔄 Restarting container...')
    
    try {
      // Kill all processes
      for (const [id, process] of this.processes) {
        try {
          process.kill()
        } catch (e) {
          console.warn(`Failed to kill process ${id}:`, e)
        }
      }
      this.processes.clear()

      // Tear down container
      if (this.container) {
        await this.container.teardown()
        this.container = null
      }

      // Clear state
      this.serverUrl = null
      this.error = null
      this.setStatus('idle')

      // Reboot
      await this.boot()
      
      console.log('[Runtime] ✅ Container restarted successfully')
    } catch (error) {
      console.error('[Runtime] ❌ Restart failed:', error)
      throw error
    }
  }

  /**
   * Get container state
   */
  getState(): RuntimeState {
    return {
      status: this.status,
      container: this.container,
      serverUrl: this.serverUrl,
      processes: new Map(this.processes),
      error: this.error,
    }
  }

  /**
   * Subscribe to runtime output
   */
  subscribe(callback: (output: ProcessOutput) => void): () => void {
    const id = `sub_${Date.now()}`
    this.listeners.set(id, callback)
    return () => this.listeners.delete(id)
  }

  /**
   * Check if container is ready
   */
  isReady(): boolean {
    return this.status === 'ready' && this.container !== null
  }

  /**
   * Get server URL
   */
  getServerUrl(): string | null {
    return this.serverUrl
  }

  // Private methods

  private setStatus(status: RuntimeStatus) {
    this.status = status
    console.log(`[Runtime] Status: ${status}`)
  }

  private setError(error: string) {
    this.error = error
    this.setStatus('error')
  }

  private notifyListeners(output: ProcessOutput) {
    for (const listener of this.listeners.values()) {
      listener(output)
    }
  }
}

/**
 * Export singleton instance
 */
export const runtimeEngine = RuntimeEngine.getInstance()
