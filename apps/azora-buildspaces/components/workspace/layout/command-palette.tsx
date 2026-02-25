"use client"

import { useState } from "react"
import { File, Settings, Terminal, GitBranch, Package, Zap, Command, Play, Cloud, Eye, BookOpen, Bot } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import { useRouter } from "next/navigation"

interface CommandPaletteProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

interface CommandItem {
    id: string
    title: string
    description?: string
    icon?: any
    shortcut?: string
    action: () => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const [value, setValue] = useState("")
    const router = useRouter()

    const dispatch = (event: string, detail?: unknown) => {
        window.dispatchEvent(new CustomEvent(event, { detail }))
    }

    const commands: CommandItem[] = [
        // File Operations
        {
            id: "file.save",
            title: "File: Save",
            description: "Save the current file",
            icon: File,
            shortcut: "Ctrl+S",
            action: () => dispatch("workspace:save"),
        },
        {
            id: "file.new",
            title: "File: New File",
            description: "Create a new file in the explorer",
            icon: File,
            shortcut: "Ctrl+N",
            action: () => dispatch("workspace:new-file"),
        },
        {
            id: "file.upload",
            title: "File: Upload Files",
            description: "Upload files from your computer",
            icon: File,
            action: () => dispatch("workspace:upload-files"),
        },

        // View Operations
        {
            id: "view.terminal",
            title: "View: Toggle Terminal",
            description: "Show or hide the integrated terminal",
            icon: Terminal,
            shortcut: "Ctrl+`",
            action: () => dispatch("workspace:toggle-terminal"),
        },
        {
            id: "view.preview",
            title: "View: Toggle Preview",
            description: "Show or hide the live preview",
            icon: Eye,
            action: () => dispatch("workspace:toggle-preview"),
        },
        {
            id: "view.ai",
            title: "View: Toggle AI Assistant",
            description: "Show or hide the Elara AI assistant",
            icon: Bot,
            shortcut: "Ctrl+Shift+A",
            action: () => dispatch("workspace:toggle-ai"),
        },
        {
            id: "view.knowledge",
            title: "View: Knowledge Ocean",
            description: "Open the knowledge base",
            icon: BookOpen,
            action: () => dispatch("workspace:goto-room", "knowledge-ocean"),
        },

        // Rooms
        {
            id: "room.code-chamber",
            title: "Go to: Code Chamber",
            description: "Switch to the code editor",
            icon: Command,
            shortcut: "Ctrl+1",
            action: () => dispatch("workspace:goto-room", "code-chamber"),
        },
        {
            id: "room.design-studio",
            title: "Go to: Design Studio",
            description: "Switch to the design tool",
            icon: Command,
            shortcut: "Ctrl+3",
            action: () => dispatch("workspace:goto-room", "design-studio"),
        },
        {
            id: "room.ai-studio",
            title: "Go to: AI Studio",
            description: "Switch to the AI studio",
            icon: Command,
            shortcut: "Ctrl+2",
            action: () => dispatch("workspace:goto-room", "ai-studio"),
        },
        {
            id: "room.task-board",
            title: "Go to: Task Board",
            description: "Switch to the task board",
            icon: Command,
            shortcut: "Ctrl+6",
            action: () => dispatch("workspace:goto-room", "task-board"),
        },

        // Git Operations
        {
            id: "git.commit",
            title: "Git: Commit",
            description: "Commit staged changes",
            icon: GitBranch,
            action: () => dispatch("workspace:git-commit"),
        },
        {
            id: "git.push",
            title: "Git: Push",
            description: "Push commits to remote",
            icon: GitBranch,
            action: () => dispatch("workspace:git-push"),
        },
        {
            id: "git.pull",
            title: "Git: Pull",
            description: "Pull latest changes",
            icon: GitBranch,
            action: () => dispatch("workspace:git-pull"),
        },

        // Development
        {
            id: "dev.run",
            title: "Run: Start Dev Server",
            description: "Start the development server",
            icon: Play,
            shortcut: "F5",
            action: () => dispatch("workspace:toggle-terminal"),
        },
        {
            id: "dev.deploy",
            title: "Deploy: Push to Cloud",
            description: "Deploy the project to cloud",
            icon: Cloud,
            action: () => dispatch("workspace:deploy"),
        },

        // Settings
        {
            id: "settings.open",
            title: "Preferences: Open Settings",
            description: "Open workspace settings",
            icon: Settings,
            action: () => router.push("/settings"),
        },
    ]

    const filteredCommands = value
        ? commands.filter(cmd =>
            cmd.title.toLowerCase().includes(value.toLowerCase()) ||
            (cmd.description && cmd.description.toLowerCase().includes(value.toLowerCase()))
          )
        : commands

    const handleSelect = (cmd: CommandItem) => {
        cmd.action()
        onOpenChange(false)
        setValue("")
    }

    const groups = [
        { heading: "Files", prefix: "file." },
        { heading: "View", prefix: "view." },
        { heading: "Rooms", prefix: "room." },
        { heading: "Git", prefix: "git." },
        { heading: "Run & Deploy", prefix: "dev." },
        { heading: "Settings", prefix: "settings." },
    ]

    const renderItem = (cmd: CommandItem) => (
        <CommandItem
            key={cmd.id}
            value={cmd.title}
            onSelect={() => handleSelect(cmd)}
            className="flex items-center gap-3 px-3 py-2"
        >
            {cmd.icon && <cmd.icon className="w-4 h-4 shrink-0 text-muted-foreground" />}
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{cmd.title}</div>
                {cmd.description && (
                    <div className="text-xs text-muted-foreground truncate">{cmd.description}</div>
                )}
            </div>
            {cmd.shortcut && (
                <Badge variant="outline" className="text-xs shrink-0">
                    {cmd.shortcut}
                </Badge>
            )}
        </CommandItem>
    )

    const handleOpenChange = (v: boolean) => {
        onOpenChange(v)
        if (!v) setValue("")
    }

    return (
        <CommandDialog open={open} onOpenChange={handleOpenChange}>
            <CommandInput
                placeholder="Type a command or search..."
                value={value}
                onValueChange={setValue}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {groups.map((group, idx) => {
                    const items = filteredCommands.filter(cmd => cmd.id.startsWith(group.prefix))
                    if (items.length === 0) return null
                    return (
                        <div key={group.prefix}>
                            {idx > 0 && <CommandSeparator />}
                            <CommandGroup heading={group.heading}>
                                {items.map(renderItem)}
                            </CommandGroup>
                        </div>
                    )
                })}
            </CommandList>
        </CommandDialog>
    )
}
