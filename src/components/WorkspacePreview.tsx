import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import './WorkspacePreview.css'

const EASE = [0.16, 1, 0.3, 1] as const

function WorkspacePreview() {
  const [step3Done, setStep3Done] = useState(false)
  const [codeLines, setCodeLines] = useState(0)
  const [terminalLines, setTerminalLines] = useState(0)

  useEffect(() => {
    const step3Timer = window.setTimeout(() => setStep3Done(true), 2200)
    
    const codeTimers: number[] = []
    for (let i = 1; i <= 16; i += 1) {
      codeTimers.push(
        window.setTimeout(() => setCodeLines(i), 600 + i * 75),
      )
    }

    const termTimers: number[] = []
    for (let i = 1; i <= 4; i += 1) {
      termTimers.push(
        window.setTimeout(() => setTerminalLines(i), 1800 + i * 120),
      )
    }

    return () => {
      window.clearTimeout(step3Timer)
      codeTimers.forEach((t) => window.clearTimeout(t))
      termTimers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  return (
    <motion.div
      className="ws"
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 1.15, ease: EASE }}
    >
      <div className="ws-chrome">
        <div className="ws-dots" aria-hidden="true">
          <span className="ws-dot-red" />
          <span className="ws-dot-yellow" />
          <span className="ws-dot-green" />
        </div>
        <span className="ws-title">payments-api</span>
      </div>

      <div className="ws-body">
        <aside className="ws-left">
          <div className="ws-section">
            <h3 className="ws-section-label">In Progress</h3>
            <ul className="ws-tasks">
              <li className="ws-task is-done">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="ws-check">
                  <circle cx="8" cy="8" r="8" fill="#10b981" />
                  <path
                    d="M4.8 8.2l2 2 4.4-4.4"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="ws-task-content">
                  <span className="ws-task-title">Set up Stripe integration</span>
                  <span className="ws-task-meta">2 files changed</span>
                </div>
              </li>
              <li className="ws-task is-done">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="ws-check">
                  <circle cx="8" cy="8" r="8" fill="#10b981" />
                  <path
                    d="M4.8 8.2l2 2 4.4-4.4"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="ws-task-content">
                  <span className="ws-task-title">Create checkout endpoint</span>
                  <span className="ws-task-meta">1 file changed</span>
                </div>
              </li>
              <motion.li
                className={`ws-task ${step3Done ? 'is-done' : 'is-active'}`}
                animate={step3Done ? { opacity: 1 } : {}}
                transition={{ duration: 0.4 }}
              >
                {step3Done ? (
                  <svg viewBox="0 0 16 16" aria-hidden="true" className="ws-check">
                    <circle cx="8" cy="8" r="8" fill="#10b981" />
                    <path
                      d="M4.8 8.2l2 2 4.4-4.4"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <span className="ws-spinner" aria-hidden="true">
                    <span className="ws-spinner-dot" />
                  </span>
                )}
                <div className="ws-task-content">
                  <span className="ws-task-title">Test payment flow</span>
                  <span className="ws-task-meta">Running tests...</span>
                </div>
              </motion.li>
            </ul>
          </div>

          <div className="ws-section">
            <h3 className="ws-section-label">Ready for Review</h3>
            <ul className="ws-tasks">
              <li className="ws-task is-ready">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="ws-icon">
                  <circle cx="8" cy="8" r="7" fill="none" stroke="#6b7280" strokeWidth="1.5" />
                </svg>
                <div className="ws-task-content">
                  <span className="ws-task-title">Add error handling</span>
                  <span className="ws-task-meta">Waiting</span>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <section className="ws-center">
          <div className="ws-chat">
            <div className="ws-msg">
              <div className="ws-msg-header">
                <strong>Current Task</strong>
                <span className="ws-status-badge">Building</span>
              </div>
              <p className="ws-msg-text">
                Implement Stripe payment integration for subscription checkout
              </p>
            </div>

            <div className="ws-changes">
              <h4 className="ws-changes-title">Files Modified</h4>
              <ul className="ws-files">
                <li className="ws-file-item">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>route.ts</span>
                  <span className="ws-diff">+42 -8</span>
                </li>
                <li className="ws-file-item">
                  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6l-4-4z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9 2v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <span>stripe.ts</span>
                  <span className="ws-diff">+18 -0</span>
                </li>
              </ul>
            </div>

            <div className="ws-status-msg">
              <span className="ws-status-icon" />
              Done. Payment endpoint created and tested.
            </div>
          </div>
        </section>

        <section className="ws-right">
          <div className="ws-pane">
            <div className="ws-pane-header">
              <span className="ws-pane-label">src/app/api/checkout/route.ts</span>
              <span className="ws-pane-status">Modified</span>
            </div>
            <div className="ws-code">
              {codeLines >= 1 && (
                <div className="ws-code-line">
                  <span className="ws-ln">1</span>
                  <code><span className="t-keyword">import</span> <span className="t-punctuation">{'{'}</span> stripe <span className="t-punctuation">{'}'}</span> <span className="t-keyword">from</span> <span className="t-string">'@/lib/stripe'</span></code>
                </div>
              )}
              {codeLines >= 2 && (
                <div className="ws-code-line">
                  <span className="ws-ln">2</span>
                  <code><span className="t-keyword">import</span> <span className="t-punctuation">{'{'}</span> db <span className="t-punctuation">{'}'}</span> <span className="t-keyword">from</span> <span className="t-string">'@/lib/db'</span></code>
                </div>
              )}
              {codeLines >= 3 && (
                <div className="ws-code-line">
                  <span className="ws-ln">3</span>
                  <code>&nbsp;</code>
                </div>
              )}
              {codeLines >= 4 && (
                <div className="ws-code-line">
                  <span className="ws-ln">4</span>
                  <code><span className="t-keyword">export</span> <span className="t-keyword">async</span> <span className="t-keyword">function</span> <span className="t-function">POST</span><span className="t-punctuation">(</span>req<span className="t-punctuation">:</span> Request<span className="t-punctuation">)</span> <span className="t-punctuation">{'{'}</span></code>
                </div>
              )}
              {codeLines >= 5 && (
                <div className="ws-code-line">
                  <span className="ws-ln">5</span>
                  <code>  <span className="t-keyword">const</span> <span className="t-punctuation">{'{'}</span> email<span className="t-punctuation">,</span> plan <span className="t-punctuation">{'}'}</span> <span className="t-operator">=</span> <span className="t-keyword">await</span> req<span className="t-punctuation">.</span><span className="t-function">json</span><span className="t-punctuation">()</span></code>
                </div>
              )}
              {codeLines >= 6 && (
                <div className="ws-code-line">
                  <span className="ws-ln">6</span>
                  <code>&nbsp;</code>
                </div>
              )}
              {codeLines >= 7 && (
                <div className="ws-code-line">
                  <span className="ws-ln">7</span>
                  <code>  <span className="t-keyword">const</span> customer <span className="t-operator">=</span> <span className="t-keyword">await</span> stripe<span className="t-punctuation">.</span>customers<span className="t-punctuation">.</span><span className="t-function">create</span><span className="t-punctuation">({'{'}</span></code>
                </div>
              )}
              {codeLines >= 8 && (
                <div className="ws-code-line">
                  <span className="ws-ln">8</span>
                  <code>    email<span className="t-punctuation">,</span></code>
                </div>
              )}
              {codeLines >= 9 && (
                <div className="ws-code-line">
                  <span className="ws-ln">9</span>
                  <code>  <span className="t-punctuation">{'})'}</span></code>
                </div>
              )}
              {codeLines >= 10 && (
                <div className="ws-code-line">
                  <span className="ws-ln">10</span>
                  <code>&nbsp;</code>
                </div>
              )}
              {codeLines >= 11 && (
                <div className="ws-code-line">
                  <span className="ws-ln">11</span>
                  <code>  <span className="t-keyword">const</span> session <span className="t-operator">=</span> <span className="t-keyword">await</span> stripe<span className="t-punctuation">.</span>checkout<span className="t-punctuation">.</span>sessions<span className="t-punctuation">.</span><span className="t-function">create</span><span className="t-punctuation">({'{'}</span></code>
                </div>
              )}
              {codeLines >= 12 && (
                <div className="ws-code-line">
                  <span className="ws-ln">12</span>
                  <code>    customer<span className="t-punctuation">:</span> customer<span className="t-punctuation">.</span>id<span className="t-punctuation">,</span></code>
                </div>
              )}
              {codeLines >= 13 && (
                <div className="ws-code-line">
                  <span className="ws-ln">13</span>
                  <code>    mode<span className="t-punctuation">:</span> <span className="t-string">'subscription'</span><span className="t-punctuation">,</span></code>
                </div>
              )}
              {codeLines >= 14 && (
                <div className="ws-code-line">
                  <span className="ws-ln">14</span>
                  <code>    line_items<span className="t-punctuation">:</span> <span className="t-punctuation">[{'{'}</span> price<span className="t-punctuation">:</span> plan <span className="t-punctuation">{'}'}</span>]<span className="t-punctuation">,</span></code>
                </div>
              )}
              {codeLines >= 15 && (
                <div className="ws-code-line">
                  <span className="ws-ln">15</span>
                  <code>  <span className="t-punctuation">{'})'}</span></code>
                </div>
              )}
              {codeLines >= 16 && (
                <div className="ws-code-line">
                  <span className="ws-ln">16</span>
                  <code><span className="t-punctuation">{'}'}</span></code>
                </div>
              )}
            </div>
          </div>

          <div className="ws-terminal">
            <div className="ws-terminal-header">
              <span>Terminal</span>
            </div>
            <div className="ws-terminal-body">
              {terminalLines >= 1 && <div className="ws-term-line">$ npm test</div>}
              {terminalLines >= 2 && <div className="ws-term-line ws-term-dim">Running tests...</div>}
              {terminalLines >= 3 && <div className="ws-term-line ws-term-success">✓ Payment endpoint tests passed</div>}
              {terminalLines >= 4 && <div className="ws-term-line ws-term-dim">3 passed, 0 failed</div>}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

export default WorkspacePreview
