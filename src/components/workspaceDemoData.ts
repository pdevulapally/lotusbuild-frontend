// Sample workspace data for the landing-page demo. No live agents or organisations.
export type DemoStatus = 'working' | 'review' | 'idle'
export type DiffLine = { kind: 'context' | 'added' | 'removed'; text: string }
export type DemoMessage = { role: 'user' | 'agent' | 'activity'; text: string }
export type DemoSession = {
  id: string
  name: string
  status: DemoStatus
  file: string
  request: string
  response: string
  explanation: string
  checks: string[]
  diff: DiffLine[]
  preview: 'invoices' | 'login' | 'members' | 'notes'
}
export type DemoSubagent = {
  id: string
  name: string
  status: DemoStatus
  task: string
}
export type DemoAgent = DemoSubagent & { sessionId: string; subagents: DemoSubagent[] }
export type DemoOrganisation = {
  id: string
  name: string
  initials: string
  sessions: DemoSession[]
  agents: DemoAgent[]
}

export const STATUS_LABEL: Record<DemoStatus, string> = {
  working: 'Working', review: 'Awaiting review', idle: 'Idle',
}

export const DEMO_ORGANISATIONS: DemoOrganisation[] = [
  {
    id: 'acme', name: 'Acme', initials: 'AC',
    sessions: [
      {
        id: 'billing', name: 'billing-api', status: 'working', file: 'src/invoice.ts', preview: 'invoices',
        request: 'Voided invoices are still changing the account balance. Can you fix that and check the other invoice states?',
        response: 'I found the balance update in settle(). I’m adding an early return for voided invoices. Two subagents are reviewing the change and checking the invoice states.',
        explanation: 'The old function applied a balance update to every invoice. The new guard returns voided invoices unchanged. Open invoices still reach applyBalance(). The red row is the old call; the green rows show the guard and the call in its new position.',
        checks: ['Voided invoice: balance unchanged', 'Open invoice: balance updated', 'Review: guard runs before the balance update'],
        diff: [
          { kind: 'context', text: 'export function settle(invoice: Invoice) {' },
          { kind: 'removed', text: '  return applyBalance(invoice)' },
          { kind: 'added', text: '  if (invoice.status === "void") {' },
          { kind: 'added', text: '    return invoice' },
          { kind: 'added', text: '  }' },
          { kind: 'added', text: '' },
          { kind: 'added', text: '  return applyBalance(invoice)' },
          { kind: 'context', text: '}' },
        ],
      },
      {
        id: 'auth', name: 'auth-fix', status: 'review', file: 'src/session.ts', preview: 'login',
        request: 'An expired session should ask the user to sign in again. Please remove the stale-token fallback.',
        response: 'The refresh path now throws when a new token cannot be issued. The token-audit subagent has reviewed the failure path. The change is ready for your review.',
        explanation: 'Previously, a failed refresh returned the old token. The removed line shows that fallback. The added lines throw AuthError instead, so the application can show the sign-in screen.',
        checks: ['Failed refresh: AuthError raised', 'Successful refresh: new token returned', 'Token audit: stale-token fallback removed'],
        diff: [
          { kind: 'context', text: 'export async function refresh(token: Token) {' },
          { kind: 'context', text: '  const next = await issue(token)' },
          { kind: 'removed', text: '  return next ?? token' },
          { kind: 'added', text: '  if (!next) {' },
          { kind: 'added', text: '    throw new AuthError("expired")' },
          { kind: 'added', text: '  }' },
          { kind: 'added', text: '  return next' },
          { kind: 'context', text: '}' },
        ],
      },
      {
        id: 'onboarding', name: 'onboarding', status: 'idle', file: 'src/org.ts', preview: 'members',
        request: 'Scope organisation invitations to members of the same organisation.',
        response: 'The invitation check now compares the member’s organisation with the target organisation. You can inspect the change and explore the sample member list.',
        explanation: 'The unconditional allow was removed. The replacement returns true only when actor.orgId matches org.id. This snippet illustrates the check; the demo does not send invitations or change permissions.',
        checks: ['Same organisation: allowed', 'Different organisation: denied'],
        diff: [
          { kind: 'context', text: 'export function canInvite(actor: Member, org: Org) {' },
          { kind: 'removed', text: '  return true' },
          { kind: 'added', text: '  return actor.orgId === org.id' },
          { kind: 'context', text: '}' },
        ],
      },
    ],
    agents: [
      {
        id: 'billing-engineer', name: 'Billing engineer', status: 'working', sessionId: 'billing',
        task: 'Fix the voided-invoice balance update.',
        subagents: [
          { id: 'invoice-reviewer', name: 'Code reviewer', status: 'review', task: 'Review the invoice guard and balance-update order.' },
          { id: 'invoice-tester', name: 'Test specialist', status: 'idle', task: 'Check voided and open invoice scenarios.' },
        ],
      },
      {
        id: 'session-engineer', name: 'Session engineer', status: 'review', sessionId: 'auth',
        task: 'Remove the stale-token fallback from refresh().',
        subagents: [{ id: 'token-auditor', name: 'Token auditor', status: 'idle', task: 'Inspect failed refresh and expired-token paths.' }],
      },
      { id: 'workspace-engineer', name: 'Workspace engineer', status: 'idle', sessionId: 'onboarding', task: 'Scope invitations to the current organisation.', subagents: [] },
    ],
  },
  {
    id: 'personal', name: 'Personal', initials: 'P',
    sessions: [{
      id: 'notes', name: 'notes-app', status: 'review', file: 'src/notes.ts', preview: 'notes',
      request: 'Ignore empty notes and remove whitespace around the note text.',
      response: 'The note is now trimmed before saving, and empty text returns early. A review subagent is checking the empty-input case.',
      explanation: 'The previous version saved the raw input. The new version trims it and skips empty strings before saving. Try typing a note in the sample preview.',
      checks: ['Whitespace-only note: ignored', 'Padded text: trimmed before saving'],
      diff: [
        { kind: 'context', text: 'export function addNote(input: string) {' },
        { kind: 'removed', text: '  return save(input)' },
        { kind: 'added', text: '  const text = input.trim()' },
        { kind: 'added', text: '  if (!text) return' },
        { kind: 'added', text: '  return save(text)' },
        { kind: 'context', text: '}' },
      ],
    }],
    agents: [{
      id: 'notes-engineer', name: 'Notes engineer', status: 'review', sessionId: 'notes', task: 'Validate and trim note text.',
      subagents: [{ id: 'notes-reviewer', name: 'Input reviewer', status: 'working', task: 'Check empty and whitespace-only notes.' }],
    }],
  },
]
