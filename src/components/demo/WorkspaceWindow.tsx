import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react'
import { motion } from 'motion/react'
import {
  workspace,
  type DemoTask,
  type Message,
  type Step,
} from '../../content/demo.ts'
import PaneView from './Panes.tsx'

const EASE = [0.16, 1, 0.3, 1] as const

export type SidebarTask = DemoTask & { active?: boolean }

type Props = {
  tasks: SidebarTask[]
  selectedId: string
  onSelect: (id: string) => void
  extraMessages: Message[]
  onSend: (text: string) => void
}

function StepIcon({ kind }: { kind: Step['kind'] }) {
  const glyph = { read: '▤', thought: '◌', search: '⌕', ran: '›' }[kind]
  return (
    <span className="demo-step-icon" aria-hidden="true">
      {glyph}
    </span>
  )
}

function StepLabel({ kind }: { kind: Step['kind'] }) {
  return (
    <span className="demo-step-kind">
      {{ read: 'Read', thought: '', search: 'Searched', ran: '' }[kind]}
    </span>
  )
}

function MessageView({ message }: { message: Message }) {
  switch (message.role) {
    case 'user':
      return <div className="demo-msg-user">{message.text}</div>
    case 'assistant':
      return <p className="demo-msg-assistant">{message.text}</p>
    case 'steps':
      return (
        <ul className="demo-steps">
          {message.steps.map((step) => (
            <li key={step.text}>
              <StepIcon kind={step.kind} />
              <StepLabel kind={step.kind} />
              <span className="demo-step-text">{step.text}</span>
            </li>
          ))}
        </ul>
      )
    case 'files':
      return (
        <ul className="demo-files">
          {message.files.map((file) => (
            <li key={file.path}>
              <span className="demo-file-icon" aria-hidden="true">
                ▢
              </span>
              <span className="demo-file-path">{file.path}</span>
              <span className="demo-stat-add">+{file.added}</span>
              <span className="demo-stat-del">−{file.removed}</span>
            </li>
          ))}
        </ul>
      )
  }
}

function TaskRow({
  task,
  selected,
  onSelect,
}: {
  task: SidebarTask
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      layout
      type="button"
      tabIndex={-1}
      className={`demo-task${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <span
        className={task.active ? 'demo-task-icon demo-spinner' : 'demo-task-icon demo-task-done'}
        aria-hidden="true"
      />
      <span className="demo-task-main">
        <span className="demo-task-head">
          <span className="demo-task-title">{task.title}</span>
          <span className="demo-task-age">{task.age}</span>
        </span>
        <span className="demo-task-sub">
          {task.stats && !task.active && (
            <>
              <span className="demo-stat-add">+{task.stats.added}</span>
              <span className="demo-stat-del">−{task.stats.removed}</span>
              <span className="demo-task-dot">·</span>
            </>
          )}
          <span className="demo-task-summary">{task.summary}</span>
        </span>
      </span>
    </motion.button>
  )
}

function WorkspaceWindow({
  tasks,
  selectedId,
  onSelect,
  extraMessages,
  onSend,
}: Props) {
  const [draft, setDraft] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0]
  const active = tasks.filter((task) => task.active)
  const done = tasks.filter((task) => !task.active)
  const messages = [...selected.messages, ...extraMessages]

  useEffect(() => {
    const el = transcriptRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, selectedId])

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
    <div className="demo-workspace">
      <aside className="demo-sidebar">
        {active.length > 0 && (
          <div className="demo-group">
            <div className="demo-group-title">
              {workspace.groups.active} <span>{active.length}</span>
            </div>
            {active.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                selected={task.id === selected.id}
                onSelect={() => onSelect(task.id)}
              />
            ))}
          </div>
        )}
        <div className="demo-group">
          <div className="demo-group-title">
            {workspace.groups.done} <span>{done.length}</span>
          </div>
          {done.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              selected={task.id === selected.id}
              onSelect={() => onSelect(task.id)}
            />
          ))}
        </div>
      </aside>

      <section className="demo-chat">
        <div className="demo-chat-title">{selected.title}</div>
        <div className="demo-transcript" ref={transcriptRef}>
          {messages.map((message, i) => (
            <MessageView key={`${selected.id}-${i}`} message={message} />
          ))}
        </div>
        <form className="demo-composer" onSubmit={submit}>
          <textarea
            name="message"
            rows={1}
            spellCheck={false}
            placeholder={workspace.composer.placeholder}
            aria-label={workspace.composer.placeholder}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <div className="demo-composer-row">
            <span className="demo-chip">{workspace.composer.mode} ▾</span>
            <span className="demo-chip demo-chip-plain">
              {workspace.composer.context} ▾
            </span>
            <button
              type="submit"
              className="demo-send"
              aria-label="Send"
              tabIndex={-1}
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </div>
        </form>
      </section>

      <section className="demo-main">
        <PaneView pane={selected.pane} paneKey={`${selected.id}-${selected.pane.kind}`} />
      </section>
    </div>
  )
}

export default WorkspaceWindow
