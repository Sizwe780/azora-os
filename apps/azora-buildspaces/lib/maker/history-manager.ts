/**
 * Iteration Engine - Version Control Lite for Maker Lab
 * 
 * Constitutional Compliance:
 * - TRUTH: Real snapshots of the actual VFS state, no mocks
 * - SINGLE SOURCE OF TRUTH: One history per project
 * - UBUNTU: Enable users to safely experiment and revert
 * 
 * This provides version control for rapid prototyping iterations.
 * Every prompt creates a new snapshot, allowing instant rollback.
 */

import { fileSystem, FileNode } from '@/lib/workspace/file-system'

export interface AppSnapshot {
  id: string
  version: number
  timestamp: number
  prompt: string
  description: string
  files: Record<string, string> // path -> content
  fileTree: FileNode[]
}

export interface AppState {
  projectId: string
  projectName: string
  currentVersion: number
  snapshots: AppSnapshot[]
}

/**
 * History Manager for tracking app iterations
 */
export class HistoryManager {
  private state: AppState

  constructor(projectId: string, projectName: string) {
    this.state = {
      projectId,
      projectName,
      currentVersion: 0,
      snapshots: [],
    }
  }

  /**
   * Create a new snapshot of the current VFS state
   * Constitutional Compliance: Real file content, not placeholders
   */
  async createSnapshot(
    prompt: string,
    description: string,
    projectRoot: string
  ): Promise<AppSnapshot> {
    try {
      console.log('[HistoryManager] Creating snapshot for:', projectRoot)

      // Get the current file tree
      const fileTree = await fileSystem.listFiles(projectRoot)

      // Read all file contents
      const files: Record<string, string> = {}
      await this.readFileContents(fileTree, files)

      // Create snapshot
      const snapshot: AppSnapshot = {
        id: `v${this.state.currentVersion + 1}_${Date.now()}`,
        version: this.state.currentVersion + 1,
        timestamp: Date.now(),
        prompt,
        description,
        files,
        fileTree,
      }

      // Add to history
      this.state.snapshots.push(snapshot)
      this.state.currentVersion = snapshot.version

      console.log(`[HistoryManager] ✅ Snapshot created: v${snapshot.version}`)
      return snapshot
    } catch (error) {
      console.error('[HistoryManager] Failed to create snapshot:', error)
      throw error
    }
  }

  /**
   * Recursively read all file contents
   */
  private async readFileContents(
    nodes: FileNode[],
    files: Record<string, string>
  ): Promise<void> {
    for (const node of nodes) {
      if (node.type === 'file') {
        try {
          const content = await fileSystem.readFile(node.path)
          files[node.path] = content
        } catch (error) {
          console.warn(`Failed to read file ${node.path}:`, error)
          files[node.path] = '' // Empty content on error
        }
      } else if (node.type === 'directory' && node.children) {
        await this.readFileContents(node.children, files)
      }
    }
  }

  /**
   * Restore a specific snapshot
   * Constitutional Compliance: Complete restoration, all files synced
   */
  async restoreSnapshot(
    version: number,
    projectRoot: string
  ): Promise<AppSnapshot> {
    const snapshot = this.state.snapshots.find((s) => s.version === version)
    if (!snapshot) {
      throw new Error(`Snapshot v${version} not found`)
    }

    try {
      console.log(`[HistoryManager] Restoring snapshot v${version}...`)

      // Clear existing files (except .git)
      await this.clearProjectFiles(projectRoot)

      // Restore all files from snapshot
      for (const [path, content] of Object.entries(snapshot.files)) {
        await fileSystem.writeFile(path, content)
      }

      // Update current version
      this.state.currentVersion = version

      console.log(`[HistoryManager] ✅ Restored to v${version}`)
      return snapshot
    } catch (error) {
      console.error('[HistoryManager] Failed to restore snapshot:', error)
      throw error
    }
  }

  /**
   * Clear project files (except .git directory)
   */
  private async clearProjectFiles(projectRoot: string): Promise<void> {
    const files = await fileSystem.listFiles(projectRoot)
    for (const node of files) {
      // Keep .git directory
      if (node.name === '.git') continue
      
      await fileSystem.deleteFile(node.path)
    }
  }

  /**
   * Get the diff between two versions
   * Returns changed, added, and deleted files
   */
  getDiff(fromVersion: number, toVersion: number): {
    changed: string[]
    added: string[]
    deleted: string[]
  } {
    const fromSnapshot = this.state.snapshots.find((s) => s.version === fromVersion)
    const toSnapshot = this.state.snapshots.find((s) => s.version === toVersion)

    if (!fromSnapshot || !toSnapshot) {
      throw new Error('Invalid version numbers')
    }

    const changed: string[] = []
    const added: string[] = []
    const deleted: string[] = []

    // Find changed and deleted files
    for (const [path, content] of Object.entries(fromSnapshot.files)) {
      if (!(path in toSnapshot.files)) {
        deleted.push(path)
      } else if (toSnapshot.files[path] !== content) {
        changed.push(path)
      }
    }

    // Find added files
    for (const path of Object.keys(toSnapshot.files)) {
      if (!(path in fromSnapshot.files)) {
        added.push(path)
      }
    }

    return { changed, added, deleted }
  }

  /**
   * Get the previous snapshot (for diffing)
   */
  getPreviousSnapshot(): AppSnapshot | null {
    if (this.state.snapshots.length < 2) return null
    return this.state.snapshots[this.state.snapshots.length - 2]
  }

  /**
   * Get the current snapshot
   */
  getCurrentSnapshot(): AppSnapshot | null {
    if (this.state.snapshots.length === 0) return null
    return this.state.snapshots[this.state.snapshots.length - 1]
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): AppSnapshot[] {
    return [...this.state.snapshots]
  }

  /**
   * Get current version number
   */
  getCurrentVersion(): number {
    return this.state.currentVersion
  }

  /**
   * Get state for persistence
   */
  getState(): AppState {
    return { ...this.state }
  }

  /**
   * Restore state from persistence
   */
  setState(state: AppState): void {
    this.state = { ...state }
  }
}

/**
 * Export singleton factory
 */
const historyManagers: Map<string, HistoryManager> = new Map()

export function getHistoryManager(
  projectId: string,
  projectName: string
): HistoryManager {
  if (!historyManagers.has(projectId)) {
    historyManagers.set(projectId, new HistoryManager(projectId, projectName))
  }
  return historyManagers.get(projectId)!
}
