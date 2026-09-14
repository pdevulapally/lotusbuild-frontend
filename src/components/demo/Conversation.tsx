import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { motion } from 'motion/react'
import {
  session,
  stages,
  type AgentStep,
  type Message,
} from '../../content/demo.ts'
import type { Progress } from './Artifacts.tsx'
import { StageMark } from './StageTabs.tsx'
import { stageSub, type TranscriptGroup } from './useSession.ts'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  transcript: TranscriptGroup[]
  viewIndex: number
  working: boolean
  progressOf: (index: number) => Progress
  onSelect: (index: number) => void
  onSend: (text: string) => void
}

function StepIcon({ kind }: { kind: AgentStep['kind'] }) {
  const glyph = { read: '▤', thought: '◌', search: '⌕', ran: '›' }[kind]
  return (
    <span className="demo-step-icon" aria-hidden="true">
      {glyph}
    </span>
  )
}

function Entry({ message }: { message: Message }) {
  switch (message.role) {
    case 'user':
      return (
        <div className="demo-msg demo-msg-user">
          <p>{message.text}</p>
        </div>
      )
    case 'assistant':
      return (
        <div className="demo-msg demo-msg-agent">
          <span className="demo-msg-who">
            <span className="demo-msg-mark" aria-hidden="true" />
            {session.agentName}
          </span>
          <p>{message.text}</p>
        </div>
      )
    case 'steps':
      return (
        <ul className="demo-msg demo-msg-steps">
          {message.steps.map((step) => (
            <li key={step.text}>
              <StepIcon kind={step.kind} />
              <span className="demo-step-text">{step.text}</span>
            </li>
          ))}
        </ul>
      )
    case 'files':
      return (
        <ul className="demo-msg demo-msg-files">
          {message.files.map((file) => (
            <li key={file.path}>
              <span className="demo-file-path">{file.path}</span>
              <span className="demo-stat-add">+{file.added}</span>
            </li>
          ))}
        </ul>
      )
  }
}

function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** A stage's messages, with a clickable stage marker after any leading user prompt. */
function Group({
  group,
  viewIndex,
  progressOf,
  onSelect,
}: Omit<Props, 'transcript' | 'working' | 'onSend'> & {
  group: TranscriptGroup
}) {
  const { stage, messages } = group
  if (stage === null) {
    return messages.map((m, i) => (
      <Reveal key={i}>
        <Entry message={m} />
      </Reveal>
    ))
  }

  const progress = progressOf(stage)
  const lead = messages.findIndex((m) => m.role !== 'user')
  const split = lead < 0 ? messages.length : lead
  const marker = (
    <Reveal key="marker">
      <button
        type="button"
        className={`demo-marker is-${progress}${stage === viewIndex ? ' is-selected' : ''}`}
        onClick={() => onSelect(stage)}
      >
        <StageMark progress={progress} />
        <span className="demo-marker-label">{stages[stage].label}</span>
        <span className="demo-marker-sub">
          {stageSub(stages[stage], progress)}
        </span>
        <span className="demo-marker-open">{session.openLabel}</span>
      </button>
    </Reveal>
  )

  return [
    ...messages.slice(0, split).map((m, i) => (
      <Reveal key={`u${i}`}>
        <Entry message={m} />
      </Reveal>
    )),
    marker,
    ...messages.slice(split).map((m, i) => (
      <Reveal key={`m${i}`}>
        <Entry message={m} />
      </Reveal>
    )),
  ]
}

function Conversation({
  transcript,
  viewIndex,
  working,
  progressOf,
  onSelect,
  onSend,
}: Props) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const count = transcript.reduce((n, g) => n + g.messages.length, 0)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [count, working])

  const submit = (e?: FormEvent) => {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <aside className="demo-chat" aria-label={session.railLabel}>
      <div className="demo-chat-scroll" ref={scrollRef}>
        {transcript.map((group) => (
          <Group
            key={group.stage ?? 'replies'}
            group={group}
            viewIndex={viewIndex}
            progressOf={progressOf}
            onSelect={onSelect}
          />
        ))}
        {working && (
          <div className="demo-msg demo-msg-typing" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
      <form className="demo-composer" onSubmit={submit}>
        <textarea
          name="message"
          rows={2}
          spellCheck={false}
          placeholder={session.composer.placeholder}
          aria-label={session.composer.placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="demo-composer-bar">
          <span className="demo-composer-hint">{session.composer.hint}</span>
          <button type="submit" className="demo-send" disabled={!draft.trim()}>
            {session.composer.send}
          </button>
        </div>
      </form>
    </aside>
  )
}

export default Conversation
