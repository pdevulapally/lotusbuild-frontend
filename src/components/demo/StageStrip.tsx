import type { Stage } from '../../content/demo.ts'
import type { Progress } from './Artifacts.tsx'

type Props = {
  stages: Stage[]
  viewIndex: number
  progressOf: (index: number) => Progress
  onSelect: (index: number) => void
}

function StageStrip({ stages, viewIndex, progressOf, onSelect }: Props) {
  return (
    <ol className="demo-strip">
      {stages.map((stage, i) => {
        const progress = progressOf(i)
        const sub =
          progress === 'active'
            ? stage.working
            : progress === 'done'
              ? stage.done
              : stage.pending
        return (
          <li
            key={stage.id}
            className={`demo-stage is-${progress}${i === viewIndex ? ' is-viewed' : ''}`}
          >
            <button
              type="button"
              className="demo-stage-btn"
              aria-current={i === viewIndex ? 'step' : undefined}
              onClick={() => onSelect(i)}
            >
              <span className="demo-stage-mark" aria-hidden="true">
                {progress === 'active' ? (
                  <span className="demo-spinner" />
                ) : progress === 'done' ? (
                  <span className="demo-stage-check" />
                ) : (
                  i + 1
                )}
              </span>
              <span className="demo-stage-text">
                <span className="demo-stage-label">{stage.label}</span>
                <span className="demo-stage-sub">{sub || '\u00a0'}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

export default StageStrip
