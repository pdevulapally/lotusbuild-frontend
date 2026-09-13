import { session, stages } from '../../content/demo.ts'
import ArtifactView from './Artifacts.tsx'
import StageStrip from './StageStrip.tsx'
import Conversation from './Conversation.tsx'
import type { SessionState } from './useSession.ts'
import './demo.css'

function SessionDemo({
  viewIndex,
  runKey,
  messages,
  working,
  progressOf,
  select,
  send,
  replay,
}: SessionState) {
  const viewed = stages[viewIndex]

  return (
    <div className="demo-session">
      <div className="demo-head">
        <span className="demo-head-name">
          <span className="demo-head-kicker">{session.kicker}</span>
          {session.name}
        </span>
        <span className={`demo-head-status${working ? ' is-working' : ''}`}>
          <span className="demo-head-dot" aria-hidden="true" />
          {working ? session.status.working : session.status.idle}
        </span>
        <button type="button" className="demo-replay" onClick={replay}>
          {session.replayLabel}
        </button>
      </div>

      <StageStrip
        stages={stages}
        viewIndex={viewIndex}
        progressOf={progressOf}
        onSelect={(i) => select(stages[i].id)}
      />

      <div className="demo-body">
        <Conversation messages={messages} working={working} onSend={send} />
        <div className="demo-artifact-area">
          <ArtifactView
            artifact={viewed.artifact}
            artifactKey={`${viewed.id}-${runKey}`}
            progress={progressOf(viewIndex)}
          />
        </div>
      </div>
    </div>
  )
}

export default SessionDemo
