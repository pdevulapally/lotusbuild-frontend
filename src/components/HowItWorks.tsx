import './HowItWorks.css'

const STEPS = [
  {
    n: '01',
    title: 'Prompt',
    body: 'You describe the software. That message opens a session.',
  },
  {
    n: '02',
    title: 'Plan',
    body: 'LotusBuild writes the plan first: pages, data, and the work to do. You see it before the run starts.',
  },
  {
    n: '03',
    title: 'Build',
    body: 'The agent writes code in a sandbox. Files and a live preview show up in the workspace.',
  },
  {
    n: '04',
    title: 'Review',
    body: 'Same session, another prompt. Change the plan or the app, then preview again.',
  },
]

function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how-inner">
        <header className="how-header">
          <span className="how-kicker">How it works</span>
          <h2 className="how-title">Prompt. Plan. Build. Review.</h2>
        </header>

        <div className="how-steps">
          <div className="how-rail" aria-hidden="true" />
          <ol className="how-step-list">
            {STEPS.map((step) => (
              <li key={step.n} className="how-step">
                <span className="how-num">{step.n}</span>
                <h3 className="how-step-title">{step.title}</h3>
                <p className="how-step-body">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
