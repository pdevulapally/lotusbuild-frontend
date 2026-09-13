import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import './WorkspacePreview.css'

const EASE = [0.16, 1, 0.3, 1] as const

function WorkspacePreview() {
  const [step2Complete, setStep2Complete] = useState(false)
  const [codeLines, setCodeLines] = useState(0)

  useEffect(() => {
    const step2Timer = window.setTimeout(() => setStep2Complete(true), 2400)
    
    const lineTimers: number[] = []
    for (let i = 1; i <= 12; i += 1) {
      lineTimers.push(
        window.setTimeout(() => setCodeLines(i), 800 + i * 85),
      )
    }

    return () => {
      window.clearTimeout(step2Timer)
      lineTimers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  const code = [
    "import { stripe } from '@/lib/stripe'",
    "import { db } from '@/lib/db'",
    '',
    'export async function POST(req: Request) {',
    '  const { email, plan } = await req.json()',
    '',
    '  const customer = await stripe.customers.create({',
    '    email,',
    '  })',
    '',
    '  await db.user.create({',
    '    data: { email, stripeId: customer.id },',
  ]

  return (
    <motion.div
      className="ws"
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 1.1, ease: EASE }}
    >
      <div className="ws-bar">
        <div className="ws-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="ws-title">task-queue · LotusBuild</span>
      </div>

      <div className="ws-body">
        <aside className="ws-sidebar">
          <div className="ws-section">
            <h3 className="ws-section-title">Plan</h3>
            <ul className="ws-steps">
              <li className="ws-step is-done">
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <circle cx="7" cy="7" r="7" fill="#111" />
                  <path
                    d="M3.8 7.2l1.9 1.9 4.5-4.5"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Design data model</span>
              </li>
              <motion.li
                className={`ws-step ${step2Complete ? 'is-done' : 'is-active'}`}
                animate={step2Complete ? { opacity: 1 } : {}}
                transition={{ duration: 0.3 }}
              >
                {step2Complete ? (
                  <svg viewBox="0 0 14 14" aria-hidden="true">
                    <circle cx="7" cy="7" r="7" fill="#111" />
                    <path
                      d="M3.8 7.2l1.9 1.9 4.5-4.5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="ws-step-ring" aria-hidden="true">
                    <span className="ws-step-dot" />
                  </span>
                )}
                <span>Build payment endpoint</span>
              </motion.li>
              <li className="ws-step is-todo">
                <span className="ws-step-ring ws-step-empty" aria-hidden="true" />
                <span>Add webhook handlers</span>
              </li>
              <li className="ws-step is-todo">
                <span className="ws-step-ring ws-step-empty" aria-hidden="true" />
                <span>Test checkout flow</span>
              </li>
            </ul>
          </div>

          <div className="ws-section">
            <h3 className="ws-section-title">Sessions</h3>
            <div className="ws-sessions">
              <button type="button" className="ws-session is-active">
                <span className="ws-session-icon" />
                <span className="ws-session-label">
                  <strong>Payments API</strong>
                  <em>12 messages</em>
                </span>
              </button>
              <button type="button" className="ws-session">
                <span className="ws-session-icon" />
                <span className="ws-session-label">
                  <strong>Landing redesign</strong>
                  <em>8 messages</em>
                </span>
              </button>
            </div>
          </div>
        </aside>

        <main className="ws-main">
          <div className="ws-editor-bar">
            <span className="ws-file">src/app/api/checkout/route.ts</span>
            <span className="ws-status">Modified</span>
          </div>
          <div className="ws-editor">
            {code.slice(0, codeLines).map((line, i) => (
              <div className="ws-line" key={i}>
                <span className="ws-ln">{i + 1}</span>
                <code>{line === '' ? '\u00a0' : line}</code>
              </div>
            ))}
          </div>
        </main>
      </div>
    </motion.div>
  )
}

export default WorkspacePreview
