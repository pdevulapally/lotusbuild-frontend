import { useState } from 'react'
import type { DemoSession } from './workspaceDemoData'

const INVOICES = [
  { id: 'INV-204', amount: '$240.00', status: 'Void' },
  { id: 'INV-205', amount: '$480.00', status: 'Open' },
  { id: 'INV-206', amount: '$120.00', status: 'Open' },
]

export default function WorkspaceAppPreview({ kind, onInspect }: { kind: DemoSession['preview']; onInspect: (text: string) => void }) {
  const [invoiceId, setInvoiceId] = useState('INV-204')
  const [signedIn, setSignedIn] = useState(false)
  const [filter, setFilter] = useState('')
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<string[]>([])

  if (kind === 'invoices') {
    const selected = INVOICES.find((item) => item.id === invoiceId)
    return (
      <div className="wp-sample-app">
        <h3>Invoices</h3><p>Select an invoice to inspect it.</p>
        {INVOICES.map((invoice) => <button className="wp-invoice-row" key={invoice.id} type="button" aria-pressed={invoice.id === invoiceId} onClick={() => {
          setInvoiceId(invoice.id)
          onInspect(`${invoice.id} is ${invoice.status.toLowerCase()}. ${invoice.status === 'Void' ? 'The guard in src/invoice.ts returns this invoice before applying a balance update. Its amount is excluded.' : `Its ${invoice.amount} remains included in the balance. The void guard does not block open invoices.`}`)
        }}><span>{invoice.id}</span><span>{invoice.amount}</span></button>)}
        <div className="wp-preview-detail" role="status"><strong>{selected?.id} · {selected?.status}</strong><p>{selected?.status === 'Void' ? 'This invoice does not change the account balance.' : `${selected?.amount} is included in the account balance.`}</p></div>
      </div>
    )
  }
  if (kind === 'login') return (
    <div className="wp-sample-app"><h3>{signedIn ? 'Welcome back' : 'Session expired'}</h3><p>{signedIn ? 'You are viewing the signed-in sample screen.' : 'Sign in again to continue to the sample workspace.'}</p><button className="wp-solid-button" type="button" onClick={() => { setSignedIn((value) => !value); onInspect(signedIn ? 'The sample session has been reset to expired. Sign-in is required again.' : 'The sample sign-in succeeded. The expired token was not reused.') }}>{signedIn ? 'Reset preview' : 'Try sample sign-in'}</button></div>
  )
  if (kind === 'members') {
    const members = ['ada@acme', 'lin@acme'].filter((name) => name.includes(filter.toLowerCase()))
    return <div className="wp-sample-app"><h3>Members</h3><input aria-label="Filter members" placeholder="Find a member" value={filter} onChange={(event) => setFilter(event.target.value)} maxLength={100} />{members.map((name) => <button type="button" className="wp-invoice-row" key={name} onClick={() => onInspect(`${name} belongs to Acme. The invitation guard compares this member organisation with the target organisation before allowing an invitation.`)}><span>{name}</span><span>Member</span></button>)}{members.length === 0 && <p role="status">No matching members.</p>}</div>
  }
  return (
    <div className="wp-sample-app"><h3>Notes</h3><form onSubmit={(event) => { event.preventDefault(); const text = note.trim(); if (!text || text.length > 280) return; setNotes((items) => [...items, text]); onInspect(`Added the note "${text}" to this local preview. Empty notes are rejected by the form.`); setNote('') }}><label htmlFor="demo-note-input">New note</label><input id="demo-note-input" value={note} maxLength={280} onChange={(event) => setNote(event.target.value)} placeholder="Write a note" /><button className="wp-solid-button" disabled={!note.trim()} type="submit">Add note</button></form><ul className="wp-notes" aria-live="polite">{notes.map((text, index) => <li key={index}>{text}</li>)}</ul></div>
  )
}
