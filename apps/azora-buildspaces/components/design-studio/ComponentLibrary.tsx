"use client"

import { Badge } from "@/components/ui/badge"
import { Layers } from "lucide-react"

export default function ComponentLibrary() {
    return (
        <div className="h-full p-4">
            <div className="text-center text-muted-foreground py-8">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Component Library</p>
                <p className="text-xs mt-1">Drag and drop UI components</p>
            </div>
        </div>
    )
}
