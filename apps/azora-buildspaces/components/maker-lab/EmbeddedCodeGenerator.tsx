"use client"

import { Badge } from "@/components/ui/badge"
import { Code, Cpu } from "lucide-react"

interface EmbeddedCodeGeneratorProps {
    board: string
}

export function EmbeddedCodeGenerator({ board }: EmbeddedCodeGeneratorProps) {
    return (
        <div className="h-full p-4">
            <div className="text-center text-muted-foreground py-8">
                <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Embedded code generation and optimization</p>
                <p className="text-xs mt-1">Automatic code generation for {board} microcontroller</p>
            </div>
        </div>
    )
}
