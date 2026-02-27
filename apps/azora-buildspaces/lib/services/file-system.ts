/**
 * File System Service
 * 
 * Provides file system operations, Git integration, and workspace management
 * for containerized development environments.
 */

import { z } from 'zod'
import { EventEmitter } from 'events'
import { azoraPilotClient } from './ai-pilot-client'
import { constitutionalAI, UserActionType, UserAction } from './constitutional-ai'

// File System Schemas
export type FileEntry = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified: Date;
  permissions?: string;
  isHidden?: boolean;
  isSymlink?: boolean;
  children?: FileEntry[];
};

const FileEntrySchema: z.ZodType<FileEntry> = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory']),
  size: z.number().optional(),
  modified: z.date(),
  permissions: z.string().optional(),
  isHidden: z.boolean().default(false),
  isSymlink: z.boolean().default(false),
  children: z.array(z.lazy(() => FileEntrySchema)).optional()
})

const GitStatusSchema = z.object({
  branch: z.string(),
  ahead: z.number().default(0),
  behind: z.number().default(0),
  staged: z.array(z.string()).default([]),
  unstaged: z.array(z.string()).default([]),
  untracked: z.array(z.string()).default([]),
  conflicted: z.array(z.string()).default([]),
  clean: z.boolean().default(true)
})

const GitCommitSchema = z.object({
  hash: z.string(),
  author: z.string(),
  email: z.string(),
  date: z.date(),
  message: z.string(),
  files: z.array(z.string()).default([])
})

// Types
// export type FileEntry = z.infer<typeof FileEntrySchema>
export type GitStatus = z.infer<typeof GitStatusSchema>
export type GitCommit = z.infer<typeof GitCommitSchema>

export interface FileWatcher {
  path: string
  recursive: boolean
  callback: (event: FileSystemEvent) => void
}

export interface FileSystemEvent {
  type: 'created' | 'modified' | 'deleted' | 'renamed'
  path: string
  oldPath?: string
  timestamp: Date
}

export interface GitRemote {
  name: string
  url: string
  type: 'fetch' | 'push'
}

/**
 * File System Service
 * 
 * Manages file operations and Git integration
 */
export class FileSystemService extends EventEmitter {
  private watchers: Map<string, FileWatcher[]> = new Map()
  private gitRepositories: Map<string, any> = new Map()

  constructor() {
    super()
  }

  /**
   * List directory contents
   */
  async listDirectory(containerId: string, path: string, showHidden = false): Promise<FileEntry[]> {
    try {
      const response = await fetch(`/api/fs?operation=list&path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error(await response.text());
      const entries = await response.json();
      return entries.filter((entry: FileEntry) => showHidden || !entry.isHidden);
    } catch (error) {
      throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read file content
   */
  async readFile(containerId: string, filePath: string): Promise<string> {
    try {
      const response = await fetch(`/api/fs?operation=read&path=${encodeURIComponent(filePath)}`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      return data.content;
    } catch (error) {
      throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write file content
   */
  async writeFile(containerId: string, filePath: string, content: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'write', path: filePath, content })
      });
      if (!response.ok) throw new Error(await response.text());

      this.emit('fileChanged', {
        type: 'modified',
        path: filePath,
        timestamp: new Date()
      } as FileSystemEvent)

      // Optional: Auto-ingest file content into Azora Pilot for RAG/provenance
      if (process.env.AZORA_PILOT_AUTOMATIC_INGEST === 'true') {
        // Ingest in background and ignore failures
        try { await azoraPilotClient.ingest(content, filePath) } catch (e) { /* swallow */ }
      }

    } catch (error) {
      throw new Error(`Failed to write file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create directory
   */
  async createDirectory(containerId: string, dirPath: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'mkdir', path: dirPath })
      });
      if (!response.ok) throw new Error(await response.text());

      this.emit('fileChanged', {
        type: 'created',
        path: dirPath,
        timestamp: new Date()
      } as FileSystemEvent)

    } catch (error) {
      throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete file or directory
   */
  async delete(containerId: string, path: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'delete', path })
      });
      if (!response.ok) throw new Error(await response.text());

      this.emit('fileChanged', {
        type: 'deleted',
        path,
        timestamp: new Date()
      } as FileSystemEvent)

    } catch (error) {
      throw new Error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Rename file or directory
   */
  async rename(containerId: string, oldPath: string, newPath: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'rename', oldPath, newPath })
      });
      if (!response.ok) throw new Error(await response.text());

      this.emit('fileChanged', {
        type: 'renamed',
        path: newPath,
        oldPath,
        timestamp: new Date()
      } as FileSystemEvent)

    } catch (error) {
      throw new Error(`Failed to rename: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Watch file system changes
   */
  watchPath(containerId: string, path: string, recursive = true, callback: (event: FileSystemEvent) => void): string {
    const watcherId = `watcher_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const watcher: FileWatcher = {
      path,
      recursive,
      callback
    }

    if (!this.watchers.has(containerId)) {
      this.watchers.set(containerId, [])
    }

    this.watchers.get(containerId)!.push(watcher)

    // Listen to file change events
    this.on('fileChanged', (event: FileSystemEvent) => {
      if (event.path.startsWith(path) || (recursive && event.path.includes(path))) {
        callback(event)
      }
    })

    return watcherId
  }

  /**
   * Stop watching path
   */
  unwatchPath(containerId: string, watcherId: string): void {
    const watchers = this.watchers.get(containerId)
    if (watchers) {
      const index = watchers.findIndex(w => w.path === watcherId)
      if (index !== -1) {
        watchers.splice(index, 1)
      }
    }
  }

  /**
   * Initialize Git repository
   */
  async initGitRepository(containerId: string, path: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitInit', path })
      });
      if (!response.ok) throw new Error(await response.text());
      this.emit('gitRepositoryInitialized', { containerId, path })
    } catch (error) {
      throw new Error(`Failed to initialize Git repository: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get Git status
   */
  async getGitStatus(containerId: string, path: string): Promise<GitStatus> {
    try {
        const response = await fetch(`/api/fs?operation=gitStatus&path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error(await response.text());
      const { status, branch } = await response.json();

      // Parse git status output
      const lines = status.split('\n').filter(Boolean);
      const gitStatus: GitStatus = {
        branch: branch || 'main',
        ahead: 0,
        behind: 0,
        staged: [],
        unstaged: [],
        untracked: [],
        conflicted: [],
        clean: lines.length === 0
      };

      // Simple parsing logic
      for (const line of lines) {
        const code = line.substring(0, 2);
        const file = line.substring(3);
        if (code === '??') gitStatus.untracked.push(file);
        else if (code === ' M') gitStatus.unstaged.push(file);
        else if (code === 'M ') gitStatus.staged.push(file);
      }

      return gitStatus;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stage files for commit
   */
  async gitAdd(containerId: string, path: string, files: string[]): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitAdd', path, files })
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      throw new Error(`Failed to stage files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Commit changes
   */
  async gitCommit(containerId: string, path: string, message: string, author?: { name: string; email: string }): Promise<string> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitCommit', path, message })
      });
      if (!response.ok) throw new Error(await response.text());
      return 'commit-hash-placeholder'; // Real hash would require parsing output
    } catch (error) {
      throw new Error(`Failed to commit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get commit history
   */
  async getGitHistory(containerId: string, path: string, limit = 50): Promise<GitCommit[]> {
    try {
      const response = await fetch(`/api/fs?operation=gitLog&path=${encodeURIComponent(path)}&limit=${limit}`)
      if (!response.ok) throw new Error(await response.text())
      const { commits } = await response.json()
      return commits.map((c: any) => ({
        hash: c.hash,
        author: c.author,
        email: c.email,
        date: new Date(c.date),
        message: c.message,
        files: []
      }))
    } catch (error) {
      throw new Error(`Failed to get git history: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Create new branch
   */
  async createBranch(containerId: string, path: string, branchName: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitBranch', path, name: branchName })
      })
      if (!response.ok) throw new Error(await response.text())
    } catch (error) {
      throw new Error(`Failed to create branch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Switch branch
   */
  async switchBranch(containerId: string, path: string, branchName: string, create = false): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitCheckout', path, name: branchName, create })
      })
      if (!response.ok) throw new Error(await response.text())
    } catch (error) {
      throw new Error(`Failed to switch branch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Add remote repository
   */
  async addRemote(containerId: string, path: string, name: string, url: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitRemoteAdd', path, name, url })
      })
      if (!response.ok) throw new Error(await response.text())
    } catch (error) {
      throw new Error(`Failed to add remote: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Push to remote
   */
  async gitPush(containerId: string, path: string, remote = 'origin', branch?: string, userId?: string): Promise<void> {
    // Constitutional Guard: Check if user is allowed to push
    const verification = await constitutionalAI.verifyAction({
      type: 'git_push',
      resource: `${remote}:${branch || 'main'}`,
      userId: userId || 'system',
      metadata: { path, containerId }
    })

    if (!verification.allowed) {
      throw new Error(`Constitutional Violation: ${verification.explanation}. Violations: ${verification.violations.map(v => v.description).join(', ')}`)
    }

    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitPush', path, remote, branch: branch || 'main' })
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      throw new Error(`Failed to push: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Pull from remote
   */
  async gitPull(containerId: string, path: string, remote = 'origin', branch?: string): Promise<void> {
    try {
      const response = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operation: 'gitPull', path, remote, branch: branch || 'main' })
      });
      if (!response.ok) throw new Error(await response.text());
    } catch (error) {
      throw new Error(`Failed to pull: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Export singleton instance
export const fileSystemService = new FileSystemService()