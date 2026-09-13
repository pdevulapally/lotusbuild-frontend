import { useId, useState } from 'react'
import './AgentDesktop.css'

const STEPS = [
  { title: 'Describe the task', body: 'Start with what you want to build or fix. Keep the conversation, files, and follow-up work together in a session.' },
  { title: 'Work with your agents', body: 'Follow the plan as your agent reads files and makes changes. Open each action to see the work and its assigned subagents.' },
  { title: 'Review the result', body: 'Inspect the diff, check the output, and try the preview. Keep the conversation going when you want to make a change.' },
]

function AgentDesktop() {
  const [step, setStep] = useState(0)
  const id = useId()
  return (
    <section className="desk" id="product" aria-labelledby={`${id}-heading`}>
      <div className="desk-inner">
        <h2 className="desk-title" id={`${id}-heading`}>How it works</h2>
        <p className="desk-lede">From the first idea to a result you can try. One conversation, all the way through.</p>
        <div className="desk-steps" role="tablist" aria-label="How LotusBuild works">
          {STEPS.map((item, index) => <button key={item.title} type="button" role="tab" id={`${id}-tab-${index}`} aria-controls={`${id}-panel-${index}`} aria-selected={step === index} tabIndex={step === index ? 0 : -1} onClick={() => setStep(index)} onKeyDown={(event) => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
            event.preventDefault()
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3
            setStep(next)
            event.currentTarget.parentElement?.querySelectorAll('button')[next]?.focus()
          }}><span>{index + 1}</span>{item.title}</button>)}
        </div>
        {STEPS.map((item, index) => <div key={item.title} className="desk-panel" role="tabpanel" id={`${id}-panel-${index}`} aria-labelledby={`${id}-tab-${index}`} hidden={step !== index} tabIndex={0}>
          <div className="desk-copy"><h3>{item.title}</h3><p>{item.body}</p><a href="#workspace-demo">Try the workspace demo <span aria-hidden="true">↗</span></a></div>
          <div className="desk-example" aria-label="Illustrative workflow example">
            <div className="desk-example-heading"><span>billing-api</span><small>Example session</small></div>
            {index === 0 && <><p className="desk-bubble">Voided invoices are still changing the balance. Can you fix that?</p><p className="desk-reply">I’ll inspect the invoice logic and check how each state updates the balance.</p><div className="desk-file">src/invoice.ts</div></>}
            {index === 1 && <><p className="desk-reply">A focused change, with a second pair of eyes.</p><ul className="desk-task-list"><li><span>Read invoice.ts</span><small>Complete</small></li><li><span>Add the void guard</span><small>Complete</small></li><li><span>Code reviewer</span><small>Reviewing</small></li><li><span>Test specialist</span><small>Checking states</small></li></ul></>}
            {index === 2 && <><div className="desk-code"><code className="is-removed">− return applyBalance(invoice)</code><code className="is-added">+ if (invoice.status === "void") return invoice</code><code className="is-added">+ return applyBalance(invoice)</code></div><p className="desk-reply">Review the change. Then see what it does.</p><a className="desk-preview-link" href="#workspace-demo">Open interactive demo <span aria-hidden="true">↗</span></a></>}
          </div>
        </div>)}
      </div>
    </section>
  )
}

export default AgentDesktop
