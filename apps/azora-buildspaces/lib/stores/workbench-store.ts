import { create } from 'zustand'

export type SidebarView = 'explorer' | 'search' | 'git' | 'extensions' | 'chat' | 'ai-assistant' | 'code-analysis' | 'refactoring'
export type PanelView = 'terminal' | 'output' | 'problems' | 'debug' | 'testing' | 'performance' | 'code-review'

interface WorkbenchState {
    // Sidebar State
    activeSidebarView: SidebarView
    isSidebarVisible: boolean
    setSidebarView: (view: SidebarView) => void
    toggleSidebar: () => void

    // Panel State
    activePanelView: PanelView
    isPanelVisible: boolean
    setPanelView: (view: PanelView) => void
    togglePanel: () => void

    // Layout State
    sidebarWidth: number
    panelHeight: number
    setSidebarWidth: (width: number) => void
    setPanelHeight: (height: number) => void
}

export const useWorkbench = create<WorkbenchState>((set) => ({
    // Sidebar Defaults
    activeSidebarView: 'explorer',
    isSidebarVisible: true,
    setSidebarView: (view) => set({ activeSidebarView: view, isSidebarVisible: true }),
    toggleSidebar: () => set((state) => ({ isSidebarVisible: !state.isSidebarVisible })),

    // Panel Defaults
    activePanelView: 'terminal',
    isPanelVisible: true,
    setPanelView: (view) => set({ activePanelView: view, isPanelVisible: true }),
    togglePanel: () => set((state) => ({ isPanelVisible: !state.isPanelVisible })),

    // Layout Defaults
    sidebarWidth: 20, // Percentage
    panelHeight: 30, // Percentage
    setSidebarWidth: (width) => set({ sidebarWidth: width }),
    setPanelHeight: (height) => set({ panelHeight: height }),
}))
