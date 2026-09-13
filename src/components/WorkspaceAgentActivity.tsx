import { Check, ChevronRight, FileCode2, Terminal, Users } from 'lucide-react'
import LotusActivityLogo from './LotusActivityLogo'
import type { DemoAgent, DemoSession } from './workspaceDemoData'
import './WorkspaceAgentActivity.css'

type Props = {
  session: DemoSession
  agent: DemoAgent
  step: number
  playing: boolean
  onOpenCode: () => void
  onOpenChecks: () => void
  onLaunch: () => void
}

export default function WorkspaceAgentActivity({ session, agent, step, playing, onOpenCode, onOpenChecks, onLaunch }: Props) {
  const stages = ['Thinking · preparing a plan', 'Reading the affected file', 'Applying changes and delegating review', 'Checking the result', 'Ready for review']
  const plan = ['Inspect the affected code', 'Apply the focused change', 'Review behavior and check scenarios', 'Launch the app preview']
  return (
    <div className="wp-agent-activity" aria-label="Scripted agent activity">
      <div className="wp-agent-status" role="status"><LotusActivityLogo active={playing && step < 4} /><span className={playing && step < 4 ? 'wp-agent-shimmer' : undefined}>{stages[step]}</span><small>{agent.name}</small></div>
      <details className="wp-agent-event" open={step === 0}>
        <summary><ChevronRight size={13} /><span className={playing && step === 0 ? 'wp-agent-shimmer' : undefined}>Plan</span><small>{Math.min(step, 4)}/4</small></summary>
        <ol className="wp-agent-plan">{plan.map((item, index) => <li key={item} className={step > index ? 'is-done' : ''}><span>{step > index ? <Check size={12} /> : index + 1}</span>{item}</li>)}</ol>
        <p className="wp-agent-note">Approach: inspect the existing behavior, make a focused edit, then verify the affected scenarios.</p>
      </details>
      {step >= 1 && <details className="wp-agent-event" open={step === 1}>
        <summary><FileCode2 size={14} /><span className={playing && step === 1 ? 'wp-agent-shimmer' : undefined}>Read file</span><small>{step === 1 ? 'Reading' : 'Done'}</small></summary>
        <button className="wp-agent-file" type="button" onClick={onOpenCode}>{session.file}<span>Open file</span></button>
        <pre>{session.diff.filter((line) => line.kind !== 'added').map((line) => line.text).join('\n')}</pre>
      </details>}
      {step >= 2 && <>
        <details className="wp-agent-event" open={step === 2}>
          <summary><Terminal size={14} /><span>Apply patch</span><small>Done</small></summary>
          <button className="wp-agent-file" type="button" onClick={onOpenCode}>{session.file}<span>View diff</span></button>
          <pre>{session.diff.filter((line) => line.kind !== 'context').map((line, index) => <span className={line.kind === 'added' ? 'is-added' : 'is-removed'} key={index}>{line.kind === 'added' ? '+' : '−'} {line.text}{'\n'}</span>)}</pre>
        </details>
        {agent.subagents.length > 0 && <details className="wp-agent-event" open={step === 2}>
          <summary><Users size={14} /><span className={playing && step === 2 ? 'wp-agent-shimmer' : undefined}>Spawned {agent.subagents.length} {agent.subagents.length === 1 ? 'subagent' : 'subagents'}</span><small>{step < 3 ? 'Working' : 'Complete'}</small></summary>
          <div className="wp-agent-children">{agent.subagents.map((child) => <details key={child.id}><summary><ChevronRight size={12} /><span className={playing && step === 2 ? 'wp-agent-shimmer' : undefined}>{child.name}</span><small>{step < 3 ? 'Working' : 'Done'}</small></summary><p>{child.task}</p>{step >= 3 && <p>Finished the assigned review in this scripted example.</p>}</details>)}</div>
        </details>}
      </>}
      {step >= 3 && <details className="wp-agent-event" open={step === 3}>
        <summary><Terminal size={14} /><span>Run checks</span><small>{session.checks.length} passed</small></summary>
        <ul className="wp-agent-checks">{session.checks.map((check) => <li key={check}><Check size={12} />{check}</li>)}</ul>
        <button className="wp-agent-file" type="button" onClick={onOpenChecks}>View output<span>Desktop</span></button>
        <p className="wp-agent-note">Recorded demo results · no commands executed.</p>
      </details>}
      {step >= 4 && <button type="button" className="wp-agent-launch" onClick={onLaunch}>Launch preview<span>↗</span></button>}
    </div>
  )
}
