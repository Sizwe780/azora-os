'use client'

import { useState, useEffect, useRef } from 'react'
import { Navbar } from '@/components/features/navbar'
import { Footer } from '@/components/features/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  MessageSquare,
  Video,
  Share2,
  Zap,
  Globe,
  ArrowRight,
  Play,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CollaborationPodPage() {
  const router = useRouter()
  const [openWhiteboard, setOpenWhiteboard] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [whiteboardText, setWhiteboardText] = useState('')
  const [docInfo, setDocInfo] = useState({connected:false, peers:0})
  const [peersList, setPeersList] = useState<Array<{id:number, name:string, color?:string}>>([])

  // YJS provider lifecycle
  const docRef = useRef<any>(null)
  const providerRef = useRef<any>(null)
  const textRef = useRef<any>(null)
  const textObserverRef = useRef<any>(null)
  const awarenessHandlerRef = useRef<any>(null)
  const writeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    async function start() {
      if (!openWhiteboard) return
      // dynamic imports to avoid importing on server
      const Y = await import('yjs')
      const { WebsocketProvider } = await import('y-websocket')
      const doc = new Y.Doc()
      const provider = new WebsocketProvider('ws://localhost:1234', 'collaboration-pod-room', doc)
      const text = doc.getText('board')

      docRef.current = doc
      providerRef.current = provider
      textRef.current = text

      setWhiteboardText(text.toString())

      const textObserver = () => {
        setWhiteboardText(text.toString())
      }

      textObserverRef.current = textObserver
      text.observe(textObserverRef.current)

      // update peers when awareness changes
      const setLocalPresence = () => {
        try {
          const name = (typeof window !== 'undefined' && (window as any).AZORA_USER_NAME) || 'You'
          const color = '#22c55e' // emerald
          provider.awareness?.setLocalStateField('user', { name, color })
        } catch (err) {
          // ignore
        }
      }

      const awarenessHandler = () => {
        const states = provider.awareness ? provider.awareness.getStates() : new Map()
        const peers: Array<{id:number,name:string,color?:string}> = []
        states.forEach((state: any, clientId: number) => {
          const user = state.user || {}
          peers.push({ id: clientId, name: user.name || 'Anon', color: user.color })
        })
        setPeersList(peers.filter((p) => p.id !== provider.awareness.clientID))
        setDocInfo({ connected: provider.shouldConnect, peers: peers.length })
      }

      awarenessHandlerRef.current = awarenessHandler
      provider.awareness?.on('update', awarenessHandlerRef.current)

      provider.on('status', (e: any) => {
        setDocInfo((s) => ({ ...s, connected: e.status === 'connected' }))
      })

      // set local presence and initial peers
      setLocalPresence()
      awarenessHandlerRef.current()
    }

    start()

    return () => {
      try {
        const provider = providerRef.current
        const doc = docRef.current
        const text = textRef.current
        const textObserver = textObserverRef.current
        const awarenessHandler = awarenessHandlerRef.current
        if (text && textObserver) text.unobserve(textObserver)
        if (provider?.awareness && awarenessHandler) provider.awareness.off('update', awarenessHandler)
        if (writeTimeoutRef.current) {
          clearTimeout(writeTimeoutRef.current)
          writeTimeoutRef.current = null
        }
        provider?.disconnect()
        doc?.destroy()
        docRef.current = null
        providerRef.current = null
        textRef.current = null
        textObserverRef.current = null
        awarenessHandlerRef.current = null
      } catch (e) {
        // ignore
      }
    }
  }, [openWhiteboard])

  const features = [
    {
      icon: Users,
      title: "Real-time Collaboration",
      description: "Work together on code, designs, and documents with live synchronization"
    },
    {
      icon: MessageSquare,
      title: "Team Chat",
      description: "Communicate with your team through integrated chat and voice channels"
    },
    {
      icon: Share2,
      title: "Shared Whiteboard",
      description: "Collaborative whiteboard for brainstorming and visual planning"
    },
    {
      icon: Video,
      title: "Video Calls",
      description: "High-quality video conferencing integrated into your workspace"
    },
    {
      icon: Globe,
      title: "Cross-Platform",
      description: "Access your collaboration sessions from any device or browser"
    },
    {
      icon: Zap,
      title: "Instant Sessions",
      description: "Start collaborative sessions instantly without complex setup"
    }
  ]

  const capabilities = [
    "Real-time code collaboration",
    "Shared document editing",
    "Whiteboard and diagramming",
    "Video and voice calls",
    "Screen sharing",
    "File sharing and comments",
    "Session recording",
    "Team management",
    "Guest access",
    "Integration with external tools"
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Users className="w-4 h-4" />
              <span>Collaboration Pod</span>
            </div>
            <h1 className="text-4xl font-bold mb-6">
              Real-Time Team Collaboration
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Work together seamlessly with your team. Share code, collaborate on designs,
              chat in real-time, and conduct video calls - all integrated into your workspace.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                <Play className="w-4 h-4" />
                Open Collaboration Pod
              </Button>
              <Button size="lg" variant="outline" onClick={() => setOpenWhiteboard(true)}>
                Try Live Demo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, i) => (
              <Card key={i} className="border-border/50">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Demo Section */}
          {openWhiteboard && (
            <Card className="mb-16">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Live Collaboration Demo
                </CardTitle>
                <CardDescription>
                  Try the shared whiteboard below. Open this page in another browser tab to see real-time collaboration in action.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Participants */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Participants ({docInfo.peers})
                    </h4>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {peersList.slice(0, 5).map((p) => (
                          <div key={p.id} className="w-8 h-8 rounded-full flex items-center justify-center ring-1 ring-border text-xs font-semibold text-white" title={p.name} style={{ background: p.color || '#555' }}>
                            {p.name.split(' ').map(s => s[0]).join('').slice(0,2)}
                          </div>
                        ))}
                      </div>
                      <Badge variant={docInfo.connected ? "default" : "secondary"}>
                        {docInfo.connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" onClick={() => setChatOpen(!chatOpen)} className="w-full justify-start gap-2">
                        <MessageSquare className="w-4 h-4" />
                        {chatOpen ? 'Close Chat' : 'Open Chat'}
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start gap-2">
                        <Video className="w-4 h-4" />
                        Start Call
                      </Button>
                    </div>
                  </div>

                  {/* Whiteboard */}
                  <div>
                    <h4 className="font-semibold mb-3">Shared Whiteboard</h4>
                    <textarea
                      value={whiteboardText}
                      onChange={(e) => {
                        const val = e.target.value
                        setWhiteboardText(val)
                        // write into shared Y.Text if available with debounce
                        const text = textRef.current
                        const doc = docRef.current
                        if (text && doc) {
                          try {
                            if (writeTimeoutRef.current) {
                              clearTimeout(writeTimeoutRef.current)
                            }
                            // debounce writes to reduce churn
                            writeTimeoutRef.current = window.setTimeout(() => {
                              try {
                                doc.transact(() => {
                                  const oldLen = (typeof text.length === 'number') ? text.length : text.toString().length
                                  if (oldLen > 0) text.delete(0, oldLen)
                                  if (val.length > 0) text.insert(0, val)
                                })
                              } catch (err) {
                                // ignore sync errors
                              }
                              writeTimeoutRef.current = null
                            }, 250)
                          } catch (err) {
                            // ignore sync errors
                          }
                        }
                      }}
                      placeholder="Start typing to collaborate in real-time..."
                      className="w-full h-48 resize-none rounded-md border border-border bg-background p-3 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Capabilities */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-center">Collaboration Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((capability, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-muted/30 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Collaborate?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Access the full Collaboration Pod in our integrated workspace.
                Invite your team and start working together seamlessly.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" onClick={() => router.push('/workspace')} className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Enter Collaboration Pod
                </Button>
                <Link href="/features" className="text-muted-foreground hover:text-foreground">
                  View All Features →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
