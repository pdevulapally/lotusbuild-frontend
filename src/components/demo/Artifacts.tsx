import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { Artifact, InspectorTarget } from '../../content/demo.ts'

const EASE = [0.16, 1, 0.3, 1] as const

/** Counts up to `total`, one step every `stepMs` after `startMs`. Returns `total` at once when `instant`. */
function useCountUp(total: number, startMs: number, stepMs: number, instant: boolean) {
  const [count, setCount] = useState(instant ? total : 0)

  useEffect(() => {
    if (instant) return
    const timers: number[] = []
    for (let i = 1; i <= total; i++) {
      timers.push(window.setTimeout(() => setCount(i), startMs + (i - 1) * stepMs))
    }
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [total, startMs, stepMs, instant])

  return instant ? total : count
}

type Progress = 'pending' | 'active' | 'done'

function PlanArtifact({
  artifact,
  progress,
}: {
  artifact: Extract<Artifact, { kind: 'plan' }>
  progress: Progress
}) {
  const shown = useCountUp(artifact.tasks.length, 900, 350, progress !== 'active')
  return (
    <div className="demo-doc">
      <div className="demo-doc-crumb">Plan</div>
      <h3>{artifact.title}</h3>
      {artifact.sections.map((section) => (
        <section key={section.heading}>
          <h4>{section.heading}</h4>
          <p>{section.body}</p>
        </section>
      ))}
      <h4>{artifact.tasks.length} tasks</h4>
      <ul className="demo-doc-tasks">
        {artifact.tasks.map((task, i) => (
          <li
            key={task}
            className={
              i >= shown ? 'is-hidden' : progress === 'done' ? 'is-done' : undefined
            }
          >
            <span className="demo-check" aria-hidden="true" />
            {task}
          </li>
        ))}
      </ul>
    </div>
  )
}

function BuildArtifact({
  artifact,
  progress,
}: {
  artifact: Extract<Artifact, { kind: 'build' }>
  progress: Progress
}) {
  const instant = progress !== 'active'
  const lines = useCountUp(artifact.lines.length, 400, 160, instant)
  const logStart = 400 + artifact.lines.length * 160 + 500
  const log = useCountUp(artifact.log.length, logStart, 480, instant)

  return (
    <div className="demo-build">
      <ul className="demo-build-files">
        {artifact.files.map((file) => (
          <li
            key={file.path}
            className={file.path === artifact.activeFile ? 'is-active' : undefined}
          >
            <span className="demo-file-path">{file.path}</span>
            <span className="demo-stat-add">+{file.added}</span>
          </li>
        ))}
      </ul>
      <pre className="demo-diff">
        {artifact.lines.slice(0, lines).map((line, i) => (
          <span key={i} className={`demo-diff-line is-${line.kind}`}>
            <span className="demo-diff-gutter">
              {line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ''}
            </span>
            {line.text || ' '}
          </span>
        ))}
        {lines < artifact.lines.length && <span className="demo-caret" />}
      </pre>
      <div className="demo-log">
        <div className="demo-log-line">
          <span className="demo-log-prompt">$</span>
          {artifact.command}
        </div>
        {artifact.log.slice(0, log).map((line) => (
          <div key={line.text} className={`demo-log-line tone-${line.tone}`}>
            {line.text}
          </div>
        ))}
        {log < artifact.log.length && <span className="demo-caret" />}
      </div>
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

function PreviewArtifact({
  artifact,
  progress,
}: {
  artifact: Extract<Artifact, { kind: 'preview' }>
  progress: Progress
}) {
  const { page, inspector } = artifact
  const ready = progress === 'done'
  const [index, setIndex] = useState(-1)

  useEffect(() => {
    if (!ready) return
    const first = window.setTimeout(() => setIndex(0), 1400)
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % inspector.length),
      2600,
    )
    return () => {
      window.clearTimeout(first)
      window.clearInterval(id)
    }
  }, [ready, inspector.length])

  const active = ready && index >= 0 ? inspector[index] : null

  return (
    <div className="demo-browser">
      <div className="demo-browser-bar">
        <span className="demo-browser-nav">‹</span>
        <span className="demo-browser-nav">›</span>
        <span className="demo-browser-nav">↻</span>
        <div className="demo-browser-url">{artifact.url}</div>
      </div>
      <div className="demo-browser-body">
        {!ready ? (
          <div className="demo-starting">
            <span className="demo-spinner" aria-hidden="true" />
            <span>{artifact.startingStatus}</span>
          </div>
        ) : (
          <motion.div
            className="demo-site"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
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
                <Inspectable key={card.title} id="card" active={i === 0 ? active : null}>
                  <article className="demo-site-card">
                    <div className="demo-site-card-art" />
                    <strong>{card.title}</strong>
                    <span>{card.meta}</span>
                  </article>
                </Inspectable>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function PublishArtifact({ artifact }: { artifact: Extract<Artifact, { kind: 'publish' }> }) {
  return (
    <div className="demo-publish">
      <h3>{artifact.title}</h3>
      <p>{artifact.body}</p>
      <span className="demo-publish-btn" aria-disabled="true">
        {artifact.action}
      </span>
    </div>
  )
}

type Props = {
  artifact: Artifact
  artifactKey: string
  progress: Progress
}

function ArtifactView({ artifact, artifactKey, progress }: Props) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={artifactKey}
        className="demo-artifact"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: EASE }}
      >
        {artifact.kind === 'plan' && <PlanArtifact artifact={artifact} progress={progress} />}
        {artifact.kind === 'build' && <BuildArtifact artifact={artifact} progress={progress} />}
        {artifact.kind === 'preview' && (
          <PreviewArtifact artifact={artifact} progress={progress} />
        )}
        {artifact.kind === 'publish' && <PublishArtifact artifact={artifact} />}
      </motion.div>
    </AnimatePresence>
  )
}

export type { Progress }
export default ArtifactView
