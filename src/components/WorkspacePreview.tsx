import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import markUrl from '../assets/lotusbuild-mark.png'
import './WorkspacePreview.css'

const EASE = [0.16, 1, 0.3, 1] as const

type StepState = 'done' | 'active' | 'todo'

type Project = {
  id: string
  chip: string
  prompt: string
  plan: { label: string; state: StepState }[]
  code: string[]
  render: () => ReactNode
}

const PROJECTS: Project[] = [
  {
    id: 'waitlist',
    chip: 'Waitlist page',
    prompt: 'Build a landing page with an email waitlist.',
    plan: [
      { label: 'Plan the pages and data model', state: 'done' },
      { label: 'Generate the hero and waitlist form', state: 'done' },
      { label: 'Preview and iterate', state: 'active' },
      { label: 'Publish to production', state: 'todo' },
    ],
    code: [
      "export function Waitlist() {",
      "  const [email, setEmail] = useState('')",
      '',
      '  return (',
      '    <form onSubmit={join}>',
      '      <h1>Join the waitlist</h1>',
      '      <input value={email} onChange={onChange} />',
      '      <button>Notify me</button>',
      '    </form>',
      '  )',
      '}',
    ],
    render: () => (
      <div className="mini">
        <span className="mini-eyebrow">Early access</span>
        <h3>Join the waitlist</h3>
        <p>Be the first to try it — we&rsquo;ll email you at launch.</p>
        <div className="mini-form">
          <span className="mini-input">you@company.com</span>
          <span className="mini-btn">Notify me</span>
        </div>
      </div>
    ),
  },
  {
    id: 'dashboard',
    chip: 'Analytics dashboard',
    prompt: 'Create a simple analytics dashboard with a chart.',
    plan: [
      { label: 'Plan the routes and data model', state: 'done' },
      { label: 'Build the metric tiles and chart', state: 'done' },
      { label: 'Preview and iterate', state: 'active' },
      { label: 'Publish to production', state: 'todo' },
    ],
    code: [
      'export function Dashboard({ metrics }) {',
      '  return (',
      '    <main className="grid">',
      '      {metrics.map((m) => (',
      '        <Stat key={m.id} label={m.label} value={m.value} />',
      '      ))}',
      '      <Chart series={weekly} />',
      '    </main>',
      '  )',
      '}',
    ],
    render: () => (
      <div className="mini mini-dash">
        <div className="mini-stats">
          <div className="mini-stat">
            <b>1,248</b>
            <span>Signups</span>
          </div>
          <div className="mini-stat">
            <b>72%</b>
            <span>Active</span>
          </div>
          <div className="mini-stat">
            <b>+18</b>
            <span>Today</span>
          </div>
        </div>
        <div className="mini-chart" aria-hidden="true">
          {[42, 58, 36, 72, 51, 84, 63].map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 'blog',
    chip: 'Minimal blog',
    prompt: 'Make a minimal blog with a list of posts.',
    plan: [
      { label: 'Plan the content model', state: 'done' },
      { label: 'Generate the post list and layout', state: 'done' },
      { label: 'Preview and iterate', state: 'active' },
      { label: 'Publish to production', state: 'todo' },
    ],
    code: [
      'export function Blog({ posts }) {',
      '  return (',
      '    <ul className="posts">',
      '      {posts.map((p) => (',
      '        <li key={p.slug}>',
      '          <a href={p.slug}>{p.title}</a>',
      '        </li>',
      '      ))}',
      '    </ul>',
      '  )',
      '}',
    ],
    render: () => (
      <div className="mini mini-blog">
        <h3>Field notes</h3>
        <ul>
          <li>
            <span>Shipping faster with LotusBuild</span>
            <em>Mar 4</em>
          </li>
          <li>
            <span>From prompt to production</span>
            <em>Feb 18</em>
          </li>
          <li>
            <span>Designing the workspace</span>
            <em>Feb 2</em>
          </li>
        </ul>
      </div>
    ),
  },
]

function Step({ state }: { state: StepState }) {
  if (state === 'done') {
    return (
      <svg className="wp-step" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="#111" />
        <path
          d="M4.6 8.2l2.1 2.1 4.7-4.7"
          fill="none"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (state === 'active') {
    return (
      <span className="wp-step wp-step-active" aria-hidden="true">
        <span className="wp-step-active-dot" />
      </span>
    )
  }
  return <span className="wp-step wp-step-todo" aria-hidden="true" />
}

function SendArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M7 11.5V3M7 3L3.4 6.6M7 3l3.6 3.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function WorkspacePreview() {
  const [active, setActive] = useState(0)
  const [typed, setTyped] = useState('')
  const [visibleLines, setVisibleLines] = useState(0)
  const [tab, setTab] = useState<'preview' | 'code'>('code')
  const [paused, setPaused] = useState(false)

  const timers = useRef<number[]>([])
  const project = PROJECTS[active]
  const promptDone = typed.length >= project.prompt.length
  const codeStreaming = visibleLines < project.code.length

  useEffect(() => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []

    setTyped('')
    setVisibleLines(0)
    setTab('code')

    const { prompt, code } = PROJECTS[active]

    for (let i = 1; i <= prompt.length; i += 1) {
      timers.current.push(
        window.setTimeout(() => setTyped(prompt.slice(0, i)), 38 * i),
      )
    }
    const afterPrompt = 38 * prompt.length + 450

    for (let i = 0; i < code.length; i += 1) {
      timers.current.push(
        window.setTimeout(() => setVisibleLines(i + 1), afterPrompt + i * 175),
      )
    }
    const afterCode = afterPrompt + code.length * 175 + 1600
    timers.current.push(window.setTimeout(() => setTab('preview'), afterCode))

    return () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    }
  }, [active])

  useEffect(() => {
    if (paused) return undefined
    const id = window.setTimeout(
      () => setActive((a) => (a + 1) % PROJECTS.length),
      10500,
    )
    return () => window.clearTimeout(id)
  }, [active, paused])

  function selectTab(next: 'preview' | 'code') {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setTab(next)
  }

  return (
    <motion.div
      className="wp"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
    >
      <div className="wp-bar">
        <div className="wp-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="wp-tab">{project.id}-app · workspace</div>
        <div className="wp-live">
          <span className="wp-live-dot" aria-hidden="true" />
          Live
        </div>
      </div>

      <div className="wp-body">
        <div className="wp-chat">
          <div className="wp-msg wp-msg-user">
            <span className="wp-ava" aria-hidden="true" />
            <p>
              {typed}
              {!promptDone && <span className="wp-caret" />}
            </p>
          </div>

          <div className="wp-msg wp-msg-bot">
            <span className="wp-mark" aria-hidden="true">
              <img src={markUrl} width="14" height="14" alt="" />
            </span>
            <div className="wp-bot-body">
              <p className="wp-plan-title">Here&rsquo;s the plan</p>
              <ul className="wp-plan">
                {project.plan.map((step, i) => (
                  <motion.li
                    key={`${project.id}-${step.label}`}
                    className={`wp-plan-item is-${step.state}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 * i, ease: EASE }}
                  >
                    <Step state={step.state} />
                    <span>{step.label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <div className="wp-suggest">
            {PROJECTS.map((p, i) => (
              <button
                key={p.id}
                type="button"
                className={`wp-chip ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                {p.chip}
              </button>
            ))}
          </div>

          <div className="wp-input">
            <span>Describe a change&hellip;</span>
            <button type="button" aria-label="Send message">
              <SendArrow />
            </button>
          </div>
        </div>

        <div className="wp-preview">
          <div className="wp-preview-bar">
            <div className="wp-seg">
              <button
                type="button"
                className={tab === 'preview' ? 'is-active' : ''}
                onClick={() => selectTab('preview')}
              >
                Preview
              </button>
              <button
                type="button"
                className={tab === 'code' ? 'is-active' : ''}
                onClick={() => selectTab('code')}
              >
                Code
              </button>
            </div>
            <span className="wp-url">localhost:5173</span>
          </div>

          <div className="wp-pane">
            <AnimatePresence mode="wait">
              {tab === 'code' ? (
                <motion.div
                  key="code"
                  className="wp-code"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {project.code.slice(0, visibleLines).map((line, i) => (
                    <div className="wp-code-line" key={i}>
                      <span className="wp-ln">{i + 1}</span>
                      <code>{line === '' ? '\u00a0' : line}</code>
                      {i === visibleLines - 1 && codeStreaming && (
                        <span className="wp-caret" />
                      )}
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={`preview-${project.id}`}
                  className="wp-canvas"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {project.render()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkspacePreview
