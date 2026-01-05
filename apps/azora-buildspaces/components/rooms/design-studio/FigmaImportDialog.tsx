"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Figma, Loader2, CheckCircle2 } from "lucide-react";

interface FigmaImportDialogProps {
    onImport: (data: any) => void;
}

export default function FigmaImportDialog({ onImport }: FigmaImportDialogProps) {
    const [url, setUrl] = useState("");
    const [isImporting, setIsImporting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleImport = async () => {
        if (!url) return;
        setIsImporting(true);

        // Simulate Figma API call (real logic would use FIGMA_TOKEN)
        try {
            // In a real app, we would fetch from /api/design/figma-import
            // For now, we'll simulate a successful response with a mock frame
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const mockFrame = {
                id: `figma-${Date.now()}`,
                name: "Imported Frame",
                width: 375,
                height: 812,
                components: [
                    { type: 'button', label: 'Click Me' },
                    { type: 'input', placeholder: 'Enter email' }
                ]
            };

            onImport(mockFrame);
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                setUrl("");
            }, 2000);
        } catch (error) {
            console.error("Figma import failed", error);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Figma className="w-4 h-4 text-pink-500" />
                    Import from Figma
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Figma Design</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Figma File URL</label>
                        <Input 
                            placeholder="https://www.figma.com/file/..." 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Paste the link to your Figma file or specific frame.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        className="w-full gap-2" 
                        onClick={handleImport}
                        disabled={isImporting || !url}
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Importing...
                            </>
                        ) : isSuccess ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                Imported Successfully
                            </>
                        ) : (
                            <>
                                <Figma className="w-4 h-4" />
                                Import Frame
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
