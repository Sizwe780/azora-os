/**
 * Knowledge Ocean — Conversation History & Knowledge Graph API
 * 
 * Industry leaders: Perplexity, Notion AI, Obsidian Graph, ChatGPT memory
 * Our edge: Cross-room knowledge context, constitutional transparency
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// In-memory conversation store
const conversations = new Map<string, any[]>()
// Knowledge graph edges
const knowledgeGraph: { from: string; to: string; relation: string; weight: number }[] = []

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action')

  if (action === 'conversations') {
    const allConversations: any[] = []
    conversations.forEach((msgs, id) => {
      allConversations.push({
        id,
        messageCount: msgs.length,
        lastQuestion: msgs[msgs.length - 1]?.question || '',
        timestamp: msgs[msgs.length - 1]?.timestamp || new Date().toISOString(),
      })
    })
    return NextResponse.json({
      conversations: allConversations.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    })
  }

  if (action === 'graph') {
    // Build knowledge graph from conversations
    const nodes = new Map<string, { id: string; label: string; type: string; weight: number }>()

    conversations.forEach((msgs) => {
      msgs.forEach((msg: any) => {
        // Extract topics from questions
        const words = (msg.question || '').toLowerCase().split(/\s+/).filter((w: string) => w.length > 4)
        words.forEach((word: string) => {
          const existing = nodes.get(word)
          if (existing) {
            existing.weight++
          } else {
            nodes.set(word, { id: word, label: word, type: 'topic', weight: 1 })
          }
        })
      })
    })

    return NextResponse.json({
      nodes: Array.from(nodes.values()).sort((a, b) => b.weight - a.weight).slice(0, 50),
      edges: knowledgeGraph.slice(0, 100),
    })
  }

  return NextResponse.json({ conversations: [], graph: { nodes: [], edges: [] } })
}

export async function POST(req: NextRequest) {
  try {
    const { action, question, answer, sessionId, sources } = await req.json()

    if (action === 'save-qa') {
      const session = sessionId || 'default'
      const msgs = conversations.get(session) || []
      msgs.push({
        id: crypto.randomUUID(),
        question,
        answer,
        sources: sources || [],
        timestamp: new Date().toISOString(),
      })
      conversations.set(session, msgs)
      return NextResponse.json({ success: true, conversationLength: msgs.length })
    }

    if (action === 'suggest-related') {
      // Get all past questions to find related topics
      const allQuestions: string[] = []
      conversations.forEach((msgs) => {
        msgs.forEach((msg: any) => {
          if (msg.question) allQuestions.push(msg.question)
        })
      })

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          relatedQuestions: z.array(z.string()).min(3).max(6),
          relatedTopics: z.array(z.object({
            topic: z.string(),
            description: z.string(),
            relevance: z.number().min(0).max(1),
          })),
        }),
        prompt: `Based on this question: "${question}"
And past questions: ${allQuestions.slice(-10).join(', ')}

Suggest:
1. 3-6 follow-up questions the user might ask next
2. Related topics they should explore
Focus on deepening understanding and finding connections.`,
      })
      return NextResponse.json(result.object)
    }

    if (action === 'summarize-session') {
      const session = sessionId || 'default'
      const msgs = conversations.get(session) || []

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          title: z.string(),
          summary: z.string(),
          keyTopics: z.array(z.string()),
          keyInsights: z.array(z.string()),
          unresolvedQuestions: z.array(z.string()),
        }),
        prompt: `Summarize this knowledge exploration session:
${msgs.map((m: any) => `Q: ${m.question}\nA: ${m.answer?.substring(0, 200)}`).join('\n\n')}

Provide a title, summary, key topics, insights, and any unresolved questions.`,
      })
      return NextResponse.json(result.object)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
