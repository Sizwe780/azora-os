/**
 * Innovation Theater — Poll Route
 *
 * Creates and manages live audience polls during a session.
 * Supports creating polls, submitting votes, and retrieving results.
 */

import { NextRequest, NextResponse } from "next/server"

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  sessionId: string
  question: string
  options: PollOption[]
  status: "active" | "closed"
  createdAt: string
  closedAt?: string
  voters: string[]
}

// sessionId -> polls[]
const sessionPolls = new Map<string, Poll[]>()

function getPolls(sessionId: string): Poll[] {
  if (!sessionPolls.has(sessionId)) {
    sessionPolls.set(sessionId, [])
  }
  return sessionPolls.get(sessionId)!
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("sessionId") ?? "default"
  const pollId = searchParams.get("pollId")

  const polls = getPolls(sessionId)

  if (pollId) {
    const poll = polls.find((p) => p.id === pollId)
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }
    // Don't expose voter IDs
    const { voters, ...safePoll } = poll
    return NextResponse.json({ poll: { ...safePoll, totalVotes: voters.length } })
  }

  const safePolls = polls.map(({ voters, ...p }) => ({
    ...p,
    totalVotes: voters.length,
  }))

  return NextResponse.json({ polls: safePolls, sessionId })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sessionId = "default", action = "create", pollId, question, options, optionId, voterId } = body

    const polls = getPolls(sessionId)

    if (action === "create") {
      if (!question || !Array.isArray(options) || options.length < 2) {
        return NextResponse.json(
          { error: "question and at least 2 options are required" },
          { status: 400 },
        )
      }

      // Close any currently active polls in this session
      polls.forEach((p) => { if (p.status === "active") p.status = "closed" })

      const newPoll: Poll = {
        id: `poll_${Date.now()}`,
        sessionId,
        question,
        options: options.map((text: string, i: number) => ({
          id: `opt_${i}`,
          text,
          votes: 0,
        })),
        status: "active",
        createdAt: new Date().toISOString(),
        voters: [],
      }

      polls.push(newPoll)

      const { voters, ...safePoll } = newPoll
      return NextResponse.json({ success: true, poll: { ...safePoll, totalVotes: 0 } })
    }

    if (action === "vote") {
      if (!pollId || !optionId || !voterId) {
        return NextResponse.json({ error: "pollId, optionId, and voterId are required" }, { status: 400 })
      }

      const poll = polls.find((p) => p.id === pollId)
      if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 })
      if (poll.status === "closed") return NextResponse.json({ error: "Poll is closed" }, { status: 409 })
      if (poll.voters.includes(voterId)) {
        return NextResponse.json({ error: "Already voted" }, { status: 409 })
      }

      const option = poll.options.find((o) => o.id === optionId)
      if (!option) return NextResponse.json({ error: "Option not found" }, { status: 404 })

      option.votes += 1
      poll.voters.push(voterId)

      const { voters, ...safePoll } = poll
      return NextResponse.json({ success: true, poll: { ...safePoll, totalVotes: voters.length } })
    }

    if (action === "close") {
      if (!pollId) return NextResponse.json({ error: "pollId is required" }, { status: 400 })

      const poll = polls.find((p) => p.id === pollId)
      if (!poll) return NextResponse.json({ error: "Poll not found" }, { status: 404 })

      poll.status = "closed"
      poll.closedAt = new Date().toISOString()

      const { voters, ...safePoll } = poll
      return NextResponse.json({ success: true, poll: { ...safePoll, totalVotes: voters.length } })
    }

    return NextResponse.json({ error: "Unknown action. Use create, vote, or close." }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to process poll" }, { status: 500 })
  }
}
