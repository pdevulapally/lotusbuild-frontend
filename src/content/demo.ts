export type StageId = 'plan' | 'build' | 'preview' | 'publish'

export type FileChange = {
  path: string
  added: number
  removed: number
}

export type AgentStep = {
  kind: 'read' | 'thought' | 'search' | 'ran'
  text: string
}

export type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string }
  | { role: 'steps'; steps: AgentStep[] }
  | { role: 'files'; files: FileChange[] }

export type PreviewPage = {
  brand: string
  nav: string[]
  headline: string
  sub: string
  cta: string
  cards: { title: string; meta: string }[]
}

export type InspectorTarget = {
  target: 'brand' | 'headline' | 'cta' | 'card'
  label: string
}

export type DiffLine = {
  kind: 'ctx' | 'add' | 'del'
  text: string
}

export type LogLine = {
  text: string
  tone: 'dim' | 'ok' | 'plain' | 'accent'
}

export type Artifact =
  | {
      kind: 'plan'
      title: string
      sections: { heading: string; body: string }[]
      tasks: string[]
    }
  | {
      kind: 'build'
      files: FileChange[]
      activeFile: string
      lines: DiffLine[]
      command: string
      log: LogLine[]
    }
  | {
      kind: 'preview'
      url: string
      startingStatus: string
      startingMs: number
      page: PreviewPage
      inspector: InspectorTarget[]
    }
  | { kind: 'publish'; title: string; body: string; action: string }

export type Stage = {
  id: StageId
  label: string
  /** Sub-label while the agent is on this stage. */
  working: string
  /** Sub-label once the agent has moved past (or finished) this stage. */
  done: string
  /** Sub-label before the agent reaches this stage. */
  pending: string
  /** How long the agent stays here before advancing; 0 = never auto-advances. */
  durationMs: number
  messages: Message[]
  artifact: Artifact
}

export const session = {
  kicker: 'Session',
  name: 'Northlight Studio booking site',
  status: {
    working: 'Agent working',
    idle: 'Waiting for you',
  },
  replayLabel: 'Replay',
  railLabel: 'Conversation',
  agentName: 'LotusBuild',
  composer: {
    placeholder: 'Ask for a change…',
    hint: 'Enter to send',
    send: 'Send',
  },
  cannedReply:
    'This is a preview of a LotusBuild session. Start building to run it on your own project.',
} as const

export const bookingPage: PreviewPage = {
  brand: 'Northlight Studio',
  nav: ['Sessions', 'Portfolio', 'About'],
  headline: 'Portrait sessions, booked in a minute.',
  sub: 'Pick a slot, tell us about the shoot and we will handle the rest.',
  cta: 'Book a session',
  cards: [
    { title: 'Portrait', meta: '60 min · Studio' },
    { title: 'Family', meta: '90 min · Studio or outdoor' },
    { title: 'Headshots', meta: '30 min · Studio' },
  ],
}

const files: FileChange[] = [
  { path: 'src/app/booking/page.tsx', added: 96, removed: 0 },
  { path: 'src/components/Calendar.tsx', added: 74, removed: 0 },
  { path: 'src/app/api/bookings/route.ts', added: 44, removed: 0 },
]

export const stages: Stage[] = [
  {
    id: 'plan',
    label: 'Plan',
    working: 'Planning…',
    done: 'Plan ready',
    pending: '',
    durationMs: 3400,
    messages: [
      {
        role: 'user',
        text: 'Build a booking site for a photography studio: session types, an availability calendar and a booking form.',
      },
      {
        role: 'steps',
        steps: [
          { kind: 'read', text: 'src/app/layout.tsx' },
          { kind: 'read', text: 'src/lib/db.ts' },
          { kind: 'thought', text: 'Planned 4 screens' },
        ],
      },
      {
        role: 'assistant',
        text: 'Plan is ready: a sessions grid, a calendar with 30-minute slots and a booking form that posts to /api/bookings. Starting the build.',
      },
    ],
    artifact: {
      kind: 'plan',
      title: 'Studio booking site',
      sections: [
        {
          heading: 'Goal',
          body: 'Let visitors pick a session type, see open slots and book without emailing the studio.',
        },
        {
          heading: 'Approach',
          body: 'One booking page with three parts. Availability comes from the existing bookings table; the form posts to a new API route that rejects taken slots.',
        },
      ],
      tasks: [
        'Session types grid',
        'Availability calendar with 30-minute slots',
        'Booking form posting to /api/bookings',
        'Confirmation state',
      ],
    },
  },
  {
    id: 'build',
    label: 'Build',
    working: 'Writing code…',
    done: '3 files · +214',
    pending: '',
    durationMs: 5600,
    messages: [
      {
        role: 'steps',
        steps: [
          { kind: 'ran', text: 'Created src/app/booking/page.tsx' },
          { kind: 'ran', text: 'Created src/components/Calendar.tsx' },
          { kind: 'ran', text: 'Created src/app/api/bookings/route.ts' },
        ],
      },
      { role: 'files', files },
    ],
    artifact: {
      kind: 'build',
      files,
      activeFile: 'src/app/api/bookings/route.ts',
      lines: [
        { kind: 'ctx', text: "import { db } from '@/lib/db'" },
        { kind: 'add', text: "import { openSlots } from '@/lib/availability'" },
        { kind: 'ctx', text: '' },
        { kind: 'ctx', text: 'export async function POST(req: Request) {' },
        { kind: 'add', text: '  const booking = await req.json()' },
        { kind: 'add', text: '  const slots = await openSlots(booking.date)' },
        { kind: 'add', text: '' },
        { kind: 'add', text: '  if (!slots.includes(booking.time)) {' },
        { kind: 'add', text: "    return Response.json({ error: 'Slot taken' }, { status: 409 })" },
        { kind: 'add', text: '  }' },
        { kind: 'add', text: '' },
        { kind: 'add', text: '  const saved = await db.bookings.insert(booking)' },
        { kind: 'add', text: '  return Response.json({ ok: true, id: saved.id })' },
        { kind: 'ctx', text: '}' },
      ],
      command: 'npm run build',
      log: [
        { text: 'Type-checking 38 files…', tone: 'dim' },
        { text: 'No type errors', tone: 'ok' },
        { text: 'Building for preview…', tone: 'dim' },
        { text: 'dist/assets/index-3f9c.js   142 kB', tone: 'plain' },
        { text: 'Preview ready on http://localhost:5173', tone: 'accent' },
      ],
    },
  },
  {
    id: 'preview',
    label: 'Preview',
    working: 'Starting preview…',
    done: 'Live · localhost:5173',
    pending: '',
    durationMs: 0,
    messages: [
      {
        role: 'assistant',
        text: 'The preview is live. Sessions, calendar and booking form are wired up — want me to add email confirmations next?',
      },
    ],
    artifact: {
      kind: 'preview',
      url: 'localhost:5173/booking',
      startingStatus: 'Starting dev server…',
      startingMs: 1600,
      page: bookingPage,
      inspector: [
        { target: 'headline', label: 'Hero · h1' },
        { target: 'cta', label: 'BookButton · button' },
        { target: 'card', label: 'SessionCard · article' },
        { target: 'brand', label: 'Nav · a' },
      ],
    },
  },
  {
    id: 'publish',
    label: 'Publish',
    working: '',
    done: 'Coming soon',
    pending: 'Coming soon',
    durationMs: 0,
    messages: [],
    artifact: {
      kind: 'publish',
      title: 'Publishing is coming to LotusBuild.',
      body: 'Ship the project from the same session once it is ready. Until then, everything the agent writes lives in a project you own.',
      action: 'Publish',
    },
  },
]

/** Index of the last stage the agent actually runs through. */
export const LAST_AGENT_STAGE = stages.findIndex((s) => s.id === 'preview')
