import { motion } from 'motion/react'
import markUrl from '../assets/lotusbuild-mark.png'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1] as const

function LogoIcon() {
  return (
    <img
      className="hero-logo-mark"
      src={markUrl}
      width="28"
      height="28"
      alt=""
      aria-hidden="true"
    />
  )
}

function GridIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="1.5" fill="#fff" />
      <circle cx="9" cy="3" r="1.5" fill="#fff" />
      <circle cx="3" cy="9" r="1.5" fill="#fff" />
      <circle cx="9" cy="9" r="1.5" fill="#fff" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="hero">
      <motion.nav
        className="hero-nav"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <div className="hero-nav-left">
          <a href="/" className="hero-logo" aria-label="LotusBuild home">
            <LogoIcon />
            <span className="hero-brand">LotusBuild</span>
          </a>
        </div>

        <div className="hero-tags-pill">
          <span>Plan &amp; build</span>
          <span>Preview &amp; ship</span>
        </div>

        <div className="hero-nav-right">
          <div className="hero-right-pill">
            <button
              type="button"
              className="hero-grid-btn"
              aria-label="Workspace"
            >
              <GridIcon />
            </button>
            <span className="hero-right-label">Workspace</span>
          </div>
        </div>
      </motion.nav>

      <motion.div
        className="hero-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      >
        <div className="hero-footer-left">
          <motion.p
            className="hero-subtitle"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            <span className="hero-dot" />
            AI software builder
          </motion.p>

          <motion.h1
            className="hero-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            Turn ideas into
            <br />
            working software.
          </motion.h1>

          <motion.div
            className="hero-actions"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
          >
            <button type="button" className="hero-btn hero-btn-primary">
              Start building
            </button>
            <button type="button" className="hero-btn hero-btn-outline">
              Explore LotusBuild
            </button>
          </motion.div>
        </div>

        <div className="hero-footer-right">
          <span className="hero-tag">Real code</span>
          <span className="hero-tag">Live preview</span>
          <span className="hero-tag">Deploy-ready</span>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
