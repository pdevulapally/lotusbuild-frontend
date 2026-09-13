import { motion } from 'motion/react'
import './HowItWorks.css'

const EASE = [0.16, 1, 0.3, 1] as const

const STEPS = [
  {
    num: '01',
    title: 'Describe',
    body: 'Start with a prompt. Describe what you want to build - a feature, an app, or a fix - in plain language.',
  },
  {
    num: '02',
    title: 'Plan',
    body: 'LotusBuild generates a step-by-step plan: routes, data models, components. Review and refine before any code runs.',
  },
  {
    num: '03',
    title: 'Build',
    body: 'Watch as code generates in a live sandbox. The workspace streams every file, test, and change in real time.',
  },
  {
    num: '04',
    title: 'Ship',
    body: "Preview instantly. Iterate in the same thread. When it's ready, merge to production or export the full codebase.",
  },
]

function HowItWorks() {
  return (
    <section className="how">
      <div className="how-inner">
        <motion.div
          className="how-header"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="how-title">How it works</h2>
          <p className="how-subtitle">
            From idea to working software in four steps.
          </p>
        </motion.div>

        <div className="how-steps">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="how-step"
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
            >
              <span className="how-num">{step.num}</span>
              <h3 className="how-step-title">{step.title}</h3>
              <p className="how-step-body">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
