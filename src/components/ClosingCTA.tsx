import { motion } from 'motion/react'
import './ClosingCTA.css'

const EASE = [0.16, 1, 0.3, 1] as const

function ClosingCTA() {
  return (
    <section className="closing">
      <div className="closing-inner">
        <motion.div
          className="closing-content"
          initial={{ y: 24, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="closing-title">Start building today</h2>
          <p className="closing-subtitle">
            Turn your ideas into working software with LotusBuild.
          </p>
          <div className="closing-actions">
            <button type="button" className="closing-btn closing-btn-primary">
              Get started
            </button>
            <button type="button" className="closing-btn closing-btn-outline">
              Request access
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ClosingCTA
