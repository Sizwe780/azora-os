/**
 * Theater AI — Slide generation, sentiment analysis, Q&A answers
 * 
 * Constitutional Compliance:
 * - Ubuntu Philosophy: AI assists presenters, not replaces them
 * - Truth as Currency: AI discloses when content is generated
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateText, generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    if (action === 'generate-slides') {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          slides: z.array(
            z.object({
              title: z.string(),
              content: z.string(),
              type: z.enum(['title', 'content', 'code', 'demo', 'split']),
              notes: z.string(),
            })
          ),
        }),
        prompt: `Generate a professional presentation with 5-8 slides about: "${data.topic}".
Each slide should have a clear title, substantive content (use markdown-style bullet points for content slides, real code for code slides), and helpful speaker notes.
The first slide should be type "title", include at least one "code" slide with a real code example, and end with a "content" slide for Q&A/next steps.`,
      })

      return NextResponse.json({ slides: result.object.slides })
    }

    if (action === 'analyze-sentiment') {
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          overall: z.number().min(0).max(100).describe('Audience engagement score 0-100'),
          sentiment: z.enum(['very_negative', 'negative', 'neutral', 'positive', 'very_positive']),
          themes: z.array(z.string()).describe('Key themes from audience messages'),
          suggestions: z.array(z.string()).describe('Suggestions for the presenter'),
          engagementTrend: z.enum(['rising', 'stable', 'declining']),
        }),
        prompt: `Analyze the audience sentiment from these chat messages during a live presentation:\n\n${JSON.stringify(data.messages)}\n\nReactions: 👍 ${data.reactions?.thumbsUp || 0}, 👎 ${data.reactions?.thumbsDown || 0}, ✋ ${data.reactions?.raised || 0}\n\nProvide engagement score, sentiment, key themes, and suggestions for the presenter.`,
      })

      return NextResponse.json(result.object)
    }

    if (action === 'answer-question') {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        system: `You are an AI assistant helping a presenter answer audience questions during a live presentation about: "${data.presentationTopic}". 
Give concise, accurate answers. If you're unsure, say so. Keep answers under 3 sentences unless the question demands more detail.
Current slide context: ${data.slideContext || 'N/A'}`,
        prompt: data.question,
      })

      return NextResponse.json({ answer: text })
    }

    if (action === 'improve-slide') {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          title: z.string(),
          content: z.string(),
          notes: z.string(),
          improvements: z.array(z.string()).describe('What was improved'),
        }),
        prompt: `Improve this presentation slide for clarity, impact, and engagement:\n\nTitle: ${data.title}\nContent: ${data.content}\nNotes: ${data.notes}\n\nMake the content more compelling, add specific examples or data points, and enhance speaker notes with delivery tips.`,
      })

      return NextResponse.json(result.object)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
