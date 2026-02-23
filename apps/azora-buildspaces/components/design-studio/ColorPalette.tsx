"use client"

import { Badge } from "@/components/ui/badge"
import { Palette } from "lucide-react"

export default function ColorPalette() {
    return (
        <div className="h-full p-4">
            <div className="text-center text-muted-foreground py-8">
                <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Color Palette</p>
                <p className="text-xs mt-1">Design system colors and themes</p>
            </div>
        </div>
    )
}
