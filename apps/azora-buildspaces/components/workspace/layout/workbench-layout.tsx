"use client"

import { useState, useEffect } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { ActivityBar } from "./activity-bar"
import { StatusBar } from "./status-bar"
import { Sidebar } from "./sidebar"
import { Panel } from "./panel"
import { BreadcrumbNavigation } from "./breadcrumb-navigation"
import { CommandPalette } from "./command-palette"
import { useWorkbench } from "@/lib/stores/workbench-store"

interface WorkbenchLayoutProps {
    sidebarContent: React.ReactNode
    editorContent: React.ReactNode
    panelContent: React.ReactNode
}

export function WorkbenchLayout({ sidebarContent, editorContent, panelContent }: WorkbenchLayoutProps) {
    const { isSidebarVisible, isPanelVisible } = useWorkbench()
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Command Palette: Ctrl+Shift+P
            if (e.key === "P" && e.ctrlKey && e.shiftKey) {
                e.preventDefault()
                setCommandPaletteOpen(true)
            }
            // Command Palette: Ctrl+K Ctrl+P (alternative)
            if (e.key === "k" && e.ctrlKey) {
                let pressedP = false
                const handleP = (e2: KeyboardEvent) => {
                    if (e2.key === "p" && e2.ctrlKey) {
                        e2.preventDefault()
                        setCommandPaletteOpen(true)
                        pressedP = true
                    }
                }
                document.addEventListener("keydown", handleP, { once: true })
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
            {/* Breadcrumb Navigation */}
            <BreadcrumbNavigation />

            <div className="flex-1 flex overflow-hidden">
                {/* Activity Bar - Fixed Width */}
                <ActivityBar />

                {/* Main Resizable Area */}
                <ResizablePanelGroup direction="horizontal" className="flex-1">

                    {/* Sidebar */}
                    {isSidebarVisible && (
                        <>
                            <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="min-w-[200px]">
                                <Sidebar>
                                    {sidebarContent}
                                </Sidebar>
                            </ResizablePanel>
                            <ResizableHandle />
                        </>
                    )}

                    {/* Editor & Panel Group */}
                    <ResizablePanel defaultSize={isSidebarVisible ? 80 : 100}>
                        <ResizablePanelGroup direction="vertical">

                            {/* Editor Area */}
                            <ResizablePanel defaultSize={70} minSize={30}>
                                <div className="h-full w-full bg-editor-background">
                                    {editorContent}
                                </div>
                            </ResizablePanel>

                            {/* Bottom Panel */}
                            {isPanelVisible && (
                                <>
                                    <ResizableHandle />
                                    <ResizablePanel defaultSize={30} minSize={10}>
                                        <Panel>
                                            {panelContent}
                                        </Panel>
                                    </ResizablePanel>
                                </>
                            )}

                        </ResizablePanelGroup>
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>

            {/* Status Bar - Fixed Height */}
            <StatusBar />

            {/* Command Palette */}
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
            />
        </div>
    )
}
