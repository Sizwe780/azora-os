"use client"

import { useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { useFileSystem } from "@/lib/stores/file-system"
import { WorkbenchLayout } from "@/components/workspace/layout/workbench-layout"
import { useWorkbench } from "@/lib/stores/workbench-store"
import { ExplorerView } from "@/components/workspace/views/explorer-view"
import { SearchView } from "@/components/workspace/views/search-view"
import { SourceControlView } from "@/components/workspace/views/source-control-view"
import { ExtensionsView } from "@/components/workspace/views/extensions-view"
import { OutputView } from "@/components/workspace/panels/output-view"
import { ProblemsView } from "@/components/workspace/panels/problems-view"
import { DebugView } from "@/components/workspace/panels/debug-view"
import { CommandDesk } from "@/components/rooms/command-desk"
import { EditorPanel } from "@/components/workspace/editor-panel"
import { TerminalPanel } from "@/components/workspace/panels/terminal-panel"
import { ProjectWelcome } from "@/components/workspace/project-welcome"

interface CodeChamberProps {
    id?: string
}

export function CodeChamber({ id }: CodeChamberProps) {
    const pathname = usePathname()
    const projectId = useMemo(() => {
        if (id && id.trim().length > 0) return id
        const parts = pathname?.split("/").filter(Boolean) ?? []
        return parts[parts.length - 1] || "default"
    }, [id, pathname])

    const {
        rootId,
        activeFileId,
        openFiles,
        setActiveFile,
        closeFile,
        createFile,
        openFile,
        fileMap,
        loadProject
    } = useFileSystem()

    useEffect(() => {
        if (projectId) {
            loadProject(projectId)
        }
    }, [projectId, loadProject])

    const handleFileSelect = (fileId: string) => {
        setActiveFile(fileId)
    }

    const handleCloseFile = (fileId: string) => {
        closeFile(fileId)
    }

    const { activeSidebarView, activePanelView } = useWorkbench()

    const renderSidebar = () => {
        switch (activeSidebarView) {
            case 'explorer': return <ExplorerView />
            case 'search': return <SearchView />
            case 'git': return <SourceControlView />
            case 'extensions': return <ExtensionsView />
            case 'chat': return <CommandDesk onSwitchToKnowledge={() => { }} />
            default: return <ExplorerView />
        }
    }

    const renderPanel = () => {
        switch (activePanelView) {
            case 'terminal': return <TerminalPanel onClose={() => { }} />
            case 'output': return <OutputView />
            case 'problems': return <ProblemsView />
            case 'debug': return <DebugView />
            default: return <TerminalPanel onClose={() => { }} />
        }
    }

    return (
        <WorkbenchLayout
            sidebarContent={renderSidebar()}
            editorContent={
                rootId ? (
                    <EditorPanel
                        activeFile={activeFileId || ""}
                        openFiles={openFiles}
                        onFileSelect={handleFileSelect}
                        onCloseFile={handleCloseFile}
                    />
                ) : (
                    <ProjectWelcome onProjectSelect={(projectId) => loadProject(projectId)} />
                )
            }
            panelContent={renderPanel()}
        />
    )
}
