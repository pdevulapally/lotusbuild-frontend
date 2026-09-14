import type { Stage } from '../../content/demo.ts'
import type { Progress } from './Artifacts.tsx'
import { stageSub } from './useSession.ts'

type Props = {
  stages: Stage[]
  viewIndex: number
  progressOf: (index: number) => Progress
  onSelect: (index: number) => void
}

export function StageMark({ progress }: { progress: Progress }) {
  return (
    <span className={`demo-mark is-${progress}`} aria-hidden="true">
      {progress === 'active' ? (
        <span className="demo-spinner" />
      ) : progress === 'done' ? (
        <span className="demo-mark-check" />
      ) : null}
    </span>
  )
}

function StageTabs({ stages, viewIndex, progressOf, onSelect }: Props) {
  const viewedSub = stageSub(stages[viewIndex], progressOf(viewIndex))

  return (
    <div className="demo-tabs">
      <div className="demo-tabs-list" role="tablist">
        {stages.map((stage, i) => {
          const progress = progressOf(i)
          const selected = i === viewIndex
          return (
            <button
              key={stage.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={`demo-tab is-${progress}${selected ? ' is-selected' : ''}`}
              onClick={() => onSelect(i)}
            >
              <StageMark progress={progress} />
              {stage.label}
            </button>
          )
        })}
      </div>
      <span className="demo-tabs-sub">{viewedSub}</span>
    </div>
  )
}

export default StageTabs
