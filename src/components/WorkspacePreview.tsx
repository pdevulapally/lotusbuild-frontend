import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import markUrl from '../assets/lotusbuild-mark.png'
import './WorkspacePreview.css'

const EASE = [0.16, 1, 0.3, 1] as const

type SessionStatus = 'running' | 'review' | 'idle'

type Session = {
  id: string
  name: string
  status: SessionStatus
  run: string
  file: string
  code: string[]
  changed: number
  note: string
}

const SESSIONS: Session[] = [
  {
    id: 'billing',
    name: 'billing-api',
    status: 'running',
    run: '184',
    file: 'src/invoice.ts',
    changed: 1,
    note: 'Updating settle() to skip voided invoices.',
    code: [
      'export function settle(invoice: Invoice) {',
      '  if (invoice.status === "void") {',
      '    return invoice',
      '  }',
      '',
      '  return applyBalance(invoice)',
      '}',
    ],
  },
  {
    id: 'auth',
    name: 'auth-fix',
    status: 'review',
    run: '179',
    file: 'src/session.ts',
    changed: 2,
    note: 'Session token refresh now fails closed.',
    code: [
      'export async function refresh(token: Token) {',
      '  const next = await issue(token)',
      '  if (!next) {',
      '    throw new AuthError("expired")',
      '  }',
      '',
      '  return next',
      '}',
    ],
  },
  {
    id: 'onboarding',
    name: 'onboarding',
    status: 'idle',
    run: '166',
    file: 'src/org.ts',
    changed: 3,
    note: 'Org invite accepts only members of the same org.',
    code: [
      'export function canInvite(actor: Member, org: Org) {',
      '  return actor.orgId === org.id',
      '}',
    ],
  },
]

const STATUS_LABEL: Record<SessionStatus, string> = {
  running: 'Running',
  review: 'Review',
  idle: 'Idle',
}

function WorkspacePreview() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const session = SESSIONS[active]

  useEffect(() => {
    if (paused) return undefined
    const id = window.setTimeout(
      () => setActive((i) => (i + 1) % SESSIONS.length),
      7000,
    )
    return () => window.clearTimeout(id)
  }, [active, paused])

  return (
    <motion.div
      className="wp"
      id="desktop-demo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      initial={{ y: 28, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 1.1, ease: EASE }}
    >
      <div className="wp-bar">
        <div className="wp-brand">
          <img src={markUrl} width="14" height="14" alt="" />
          <span>LotusBuild</span>
        </div>
        <span className="wp-org">org / acme</span>
      </div>

      <div className="wp-body">
        <aside className="wp-sessions">
          <p className="wp-col-label">Sessions</p>
          <ul>
            {SESSIONS.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={i === active ? 'is-active' : ''}
                  onClick={() => setActive(i)}
                >
                  <span className={`wp-st is-${item.status}`} />
                  <span className="wp-s-name">{item.name}</span>
                  <span className="wp-s-meta">{STATUS_LABEL[item.status]}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="wp-main">
          <div className="wp-filebar">
            <span className="wp-file">{session.file}</span>
            <span className="wp-run">
              Run {session.run}
              {session.status === 'running' ? ' · writing' : ''}
            </span>
          </div>

          <div className="wp-code" key={session.id}>
            {session.code.map((line, i) => (
              <div
                className={`wp-code-line${i === session.changed ? ' is-changed' : ''}`}
                key={`${session.id}-${i}`}
              >
                <span className="wp-ln">{i + 1}</span>
                <code>{line === '' ? '\u00a0' : line}</code>
              </div>
            ))}
          </div>

          <div className="wp-agent">
            <span className={`wp-st is-${session.status}`} />
            <p>{session.note}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WorkspacePreview
