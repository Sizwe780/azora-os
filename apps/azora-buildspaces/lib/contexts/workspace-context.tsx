"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type RoomType =
  | "code-chamber"
  | "spec-chamber"
  | "design-studio"
  | "ai-studio"
  | "command-desk"
  | "maker-lab"
  | "collaboration-pod"
  | "innovation-theater"
  | "deep-focus"
  | "knowledge-ocean"
  | "task-board"
  | "collectible-showcase"
  | "marketplace"

export interface Task {
  id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "done" | "pending" | "active" | "complete" | "error" | "backlog" | "in-review" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent" | "none"
  assignee?: string
  agentId?: string
  agentName?: string
  agentColor?: string
  icon?: any
  task?: string
  dueDate?: string
  progress?: number
  files?: string[]
  canModify?: boolean
  estimatedTime?: string
}

interface WorkspaceContextType {
  activeRoom: RoomType
  setActiveRoom: (room: RoomType) => void
  tasks: Task[]
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  addTask: (task: Omit<Task, 'id'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined)

export function WorkspaceProvider({ children, initialRoom }: { children: React.ReactNode, initialRoom?: RoomType }) {
  const [activeRoom, setActiveRoomState] = useState<RoomType>(initialRoom || "code-chamber")
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    if (initialRoom) {
      setActiveRoomState(initialRoom)
    } else {
      const savedRoom = localStorage.getItem('lastActiveRoom') as RoomType | null
      if (savedRoom) {
        setActiveRoomState(savedRoom)
      }
    }
  }, [initialRoom])

  const setActiveRoom = (room: RoomType) => {
    setActiveRoomState(room)
    localStorage.setItem('lastActiveRoom', room)

    // Track visited rooms for cross-room achievements
    try {
      const visited = JSON.parse(localStorage.getItem('buildspaces-visited-rooms') || '[]')
      if (!visited.includes(room)) {
        visited.push(room)
        localStorage.setItem('buildspaces-visited-rooms', JSON.stringify(visited))
        // Fire achievement event
        fetch('/api/collectibles/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: visited.length >= 12 ? 'all-rooms-visited' : 'room-navigate', room, data: { visitedCount: visited.length } }),
        }).catch(() => {})
      }
    } catch { /* silent */ }
  }

  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setTasks(prev => [newTask, ...prev])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  return (
    <WorkspaceContext.Provider value={{ 
      activeRoom, 
      setActiveRoom, 
      tasks, 
      setTasks, 
      addTask, 
      updateTask 
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider')
  }
  return context
}
