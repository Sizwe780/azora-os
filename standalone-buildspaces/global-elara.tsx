"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, MessageSquare, Mic, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function GlobalElara() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [context, setContext] = useState("Lobby")
    const [mode, setMode] = useState<"manager" | "assistant">("assistant")

    // Determine context based on route
    useEffect(() => {
        if (pathname === "/lobby") {
            setContext("Lobby")
            setMessages([{ role: 'assistant', content: "Welcome to the Lobby. Select a room to begin your work." }])
        } else if (pathname.includes("/room/code-chamber")) {
            setContext("Code Chamber")
            setMessages([{ role: 'assistant', content: "I am ready to assist with your coding tasks." }])
        } else if (pathname.includes("/room/")) {
            const room = pathname.split("/")[2].replace("-", " ")
            setContext(room)
            setMessages([{ role: 'assistant', content: `You are now in the ${room}. How can I help?` }])
        }
    }, [pathname])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user' as const, content: input }
        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsProcessing(true)

        try {
            // Import dynamically to avoid server-side issues in client component if needed, 
            // but Server Actions are fine to import.
            const { chat } = await import("@/app/actions/ai-orchestrator")
            const response = await chat(userMsg.content, {
                activeFile: "unknown",
                route: pathname
            })

            const aiMsg = { role: 'assistant' as const, content: response }
            setMessages(prev => [...prev, aiMsg])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'assistant' as const, content: "I'm having trouble connecting to the Citadel." }])
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-80"
                    >
                        <Card className="p-4 shadow-2xl border-primary/20 bg-background/95 backdrop-blur">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-background" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm">Elara</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{context} • {mode} Mode</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant={mode === "manager" ? "default" : "ghost"}
                                        size="sm"
                                        className="h-6 text-[10px]"
                                        onClick={() => setMode("manager")}
                                    >
                                        Manager
                                    </Button>
                                    <Button
                                        variant={mode === "assistant" ? "default" : "ghost"}
                                        size="sm"
                                        className="h-6 text-[10px]"
                                        onClick={() => setMode("assistant")}
                                    >
                                        Assistant
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={() => setIsOpen(false)}>
                                        <X className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-muted/50 rounded-lg p-3 text-sm mb-3 h-60 overflow-y-auto flex flex-col gap-2">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-lg p-2 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-background border border-border'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isProcessing && (
                                    <div className="flex justify-start">
                                        <div className="bg-background border border-border rounded-lg p-2 text-xs text-muted-foreground animate-pulse">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    className="flex-1 bg-muted rounded px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                                    placeholder={mode === "manager" ? "Command the platform..." : "Ask Elara..."}
                                />
                                <Button type="submit" size="icon" className="h-9 w-9" disabled={isProcessing}>
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isOpen ? "bg-muted text-foreground" : "bg-gradient-to-br from-primary to-emerald-500 text-background"
                    }`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </motion.button>
        </div>
    )
}
