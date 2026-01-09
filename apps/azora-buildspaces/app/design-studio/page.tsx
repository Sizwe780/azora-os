import { StudioCanvas } from '@/components/rooms/design-studio/studio-canvas'
import { AtomicPreviewer } from '@/components/rooms/design-studio/atomic-preview'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

export default function DesignStudioPage() {
  return (
    <div className="h-screen w-full">
      <ResizablePanelGroup direction="horizontal">
        {/* Canvas */}
        <ResizablePanel defaultSize={60} minSize={40}>
          <StudioCanvas />
        </ResizablePanel>

        <ResizableHandle />

        {/* Atomic Previewer */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <AtomicPreviewer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
