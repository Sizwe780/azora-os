"use client"

import { Badge } from "@/components/ui/badge"
import { MessageSquare, CheckCircle, XCircle } from "lucide-react"

interface SpecReviewProps {
    specId: string | null
}

export function SpecReview({ specId }: SpecReviewProps) {
    return (
        <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Specification review system</p>
            <p className="text-xs mt-1">Collaborative review, approval workflows, and feedback tracking</p>
        </div>
    )
}
