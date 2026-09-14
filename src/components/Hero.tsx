import { motion } from 'motion/react'
import WorkspacePreview from './WorkspacePreview.tsx'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1] as const

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-intro">
        <motion.div
          className="hero-footer"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.5, ease: EASE }}
        >
          <div className="hero-footer-left">
            <motion.p
              className="hero-eyebrow"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            >
              <span className="hero-dot" />
              AI software builder
            </motion.p>

            <motion.h1
              className="hero-heading"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
            >
              Turn ideas into
              <br />
              working software.
            </motion.h1>

            <motion.p
              className="hero-lede"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
            >
              Plan, build, preview, and iterate on real applications from one
              intelligent workspace.
            </motion.p>

            <motion.div
              className="hero-actions"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
            >
              <button type="button" className="hero-btn hero-btn-primary">
                Start building
              </button>
              <a href="#product" className="hero-btn hero-btn-outline">
                Explore LotusBuild
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <WorkspacePreview />
    </section>
  )
}

export default Hero
