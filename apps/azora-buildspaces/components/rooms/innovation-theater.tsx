"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  MonitorPlay,
  Play,
  Pause,
  Share2,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Hand,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Presentation,
  Plus,
  Trash2,
  GripVertical,
  Image,
  Type,
  Code2,
  BarChart3,
  Send,
  Sparkles,
  Eye,
  Radio,
  Layers,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useRoomEvents } from "@/lib/hooks/use-room-events"

/* ─── types ─── */
interface Slide {
  id: string
  title: string
  content: string
  type: "title" | "content" | "code" | "demo" | "image" | "split"
  notes: string
}

interface ChatMessage {
  id: string
  user: string
  text: string
  timestamp: Date
}

interface PollOption {
  label: string
  votes: number
}

interface SentimentData {
  overall: number
  sentiment: string
  themes: string[]
  suggestions: string[]
  engagementTrend: string
}

/* ═══════════════════════════════════════════════ */
/*            INNOVATION THEATER                   */
/* ═══════════════════════════════════════════════ */
export default function InnovationTheater() {
  const { emit, ROOM_EVENTS } = useRoomEvents('innovation-theater')
  const [isLive, setIsLive] = useState(false)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [isPresenterMode, setIsPresenterMode] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeTab, setActiveTab] = useState("slides")
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [reactions, setReactions] = useState({ thumbsUp: 0, thumbsDown: 0, raised: 0 })
  const [viewerCount, setViewerCount] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pollActive, setPollActive] = useState(false)
  const [pollQuestion, setPollQuestion] = useState("")
  const [pollOptions, setPollOptions] = useState<PollOption[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // AI features state
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false)
  const [generateTopic, setGenerateTopic] = useState("")
  const [sentimentData, setSentimentData] = useState<SentimentData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnswer, setAiAnswer] = useState("")
  const [isAnswering, setIsAnswering] = useState(false)
  const [qaQuestion, setQaQuestion] = useState("")
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [paceAdvice, setPaceAdvice] = useState("")
  const [slideTimings, setSlideTimings] = useState<Record<number, number>>({})
  const slideStartRef = useRef<number>(Date.now())

  /* ── AI: Generate slides from topic ── */
  const generateSlidesFromTopic = async () => {
    if (!generateTopic.trim()) return
    setIsGeneratingSlides(true)
    try {
      const resp = await fetch('/api/theater/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-slides', data: { topic: generateTopic } }),
      })
      if (resp.ok) {
        const data = await resp.json()
        const newSlides = (data.slides || []).map((s: any, i: number) => ({
          id: `gen-${Date.now()}-${i}`,
          ...s,
        }))
        setSlides(newSlides)
        setCurrentSlide(0)
        emit(ROOM_EVENTS.SLIDE_AI_GENERATE, { topic: generateTopic, slideCount: newSlides.length })
      }
    } catch { /* silent */ }
    setIsGeneratingSlides(false)
    setGenerateTopic("")
  }

  /* ── AI: Analyze audience sentiment ── */
  const analyzeSentiment = async () => {
    if (chatMessages.length === 0) return
    setIsAnalyzing(true)
    try {
      const resp = await fetch('/api/theater/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze-sentiment',
          data: { messages: chatMessages.map(m => ({ user: m.user, text: m.text })), reactions },
        }),
      })
      if (resp.ok) setSentimentData(await resp.json())
    } catch { /* silent */ }
    setIsAnalyzing(false)
  }

  /* ── AI: Answer Q&A ── */
  const answerQuestion = async (question: string) => {
    if (!question.trim()) return
    setIsAnswering(true)
    try {
      const active = slides[currentSlide]
      const resp = await fetch('/api/theater/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'answer-question',
          data: {
            question,
            presentationTopic: slides[0]?.title || 'General',
            slideContext: active ? `${active.title}: ${active.content}` : '',
          },
        }),
      })
      if (resp.ok) {
        const data = await resp.json()
        setAiAnswer(data.answer)
      }
    } catch { /* silent */ }
    setIsAnswering(false)
  }

  /* ── load slides from API ── */
  useEffect(() => {
    const loadSlides = async () => {
      setIsLoading(true)
      try {
        const resp = await fetch("/api/theater/presentations")
        if (resp.ok) {
          const data = await resp.json()
          setSlides(data.slides || [])
        } else {
          setSlides([])
        }
      } catch {
        setSlides([])
      } finally {
        setIsLoading(false)
      }
    }
    loadSlides()
  }, [])

  /* ── live stream timer ── */
  useEffect(() => {
    if (isLive) {
      timerRef.current = setInterval(() => setElapsedTime((t) => t + 1), 1000)
      fetchViewerCount()
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
      setElapsedTime(0)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isLive])

  const fetchViewerCount = async () => {
    try {
      const resp = await fetch("/api/theater/viewers")
      if (resp.ok) {
        const data = await resp.json()
        setViewerCount(data.count ?? 0)
      }
    } catch {
      /* silent */
    }
  }

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  /* ── go live / end stream ── */
  const toggleLive = async () => {
    try {
      await fetch("/api/theater/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isLive ? "stop" : "start" }),
      })
    } catch {
      /* silent */
    }
    if (!isLive) {
      emit(ROOM_EVENTS.GO_LIVE, { slideCount: slides.length })
    }
    setIsLive(!isLive)
  }

  /* ── slide navigation with timing tracking ── */
  const trackSlideTime = useCallback(() => {
    const elapsed = Math.round((Date.now() - slideStartRef.current) / 1000)
    setSlideTimings(prev => ({
      ...prev,
      [currentSlide]: (prev[currentSlide] || 0) + elapsed,
    }))
    slideStartRef.current = Date.now()

    // Pace coaching: warn if spending too long on a slide (>3 min)
    const total = Object.values(slideTimings).reduce((a, b) => a + b, 0) + elapsed
    const avgPerSlide = slides.length > 0 ? total / slides.length : 0
    if (elapsed > 180) {
      setPaceAdvice("Consider moving forward — you've spent over 3 minutes on this slide")
    } else if (avgPerSlide > 120 && slides.length > 3) {
      setPaceAdvice("Your average pace is above 2 min/slide — consider picking up the pace")
    } else {
      setPaceAdvice("")
    }
  }, [currentSlide, slideTimings, slides.length])

  const nextSlide = () => { trackSlideTime(); setCurrentSlide((c) => Math.min(c + 1, slides.length - 1)) }
  const prevSlide = () => { trackSlideTime(); setCurrentSlide((c) => Math.max(c - 1, 0)) }

  const addSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      title: "New Slide",
      content: "",
      type: "content",
      notes: "",
    }
    setSlides((prev) => [...prev, newSlide])
    setCurrentSlide(slides.length)
  }

  const removeSlide = (idx: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== idx))
    if (currentSlide >= slides.length - 1) setCurrentSlide(Math.max(0, slides.length - 2))
  }

  /* ── chat ── */
  const sendChat = async () => {
    if (!chatInput.trim()) return
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      user: "You",
      text: chatInput,
      timestamp: new Date(),
    }
    setChatMessages((prev) => [...prev, msg])
    setChatInput("")
    try {
      await fetch("/api/theater/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: chatInput }),
      })
    } catch {
      /* silent */
    }
  }

  /* ── reactions ── */
  const sendReaction = async (type: "thumbsUp" | "thumbsDown" | "raised") => {
    setReactions((prev) => {
      const updated = { ...prev, [type]: prev[type] + 1 }
      if (updated.thumbsUp >= 50) emit(ROOM_EVENTS.REACTION_RECEIVED, { total: updated.thumbsUp })
      return updated
    })
    try {
      await fetch("/api/theater/reaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      })
    } catch {
      /* silent */
    }
  }

  /* ── polls ── */
  const launchPoll = async () => {
    if (!pollQuestion.trim() || pollOptions.length < 2) return
    setPollActive(true)
    try {
      await fetch("/api/theater/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: pollQuestion, options: pollOptions.map((o) => o.label) }),
      })
    } catch {
      /* silent */
    }
  }

  const active = slides[currentSlide]

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100">
      {/* ── Toolbar ── */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-5 bg-zinc-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
            <MonitorPlay className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Innovation Theater</span>
          </div>

          {isLive && (
            <div className="flex items-center gap-4 ml-3">
              <div className="flex items-center gap-2 animate-pulse">
                <Radio className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                {formatTime(elapsedTime)}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Eye className="w-3 h-3" />
                {viewerCount} viewers
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Media controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMicOn(!isMicOn)}
            className={isMicOn ? "text-zinc-300" : "text-red-400"}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCamOn(!isCamOn)}
            className={isCamOn ? "text-zinc-300" : "text-red-400"}
          >
            {isCamOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>

          <div className="w-px h-6 bg-zinc-800 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className="gap-1.5 text-xs"
          >
            {isPresenterMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            {isPresenterMode ? "Exit Presenter" : "Presenter View"}
          </Button>

          <Button
            size="sm"
            className={`gap-2 ${isLive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white`}
            onClick={toggleLive}
          >
            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isLive ? "End Stream" : "Go Live"}
          </Button>

          <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
            <Share2 className="w-3.5 h-3.5" />
            Invite
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className={`gap-1.5 text-xs ${showAiPanel ? 'bg-purple-500/20 text-purple-400' : ''}`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Assist
          </Button>
        </div>
      </div>

      {/* ── AI Assistant Panel ── */}
      <AnimatePresence>
        {showAiPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-zinc-800 bg-purple-500/5 overflow-hidden"
          >
            <div className="px-5 py-3 flex items-center gap-3 flex-wrap">
              {/* Generate slides from topic */}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter topic to generate slides..."
                  className="h-8 w-64 text-xs bg-zinc-900/60 border-zinc-700/50"
                  value={generateTopic}
                  onChange={(e) => setGenerateTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && generateSlidesFromTopic()}
                />
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs"
                  onClick={generateSlidesFromTopic}
                  disabled={isGeneratingSlides || !generateTopic.trim()}
                >
                  {isGeneratingSlides ? (
                    <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-3 h-3" /> Generate Slides</>
                  )}
                </Button>
              </div>

              <div className="w-px h-6 bg-zinc-800" />

              {/* Sentiment Analysis */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={analyzeSentiment}
                disabled={isAnalyzing || chatMessages.length === 0}
              >
                <BarChart3 className="w-3 h-3" />
                {isAnalyzing ? 'Analyzing...' : 'Audience Sentiment'}
              </Button>

              {sentimentData && (
                <div className="flex items-center gap-3 text-xs">
                  <Badge variant="outline" className={`${
                    sentimentData.overall >= 70 ? 'text-emerald-400 border-emerald-500/30' :
                    sentimentData.overall >= 40 ? 'text-yellow-400 border-yellow-500/30' :
                    'text-red-400 border-red-500/30'
                  }`}>
                    Engagement: {sentimentData.overall}%
                  </Badge>
                  <Badge variant="outline" className="text-zinc-400 border-zinc-700">
                    {sentimentData.engagementTrend === 'rising' ? '📈' : sentimentData.engagementTrend === 'stable' ? '➡️' : '📉'} {sentimentData.engagementTrend}
                  </Badge>
                  {sentimentData.suggestions.length > 0 && (
                    <span className="text-zinc-500 italic">💡 {sentimentData.suggestions[0]}</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* ── Left: Slide Thumbnails ── */}
          <ResizablePanel defaultSize={18} minSize={14} maxSize={24}>
            <div className="h-full border-r border-zinc-800 flex flex-col bg-zinc-900/20">
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Slides</span>
                <Button variant="ghost" size="sm" onClick={addSlide} className="h-6 w-6 p-0">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                  {isLoading ? (
                    <div className="text-xs text-zinc-600 text-center py-8">Loading slides…</div>
                  ) : slides.length === 0 ? (
                    <div className="text-center py-8">
                      <Presentation className="w-8 h-8 text-zinc-800 mx-auto mb-2" />
                      <p className="text-xs text-zinc-600 mb-2">No slides yet</p>
                      <Button size="sm" variant="outline" onClick={addSlide} className="text-xs gap-1">
                        <Plus className="w-3 h-3" />
                        Add Slide
                      </Button>
                    </div>
                  ) : (
                    slides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-full group relative rounded-lg border p-3 text-left transition-all ${
                          idx === currentSlide
                            ? "border-blue-500/50 bg-blue-500/10"
                            : "border-zinc-800 hover:border-zinc-700 bg-zinc-900/40"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-zinc-600">{idx + 1}</span>
                          <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-zinc-800 text-zinc-600">
                            {slide.type}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-zinc-300 truncate">{slide.title}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeSlide(idx)
                          }}
                          className="absolute top-1 right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Center: Stage ── */}
          <ResizablePanel defaultSize={55} minSize={35}>
            <div className="h-full flex flex-col">
              {/* Stage Area */}
              <div className="flex-1 flex items-center justify-center bg-zinc-950 p-8 relative">
                {active ? (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-4xl aspect-video bg-zinc-900/80 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center justify-center shadow-2xl"
                  >
                    {active.type === "title" && (
                      <div className="text-center space-y-4">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {active.title}
                        </h1>
                        <p className="text-lg text-zinc-400">{active.content}</p>
                      </div>
                    )}
                    {active.type === "content" && (
                      <div className="space-y-4 w-full">
                        <h2 className="text-2xl font-bold text-zinc-100">{active.title}</h2>
                        <p className="text-base text-zinc-400 leading-relaxed whitespace-pre-wrap">{active.content}</p>
                      </div>
                    )}
                    {active.type === "code" && (
                      <div className="w-full space-y-3">
                        <h2 className="text-xl font-bold text-zinc-100">{active.title}</h2>
                        <pre className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-emerald-400 overflow-auto">
                          {active.content}
                        </pre>
                      </div>
                    )}
                    {active.type === "demo" && (
                      <div className="text-center space-y-4">
                        <Sparkles className="w-12 h-12 text-amber-400 mx-auto" />
                        <h2 className="text-2xl font-bold text-zinc-100">{active.title}</h2>
                        <p className="text-zinc-500 text-sm">Live demo area</p>
                      </div>
                    )}
                    {(active.type === "image" || active.type === "split") && (
                      <div className="space-y-4 w-full">
                        <h2 className="text-2xl font-bold text-zinc-100">{active.title}</h2>
                        <p className="text-base text-zinc-400">{active.content}</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="text-center space-y-3">
                    <Presentation className="w-16 h-16 text-zinc-800 mx-auto" />
                    <p className="text-zinc-600">Create slides to start presenting</p>
                  </div>
                )}

                {/* Slide navigation overlay */}
                {slides.length > 0 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full px-4 py-2">
                    <Button variant="ghost" size="sm" onClick={prevSlide} disabled={currentSlide === 0} className="h-7 w-7 p-0">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-xs font-mono text-zinc-400">
                      {currentSlide + 1} / {slides.length}
                    </span>
                    <Button variant="ghost" size="sm" onClick={nextSlide} disabled={currentSlide === slides.length - 1} className="h-7 w-7 p-0">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Pace coaching advice */}
                {paceAdvice && isPresenterMode && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs text-amber-300 backdrop-blur-md animate-pulse">
                    ⏱ {paceAdvice}
                  </div>
                )}
              </div>

              {/* Presenter Notes */}
              {isPresenterMode && active && (
                <div className="h-32 border-t border-zinc-800 bg-zinc-900/40 p-4 overflow-y-auto">
                  <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider mb-1">Speaker Notes</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{active.notes || "No notes for this slide"}</p>
                </div>
              )}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* ── Right: Audience & Engagement ── */}
          <ResizablePanel defaultSize={27} minSize={20} maxSize={35}>
            <div className="h-full flex flex-col border-l border-zinc-800">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 h-10 rounded-none border-b border-zinc-800 bg-zinc-900/30">
                  <TabsTrigger value="chat" className="gap-1 text-xs">
                    <MessageSquare className="w-3 h-3" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="reactions" className="gap-1 text-xs">
                    <ThumbsUp className="w-3 h-3" />
                    Engage
                  </TabsTrigger>
                  <TabsTrigger value="polls" className="gap-1 text-xs">
                    <BarChart3 className="w-3 h-3" />
                    Polls
                  </TabsTrigger>
                </TabsList>

                {/* Chat */}
                <TabsContent value="chat" className="flex-1 flex flex-col m-0">
                  <ScrollArea className="flex-1 p-3">
                    {chatMessages.length === 0 ? (
                      <div className="text-center py-8 text-zinc-700 text-xs">No messages yet</div>
                    ) : (
                      <div className="space-y-3">
                        {chatMessages.map((msg) => (
                          <div key={msg.id} className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-zinc-300">{msg.user}</span>
                              <span className="text-[10px] text-zinc-700">
                                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-3 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Type a message..."
                        className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendChat()}
                      />
                      <Button size="sm" className="h-8 w-8 p-0" onClick={sendChat}>
                        <Send className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Reactions / Engagement */}
                <TabsContent value="reactions" className="flex-1 m-0 p-4">
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Live Reactions</p>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => sendReaction("thumbsUp")}
                          className="flex flex-col items-center gap-1 p-4 rounded-xl border border-zinc-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all"
                        >
                          <ThumbsUp className="w-6 h-6 text-emerald-400" />
                          <span className="text-xs font-mono text-zinc-400">{reactions.thumbsUp}</span>
                        </button>
                        <button
                          onClick={() => sendReaction("thumbsDown")}
                          className="flex flex-col items-center gap-1 p-4 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                        >
                          <ThumbsDown className="w-6 h-6 text-red-400" />
                          <span className="text-xs font-mono text-zinc-400">{reactions.thumbsDown}</span>
                        </button>
                        <button
                          onClick={() => sendReaction("raised")}
                          className="flex flex-col items-center gap-1 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                        >
                          <Hand className="w-6 h-6 text-amber-400" />
                          <span className="text-xs font-mono text-zinc-400">{reactions.raised}</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Q&A Queue</p>
                      <div className="text-center py-6 border border-zinc-800 rounded-lg">
                        <Hand className="w-6 h-6 text-zinc-700 mx-auto mb-2" />
                        <p className="text-xs text-zinc-600">Raise hand to ask a question</p>
                        <Button size="sm" variant="outline" className="mt-3 text-xs gap-1" onClick={() => sendReaction("raised")}>
                          <Hand className="w-3 h-3" />
                          Raise Hand
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Polls */}
                <TabsContent value="polls" className="flex-1 m-0 p-4">
                  <div className="space-y-4">
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">AI Q&A Assistant</p>

                    {/* AI Question Answering */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Ask a question about the presentation..."
                          className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50"
                          value={qaQuestion}
                          onChange={(e) => setQaQuestion(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && answerQuestion(qaQuestion)}
                        />
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-purple-600 hover:bg-purple-700"
                          onClick={() => answerQuestion(qaQuestion)}
                          disabled={isAnswering || !qaQuestion.trim()}
                        >
                          {isAnswering ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }} className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                        </Button>
                      </div>

                      {aiAnswer && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span className="text-[10px] font-semibold text-purple-400 uppercase">AI Answer</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="w-full h-px bg-zinc-800" />

                    {/* Traditional Polls (kept but simplified) */}
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Quick Poll</p>
                    {!pollActive ? (
                      <div className="space-y-3">
                        <Input
                          placeholder="Poll question…"
                          className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50"
                          value={pollQuestion}
                          onChange={(e) => setPollQuestion(e.target.value)}
                        />
                        {pollOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <Input
                              placeholder={`Option ${i + 1}`}
                              className="h-8 text-xs bg-zinc-900/60 border-zinc-700/50"
                              value={opt.label}
                              onChange={(e) => {
                                const updated = [...pollOptions]
                                updated[i] = { ...updated[i], label: e.target.value }
                                setPollOptions(updated)
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-zinc-600"
                              onClick={() => setPollOptions((prev) => prev.filter((_, idx) => idx !== i))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs gap-1"
                          onClick={() => setPollOptions((prev) => [...prev, { label: "", votes: 0 }])}
                        >
                          <Plus className="w-3 h-3" />
                          Add Option
                        </Button>
                        <Button
                          size="sm"
                          className="w-full text-xs bg-blue-600 hover:bg-blue-700"
                          onClick={launchPoll}
                          disabled={!pollQuestion || pollOptions.length < 2}
                        >
                          Launch Poll
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-zinc-200">{pollQuestion}</p>
                        {pollOptions.map((opt, i) => {
                          const total = pollOptions.reduce((s, o) => s + o.votes, 0)
                          const pct = total > 0 ? (opt.votes / total) * 100 : 0
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-zinc-300">{opt.label}</span>
                                <span className="text-zinc-500">{Math.round(pct)}%</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          )
                        })}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => {
                            setPollActive(false)
                            setPollQuestion("")
                            setPollOptions([])
                          }}
                        >
                          Close Poll
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* ── Status Bar ── */}
      <div className="h-7 border-t border-zinc-800 flex items-center justify-between px-5 bg-zinc-900/20 text-[11px] text-zinc-600">
        <div className="flex items-center gap-4">
          {isLive ? (
            <span className="text-red-400 font-medium">● LIVE — {formatTime(elapsedTime)}</span>
          ) : (
            <span>Ready to stream</span>
          )}
          <span>{slides.length} slides</span>
        </div>
        <div className="flex items-center gap-4">
          <span>{viewerCount} viewers</span>
          <span>{chatMessages.length} messages</span>
        </div>
      </div>
    </div>
  )
}
