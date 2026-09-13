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
  working: boolean
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

function Conversation({ messages, working, onSend }: Props) {
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages.length, working])

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
      <div className="demo-chat-label">{session.railLabel}</div>
      <div className="demo-chat-scroll" ref={scrollRef}>
        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Entry message={message} />
          </motion.div>
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
