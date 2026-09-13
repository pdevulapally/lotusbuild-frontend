import { useEffect, useId, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowUp, Check, ChevronDown, Folder } from 'lucide-react'
import WorkspaceSidebar from './WorkspaceSidebar'
import WorkspaceAppPreview from './WorkspaceAppPreview'
import WorkspaceFileTree from './WorkspaceFileTree'
import WorkspaceAgentActivity from './WorkspaceAgentActivity'
import useWorkspaceDemo, { DEMO_STEPS } from './useWorkspaceDemo'
import { DEMO_ORGANISATIONS, type DemoMessage, type DemoOrganisation } from './workspaceDemoData'
import markUrl from '../assets/lotusbuild-mark.png'
import './WorkspacePreview.css'

const VIEWS = ['Code', 'Desktop', 'Preview'] as const
type View = typeof VIEWS[number]

type OrganisationProps = {
  organisation: DemoOrganisation
  visible: boolean
  onOrganisationChange: (id: string) => void
}

function OrganisationWorkspace({ organisation, visible, onOrganisationChange }: OrganisationProps) {
  const [activeSessionId, setActiveSessionId] = useState(organisation.sessions[0].id)
  const [codeSessionId, setCodeSessionId] = useState(organisation.sessions[0].id)
  const [filesOpen, setFilesOpen] = useState(true)
  const [conversationOpen, setConversationOpen] = useState(false)
  const conversationMenuRef = useRef<HTMLDivElement>(null)
  const conversationTriggerRef = useRef<HTMLButtonElement>(null)
  const [selectedView, setSelectedView] = useState<View>('Code')
  const [codeMode, setCodeMode] = useState<'diff' | 'file'>('diff')
  const [conversations, setConversations] = useState<Record<string, DemoMessage[]>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [reviewed, setReviewed] = useState<Record<string, boolean>>({})
  const [pendingReply, setPendingReply] = useState<{ sessionId: string; text: string } | null>(null)
  const viewId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const wasVisible = useRef(visible)
  const sessions = organisation.sessions.map((item) => reviewed[item.id] ? { ...item, status: 'idle' as const } : item)
  const session = sessions.find((item) => item.id === activeSessionId)
  const codeSession = sessions.find((item) => item.id === codeSessionId)
  const messages = conversations[activeSessionId] ?? []
  const draft = drafts[activeSessionId] ?? ''
  const demoPlayerRef = useRef<HTMLDivElement>(null)
  const demo = useWorkspaceDemo(visible, activeSessionId, demoPlayerRef)
  const shownView = demo.guided ? (demo.step >= 4 ? 'Preview' : demo.step === 3 ? 'Desktop' : 'Code') : selectedView
  function exploreDemo() {
    setSelectedView(shownView)
    demo.explore()
  }

  useEffect(() => {
    if (!pendingReply) return
    const timer = window.setTimeout(() => {
      setConversations((current) => ({ ...current, [pendingReply.sessionId]: [...(current[pendingReply.sessionId] ?? []), { role: 'agent', text: pendingReply.text }] }))
      setPendingReply(null)
    }, 900)
    return () => window.clearTimeout(timer)
  }, [pendingReply])

  useEffect(() => {
    if (!conversationOpen) return
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !conversationMenuRef.current?.contains(event.target)) setConversationOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [conversationOpen])

  useEffect(() => {
    if (visible && !wasVisible.current) rootRef.current?.querySelector<HTMLButtonElement>('[data-org-trigger]')?.focus({ preventScroll: true })
    wasVisible.current = visible
  }, [visible])

  useEffect(() => {
    if (visible && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [activeSessionId, messages.length, visible, demo.step])

  if (!session) throw new Error('The selected demo session does not exist in this organisation.')
  if (!codeSession) throw new Error('The selected demo file does not exist in this organisation.')
  const agent = organisation.agents.find((item) => item.sessionId === session.id)
  if (!agent) throw new Error('The demo session has no assigned agent.')
  const additions = codeSession.diff.filter((line) => line.kind === 'added').length
  const deletions = codeSession.diff.filter((line) => line.kind === 'removed').length
  const sessionAdditions = session.diff.filter((line) => line.kind === 'added').length
  const sessionDeletions = session.diff.filter((line) => line.kind === 'removed').length
  let oldLine = 0
  let newLine = 0
  const diffRows = codeSession.diff.map((line) => ({
    ...line,
    oldLine: line.kind === 'added' ? '' : ++oldLine,
    newLine: line.kind === 'removed' ? '' : ++newLine,
  }))

  function appendMessages(...items: DemoMessage[]) {
    setConversations((current) => ({ ...current, [activeSessionId]: [...(current[activeSessionId] ?? []), ...items] }))
  }

  function launchPreview() {
    if (!session) throw new Error('The selected demo session does not exist.')
    setSelectedView('Preview')
    appendMessages({ role: 'activity', text: `Launched the ${session.name} sample preview.` }, { role: 'agent', text: 'Select an item in the preview to inspect its behavior here in the conversation.' })
  }

  function sendDemoMessage(text: string) {
    if (!session) throw new Error('The selected demo session does not exist.')
    if (pendingReply) return
    appendMessages({ role: 'user', text })
    const query = text.toLowerCase()
    let reply = `This is a scripted demo for ${session.name}. You can ask me to explain the change, show checks, or launch the preview. Select an element in the preview to inspect it with me.`
    if (/preview|launch|open app/.test(query)) {
      setSelectedView('Preview')
      reply = 'The sample app is open in Preview. Select an item to inspect its behavior in this conversation.'
    } else if (/check|test/.test(query)) {
      setSelectedView('Desktop')
      reply = `Here are the recorded sample checks:\n${session.checks.join('\n')}`
    } else if (/explain|change|code|fix/.test(query)) {
      setCodeSessionId(session.id)
      setSelectedView('Code')
      reply = session.explanation
    }
    setPendingReply({ sessionId: activeSessionId, text: reply })
  }

  function reviewChange() {
    const next = !reviewed[codeSessionId]
    setReviewed((current) => ({ ...current, [codeSessionId]: next }))
    setConversations((current) => ({ ...current, [codeSessionId]: [...(current[codeSessionId] ?? []), { role: 'activity', text: next ? 'You marked these changes as reviewed in the demo.' : 'You reopened the change review in the demo.' }] }))
  }

  function selectSession(id: string) {
    setConversationOpen(false)
    setActiveSessionId(id)
    setCodeSessionId(id)
  }

  return (
    <div className="wp-organisation" hidden={!visible} ref={rootRef}>
      <div className="wp-demo-player" ref={demoPlayerRef}>
        <span role="status">{demo.guided ? DEMO_STEPS[demo.step] : 'Explore the demo'}<small>Scripted walkthrough</small></span>
        <div><button type="button" onClick={demo.guided && demo.step < 4 ? demo.toggle : () => { setCodeSessionId(activeSessionId); setCodeMode('diff'); demo.replay() }}>{demo.playing ? 'Pause demo' : demo.guided && demo.step < 4 ? 'Play demo' : 'Replay demo'}</button><button type="button" onClick={exploreDemo}>Explore yourself</button></div>
        <div className="wp-demo-progress" aria-hidden="true">{DEMO_STEPS.map((label, index) => <span key={label} className={demo.guided && index <= demo.step ? 'is-complete' : ''} />)}</div>
      </div>
      <div className="wp-bar">
        <div className="wp-brand"><img src={markUrl} width="14" height="14" alt="" /><span>LotusBuild</span><span className="wp-demo-label">Interactive demo</span></div>
        <span className="wp-org">{organisation.name} / {session.name}</span>
      </div>
      <div className="wp-body" onPointerDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('.wp-agent-activity')) { demo.pause(); return }
        exploreDemo()
      }} onKeyDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest('.wp-agent-activity')) { demo.pause(); return }
        exploreDemo()
      }}>
        <WorkspaceSidebar organisation={organisation} organisations={DEMO_ORGANISATIONS} sessions={sessions} activeSessionId={activeSessionId} onSelect={selectSession} onOrganisationChange={onOrganisationChange} />
        <section className="wp-conversation" aria-label={`${session.name} conversation`}>
          <div className="wp-conversation-header">
            <div className="wp-conversation-menu" ref={conversationMenuRef} onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setConversationOpen(false)
            }} onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setConversationOpen(false)
                conversationTriggerRef.current?.focus()
              }
            }}>
              <button className="wp-conversation-trigger" type="button" ref={conversationTriggerRef} aria-label="Switch conversation" aria-expanded={conversationOpen} aria-controls={`${viewId}-conversations`} onClick={() => setConversationOpen((open) => !open)}>
                <Folder size={16} strokeWidth={1.5} aria-hidden="true" /><strong>Conversation</strong><ChevronDown size={14} aria-hidden="true" />
              </button>
              <div className="wp-conversation-options" id={`${viewId}-conversations`} hidden={!conversationOpen}>
                <p>Conversations</p>
                {sessions.map((item) => <button type="button" key={item.id} aria-pressed={item.id === activeSessionId} onClick={() => {
                  selectSession(item.id)
                  conversationTriggerRef.current?.focus()
                }}><Folder size={15} strokeWidth={1.5} aria-hidden="true" /><span>{item.name}</span>{item.id === activeSessionId && <Check size={14} aria-hidden="true" />}</button>)}
              </div>
            </div>
            <span>{session.name}</span>
          </div>
          <div className="wp-messages" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions" ref={logRef}>
            <article className="wp-message is-user"><header className="wp-sr-only">You</header><p>{session.request}</p></article>
            <WorkspaceAgentActivity key={session.id} session={session} agent={agent} step={demo.guided ? demo.step : 4} playing={demo.guided && demo.playing} onOpenCode={() => { exploreDemo(); setCodeSessionId(session.id); setSelectedView('Code') }} onOpenChecks={() => { exploreDemo(); setSelectedView('Desktop') }} onLaunch={() => { exploreDemo(); launchPreview() }} />
            <article className="wp-message"><header className="wp-sr-only">{agent.name}</header><p>{demo.guided && demo.step < 2 ? (demo.step === 0 ? 'Let me trace the affected code and inspect the request.' : `Reviewing ${session.file} and preparing the change.`) : session.response}</p>{(!demo.guided || demo.step >= 2) && <button className="wp-change-link" type="button" onClick={() => { setCodeSessionId(session.id); setSelectedView('Code') }}><span>{session.file}</span><span><b className="wp-added">+{sessionAdditions}</b> <b className="wp-removed">−{sessionDeletions}</b></span></button>}{demo.guided && demo.step >= 3 && <p className="wp-demo-result">{demo.step === 3 ? 'Inspecting the sample check results in Desktop.' : 'The walkthrough is complete. Try the app in Preview, or select another session to explore.'}</p>}</article>
            {messages.map((message, index) => message.role === 'activity'
              ? <p className="wp-activity" key={index}>{message.text}</p>
              : <article className={`wp-message${message.role === 'user' ? ' is-user' : ''}`} key={index}><header className="wp-sr-only">{message.role === 'user' ? 'You' : agent.name}</header><p>{message.text}</p></article>)}
          </div>
          <div className="wp-conversation-actions">
            <button type="button" onClick={launchPreview}>Launch preview</button>
            <button type="button" onClick={() => appendMessages({ role: 'user', text: 'Explain these changes.' }, { role: 'agent', text: session.explanation })}>Explain changes</button>
            <button type="button" onClick={() => { appendMessages({ role: 'user', text: 'Show the sample checks.' }, { role: 'agent', text: `Sample checks for this change:\n${session.checks.map((check) => `• ${check}`).join('\n')}` }); setSelectedView('Desktop') }}>Show checks</button>
          </div>
          <form className="wp-composer" onSubmit={(event) => {
            event.preventDefault()
            const text = draft.trim()
            if (!text || text.length > 2000) return
            if (pendingReply) return
            sendDemoMessage(text)
            setDrafts((current) => ({ ...current, [activeSessionId]: '' }))
          }}>
            <label className="wp-sr-only" htmlFor={`${viewId}-message`}>Message for {session.name}</label>
            <textarea id={`${viewId}-message`} aria-describedby={`${viewId}-demo-note`} value={draft} onChange={(event) => setDrafts((current) => ({ ...current, [activeSessionId]: event.target.value }))} onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }} maxLength={2000} rows={2} placeholder="Message your agent…" />
            <div><small>{pendingReply?.sessionId === activeSessionId ? 'Agent is responding…' : 'Shift + Enter for a new line'}</small><button className="wp-send-button" type="submit" disabled={!draft.trim() || !!pendingReply} aria-label="Send message" title="Send message"><ArrowUp size={18} aria-hidden="true" /></button></div>
          </form>
          <p className="wp-composer-note" id={`${viewId}-demo-note`}>Local demo · no live AI connection</p>
        </section>
        <div className="wp-workbench">
          <div className="wp-workbench-header">
          <div className="wp-view-bar" role="tablist" aria-label="Workspace view">
            {VIEWS.map((view, index) => <button key={view} type="button" role="tab" id={`${viewId}-${view}-tab`} aria-controls={`${viewId}-${view}-panel`} aria-selected={shownView === view} tabIndex={shownView === view ? 0 : -1} onClick={() => setSelectedView(view)} onKeyDown={(event) => {
              if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
              event.preventDefault()
              const next = event.key === 'Home' ? 0 : event.key === 'End' ? VIEWS.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + VIEWS.length) % VIEWS.length
              setSelectedView(VIEWS[next])
              event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
            }}>{view}</button>)}
          </div>
          </div>
          <section className="wp-pane" role="tabpanel" id={`${viewId}-Code-panel`} aria-labelledby={`${viewId}-Code-tab`} hidden={shownView !== 'Code'} tabIndex={0}>
            <div className="wp-filebar"><button className="wp-files-toggle" type="button" aria-expanded={filesOpen} aria-controls={`${viewId}-files`} onClick={() => setFilesOpen((value) => !value)}>Files</button><span className="wp-current-file">{codeSession.file}</span><div className="wp-code-modes" role="group" aria-label="Code display"><button type="button" aria-pressed={codeMode === 'diff'} onClick={() => setCodeMode('diff')}>Diff</button><button type="button" aria-pressed={codeMode === 'file'} onClick={() => setCodeMode('file')}>File</button></div></div>
            <div className="wp-code-layout">
              <nav className="wp-file-tree" id={`${viewId}-files`} hidden={!filesOpen} aria-label="Code files">
                <WorkspaceFileTree files={sessions} selectedId={codeSessionId} onSelect={setCodeSessionId} />
              </nav>
              <div className="wp-diff-view">
            <div className="wp-diff-summary"><span>{codeMode === 'diff' ? 'Proposed changes' : 'Updated file'}</span><span><b className="wp-added">+{additions}</b> <b className="wp-removed">−{deletions}</b></span></div>
            <div className="wp-code-scroll">
              <table className="wp-code" aria-label={`${codeSession.file} ${codeMode === 'diff' ? 'diff' : 'updated file'}`}>
                <thead className="wp-sr-only"><tr>{codeMode === 'diff' && <th>Old line</th>}<th>New line</th>{codeMode === 'diff' && <th>Change</th>}<th>Code</th></tr></thead>
                <tbody>{diffRows.filter((line) => demo.guided && demo.step < 2 ? line.kind !== 'added' : codeMode === 'diff' || line.kind !== 'removed').map((line, index) => <tr key={index} className={codeMode === 'diff' ? `is-${line.kind}` : ''}>{codeMode === 'diff' && <td className="wp-line-number">{line.oldLine}</td>}<td className="wp-line-number">{line.newLine}</td>{codeMode === 'diff' && <td className="wp-diff-sign" aria-label={line.kind === 'added' ? 'Added' : line.kind === 'removed' ? 'Removed' : 'Unchanged'}>{line.kind === 'added' ? '+' : line.kind === 'removed' ? '−' : ' '}</td>}<td><code>{line.text || '\u00a0'}</code></td></tr>)}</tbody>
              </table>
            </div>
              </div>
            </div>
            <div className="wp-review-bar"><span role="status">{reviewed[codeSession.id] ? 'Reviewed in demo' : 'Ready to inspect'}</span><button type="button" onClick={reviewChange}>{reviewed[codeSession.id] ? 'Reopen review' : 'Mark reviewed'}</button></div>
          </section>
          <section className="wp-pane" role="tabpanel" id={`${viewId}-Desktop-panel`} aria-labelledby={`${viewId}-Desktop-tab`} hidden={shownView !== 'Desktop'} tabIndex={0}>
            <div className="wp-filebar"><span>Check output</span><span className="wp-muted">Sample</span></div>
            <div className="wp-terminal"><p>Checks for {session.file}</p>{session.checks.map((check) => <div key={check}><span>✓</span> {check}</div>)}<p className="wp-muted">Recorded example output. No commands run in this demo.</p></div>
          </section>
          <section className="wp-pane" role="tabpanel" id={`${viewId}-Preview-panel`} aria-labelledby={`${viewId}-Preview-tab`} hidden={shownView !== 'Preview'} tabIndex={0}>
            <div className="wp-filebar"><span>{session.name}</span><span className="wp-muted">Sample app</span></div>
            <div className="wp-app-preview"><WorkspaceAppPreview key={session.id} kind={session.preview} onInspect={(text) => appendMessages({ role: 'activity', text: 'Selected an element in Preview' }, { role: 'agent', text })} /></div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default function WorkspacePreview() {
  const [organisationId, setOrganisationId] = useState(DEMO_ORGANISATIONS[0].id)
  return (
    <motion.div className="wp" id="workspace-demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {DEMO_ORGANISATIONS.map((organisation) => <OrganisationWorkspace key={organisation.id} organisation={organisation} visible={organisation.id === organisationId} onOrganisationChange={setOrganisationId} />)}
    </motion.div>
  )
}
