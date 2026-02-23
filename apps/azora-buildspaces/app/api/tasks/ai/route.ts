/**
 * Task Board — AI Prioritization & Smart Suggestions
 * 
 * Constitutional Compliance:
 * - Article VIII: No Mock Protocol — real AI analysis
 * - Ubuntu Philosophy: AI augments human judgment, doesn't replace it
 * - Transparency: AI explains its reasoning for every recommendation
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateObject, generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export async function POST(request: NextRequest) {
  try {
    const { action, tasks, context } = await request.json()

    if (action === 'prioritize') {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          prioritizedTasks: z.array(
            z.object({
              taskId: z.string(),
              suggestedPriority: z.enum(['urgent', 'high', 'medium', 'low']),
              reason: z.string(),
              estimatedEffort: z.string().describe('e.g. "2h", "1d", "3d"'),
              blockedBy: z.array(z.string()).describe('IDs of tasks that block this one'),
              suggestedAssignee: z.string().optional(),
            })
          ),
          sprintRecommendation: z.object({
            focusTasks: z.array(z.string()).describe('Task IDs to focus on this sprint'),
            reasoning: z.string(),
            estimatedVelocity: z.number().describe('Story points achievable'),
            risks: z.array(z.string()),
          }),
          insights: z.array(z.string()).describe('General observations about the backlog'),
        }),
        prompt: `Analyze this project backlog and provide prioritization recommendations.

Tasks:
${JSON.stringify(tasks, null, 2)}

Project Context: ${context || 'General software project'}

Consider:
1. Dependencies between tasks
2. Impact vs effort
3. Urgency vs importance (Eisenhower matrix)
4. Technical debt vs features
5. Team capacity

Provide actionable, specific recommendations with clear reasoning.`,
      })

      return NextResponse.json(result.object)
    }

    if (action === 'breakdown') {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          subtasks: z.array(
            z.object({
              title: z.string(),
              description: z.string(),
              priority: z.enum(['urgent', 'high', 'medium', 'low']),
              estimatedEffort: z.string(),
              acceptanceCriteria: z.array(z.string()),
            })
          ),
          totalEstimate: z.string(),
        }),
        prompt: `Break down this task into actionable subtasks:

Task: ${tasks[0]?.title}
Description: ${tasks[0]?.description || 'No description'}

Create 3-7 subtasks, each small enough to complete in a single work session. Include clear acceptance criteria for each.`,
      })

      return NextResponse.json(result.object)
    }

    if (action === 'generate-description') {
      const result = await generateObject({
        model: openai('gpt-4o'),
        schema: z.object({
          description: z.string(),
          acceptanceCriteria: z.array(z.string()),
          technicalNotes: z.string(),
          suggestedLabels: z.array(z.string()),
        }),
        prompt: `Generate a detailed task description for: "${tasks[0]?.title}"

Context: ${context || 'Software development project'}

Write a clear description, acceptance criteria, technical notes, and suggest appropriate labels.`,
      })

      return NextResponse.json(result.object)
    }

    if (action === 'standup-report') {
      const completedTasks = tasks.filter((t: any) => t.status === 'done' || t.status === 'complete')
      const inProgressTasks = tasks.filter((t: any) => t.status === 'in-progress' || t.status === 'active')
      const blockedTasks = tasks.filter((t: any) => t.priority === 'urgent' && t.status !== 'done')

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        prompt: `Generate a concise daily standup report:

COMPLETED: ${completedTasks.map((t: any) => t.title).join(', ') || 'None'}
IN PROGRESS: ${inProgressTasks.map((t: any) => `${t.title} (${t.priority})`).join(', ') || 'None'}
BLOCKERS: ${blockedTasks.map((t: any) => t.title).join(', ') || 'None'}

Format with 3 sections: ✅ Yesterday, 🔄 Today, 🚫 Blockers. Keep it professional and concise.`,
      })
      return NextResponse.json({ report: result.text })
    }

    if (action === 'velocity-analysis') {
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          healthScore: z.number().min(0).max(100),
          velocityTrend: z.enum(['accelerating', 'steady', 'decelerating', 'stalled']),
          completionRate: z.number(),
          riskFactors: z.array(z.string()),
          recommendations: z.array(z.string()),
          estimatedSprintCompletion: z.string(),
        }),
        prompt: `Analyze project velocity from these tasks:
${JSON.stringify(tasks.map((t: any) => ({ title: t.title, status: t.status, priority: t.priority })))}

Provide health score (0-100), velocity trend, completion rate, risk factors, and recommendations.`,
      })
      return NextResponse.json(result.object)
    }

    if (action === 'suggest-dates') {
      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: z.object({
          suggestions: z.array(z.object({
            taskId: z.string(),
            estimatedHours: z.number(),
            suggestedDueDate: z.string(),
            rationale: z.string(),
          })),
        }),
        prompt: `Suggest realistic due dates for these tasks:
${JSON.stringify(tasks.map((t: any) => ({ id: t.id, title: t.title, priority: t.priority })))}
Today: ${new Date().toISOString().split('T')[0]}`,
      })
      return NextResponse.json(result.object)
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}