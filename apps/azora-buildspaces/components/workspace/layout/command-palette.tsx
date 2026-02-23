"use client"

import { useState, useEffect, useRef } from "react"
import { Search, File, Settings, Terminal, GitBranch, Package, Zap, Command } from "lucide-react"
import { Command as CommandPrimitive } from "cmdk"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"

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

    const commands: CommandItem[] = [
        // File Operations
        {
            id: "file.new",
            title: "New File",
            description: "Create a new file",
            icon: File,
            shortcut: "Ctrl+N",
            action: () => console.log("New file")
        },
        {
            id: "file.open",
            title: "Open File",
            description: "Open an existing file",
            icon: File,
            shortcut: "Ctrl+O",
            action: () => console.log("Open file")
        },
        {
            id: "file.save",
            title: "Save File",
            description: "Save the current file",
            icon: File,
            shortcut: "Ctrl+S",
            action: () => console.log("Save file")
        },

        // View Operations
        {
            id: "view.commandPalette",
            title: "Show Command Palette",
            description: "Open the command palette",
            icon: Command,
            shortcut: "Ctrl+Shift+P",
            action: () => onOpenChange(false)
        },
        {
            id: "view.terminal",
            title: "Toggle Terminal",
            description: "Show or hide the terminal",
            icon: Terminal,
            shortcut: "Ctrl+`",
            action: () => console.log("Toggle terminal")
        },

        // Git Operations
        {
            id: "git.commit",
            title: "Git: Commit",
            description: "Commit staged changes",
            icon: GitBranch,
            shortcut: "Ctrl+Enter",
            action: () => console.log("Git commit")
        },
        {
            id: "git.push",
            title: "Git: Push",
            description: "Push commits to remote",
            icon: GitBranch,
            action: () => console.log("Git push")
        },

        // Development
        {
            id: "dev.run",
            title: "Run Project",
            description: "Start the development server",
            icon: Zap,
            shortcut: "F5",
            action: () => console.log("Run project")
        },
        {
            id: "dev.debug",
            title: "Start Debugging",
            description: "Start debugging session",
            icon: Zap,
            shortcut: "F5",
            action: () => console.log("Start debugging")
        },

        // Package Management
        {
            id: "package.install",
            title: "Install Dependencies",
            description: "Install npm/yarn dependencies",
            icon: Package,
            action: () => console.log("Install dependencies")
        },

        // Settings
        {
            id: "settings.open",
            title: "Open Settings",
            description: "Open user settings",
            icon: Settings,
            action: () => console.log("Open settings")
        }
    ]

    const filteredCommands = commands.filter(cmd =>
        cmd.title.toLowerCase().includes(value.toLowerCase()) ||
        (cmd.description && cmd.description.toLowerCase().includes(value.toLowerCase()))
    )

    const handleSelect = (cmd: CommandItem) => {
        cmd.action()
        onOpenChange(false)
    }

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                if (e.key === "k" && e.shiftKey && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    onOpenChange(!open)
                }
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [onOpenChange, open])

    return (
        <CommandDialog open={open} onOpenChange={onOpenChange}>
            <CommandInput
                placeholder="Type a command or search..."
                value={value}
                onValueChange={setValue}
            />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>

                {/* File Operations */}
                <CommandGroup heading="File">
                    {filteredCommands
                        .filter(cmd => cmd.id.startsWith('file.'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                value={cmd.title}
                                onSelect={() => handleSelect(cmd)}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {cmd.icon && <cmd.icon className="w-4 h-4" />}
                                <div className="flex-1">
                                    <div className="font-medium">{cmd.title}</div>
                                    {cmd.description && (
                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                        {cmd.shortcut}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                </CommandGroup>

                <CommandSeparator />

                {/* View Operations */}
                <CommandGroup heading="View">
                    {filteredCommands
                        .filter(cmd => cmd.id.startsWith('view.'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                value={cmd.title}
                                onSelect={() => handleSelect(cmd)}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {cmd.icon && <cmd.icon className="w-4 h-4" />}
                                <div className="flex-1">
                                    <div className="font-medium">{cmd.title}</div>
                                    {cmd.description && (
                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                        {cmd.shortcut}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                </CommandGroup>

                <CommandSeparator />

                {/* Git Operations */}
                <CommandGroup heading="Git">
                    {filteredCommands
                        .filter(cmd => cmd.id.startsWith('git.'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                value={cmd.title}
                                onSelect={() => handleSelect(cmd)}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {cmd.icon && <cmd.icon className="w-4 h-4" />}
                                <div className="flex-1">
                                    <div className="font-medium">{cmd.title}</div>
                                    {cmd.description && (
                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                        {cmd.shortcut}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                </CommandGroup>

                <CommandSeparator />

                {/* Development */}
                <CommandGroup heading="Development">
                    {filteredCommands
                        .filter(cmd => cmd.id.startsWith('dev.'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                value={cmd.title}
                                onSelect={() => handleSelect(cmd)}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {cmd.icon && <cmd.icon className="w-4 h-4" />}
                                <div className="flex-1">
                                    <div className="font-medium">{cmd.title}</div>
                                    {cmd.description && (
                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                        {cmd.shortcut}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                </CommandGroup>

                <CommandSeparator />

                {/* Other Commands */}
                <CommandGroup heading="Other">
                    {filteredCommands
                        .filter(cmd => !cmd.id.includes('.'))
                        .map((cmd) => (
                            <CommandItem
                                key={cmd.id}
                                value={cmd.title}
                                onSelect={() => handleSelect(cmd)}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                {cmd.icon && <cmd.icon className="w-4 h-4" />}
                                <div className="flex-1">
                                    <div className="font-medium">{cmd.title}</div>
                                    {cmd.description && (
                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                    )}
                                </div>
                                {cmd.shortcut && (
                                    <Badge variant="outline" className="text-xs">
                                        {cmd.shortcut}
                                    </Badge>
                                )}
                            </CommandItem>
                        ))}
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
