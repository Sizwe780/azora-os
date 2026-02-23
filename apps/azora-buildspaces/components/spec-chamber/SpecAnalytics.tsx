"use client"

import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users } from "lucide-react"

interface SpecAnalyticsProps {
    specs: any[]
}

export function SpecAnalytics({ specs }: SpecAnalyticsProps) {
    const totalSpecs = specs.length
    const approvedSpecs = specs.filter(s => s.status === 'approved').length
    const draftSpecs = specs.filter(s => s.status === 'draft').length
    const reviewSpecs = specs.filter(s => s.status === 'review').length

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{totalSpecs}</div>
                    <div className="text-sm text-muted-foreground">Total Specs</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-500">{approvedSpecs}</div>
                    <div className="text-sm text-muted-foreground">Approved</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-500">{reviewSpecs}</div>
                    <div className="text-sm text-muted-foreground">In Review</div>
                </div>
                <div className="p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-500">{draftSpecs}</div>
                    <div className="text-sm text-muted-foreground">Drafts</div>
                </div>
            </div>

            <div className="text-center text-muted-foreground py-8">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Advanced analytics and reporting</p>
                <p className="text-xs mt-1">Track specification quality, team productivity, and compliance metrics</p>
            </div>
        </div>
    )
}
