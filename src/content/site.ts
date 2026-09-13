import type { StageId } from './demo.ts'

export type Cta = {
  label: string
  href?: string
}

export const site = {
  name: 'LotusBuild',
  tagline: 'Turn ideas into working software.',
  description:
    'LotusBuild is a development platform for planning, building, previewing and iterating on real applications from one workspace.',
  flow: ['Plan', 'Build', 'Preview', 'Publish'],
} as const

export type Step = {
  id: StageId
  title: string
  body: string
  note?: string
}

export const hero = {
  headline: ['Turn ideas into', 'working software.'],
  primaryCta: { label: 'Start building' } satisfies Cta,
  secondaryCta: { label: 'See how it works' } satisfies Cta,
  navTags: ['Real code', 'Live preview'],
  loginCta: { label: 'Log in' } satisfies Cta,
  stepsLabel: 'How a LotusBuild session works',
  steps: [
    {
      id: 'plan',
      title: 'Plan',
      body: 'Describe what you want to make. LotusBuild turns it into a plan you can read and change before anything is built.',
    },
    {
      id: 'build',
      title: 'Build',
      body: 'It writes real code into a project you own. Every change arrives as a diff you can review.',
    },
    {
      id: 'preview',
      title: 'Preview',
      body: 'Run the app in a live preview and keep iterating in plain language.',
    },
    {
      id: 'publish',
      title: 'Publish',
      body: 'Ship it when it is ready.',
      note: 'Coming soon',
    },
  ] satisfies Step[],
  demoHint: 'Interactive — click a stage, or ask for a change in the composer.',
} as const
