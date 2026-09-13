import { useRef } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router'
import { hero, site, type Cta, type Step } from '../content/site.ts'
import { stages, type StageId } from '../content/demo.ts'
import SessionDemo from './demo/SessionDemo.tsx'
import { useSession } from './demo/useSession.ts'
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

function StepItem({
  step,
  index,
  active,
  onSelect,
}: {
  step: Step
  index: number
  active: boolean
  onSelect: (id: StageId) => void
}) {
  const number = String(index + 1).padStart(2, '0')
  return (
    <li className={active ? 'hero-step is-active' : 'hero-step'}>
      <button
        type="button"
        className="hero-step-btn"
        aria-pressed={active}
        onClick={() => onSelect(step.id)}
      >
        <span className="hero-step-index">{number}</span>
        <span className="hero-step-text">
          <span className="hero-step-title">
            {step.title}
            {step.note && <span className="hero-step-note">{step.note}</span>}
          </span>
          <span className="hero-step-body">{step.body}</span>
        </span>
      </button>
    </li>
  )
}

function Hero() {
  const demo = useSession()
  const stage = stages[demo.viewIndex].id
  const bandRef = useRef<HTMLDivElement>(null)

  const selectFromStep = (id: StageId) => {
    demo.select(id)
    bandRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

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
        <div className="hero-container hero-top">
          <motion.div
            className="hero-intro"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <h1 className="hero-heading">
              {hero.headline.map((line) => (
                <span key={line} className="hero-heading-line">
                  {line}
                </span>
              ))}
            </h1>
            <p className="hero-lede">{site.description}</p>
            <div className="hero-actions">
              <CtaButton
                cta={hero.primaryCta}
                className="hero-btn hero-btn-primary"
              />
              <CtaButton
                cta={hero.secondaryCta}
                className="hero-btn hero-btn-link"
              />
            </div>
          </motion.div>

          <motion.nav
            className="hero-steps"
            aria-label={hero.stepsLabel}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          >
            <p className="hero-steps-label">{hero.stepsLabel}</p>
            <ol className="hero-step-list">
              {hero.steps.map((step, i) => (
                <StepItem
                  key={step.id}
                  step={step}
                  index={i}
                  active={step.id === stage}
                  onSelect={selectFromStep}
                />
              ))}
            </ol>
          </motion.nav>
        </div>

        <motion.div
          className="hero-band"
          ref={bandRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
        >
          <div className="hero-container">
            <div className="hero-band-head">
              <span className="hero-band-title">
                {site.name} <span aria-hidden="true">·</span> workspace
              </span>
              <span className="hero-band-hint">{hero.demoHint}</span>
            </div>
            <SessionDemo {...demo} />
          </div>
        </motion.div>
      </section>
    </>
  )
}

export default Hero
