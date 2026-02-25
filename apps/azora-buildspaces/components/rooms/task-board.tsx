"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Tag,
  User,
  ChevronDown,
  MoreHorizontal,
  GripVertical,
  Zap,
  ArrowUpRight,
  Eye,
  MessageSquare,
  Paperclip,
  Star,
  X,
  ChevronRight,
  Hash,
  Flag,
  Target,
  Timer,
  Users,
  Layers,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useWorkspace, Task } from "@/lib/contexts/workspace-context"
import { useRoomEvents } from "@/lib/hooks/use-room-events"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

/* ─── types ─── */
type ViewMode = "board" | "list" | "timeline" | "sprint"
type GroupBy = "status" | "priority" | "assignee" | "label"

interface TaskLabel {
  name: string
  color: string
}

const LABELS: TaskLabel[] = [
  { name: "Feature", color: "bg-blue-500" },
  { name: "Bug", color: "bg-red-500" },
  { name: "Improvement", color: "bg-green-500" },
  { name: "Design", color: "bg-pink-500" },
  { name: "DevOps", color: "bg-orange-500" },
  { name: "Documentation", color: "bg-yellow-500" },
]

const MS_PER_DAY = 86400000


  urgent: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Urgent", order: 0 },
  high: { icon: ArrowUp, color: "text-orange-500", bg: "bg-orange-500/10", label: "High", order: 1 },
  medium: { icon: Minus, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Medium", order: 2 },
  low: { icon: ArrowDown, color: "text-blue-500", bg: "bg-blue-500/10", label: "Low", order: 3 },
  none: { icon: Minus, color: "text-zinc-500", bg: "bg-zinc-500/10", label: "None", order: 4 },
}

const STATUS_CONFIG = {
  backlog: { icon: Circle, color: "text-zinc-500", label: "Backlog" },
  todo: { icon: Circle, color: "text-zinc-400", label: "To Do" },
  "in-progress": { icon: Clock, color: "text-blue-500", label: "In Progress" },
  "in-review": { icon: Eye, color: "text-purple-500", label: "In Review" },
  done: { icon: CheckCircle2, color: "text-emerald-500", label: "Done" },
  cancelled: { icon: X, color: "text-zinc-600", label: "Cancelled" },
}

/* ─── task card component ─── */
function TaskCard({
  task,
  onUpdate,
  onClick,
  compact = false,
}: {
  task: Task
  onUpdate: (id: string, data: Partial<Task>) => void
  onClick: (task: Task) => void
  compact?: boolean
}) {
  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium
  const StatusIcon = status.icon
  const PriorityIcon = priority.icon

  // Due date badge computation
  const dueDateBadge = task.dueDate ? (() => {
    const due = new Date(task.dueDate)
    const diffDays = (due.getTime() - Date.now()) / MS_PER_DAY
    if (diffDays < 0) return { label: "Overdue", cls: "border-red-500/30 text-red-400 bg-red-500/10" }
    if (diffDays <= 2) return { label: due.toLocaleDateString("en", { month: "short", day: "numeric" }), cls: "border-amber-500/30 text-amber-400 bg-amber-500/10" }
    return { label: due.toLocaleDateString("en", { month: "short", day: "numeric" }), cls: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" }
  })() : null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={() => onClick(task)}
      className="group bg-zinc-900/60 border border-zinc-800/60 rounded-lg p-3.5 cursor-pointer hover:border-zinc-700 hover:bg-zinc-800/40 transition-all"
    >
      {/* Top Row: ID + Priority */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              const statuses = Object.keys(STATUS_CONFIG)
              const currentIdx = statuses.indexOf(task.status)
              const nextStatus = statuses[(currentIdx + 1) % statuses.length]
              onUpdate(task.id, { status: nextStatus as Task["status"] })
            }}
            className="flex-shrink-0"
          >
            <StatusIcon className={`w-4 h-4 ${status.color} transition-colors`} />
          </button>
          <span className="text-[11px] font-mono text-zinc-600">
            {task.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <PriorityIcon className={`w-3.5 h-3.5 ${priority.color}`} />
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-zinc-200 mb-2 leading-snug line-clamp-2 group-hover:text-white transition-colors">
        {task.title}
      </h3>

      {/* Description preview */}
      {task.description && !compact && (
        <p className="text-xs text-zinc-500 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Bottom Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={`text-[10px] h-5 px-1.5 border-current/20 ${priority.color}`}
          >
            {priority.label}
          </Badge>
          {task.assignee && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white">
                  {task.assignee.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
          {dueDateBadge && (
            <Badge variant="outline" className={`text-[10px] h-5 px-1.5 ${dueDateBadge.cls}`}>
              📅 {dueDateBadge.label}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MessageSquare className="w-3 h-3" />
          <Paperclip className="w-3 h-3" />
        </div>
      </div>
    </motion.div>
  )
}

/* ─── create task modal ─── */
function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
  defaultStatus,
}: {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Partial<Task>) => void
  defaultStatus?: string
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [status, setStatus] = useState(defaultStatus || "todo")
  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => titleRef.current?.focus(), 100)
      setStatus(defaultStatus || "todo")
    }
  }, [isOpen, defaultStatus])

  const handleSubmit = () => {
    if (!title.trim()) return
    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: status as Task["status"],
    })
    setTitle("")
    setDescription("")
    setPriority("medium")
    onClose()
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-200">New Task</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-zinc-500">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <Input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="bg-transparent border-zinc-700 text-zinc-200 placeholder:text-zinc-600 text-lg font-medium h-11"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />

          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className="bg-transparent border-zinc-700 text-zinc-300 placeholder:text-zinc-600 resize-none min-h-[80px]"
          />

          {/* Properties Row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
              >
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Task
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── task detail panel ─── */
function TaskDetailPanel({
  task,
  onClose,
  onUpdate,
}: {
  task: Task
  onClose: () => void
  onUpdate: (id: string, data: Partial<Task>) => void
}) {
  const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo
  const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-[480px] border-l border-zinc-800 bg-zinc-900/95 backdrop-blur-sm flex flex-col h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-500">{task.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-zinc-500">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Title */}
          <h2 className="text-lg font-semibold text-white leading-snug">{task.title}</h2>

          {/* Properties */}
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 w-24">Status</span>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-4 h-4 ${status.color}`} />
                <select
                  value={task.status}
                  onChange={(e) => onUpdate(task.id, { status: e.target.value as Task["status"] })}
                  className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
                >
                  {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 w-24">Priority</span>
              <select
                value={task.priority}
                onChange={(e) => onUpdate(task.id, { priority: e.target.value as Task["priority"] })}
                className="bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1 text-xs text-zinc-300"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>

            {/* Assignee */}
            {task.assignee && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 w-24">Assignee</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{task.assignee.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-zinc-300">{task.assignee}</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wider">Description</h3>
            <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-800/30 rounded-lg p-4 min-h-[80px] border border-zinc-800/50">
              {task.description || <span className="text-zinc-600 italic">No description provided</span>}
            </div>
          </div>

          {/* Activity */}
          <div>
            <h3 className="text-xs font-medium text-zinc-500 mb-3 uppercase tracking-wider">Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center mt-0.5">
                  <Plus className="w-3 h-3 text-zinc-500" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">Task created</p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">Just now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  )
}

/* ─── task detail dialog ─── */
function TaskDetailDialog({
  task,
  onClose,
  onSave,
}: {
  task: Task | null
  onClose: () => void
  onSave: (id: string, data: Partial<Task>) => void
}) {
  const [title, setTitle] = useState(task?.title || "")
  const [description, setDescription] = useState(task?.description || "")
  const [priority, setPriority] = useState<Task["priority"]>(task?.priority || "medium")
  const [status, setStatus] = useState(task?.status || "todo")
  const [assignee, setAssignee] = useState(task?.assignee || "")
  const [dueDate, setDueDate] = useState(task?.dueDate || "")

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || "")
      setPriority(task.priority)
      setStatus(task.status)
      setAssignee(task.assignee || "")
      setDueDate(task.dueDate || "")
    }
  }, [task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = () => {
    if (!task || !title.trim()) return
    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status: status as Task["status"],
      assignee: assignee.trim() || undefined,
      dueDate: dueDate || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={!!task} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-100 text-base flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">{task?.id.slice(0, 8).toUpperCase()}</span>
            Task Details
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600"
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add description..."
              className="bg-zinc-800 border-zinc-700 text-zinc-300 placeholder:text-zinc-600 resize-none min-h-[80px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-300"
              >
                {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Task["priority"])}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-2 py-1.5 text-sm text-zinc-300"
              >
                <option value="urgent">🔴 Urgent</option>
                <option value="high">🟠 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
                <option value="none">— None</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Assignee</label>
              <Input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Enter name..."
                className="bg-zinc-800 border-zinc-700 text-zinc-300 placeholder:text-zinc-600 h-9"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 h-9"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ═══════════════════════════════════════════════ */
/*                  TASK BOARD                     */
/* ═══════════════════════════════════════════════ */
export function TaskBoard() {
  const { tasks, updateTask, setTasks } = useWorkspace()
  const { emit, ROOM_EVENTS } = useRoomEvents('task-board')
  const [viewMode, setViewMode] = useState<ViewMode>("board")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [groupBy, setGroupBy] = useState<GroupBy>("status")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createDefaultStatus, setCreateDefaultStatus] = useState<string | undefined>()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [detailDialogTask, setDetailDialogTask] = useState<Task | null>(null)

  // AI features
  const [isAiPrioritizing, setIsAiPrioritizing] = useState(false)
  const [aiInsights, setAiInsights] = useState<string[]>([])
  const [sprintFocus, setSprintFocus] = useState<string[]>([])
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [isBreakingDown, setIsBreakingDown] = useState(false)
  const [standupReport, setStandupReport] = useState("")
  const [isGeneratingStandup, setIsGeneratingStandup] = useState(false)
  const [velocityData, setVelocityData] = useState<any>(null)
  const [isAnalyzingVelocity, setIsAnalyzingVelocity] = useState(false)

  // Persist tasks to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('buildspaces-tasks')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0 && tasks.length === 0) {
          setTasks(parsed)
        }
      } catch { /* silent */ }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('buildspaces-tasks', JSON.stringify(tasks))
    }
  }, [tasks])

  // AI Prioritization
  const aiPrioritize = async () => {
    if (tasks.length === 0) return
    setIsAiPrioritizing(true)
    try {
      const resp = await fetch('/api/tasks/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'prioritize', tasks, context: 'Buildspaces development project' }),
      })
      if (resp.ok) {
        const data = await resp.json()
        // Apply suggested priorities
        if (data.prioritizedTasks) {
          for (const pt of data.prioritizedTasks) {
            const match = tasks.find(t => t.id === pt.taskId)
            if (match) updateTask(match.id, { priority: pt.suggestedPriority })
          }
        }
        setAiInsights(data.insights || [])
        setSprintFocus(data.sprintRecommendation?.focusTasks || [])
        emit(ROOM_EVENTS.TASK_AI_PRIORITIZE, { taskCount: tasks.length })
      }
    } catch { /* silent */ }
    setIsAiPrioritizing(false)
  }

  // AI Task Breakdown
  const aiBreakdown = async (task: Task) => {
    setIsBreakingDown(true)
    try {
      const resp = await fetch('/api/tasks/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'breakdown', tasks: [task] }),
      })
      if (resp.ok) {
        const data = await resp.json()
        if (data.subtasks) {
          const newTasks = data.subtasks.map((st: any) => ({
            id: crypto.randomUUID(),
            title: st.title,
            description: st.description + '\n\nAcceptance Criteria:\n' + st.acceptanceCriteria.map((c: string) => `• ${c}`).join('\n'),
            status: 'todo' as const,
            priority: st.priority,
            assignee: undefined,
          }))
          setTasks([...tasks, ...newTasks])
        }
      }
    } catch { /* silent */ }
    setIsBreakingDown(false)
  }

  // AI Standup Report (Linear-style)
  const generateStandup = async () => {
    if (tasks.length === 0) return
    setIsGeneratingStandup(true)
    try {
      const resp = await fetch('/api/tasks/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'standup-report', tasks }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setStandupReport(data.report || '')
      }
    } catch { /* silent */ }
    setIsGeneratingStandup(false)
  }

  // Velocity Analysis (Jira-style)
  const analyzeVelocity = async () => {
    if (tasks.length === 0) return
    setIsAnalyzingVelocity(true)
    try {
      const resp = await fetch('/api/tasks/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'velocity-analysis', tasks }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setVelocityData(data)
      }
    } catch { /* silent */ }
    setIsAnalyzingVelocity(false)
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  // Group tasks by status for board view
  const columns = [
    { id: "backlog", ...STATUS_CONFIG.backlog, tasks: filteredTasks.filter((t) => t.status === "backlog") },
    { id: "todo", ...STATUS_CONFIG.todo, tasks: filteredTasks.filter((t) => t.status === "todo" || t.status === "pending") },
    { id: "in-progress", ...STATUS_CONFIG["in-progress"], tasks: filteredTasks.filter((t) => t.status === "in-progress" || t.status === "active") },
    { id: "in-review", ...STATUS_CONFIG["in-review"], tasks: filteredTasks.filter((t) => t.status === "in-review") },
    { id: "done", ...STATUS_CONFIG.done, tasks: filteredTasks.filter((t) => t.status === "done" || t.status === "complete") },
  ]

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "complete").length
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const handleCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: taskData.title || "Untitled",
      description: taskData.description || "",
      status: (taskData.status as Task["status"]) || "todo",
      priority: taskData.priority || "medium",
      assignee: undefined,
    }
    setTasks([...tasks, newTask])
    emit(ROOM_EVENTS.TASK_CREATE, { taskId: newTask.id, title: newTask.title })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setDetailDialogTask(task)
  }

  const handleUpdateTask = (id: string, data: Partial<Task>) => {
    updateTask(id, data)
    if (data.status === 'done' || data.status === 'complete') {
      emit(ROOM_EVENTS.TASK_COMPLETE, { taskId: id })
    }
  }

  const handleAddToColumn = (status: string) => {
    setCreateDefaultStatus(status)
    setShowCreateModal(true)
  }

  return (
    <div className="h-full flex bg-zinc-950 text-zinc-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Layers className="w-4 h-4 text-blue-400" />
              </div>
              <h1 className="font-semibold text-base text-zinc-100">Tasks</h1>
              <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-zinc-700 text-zinc-500">
                {totalTasks}
              </Badge>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 ml-4">
              <Progress value={progressPercent} className="w-24 h-1.5" />
              <span className="text-[11px] text-zinc-500">{progressPercent}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="pl-8 h-8 w-48 bg-zinc-900 border-zinc-700 text-sm text-zinc-300 placeholder:text-zinc-600"
              />
            </div>

            {/* Priority Filter Dropdown */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="h-8 bg-zinc-900 border border-zinc-700 rounded-md px-2 text-xs text-zinc-300 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
            </select>

            {/* Filters */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 px-2.5 text-zinc-400 hover:text-white ${showFilters ? "bg-zinc-800" : ""}`}
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              <span className="text-xs">Filter</span>
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("board")}
                className={`h-7 px-2 ${viewMode === "board" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={`h-7 px-2 ${viewMode === "list" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("sprint")}
                title="Sprint View"
                className={`h-7 px-2 ${viewMode === "sprint" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}
              >
                <Zap className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="h-5 w-px bg-zinc-800" />

            <Button
              onClick={() => { setCreateDefaultStatus(undefined); setShowCreateModal(true) }}
              size="sm"
              className="h-8 gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              New Task
            </Button>

            <Button
              onClick={() => setShowAiPanel(!showAiPanel)}
              size="sm"
              variant="ghost"
              className={`h-8 gap-1.5 text-xs ${showAiPanel ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-400'}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI
            </Button>
          </div>
        </div>

        {/* AI Insights Panel */}
        <AnimatePresence>
          {showAiPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-zinc-800 overflow-hidden bg-purple-500/5"
            >
              <div className="px-6 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <Button
                    size="sm"
                    className="h-7 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    onClick={aiPrioritize}
                    disabled={isAiPrioritizing || tasks.length === 0}
                  >
                    <Sparkles className="w-3 h-3" />
                    {isAiPrioritizing ? 'Analyzing...' : 'AI Prioritize'}
                  </Button>
                  {selectedTask && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1.5 text-xs border-purple-500/30 text-purple-400"
                      onClick={() => aiBreakdown(selectedTask)}
                      disabled={isBreakingDown}
                    >
                      <Zap className="w-3 h-3" />
                      {isBreakingDown ? 'Breaking down...' : 'AI Breakdown'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs border-blue-500/30 text-blue-400"
                    onClick={generateStandup}
                    disabled={isGeneratingStandup || tasks.length === 0}
                  >
                    <Target className="w-3 h-3" />
                    {isGeneratingStandup ? 'Generating...' : 'Standup Report'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5 text-xs border-emerald-500/30 text-emerald-400"
                    onClick={analyzeVelocity}
                    disabled={isAnalyzingVelocity || tasks.length === 0}
                  >
                    <Timer className="w-3 h-3" />
                    {isAnalyzingVelocity ? 'Analyzing...' : 'Velocity'}
                  </Button>
                  {sprintFocus.length > 0 && (
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                      Sprint Focus: {sprintFocus.length} tasks
                    </Badge>
                  )}
                </div>
                {/* AI Insights */}
                {aiInsights.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {aiInsights.map((insight, i) => (
                      <span key={i} className="text-[11px] text-zinc-400 bg-zinc-800/60 px-2 py-1 rounded">
                        💡 {insight}
                      </span>
                    ))}
                  </div>
                )}
                {/* Velocity Data */}
                {velocityData && (
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${velocityData.healthScore >= 70 ? 'bg-emerald-500' : velocityData.healthScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                      <span className="text-[11px] text-zinc-400">Health: {velocityData.healthScore}/100</span>
                    </div>
                    <span className="text-[11px] text-zinc-400">📈 {velocityData.velocityTrend}</span>
                    <span className="text-[11px] text-zinc-400">✅ {velocityData.completionRate}% done</span>
                    {velocityData.riskFactors?.length > 0 && (
                      <span className="text-[11px] text-red-400">⚠️ {velocityData.riskFactors[0]}</span>
                    )}
                  </div>
                )}
                {/* Standup Report */}
                {standupReport && (
                  <div className="bg-zinc-800/40 rounded-lg p-3 border border-zinc-700/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Daily Standup</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 px-1.5 text-[10px] text-zinc-500"
                        onClick={() => { navigator.clipboard.writeText(standupReport) }}
                      >
                        Copy
                      </Button>
                    </div>
                    <div className="text-[12px] text-zinc-300 whitespace-pre-wrap leading-relaxed">{standupReport}</div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-zinc-800 overflow-hidden"
            >
              <div className="px-6 py-3 flex items-center gap-4">
                <span className="text-xs text-zinc-500">Priority:</span>
                {["all", "urgent", "high", "medium", "low"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setFilterPriority(p)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                      filterPriority === p
                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Board / List View */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "board" ? (
            /* ── Board View ── */
            <div className="h-full flex gap-0 overflow-x-auto">
              {columns.map((column) => {
                const ColIcon = column.icon
                return (
                  <div
                    key={column.id}
                    className="flex-1 min-w-[260px] max-w-[340px] flex flex-col border-r border-zinc-800/50 last:border-r-0"
                  >
                    {/* Column Header */}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ColIcon className={`w-4 h-4 ${column.color}`} />
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          {column.label}
                        </span>
                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {column.tasks.length}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAddToColumn(column.id)}
                        className="h-6 w-6 p-0 text-zinc-600 hover:text-zinc-300"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Column Content — swimlane-grouped by priority */}
                    <ScrollArea className="flex-1 px-3 pb-3">
                      <div className="space-y-1">
                        {["urgent", "high", "medium", "low", "none"].map((prio) => {
                          const swimTasks = column.tasks.filter(
                            (t) => (t.priority || "none") === prio
                          )
                          if (swimTasks.length === 0) return null
                          const pconf = PRIORITY_CONFIG[prio as keyof typeof PRIORITY_CONFIG]
                          const swimLabel =
                            prio === "urgent" ? "🔴 Urgent" :
                            prio === "high" ? "🟠 High" :
                            prio === "medium" ? "🟡 Medium" :
                            prio === "low" ? "🔵 Low" : "— None"
                          return (
                            <div key={prio} className="mb-1">
                              <div className={`text-[10px] font-medium ${pconf.color} opacity-60 px-0.5 pt-2 pb-1`}>
                                {swimLabel} Priority
                              </div>
                              <div className="space-y-2">
                                <AnimatePresence>
                                  {swimTasks.map((task) => (
                                    <TaskCard
                                      key={task.id}
                                      task={task}
                                      onUpdate={handleUpdateTask}
                                      onClick={handleTaskClick}
                                      compact
                                    />
                                  ))}
                                </AnimatePresence>
                              </div>
                            </div>
                          )
                        })}

                        {column.tasks.length === 0 && (
                          <button
                            onClick={() => handleAddToColumn(column.id)}
                            className="w-full py-8 border border-dashed border-zinc-800 rounded-lg text-zinc-600 hover:border-zinc-700 hover:text-zinc-500 transition-colors text-xs flex flex-col items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add task
                          </button>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )
              })}
            </div>
          ) : viewMode === "sprint" ? (
            /* ── Sprint View ── */
            <ScrollArea className="h-full">
              <div className="px-6 py-4">
                {/* Sprint progress bar */}
                <div className="mb-6 bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      Sprint Progress
                    </h2>
                    <span className="text-xs text-zinc-400">{completedTasks}/{totalTasks} tasks done</span>
                  </div>
                  <Progress value={progressPercent} className="h-2.5" />
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-zinc-600">0%</span>
                    <span className="text-[11px] text-blue-400 font-semibold">{progressPercent}% complete</span>
                    <span className="text-[11px] text-zinc-600">100%</span>
                  </div>
                </div>

                {/* Tasks grouped by status */}
                {Object.entries(STATUS_CONFIG).map(([statusKey, statusVal]) => {
                  const statusTasks = filteredTasks.filter(
                    (t) =>
                      t.status === statusKey ||
                      (statusKey === "todo" && t.status === "pending") ||
                      (statusKey === "in-progress" && t.status === "active") ||
                      (statusKey === "done" && t.status === "complete")
                  )
                  if (statusTasks.length === 0) return null
                  const StatusIcon = statusVal.icon
                  return (
                    <div key={statusKey} className="mb-5">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className={`w-4 h-4 ${statusVal.color}`} />
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                          {statusVal.label}
                        </span>
                        <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                          {statusTasks.length}
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-2 border-l border-zinc-800">
                        {statusTasks.map((task) => {
                          const p = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium
                          const PIcon = p.icon
                          const sprintDueBadge = task.dueDate ? (() => {
                            const due = new Date(task.dueDate)
                            const diffDays = (due.getTime() - Date.now()) / MS_PER_DAY
                            return {
                              label: due.toLocaleDateString("en", { month: "short", day: "numeric" }),
                              cls: diffDays < 0 ? "text-red-400" : diffDays <= 2 ? "text-amber-400" : "text-emerald-400",
                            }
                          })() : null
                          return (
                            <motion.div
                              key={task.id}
                              layout
                              onClick={() => handleTaskClick(task)}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/40 cursor-pointer group transition-colors"
                            >
                              <PIcon className={`w-3.5 h-3.5 ${p.color} flex-shrink-0`} />
                              <span className="text-sm text-zinc-200 flex-1 group-hover:text-white truncate">
                                {task.title}
                              </span>
                              {sprintDueBadge && (
                                <span className={`text-[10px] ${sprintDueBadge.cls} flex-shrink-0`}>
                                  📅 {sprintDueBadge.label}
                                </span>
                              )}
                              {task.assignee && (
                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[8px] font-bold text-white">
                                    {task.assignee.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                {filteredTasks.length === 0 && (
                  <div className="text-center py-16">
                    <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm mb-1">No tasks found</p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700 mt-4"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Task
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          ) : (
            /* ── List View ── */
            <ScrollArea className="h-full">
              <div className="px-6 py-2">
                {/* List Header */}
                <div className="flex items-center gap-4 px-4 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider border-b border-zinc-800">
                  <div className="w-6" />
                  <div className="flex-1">Task</div>
                  <div className="w-24">Status</div>
                  <div className="w-20">Priority</div>
                  <div className="w-24">Assignee</div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-zinc-800/50">
                  {filteredTasks.map((task) => {
                    const status = STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.todo
                    const priority = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.medium
                    const StatusIcon = status.icon
                    const PriorityIcon = priority.icon

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        onClick={() => handleTaskClick(task)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 cursor-pointer transition-colors group"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            const statuses = Object.keys(STATUS_CONFIG)
                            const currentIdx = statuses.indexOf(task.status)
                            const nextStatus = statuses[(currentIdx + 1) % statuses.length]
                            handleUpdateTask(task.id, { status: nextStatus as Task["status"] })
                          }}
                        >
                          <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-zinc-200 group-hover:text-white transition-colors truncate block">
                            {task.title}
                          </span>
                        </div>

                        <div className="w-24">
                          <Badge variant="outline" className={`text-[10px] h-5 border-current/20 ${status.color}`}>
                            {status.label}
                          </Badge>
                        </div>

                        <div className="w-20 flex items-center gap-1.5">
                          <PriorityIcon className={`w-3.5 h-3.5 ${priority.color}`} />
                          <span className="text-xs text-zinc-500">{priority.label}</span>
                        </div>

                        <div className="w-24">
                          {task.assignee ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">{task.assignee.charAt(0).toUpperCase()}</span>
                              </div>
                              <span className="text-xs text-zinc-400 truncate">{task.assignee}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600">—</span>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {filteredTasks.length === 0 && (
                  <div className="text-center py-16">
                    <Target className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500 text-sm mb-1">No tasks found</p>
                    <p className="text-zinc-600 text-xs mb-4">Create your first task to get started</p>
                    <Button
                      onClick={() => setShowCreateModal(true)}
                      size="sm"
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      New Task
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {/* Task Detail Panel */}
      <AnimatePresence>
        {selectedTask && (
          <TaskDetailPanel
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={(id, data) => {
              handleUpdateTask(id, data)
              setSelectedTask((prev) => (prev ? { ...prev, ...data } : null))
            }}
          />
        )}
      </AnimatePresence>

      {/* Create Task Modal */}
      <AnimatePresence>
        <CreateTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          defaultStatus={createDefaultStatus}
        />
      </AnimatePresence>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={detailDialogTask}
        onClose={() => setDetailDialogTask(null)}
        onSave={(id, data) => {
          handleUpdateTask(id, data)
          setSelectedTask((prev) => (prev && prev.id === id ? { ...prev, ...data } : prev))
          setDetailDialogTask(null)
        }}
      />
    </div>
  )
}
