import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { InspectorTarget, Pane, PreviewPage } from '../../content/demo.ts'

const EASE = [0.16, 1, 0.3, 1] as const

function BrowserChrome({ url, children }: { url: string; children: ReactNode }) {
  return (
    <div className="demo-browser">
      <div className="demo-browser-bar">
        <span className="demo-browser-nav">‹</span>
        <span className="demo-browser-nav">›</span>
        <span className="demo-browser-nav">↻</span>
        <div className="demo-browser-url">{url}</div>
      </div>
      <div className="demo-browser-body">{children}</div>
    </div>
  )
}

function Inspectable({
  id,
  active,
  className,
  children,
}: {
  id: InspectorTarget['target']
  active: InspectorTarget | null
  className?: string
  children: ReactNode
}) {
  const isActive = active?.target === id
  return (
    <div className={`demo-inspect${isActive ? ' is-active' : ''} ${className ?? ''}`}>
      {isActive && <span className="demo-inspect-label">{active.label}</span>}
      {children}
    </div>
  )
}

function PreviewPane({
  url,
  page,
  inspector,
}: {
  url: string
  page: PreviewPage
  inspector: InspectorTarget[]
}) {
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    const first = window.setTimeout(() => setIndex(0), 1400)
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % inspector.length),
      2600,
    )
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [inspector.length])

  const active = index >= 0 ? inspector[index] : null

  return (
    <BrowserChrome url={url}>
      <div className="demo-site">
        <header className="demo-site-nav">
          <Inspectable id="brand" active={active}>
            <span className="demo-site-brand">{page.brand}</span>
          </Inspectable>
          <nav>
            {page.nav.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </nav>
        </header>
        <div className="demo-site-hero">
          <Inspectable id="headline" active={active}>
            <h2>{page.headline}</h2>
          </Inspectable>
          <p>{page.sub}</p>
          <Inspectable id="cta" active={active} className="demo-site-cta-wrap">
            <span className="demo-site-cta">{page.cta}</span>
          </Inspectable>
        </div>
        <div className="demo-site-cards">
          {page.cards.map((card, i) => (
            <Inspectable
              key={card.title}
              id="card"
              active={i === 0 ? active : null}
            >
              <article className="demo-site-card">
                <div className="demo-site-card-art" />
                <strong>{card.title}</strong>
                <span>{card.meta}</span>
              </article>
            </Inspectable>
          ))}
        </div>
      </div>
    </BrowserChrome>
  )
}

function BuildingPane({ url, status }: { url: string; status: string }) {
  return (
    <BrowserChrome url={url}>
      <div className="demo-building">
        <span className="demo-spinner" aria-hidden="true" />
        <span>{status}</span>
      </div>
    </BrowserChrome>
  )
}

function DiffPane({ files, lines }: Extract<Pane, { kind: 'diff' }>) {
  return (
    <div className="demo-editor">
      <div className="demo-tabs">
        {files.map((file, i) => (
          <span key={file} className={i === 0 ? 'is-active' : undefined}>
            {file}
          </span>
        ))}
      </div>
      <pre className="demo-diff">
        {lines.map((line, i) => (
          <span key={i} className={`demo-diff-line is-${line.kind}`}>
            <span className="demo-diff-gutter">
              {line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ''}
            </span>
            {line.text || ' '}
          </span>
        ))}
      </pre>
    </div>
  )
}

function PlanPane({ title, sections, tasks }: Extract<Pane, { kind: 'plan' }>) {
  return (
    <div className="demo-editor">
      <div className="demo-tabs">
        <span className="is-active">plan.md</span>
      </div>
      <div className="demo-plan">
        <div className="demo-plan-crumb">Plans › {title}</div>
        <h3>{title}</h3>
        {sections.map((section) => (
          <section key={section.heading}>
            <h4>{section.heading}</h4>
            <p>{section.body}</p>
          </section>
        ))}
        <h4>{tasks.length} tasks</h4>
        <ul className="demo-plan-tasks">
          {tasks.map((task) => (
            <li key={task.text} className={task.done ? 'is-done' : undefined}>
              <span className="demo-check" aria-hidden="true" />
              {task.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PaneView({ pane, paneKey }: { pane: Pane; paneKey: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={paneKey}
        className="demo-pane"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {pane.kind === 'preview' && <PreviewPane {...pane} />}
        {pane.kind === 'building' && <BuildingPane {...pane} />}
        {pane.kind === 'diff' && <DiffPane {...pane} />}
        {pane.kind === 'plan' && <PlanPane {...pane} />}
      </motion.div>
    </AnimatePresence>
  )
}

export default PaneView
