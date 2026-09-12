import { motion } from 'motion/react'
import { Link } from 'react-router'
import { hero, site, type Cta } from '../content/site.ts'
import './Hero.css'

const EASE = [0.16, 1, 0.3, 1] as const

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

function CtaButton({ cta, className }: { cta: Cta; className: string }) {
  if (!cta.href) {
    return (
      <button type="button" className={className}>
        {cta.label}
      </button>
    )
  }
  if (/^https?:\/\//.test(cta.href)) {
    return (
      <a href={cta.href} className={className}>
        {cta.label}
      </a>
    )
  }
  return (
    <Link to={cta.href} className={className}>
      {cta.label}
    </Link>
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
          <Link to="/" className="hero-logo" aria-label={`${site.name} home`}>
            <LogoIcon />
            <span className="hero-brand">{site.name}</span>
          </Link>

          <div className="hero-tags-pill">
            {hero.navTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="hero-nav-right">
          <div className="hero-right-pill">
            <button
              type="button"
              className="hero-grid-btn"
              aria-label={hero.navAction}
            >
              <GridIcon />
            </button>
            <span className="hero-right-label">{hero.navAction}</span>
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
            {hero.eyebrow}
          </motion.p>

          <motion.h1
            className="hero-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            {hero.headline[0]}
            <br />
            {hero.headline[1]}
          </motion.h1>

          <motion.div
            className="hero-actions"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
          >
            <CtaButton
              cta={hero.primaryCta}
              className="hero-btn hero-btn-primary"
            />
            <CtaButton
              cta={hero.secondaryCta}
              className="hero-btn hero-btn-outline"
            />
          </motion.div>
        </div>

        <div className="hero-footer-right">
          {hero.capabilities.map((tag) => (
            <span key={tag} className="hero-tag">
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default Hero
