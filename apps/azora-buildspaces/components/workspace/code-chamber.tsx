"use client"

import { useEffect, useMemo } from "react"
import { usePathname } from "next/navigation"
import { useFileSystem } from "@/lib/stores/file-system"
import { WorkbenchLayout } from "./layout/workbench-layout"
import { useWorkbench } from "@/lib/stores/workbench-store"
import { ExplorerView } from "./views/explorer-view"
import { SearchView } from "./views/search-view"
import { SourceControlView } from "./views/source-control-view"
import { ExtensionsView } from "./views/extensions-view"
import { OutputView } from "./panels/output-view"
import { ProblemsView } from "./panels/problems-view"
import { DebugView } from "./panels/debug-view"
import { EditorPanel } from "./editor-panel"
import { ProjectWelcome } from "./project-welcome"

interface CodeChamberProps {
    id?: string
}

export function CodeChamber({ id }: CodeChamberProps) {
    const pathname = usePathname()
    // Local state is handled by file system + workbench stores; this component stays stateless.
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
            case 'chat': return <div>Chat View</div>
            default: return <ExplorerView />
        }
    }

    const renderPanel = () => {
        switch (activePanelView) {
            case 'terminal': return <div>Terminal View</div>
            case 'output': return <OutputView />
            case 'problems': return <ProblemsView />
            case 'debug': return <DebugView />
            default: return <div>Terminal View</div>
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
