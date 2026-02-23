"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload } from "lucide-react"

interface FigmaImportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onImport: (data: any) => void
}

export default function FigmaImportDialog({ open, onOpenChange, onImport }: FigmaImportDialogProps) {
    const [isImporting, setIsImporting] = useState(false)

    const handleImport = async () => {
        setIsImporting(true)
        // Simulate import
        setTimeout(() => {
            onImport({ success: true })
            setIsImporting(false)
            onOpenChange(false)
        }, 2000)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import from Figma</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Import designs directly from your Figma files
                    </p>
                    <Button onClick={handleImport} disabled={isImporting} className="w-full">
                        <Upload className="w-4 h-4 mr-2" />
                        {isImporting ? 'Importing...' : 'Import Design'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
