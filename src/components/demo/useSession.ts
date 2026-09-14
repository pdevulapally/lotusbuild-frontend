import { useCallback, useEffect, useRef, useState } from 'react'
import {
  LAST_AGENT_STAGE,
  session,
  stages,
  type Message,
  type Stage,
  type StageId,
} from '../../content/demo.ts'
import type { Progress } from './Artifacts.tsx'

const MESSAGE_DELAY_MS = 500
const MESSAGE_GAP_MS = 750

const noneRevealed = () => stages.map(() => 0)

export function stageSub(stage: Stage, progress: Progress) {
  if (progress === 'active') return stage.working
  if (progress === 'done') return stage.done
  return stage.pending
}

/** Messages grouped by the stage the agent was on; `stage` is null for the user's own follow-ups. */
export type TranscriptGroup = { stage: number | null; messages: Message[] }

export type SessionState = {
  viewIndex: number
  runKey: number
  transcript: TranscriptGroup[]
  working: boolean
  progressOf: (index: number) => Progress
  select: (id: StageId) => void
  send: (text: string) => void
  replay: () => void
}

/** Drives the mocked agent session: auto-advances through stages, reveals messages, handles skips. */
export function useSession(): SessionState {
  const [viewIndex, setViewIndex] = useState(0)
  const [agentIndex, setAgentIndex] = useState(0)
  const [previewReady, setPreviewReady] = useState(false)
  const [revealed, setRevealed] = useState<number[]>(noneRevealed)
  const [replies, setReplies] = useState<Message[]>([])
  const [runKey, setRunKey] = useState(0)
  const followRef = useRef(true)

  useEffect(() => {
    const current = stages[agentIndex]
    const timers: number[] = []

    current.messages.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => {
          setRevealed((prev) =>
            prev.map((n, k) => (k === agentIndex ? Math.max(n, i + 1) : n)),
          )
        }, MESSAGE_DELAY_MS + i * MESSAGE_GAP_MS),
      )
    })

    if (current.durationMs > 0 && agentIndex < LAST_AGENT_STAGE) {
      timers.push(
        window.setTimeout(() => {
          const next = agentIndex + 1
          setRevealed((prev) =>
            prev.map((n, k) => (k === agentIndex ? current.messages.length : n)),
          )
          setAgentIndex(next)
          if (followRef.current) setViewIndex(next)
        }, current.durationMs),
      )
    }

    if (current.artifact.kind === 'preview') {
      timers.push(
        window.setTimeout(() => setPreviewReady(true), current.artifact.startingMs),
      )
    }

    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [agentIndex, runKey])

  const progressOf = useCallback(
    (index: number): Progress => {
      if (index < agentIndex) return 'done'
      if (index > agentIndex) return 'pending'
      if (stages[index].artifact.kind === 'preview' && previewReady) return 'done'
      return 'active'
    },
    [agentIndex, previewReady],
  )

  const select = useCallback(
    (id: StageId) => {
      const index = stages.findIndex((s) => s.id === id)
      if (index < 0) return
      setViewIndex(index)
      followRef.current = index >= agentIndex && index <= LAST_AGENT_STAGE
      if (index > agentIndex && index <= LAST_AGENT_STAGE) {
        setRevealed((prev) =>
          prev.map((n, k) => (k < index ? stages[k].messages.length : n)),
        )
        setAgentIndex(index)
      }
    },
    [agentIndex],
  )

  const send = useCallback((text: string) => {
    setReplies((prev) => [...prev, { role: 'user', text }])
    window.setTimeout(() => {
      setReplies((prev) => [
        ...prev,
        { role: 'assistant', text: session.cannedReply },
      ])
    }, 700)
  }, [])

  const replay = useCallback(() => {
    followRef.current = true
    setViewIndex(0)
    setAgentIndex(0)
    setPreviewReady(false)
    setRevealed(noneRevealed())
    setReplies([])
    setRunKey((k) => k + 1)
  }, [])

  const transcript: TranscriptGroup[] = stages
    .map((s, k) => ({ stage: k, messages: s.messages.slice(0, revealed[k]) }))
    .filter((g) => g.messages.length > 0)
  if (replies.length > 0) transcript.push({ stage: null, messages: replies })

  return {
    viewIndex,
    runKey,
    transcript,
    working: progressOf(LAST_AGENT_STAGE) !== 'done',
    progressOf,
    select,
    send,
    replay,
  }
}
