import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { motion } from 'motion/react'
import { session, type AgentStep, type Message } from '../../content/demo.ts'

const EASE = [0.16, 1, 0.3, 1] as const

type Props = {
  messages: Message[]
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

function MessageCard({ message }: { message: Message }) {
  switch (message.role) {
    case 'user':
      return (
        <div className="demo-card demo-card-user">
          <span className="demo-card-who">You</span>
          <p>{message.text}</p>
        </div>
      )
    case 'assistant':
      return (
        <div className="demo-card demo-card-agent">
          <span className="demo-card-who">LotusBuild</span>
          <p>{message.text}</p>
        </div>
      )
    case 'steps':
      return (
        <ul className="demo-card demo-card-steps">
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
        <ul className="demo-card demo-card-files">
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

function ConversationRail({ messages, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
  }, [messages.length])

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
    <div className="demo-rail">
      <div className="demo-rail-label">{session.railLabel}</div>
      <div className="demo-rail-scroller" ref={scrollerRef}>
        {messages.map((message, i) => (
          <motion.div
            key={i}
            className="demo-rail-item"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <MessageCard message={message} />
          </motion.div>
        ))}
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
        <button type="submit" className="demo-send" disabled={!draft.trim()}>
          {session.composer.send}
        </button>
      </form>
    </div>
  )
}

export default ConversationRail
