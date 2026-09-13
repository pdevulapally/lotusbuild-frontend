import { motion } from 'motion/react'
import { Link } from 'react-router'
import { hero, site, type Cta } from '../content/site.ts'
import HeroDemo from './demo/HeroDemo.tsx'
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

function CtaButton({
  cta,
  className,
  icon,
}: {
  cta: Cta
  className: string
  icon?: string
}) {
  const content = (
    <>
      {cta.label}
      {icon && (
        <span className="hero-btn-icon" aria-hidden="true">
          {icon}
        </span>
      )}
    </>
  )
  if (!cta.href) {
    return (
      <button type="button" className={className}>
        {content}
      </button>
    )
  }
  if (/^https?:\/\//.test(cta.href)) {
    return (
      <a href={cta.href} className={className}>
        {content}
      </a>
    )
  }
  return (
    <Link to={cta.href} className={className}>
      {content}
    </Link>
  )
}

function Hero() {
  return (
    <>
      <header className="hero-nav">
        <div className="hero-nav-left">
          <Link to="/" className="hero-logo" aria-label={`${site.name} home`}>
            <LogoIcon />
            <span className="hero-brand">{site.name}</span>
          </Link>
        </div>

        <div className="hero-nav-center">
          <div className="hero-tags-pill">
            {hero.navTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>

        <div className="hero-nav-right">
          <CtaButton cta={hero.loginCta} className="hero-login-btn" />
        </div>
      </header>

      <section className="hero">
        <div className="hero-container">
          <motion.div
            className="hero-intro"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <h1 className="hero-heading">{hero.headline}</h1>
            <div className="hero-actions">
              <CtaButton
                cta={hero.primaryCta}
                className="hero-btn hero-btn-primary"
                icon="→"
              />
              <CtaButton
                cta={hero.secondaryCta}
                className="hero-btn hero-btn-secondary"
              />
            </div>
          </motion.div>

          <motion.div
            className="hero-media"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          >
            <HeroDemo />
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Hero
