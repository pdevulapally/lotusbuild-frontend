import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { STATUS_LABEL, type DemoOrganisation, type DemoSession, type DemoSubagent } from './workspaceDemoData'
import './WorkspaceSidebar.css'

const SECTIONS = [
  { id: 'sessions', label: 'Sessions', short: 'Chats' },
  { id: 'agents', label: 'Agents', short: 'Agents' },
] as const
type Section = typeof SECTIONS[number]['id']
type Props = {
  organisation: DemoOrganisation
  organisations: DemoOrganisation[]
  sessions: DemoSession[]
  activeSessionId: string
  onSelect: (id: string) => void
  onOrganisationChange: (id: string) => void
}

export default function WorkspaceSidebar({ organisation, organisations, sessions, activeSessionId, onSelect, onOrganisationChange }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [section, setSection] = useState<Section>('sessions')
  const [organisationOpen, setOrganisationOpen] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState<{ agent: DemoSubagent; parent?: string } | null>(null)
  const panelId = useId()
  const orgMenuRef = useRef<HTMLDivElement>(null)
  const orgTriggerRef = useRef<HTMLButtonElement>(null)
  const counts = {
    sessions: sessions.length,
    agents: organisation.agents.length,
  }
  const subagentCount = organisation.agents.reduce((total, agent) => total + agent.subagents.length, 0)

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const menu = orgMenuRef.current
      if (menu && event.target instanceof Node && !menu.contains(event.target)) setOrganisationOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  return (
    <aside className={`ws-sidebar${collapsed ? ' is-collapsed' : ''}`} aria-label="Workspace navigation">
      <div className="ws-primary">
        <div className="ws-header">
          <div
            className="ws-org-menu"
            ref={orgMenuRef}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setOrganisationOpen(false)
                orgTriggerRef.current?.focus()
              }
            }}
          >
            <button type="button" ref={orgTriggerRef} data-org-trigger className="ws-org-trigger" aria-label={`Switch organisation, current: ${organisation.name}`} aria-expanded={organisationOpen} aria-controls={`${panelId}-organisations`} onClick={() => setOrganisationOpen((value) => !value)}>
              <span className="ws-label"><strong>{organisation.name}</strong><small>Organisation</small></span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <div className="ws-org-options" id={`${panelId}-organisations`} hidden={!organisationOpen}>
              <p>Demo organisations</p>
              {organisations.map((item) => (
                <button
                  key={item.id} type="button" aria-pressed={item.id === organisation.id} aria-label={`Select ${item.name} organisation`}
                  onClick={() => {
                    setOrganisationOpen(false)
                    orgTriggerRef.current?.focus()
                    onOrganisationChange(item.id)
                  }}
                ><span>{item.name}</span><small>{item.sessions.length} {item.sessions.length === 1 ? 'session' : 'sessions'}</small></button>
              ))}
            </div>
          </div>
          <button className="ws-icon-button" type="button"
            aria-label={collapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'}
            title={collapsed ? 'Expand workspace sidebar' : 'Collapse workspace sidebar'}
            aria-expanded={!collapsed} aria-controls={`${panelId}-navigation`}
            onClick={() => setCollapsed((value) => !value)}
          >
            <svg width="17" height="17" viewBox="0 0 64 64" fill="currentColor" fillRule="evenodd" clipRule="evenodd" aria-hidden="true" focusable="false">
              <path d="M50.01,56.074l-35.989,0c-3.309,0 -5.995,-2.686 -5.995,-5.995l0,-36.011c0,-3.308 2.686,-5.994 5.995,-5.994l35.989,0c3.309,0 5.995,2.686 5.995,5.994l0,36.011c0,3.309 -2.686,5.995 -5.995,5.995Zm-25.984,-4l0,-40l-9.012,0c-1.65,0.001 -2.989,1.34 -2.989,2.989l0,34.022c0,1.649 1.339,2.989 2.989,2.989l9.012,0Zm24.991,-40l-20.991,0l0,40l20.991,0c1.65,0 2.989,-1.34 2.989,-2.989l0,-34.022c0,-1.649 -1.339,-2.988 -2.989,-2.989Z" />
            </svg>
          </button>
        </div>
        <nav id={`${panelId}-navigation`} aria-label="Workspace sections">
          <ul className="ws-menu">
            {SECTIONS.map((item) => (
              <li key={item.id}>
                <button type="button" className={`ws-nav-button${section === item.id ? ' is-active' : ''}`}
                  aria-label={item.label} aria-expanded={!collapsed && section === item.id} aria-controls={panelId}
                  onClick={() => { setSection(item.id); setCollapsed(false) }}
                >
                  <span className="ws-label">{item.label}</span><span className="ws-short" aria-hidden="true">{item.short}</span>
                  <span className="ws-nav-meta"><span className="ws-count">{counts[item.id]}</span><ChevronRight className="ws-chevron" size={13} aria-hidden="true" /></span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      <section className="ws-detail" id={panelId} hidden={collapsed} aria-labelledby={`${panelId}-title`}>
        <div className="ws-detail-header">
          <h3 id={`${panelId}-title`}>{section === 'sessions' ? 'Recent sessions' : 'Your agents'}</h3>
        </div>
        {section === 'agents' ? (
          <>
            <p className="ws-agent-counts"><strong>{counts.agents}</strong> agents <span>·</span> <strong>{subagentCount}</strong> subagents</p>
            <ul className="ws-menu ws-agent-tree">
              {organisation.agents.map((agent) => (
                <li key={agent.id}>
                  <button className={`ws-detail-button${selectedAgent?.agent.id === agent.id ? ' is-active' : ''}`} type="button"
                    aria-pressed={selectedAgent?.agent.id === agent.id}
                    onClick={() => { setSelectedAgent({ agent }); onSelect(agent.sessionId) }}
                  ><strong>{agent.name}</strong><small>{STATUS_LABEL[agent.status]}</small></button>
                  {agent.subagents.length > 0 && (
                    <details className="ws-subagents">
                      <summary>{agent.subagents.length} {agent.subagents.length === 1 ? 'subagent' : 'subagents'}</summary>
                      <ul className="ws-menu">
                        {agent.subagents.map((child) => (
                          <li key={child.id}>
                            <button className={`ws-detail-button${selectedAgent?.agent.id === child.id ? ' is-active' : ''}`} type="button"
                              aria-pressed={selectedAgent?.agent.id === child.id}
                              onClick={() => { setSelectedAgent({ agent: child, parent: agent.name }); onSelect(agent.sessionId) }}
                            ><strong>{child.name}</strong><small>{STATUS_LABEL[child.status]}</small></button>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ul>
            {selectedAgent && <div className="ws-agent-task" role="status"><strong>{selectedAgent.agent.name}</strong><small>{selectedAgent.parent ? `Subagent of ${selectedAgent.parent}` : 'Primary agent'}</small><p>{selectedAgent.agent.task}</p></div>}
          </>
        ) : (
          <ul className="ws-menu ws-detail-menu">
            {sessions.map((session) => (
              <li key={session.id}>
                <button className={`ws-detail-button${activeSessionId === session.id ? ' is-active' : ''}`} type="button"
                  aria-pressed={activeSessionId === session.id}
                  onClick={() => onSelect(session.id)}
                ><strong>{session.name}</strong><small>{STATUS_LABEL[session.status]}</small></button>
              </li>
            ))}
          </ul>
        )}
      </section>
        <div className="ws-footer"><span className="ws-avatar" aria-hidden="true">{organisation.initials}</span><span className="ws-label">{organisation.name}<small>Demo workspace</small></span></div>
      </div>
    </aside>
  )
}
