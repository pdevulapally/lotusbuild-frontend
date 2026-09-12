import { motion } from 'motion/react'
import { Plus } from 'lucide-react'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1] as const

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4'

function LogoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <g transform="rotate(-35 12 12)">
        <rect x="5" y="3" width="6" height="18" rx="3" fill="#000" />
        <rect x="13" y="3" width="6" height="18" rx="3" fill="#000" />
      </g>
    </svg>
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
          <a href="/" className="hero-logo" aria-label="NeuralKinetics home">
            <LogoIcon />
            <span className="hero-brand">NeuralKinetics</span>
          </a>

          <button type="button" className="hero-menu-btn">
            <span className="hero-menu-circle">
              <Plus size={12} strokeWidth={3} />
            </span>
            <span className="hero-menu-label">Menu</span>
          </button>

          <div className="hero-tags-pill">
            <span>Advanced Bionics</span>
            <span>Cognitive AI</span>
          </div>
        </div>

        <div className="hero-nav-right">
          <div className="hero-right-pill">
            <button
              type="button"
              className="hero-grid-btn"
              aria-label="Adaptive Systems"
            >
              <GridIcon />
            </button>
            <span className="hero-right-label">Adaptive Systems</span>
          </div>
        </div>
      </motion.nav>

      <motion.div
        className="hero-video-wrap"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <video
          className="hero-video"
          src={VIDEO_URL}
          autoPlay
          muted
          playsInline
          loop
        />
      </motion.div>

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
            Best digital banking card 2026
          </motion.p>

          <motion.h1
            className="hero-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            One Card, Zero
            <br />
            Limits. Worldwide.
          </motion.h1>

          <motion.div
            className="hero-actions"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
          >
            <button type="button" className="hero-btn hero-btn-primary">
              See Features
            </button>
            <button type="button" className="hero-btn hero-btn-outline">
              How It Works
            </button>
          </motion.div>
        </div>

        <div className="hero-footer-right">
          <span className="hero-tag">Neuromorphic</span>
          <span className="hero-tag">AGI</span>
          <span className="hero-tag">Cybernetics</span>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
