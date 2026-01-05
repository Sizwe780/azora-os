'use client'

import { useState, useCallback } from 'react'
import { GitBranch, GitCommit, GitPullRequest, RefreshCw } from 'lucide-react'

interface GitStatus {
  branch: string
  hasChanges: boolean
  stagedFiles: string[]
  unstagedFiles: string[]
}

interface GitIntegrationProps {
  projectId: string
  onCommit?: (message: string) => Promise<void>
  onPush?: () => Promise<void>
}

export function GitIntegration({ projectId, onCommit, onPush }: GitIntegrationProps) {
  const [status, setStatus] = useState<GitStatus>({
    branch: 'main',
    hasChanges: false,
    stagedFiles: [],
    unstagedFiles: [],
  })
  const [commitMessage, setCommitMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCommitDialog, setShowCommitDialog] = useState(false)

  const handleRefreshStatus = useCallback(async () => {
    setLoading(true)
    try {
      // This would call your backend API to get git status
      const response = await fetch(`/api/projects/${projectId}/git/status`)
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to refresh Git status:', error)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const handleCommit = useCallback(async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message')
      return
    }

    setLoading(true)
    try {
      if (onCommit) {
        await onCommit(commitMessage)
      } else {
        const response = await fetch(`/api/projects/${projectId}/git/commit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: commitMessage }),
        })
        if (!response.ok) throw new Error('Commit failed')
      }
      setCommitMessage('')
      setShowCommitDialog(false)
      await handleRefreshStatus()
    } catch (error) {
      console.error('Commit error:', error)
      alert('Failed to commit changes')
    } finally {
      setLoading(false)
    }
  }, [commitMessage, projectId, onCommit, handleRefreshStatus])

  const handlePush = useCallback(async () => {
    setLoading(true)
    try {
      if (onPush) {
        await onPush()
      } else {
        const response = await fetch(`/api/projects/${projectId}/git/push`, {
          method: 'POST',
        })
        if (!response.ok) throw new Error('Push failed')
      }
      await handleRefreshStatus()
    } catch (error) {
      console.error('Push error:', error)
      alert('Failed to push changes')
    } finally {
      setLoading(false)
    }
  }, [projectId, onPush, handleRefreshStatus])

  return (
    <div className="w-full bg-[#252526] rounded-lg border border-white/10 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4" />
          Git Control
        </h3>
        <button
          onClick={handleRefreshStatus}
          disabled={loading}
          className="p-1 rounded hover:bg-white/10 disabled:opacity-50"
          title="Refresh status"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Branch and status */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Current Branch:</span>
          <span className="text-emerald-400 font-mono">{status.branch}</span>
        </div>

        {status.hasChanges && (
          <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/30 text-xs text-yellow-200">
            <p className="font-semibold mb-1">Uncommitted changes</p>
            {status.unstagedFiles.length > 0 && (
              <div className="text-xs text-yellow-100 ml-2">
                {status.unstagedFiles.length} file(s) modified
              </div>
            )}
          </div>
        )}
      </div>

      {/* Commit dialog */}
      {showCommitDialog && (
        <div className="space-y-2 p-3 bg-white/5 rounded border border-white/10">
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            placeholder="Describe your changes..."
            className="w-full text-sm p-2 bg-[#1e1e1e] border border-white/20 rounded text-white placeholder-gray-500 focus:outline-none focus:border-white/40"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCommit}
              disabled={loading || !commitMessage.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded text-sm font-semibold text-white"
            >
              <GitCommit className="w-4 h-4" />
              Commit
            </button>
            <button
              onClick={() => setShowCommitDialog(false)}
              className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm font-semibold text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowCommitDialog(!showCommitDialog)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded text-sm font-medium text-blue-300"
        >
          <GitCommit className="w-4 h-4" />
          Commit
        </button>
        <button
          onClick={handlePush}
          disabled={loading || !status.hasChanges}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 disabled:border-gray-600 disabled:opacity-50 rounded text-sm font-medium text-purple-300"
        >
          <GitPullRequest className="w-4 h-4" />
          Push
        </button>
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Changes are auto-saved. Use Git controls to commit and push to remote.
      </p>
    </div>
  )
}
