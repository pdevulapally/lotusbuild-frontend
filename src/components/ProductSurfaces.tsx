import { motion } from 'motion/react'
import './ProductSurfaces.css'

const EASE = [0.16, 1, 0.3, 1] as const

const SURFACES = [
  {
    label: 'Sessions',
    title: 'Persistent workspaces',
    body: 'Every conversation is a session. Keep context, iterate, and return to previous builds without losing state.',
  },
  {
    label: 'Agent runs',
    title: 'Transparent execution',
    body: 'Watch the agent work. See every plan, file change, and terminal command. Full logs, no hidden steps.',
  },
  {
    label: 'Organizations',
    title: 'Team structure',
    body: 'Invite teammates, share sessions, and manage access. Built for small teams shipping real software.',
  },
]

function ProductSurfaces() {
  return (
    <section className="surfaces">
      <div className="surfaces-inner">
        <motion.div
          className="surfaces-header"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2 className="surfaces-title">Built for builders</h2>
          <p className="surfaces-subtitle">
            The product surfaces that matter for shipping software.
          </p>
        </motion.div>

        <div className="surfaces-grid">
          {SURFACES.map((surface, i) => (
            <motion.div
              key={surface.label}
              className="surface-card"
              initial={{ y: 24, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
            >
              <span className="surface-label">{surface.label}</span>
              <h3 className="surface-title">{surface.title}</h3>
              <p className="surface-body">{surface.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ProductSurfaces
