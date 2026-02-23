"use client"

import { Badge } from "@/components/ui/badge"
import { Code } from "lucide-react"

interface DesignToCodeProps {
    frame: any
    onClose: () => void
}

export default function DesignToCode({ frame, onClose }: DesignToCodeProps) {
    return (
        <div className="h-full p-4">
            <div className="text-center text-muted-foreground py-8">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Design to Code</p>
                <p className="text-xs mt-1">Convert designs to production-ready code</p>
            </div>
        </div>
    )
}
