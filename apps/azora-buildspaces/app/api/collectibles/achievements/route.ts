/**
 * Collectible Achievement Events — Event-driven achievement unlocking
 * 
 * Constitutional Compliance:
 * - Article III: Economic Constitution — Proof-of-Knowledge rewards
 * - Ubuntu Philosophy: Community contributions earn recognition
 * - Truth as Currency: Only real, verified achievements unlock cards
 */

import { NextRequest, NextResponse } from 'next/server'

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  // Code Chamber
  { id: 'first-commit', name: 'First Commit', description: 'Make your first code commit', room: 'code-chamber', power: 50, tier: 'common' as const, icon: '💻' },
  { id: 'code-reviewer', name: 'Code Reviewer', description: 'Complete 10 AI-assisted code reviews', room: 'code-chamber', power: 200, tier: 'uncommon' as const, icon: '🔍' },
  { id: 'pair-programmer', name: 'Pair Programmer', description: 'Complete a real-time collaboration session', room: 'code-chamber', power: 150, tier: 'uncommon' as const, icon: '👥' },
  { id: 'refactor-master', name: 'Refactor Master', description: 'Apply 25 AI refactoring suggestions', room: 'code-chamber', power: 500, tier: 'rare' as const, icon: '🔧' },
  
  // Spec Chamber
  { id: 'spec-writer', name: 'Spec Writer', description: 'Write your first specification', room: 'spec-chamber', power: 75, tier: 'common' as const, icon: '📝' },
  { id: 'spec-architect', name: 'Spec Architect', description: 'Create 10 validated specifications', room: 'spec-chamber', power: 300, tier: 'uncommon' as const, icon: '🏛️' },
  { id: 'visual-thinker', name: 'Visual Thinker', description: 'Build a logic flow in the Visual Builder', room: 'spec-chamber', power: 200, tier: 'uncommon' as const, icon: '🧩' },
  
  // Design Studio
  { id: 'designer', name: 'Designer', description: 'Import your first Figma design', room: 'design-studio', power: 100, tier: 'common' as const, icon: '🎨' },
  { id: 'a11y-champion', name: 'Accessibility Champion', description: 'Pass 50 accessibility audits', room: 'design-studio', power: 750, tier: 'rare' as const, icon: '♿' },
  
  // AI Studio
  { id: 'agent-trainer', name: 'Agent Trainer', description: 'Create and run your first AI workflow', room: 'ai-studio', power: 150, tier: 'uncommon' as const, icon: '🤖' },
  { id: 'orchestrator', name: 'Orchestrator', description: 'Run a multi-agent workflow with 5+ nodes', room: 'ai-studio', power: 500, tier: 'rare' as const, icon: '🎭' },
  { id: 'ai-whisperer', name: 'AI Whisperer', description: 'Execute 100 successful AI workflows', room: 'ai-studio', power: 2000, tier: 'epic' as const, icon: '✨' },
  
  // Command Desk
  { id: 'slash-user', name: 'Slash Commander', description: 'Use 5 different slash commands', room: 'command-desk', power: 100, tier: 'common' as const, icon: '⚡' },
  { id: 'power-user', name: 'Power User', description: 'Send 500 messages to AI agents', room: 'command-desk', power: 1000, tier: 'epic' as const, icon: '🚀' },
  
  // Collaboration Pod
  { id: 'team-player', name: 'Team Player', description: 'Join your first collaboration session', room: 'collaboration-pod', power: 100, tier: 'common' as const, icon: '🤝' },
  { id: 'meeting-maven', name: 'Meeting Maven', description: 'Generate 10 AI meeting summaries', room: 'collaboration-pod', power: 400, tier: 'uncommon' as const, icon: '📋' },
  
  // Deep Focus
  { id: 'focused', name: 'Deep Focus', description: 'Complete a 25-minute focus session', room: 'deep-focus', power: 50, tier: 'common' as const, icon: '🧘' },
  { id: 'flow-state', name: 'Flow State', description: 'Accumulate 10 hours of focus time', room: 'deep-focus', power: 500, tier: 'rare' as const, icon: '🌊' },
  { id: 'zen-master', name: 'Zen Master', description: 'Maintain a 30-day focus streak', room: 'deep-focus', power: 2500, tier: 'epic' as const, icon: '☯️' },
  
  // Innovation Theater
  { id: 'presenter', name: 'Presenter', description: 'Go live for the first time', room: 'innovation-theater', power: 150, tier: 'uncommon' as const, icon: '🎤' },
  { id: 'crowd-pleaser', name: 'Crowd Pleaser', description: 'Get 50 positive reactions in a session', room: 'innovation-theater', power: 500, tier: 'rare' as const, icon: '👏' },
  
  // Knowledge Ocean
  { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Ask your first AI-powered question', room: 'knowledge-ocean', power: 50, tier: 'common' as const, icon: '📚' },
  { id: 'librarian', name: 'Librarian', description: 'Index 100 documents', room: 'knowledge-ocean', power: 500, tier: 'rare' as const, icon: '🏫' },
  
  // Maker Lab
  { id: 'maker', name: 'Maker', description: 'Run your first hardware simulation', room: 'maker-lab', power: 100, tier: 'common' as const, icon: '🔌' },
  { id: 'iot-engineer', name: 'IoT Engineer', description: 'Simulate 5 different boards', room: 'maker-lab', power: 400, tier: 'uncommon' as const, icon: '📡' },
  
  // Task Board
  { id: 'task-master', name: 'Task Master', description: 'Complete 50 tasks', room: 'task-board', power: 500, tier: 'rare' as const, icon: '✅' },
  { id: 'velocity-king', name: 'Velocity King', description: 'Maintain sprint velocity for 4 weeks', room: 'task-board', power: 1500, tier: 'epic' as const, icon: '📊' },
  
  // Cross-room
  { id: 'polymath', name: 'Polymath', description: 'Use all 12 rooms in a single day', room: 'cross-room', power: 5000, tier: 'legendary' as const, icon: '🌟' },
  { id: 'constitutional', name: 'Constitutional Developer', description: 'Pass 1000 Constitutional AI validation checks', room: 'cross-room', power: 10000, tier: 'mythical' as const, icon: '⚖️' },
]

// In-memory event store
let userAchievements: { id: string; unlockedAt: string; room: string }[] = []
let eventLog: { event: string; room: string; timestamp: string; data?: any }[] = []

export async function GET() {
  return NextResponse.json({
    definitions: ACHIEVEMENT_DEFINITIONS,
    unlocked: userAchievements,
    totalPower: userAchievements.reduce((sum, a) => {
      const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === a.id)
      return sum + (def?.power || 0)
    }, 0),
    recentEvents: eventLog.slice(-20),
    progress: ACHIEVEMENT_DEFINITIONS.map((def) => ({
      ...def,
      unlocked: userAchievements.some((a) => a.id === def.id),
      unlockedAt: userAchievements.find((a) => a.id === def.id)?.unlockedAt,
    })),
  })
}

export async function POST(request: NextRequest) {
  try {
    const { event, room, data } = await request.json()

    // Log the event
    eventLog.push({ event, room, timestamp: new Date().toISOString(), data })

    // Check if any achievements should be unlocked
    const newUnlocks: typeof ACHIEVEMENT_DEFINITIONS = []

    // Event-based achievement checking
    const eventChecks: Record<string, string[]> = {
      'code-commit': ['first-commit'],
      'code-review': ['code-reviewer'],
      'collab-join': ['pair-programmer', 'team-player'],
      'refactor-apply': ['refactor-master'],
      'spec-create': ['spec-writer'],
      'spec-validate': ['spec-architect'],
      'visual-build': ['visual-thinker'],
      'figma-import': ['designer'],
      'a11y-pass': ['a11y-champion'],
      'workflow-run': ['agent-trainer'],
      'workflow-multi': ['orchestrator'],
      'slash-command': ['slash-user'],
      'message-send': ['power-user'],
      'meeting-summary': ['meeting-maven'],
      'focus-complete': ['focused'],
      'focus-streak': ['zen-master'],
      'go-live': ['presenter'],
      'reaction-received': ['crowd-pleaser'],
      'knowledge-ask': ['knowledge-seeker'],
      'document-index': ['librarian'],
      'simulate-board': ['maker'],
      'task-complete': ['task-master'],
      'all-rooms-visited': ['polymath'],
    }

    const potentialUnlocks = eventChecks[event] || []

    for (const achievementId of potentialUnlocks) {
      if (!userAchievements.some((a) => a.id === achievementId)) {
        const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievementId)
        if (def) {
          userAchievements.push({
            id: achievementId,
            unlockedAt: new Date().toISOString(),
            room: def.room,
          })
          newUnlocks.push(def)
        }
      }
    }

    return NextResponse.json({
      success: true,
      newUnlocks,
      totalAchievements: userAchievements.length,
      totalPower: userAchievements.reduce((sum, a) => {
        const def = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === a.id)
        return sum + (def?.power || 0)
      }, 0),
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
