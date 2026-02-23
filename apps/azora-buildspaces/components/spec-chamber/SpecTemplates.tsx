"use client"

import { Badge } from "@/components/ui/badge"
import { LayoutTemplate, FileText } from "lucide-react"

interface SpecTemplatesProps {
    onSelectTemplate: (template: any) => void
}

export function SpecTemplates({ onSelectTemplate }: SpecTemplatesProps) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <LayoutTemplate className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Specification templates</p>
            <p className="text-xs mt-1">Pre-built templates for common specification types</p>
        </div>
    )
}
