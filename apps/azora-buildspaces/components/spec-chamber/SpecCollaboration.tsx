"use client"

import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare } from "lucide-react"

interface SpecCollaborationProps {
    specId: string | null
}

export function SpecCollaboration({ specId }: SpecCollaborationProps) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Team collaboration tools</p>
            <p className="text-xs mt-1">Real-time editing, comments, and review workflows</p>
        </div>
    )
}
