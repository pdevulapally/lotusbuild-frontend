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

export const hero = {
  headline:
    'LotusBuild is the workspace that turns your ideas into working software.',
  primaryCta: { label: 'Start building' } satisfies Cta,
  secondaryCta: { label: 'See how it works' } satisfies Cta,
  navTags: ['Real code', 'Live preview'],
  loginCta: { label: 'Log in' } satisfies Cta,
} as const
