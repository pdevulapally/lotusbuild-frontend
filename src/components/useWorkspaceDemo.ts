import { useEffect, useState, type RefObject } from 'react'

export const DEMO_STEPS = ['Reading request', 'Inspecting code', 'Writing changes', 'Checking results', 'Preview ready']

export default function useWorkspaceDemo(visible: boolean, sessionId: string, ref: RefObject<HTMLDivElement | null>) {
  const [inView, setInView] = useState(false)
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [step, setStep] = useState(0)
  const [guided, setGuided] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [ref])

  useEffect(() => {
    if (!visible || !inView || !playing || step === DEMO_STEPS.length - 1) return
    const timer = window.setTimeout(() => setStep((value) => value + 1), step === 2 ? 6500 : 4000)
    return () => window.clearTimeout(timer)
  }, [visible, inView, playing, step, sessionId])

  return {
    step, guided, playing: playing && step < DEMO_STEPS.length - 1,
    pause: () => setPlaying(false),
    explore: () => { setPlaying(false); setGuided(false) },
    toggle: () => setPlaying((value) => !value),
    replay: () => { setStep(0); setGuided(true); setPlaying(true) },
  }
}
