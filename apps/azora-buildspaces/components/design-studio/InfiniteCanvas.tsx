"use client"

import { Badge } from "@/components/ui/badge"
import { Palette } from "lucide-react"

export default function InfiniteCanvas() {
    return (
        <div className="h-full flex items-center justify-center bg-muted/20">
            <div className="text-center text-muted-foreground">
                <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Infinite Design Canvas</h3>
                <p className="text-sm">Professional design workspace with infinite canvas</p>
                <p className="text-xs mt-1">Drag and drop components, connect flows, create stunning designs</p>
            </div>
        </div>
    )
}
