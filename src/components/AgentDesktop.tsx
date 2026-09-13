import './AgentDesktop.css'

const FLOW = [
  {
    n: '01',
    title: 'Session',
    body: 'Start an agent on a job. Come back to the same thread.',
  },
  {
    n: '02',
    title: 'Desktop',
    body: 'Files, preview, and the agent sit in one surface — the desktop you work in.',
  },
  {
    n: '03',
    title: 'Run',
    body: 'A recorded stretch of work. See what the agent did, in the session.',
  },
  {
    n: '04',
    title: 'Review',
    body: 'Steer, take over, or ship without leaving the desktop.',
  },
]

function DesktopFrame() {
  return (
    <div className="desk-frame" aria-hidden="true">
      <div className="desk-bar">
        <div className="desk-dots">
          <span />
          <span />
          <span />
        </div>
        <div className="desk-tab">waitlist-app · agent desktop</div>
        <div className="desk-live">
          <span />
          Running
        </div>
      </div>

      <div className="desk-body">
        <aside className="desk-rail">
          <div className="desk-meta">
            <span>Session</span>
            <strong>waitlist-app</strong>
          </div>
          <div className="desk-meta">
            <span>Run</span>
            <strong>184 · writing files</strong>
          </div>
          <div className="desk-meta">
            <span>Org</span>
            <strong>lotusbuild</strong>
          </div>
          <div className="desk-agent">
            <span className="desk-agent-dot" />
            Agent in session
          </div>
        </aside>

        <div className="desk-main">
          <div className="desk-pane">
            <div className="desk-pane-label">Files</div>
            <ul>
              <li className="is-on">src/Waitlist.tsx</li>
              <li>src/App.tsx</li>
              <li>package.json</li>
            </ul>
          </div>
          <div className="desk-pane desk-pane-preview">
            <div className="desk-pane-label">Preview</div>
            <div className="desk-app">
              <em>Early access</em>
              <b>Join the waitlist</b>
              <span className="desk-app-row" />
              <span className="desk-app-btn" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AgentDesktop() {
  return (
    <section className="desk" id="desktop">
      <div className="desk-inner">
        <header className="desk-head">
          <span className="desk-kicker">The desktop</span>
          <h2 className="desk-title">One desktop. All your agents.</h2>
          <p className="desk-lede">
            LotusBuild is the surface you work in. Start a session, watch the
            run, review what changed — without leaving the desktop.
          </p>
        </header>

        <DesktopFrame />

        <ol className="desk-flow">
          {FLOW.map((step) => (
            <li key={step.n}>
              <span>{step.n}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default AgentDesktop
