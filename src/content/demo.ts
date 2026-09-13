export type FileChange = {
  path: string
  added: number
  removed: number
}

export type Step = {
  kind: 'read' | 'thought' | 'search' | 'ran'
  text: string
}

export type Message =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string }
  | { role: 'steps'; steps: Step[] }
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

export type Pane =
  | {
      kind: 'preview'
      url: string
      page: PreviewPage
      inspector: InspectorTarget[]
    }
  | { kind: 'diff'; files: string[]; lines: DiffLine[] }
  | {
      kind: 'plan'
      title: string
      sections: { heading: string; body: string }[]
      tasks: { text: string; done: boolean }[]
    }
  | { kind: 'building'; url: string; status: string }

export type DemoTask = {
  id: string
  title: string
  age: string
  summary: string
  stats?: { added: number; removed: number }
  messages: Message[]
  pane: Pane
}

export type InProgress = {
  summary: string
  messages: Message[]
  pane: Pane
  durationMs: number
}

export const workspace = {
  title: 'LotusBuild',
  resetLabel: 'Reset layout',
  groups: { active: 'In progress', done: 'Ready for review' },
  composer: {
    placeholder: 'Describe what to build or change…',
    mode: 'Build',
    context: 'Whole project',
  },
  cannedReply:
    'This is a preview of the LotusBuild workspace. Start building to run this on your own project.',
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

export const inProgress: InProgress = {
  summary: 'Generating preview…',
  durationMs: 4200,
  messages: [
    {
      role: 'user',
      text: 'Build a booking site for a photography studio: session types, an availability calendar and a booking form.',
    },
    {
      role: 'steps',
      steps: [
        { kind: 'thought', text: 'Planned 4 screens' },
        { kind: 'read', text: 'src/app/layout.tsx' },
        { kind: 'ran', text: 'Created src/app/booking/page.tsx' },
      ],
    },
    {
      role: 'assistant',
      text: 'Setting up the booking flow: a sessions grid, a calendar with 30-minute slots and a form that posts to /api/bookings. Starting the dev server for a live preview.',
    },
  ],
  pane: {
    kind: 'building',
    url: 'localhost:5173',
    status: 'Starting dev server…',
  },
}

export const tasks: DemoTask[] = [
  {
    id: 'booking',
    title: 'Studio booking site',
    age: 'now',
    summary:
      'Done. Sessions, calendar and booking form are wired up; the preview is live.',
    stats: { added: 214, removed: 0 },
    messages: [
      ...inProgress.messages,
      {
        role: 'files',
        files: [
          { path: 'src/app/booking/page.tsx', added: 96, removed: 0 },
          { path: 'src/components/Calendar.tsx', added: 74, removed: 0 },
          { path: 'src/app/api/bookings/route.ts', added: 44, removed: 0 },
        ],
      },
      {
        role: 'assistant',
        text: 'Done. Sessions, calendar and booking form are wired up and the preview is live. Want me to add email confirmations next?',
      },
    ],
    pane: {
      kind: 'preview',
      url: 'localhost:5173',
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
    id: 'checkout',
    title: 'Add card payments at checkout',
    age: '12m',
    summary: 'Added a payment step and server-side confirmation.',
    stats: { added: 148, removed: 12 },
    messages: [
      {
        role: 'user',
        text: 'Add card payments when a booking is confirmed. Keep the existing form, just add the payment step.',
      },
      {
        role: 'steps',
        steps: [
          { kind: 'read', text: 'src/app/api/bookings/route.ts' },
          { kind: 'search', text: 'payment provider setup' },
          { kind: 'thought', text: 'Thought 4s' },
        ],
      },
      {
        role: 'assistant',
        text: 'I added a payment step after the form and moved confirmation to the server so a booking is only saved once the charge succeeds.',
      },
      {
        role: 'files',
        files: [
          { path: 'src/lib/payments.ts', added: 62, removed: 0 },
          { path: 'src/app/api/bookings/route.ts', added: 38, removed: 12 },
          { path: 'src/components/PaymentStep.tsx', added: 48, removed: 0 },
        ],
      },
      {
        role: 'assistant',
        text: 'Ready for review. The diff is open on the right; test mode is enabled until you add live keys.',
      },
    ],
    pane: {
      kind: 'diff',
      files: ['route.ts', 'payments.ts', 'PaymentStep.tsx'],
      lines: [
        { kind: 'ctx', text: "import { db } from '@/lib/db'" },
        { kind: 'add', text: "import { createCharge } from '@/lib/payments'" },
        { kind: 'ctx', text: '' },
        { kind: 'ctx', text: 'export async function POST(req: Request) {' },
        { kind: 'ctx', text: '  const booking = await req.json()' },
        { kind: 'del', text: '  await db.bookings.insert(booking)' },
        { kind: 'del', text: '  return Response.json({ ok: true })' },
        { kind: 'add', text: '  const charge = await createCharge({' },
        { kind: 'add', text: '    amount: booking.price,' },
        { kind: 'add', text: '    token: booking.paymentToken,' },
        { kind: 'add', text: '  })' },
        { kind: 'add', text: '' },
        { kind: 'add', text: "  if (charge.status !== 'succeeded') {" },
        { kind: 'add', text: "    return Response.json({ error: 'Payment failed' }, { status: 402 })" },
        { kind: 'add', text: '  }' },
        { kind: 'add', text: '' },
        { kind: 'add', text: '  await db.bookings.insert({ ...booking, chargeId: charge.id })' },
        { kind: 'add', text: '  return Response.json({ ok: true, chargeId: charge.id })' },
        { kind: 'ctx', text: '}' },
      ],
    },
  },
  {
    id: 'portal',
    title: 'Plan: client portal',
    age: '25m',
    summary: 'Drafted a plan with 4 milestones. Two questions before building.',
    messages: [
      {
        role: 'user',
        text: 'Plan a client portal where customers can see upcoming sessions, download photos and reschedule.',
      },
      {
        role: 'steps',
        steps: [
          { kind: 'read', text: 'src/app/booking/page.tsx' },
          { kind: 'read', text: 'src/lib/db.ts' },
          { kind: 'thought', text: 'Thought 6s' },
        ],
      },
      {
        role: 'assistant',
        text: 'I drafted the plan on the right. Before I start: should clients log in with a magic link or a password, and do photo downloads need expiry?',
      },
    ],
    pane: {
      kind: 'plan',
      title: 'Client portal',
      sections: [
        {
          heading: 'Goal',
          body: 'Let clients see upcoming sessions, download delivered photos and reschedule without emailing the studio.',
        },
        {
          heading: 'Approach',
          body: 'Reuse the bookings table, add a clients table and a signed-URL download endpoint. Reschedule reuses the existing calendar component.',
        },
      ],
      tasks: [
        { text: 'Add clients table and login route', done: true },
        { text: 'Sessions list with reschedule action', done: false },
        { text: 'Photo gallery with signed downloads', done: false },
        { text: 'Email on reschedule', done: false },
      ],
    },
  },
  {
    id: 'mobile-nav',
    title: 'Fix mobile nav overflow',
    age: '48m',
    summary: 'Collapsed the nav into a menu below 640px.',
    stats: { added: 18, removed: 6 },
    messages: [
      {
        role: 'user',
        text: 'The nav links overflow on phones. Fix it.',
      },
      {
        role: 'steps',
        steps: [
          { kind: 'read', text: 'src/components/Nav.tsx' },
          { kind: 'ran', text: 'Checked preview at 375px' },
        ],
      },
      {
        role: 'assistant',
        text: 'The links were in a fixed-width row. Below 640px they now collapse into a menu button; the preview at 375px no longer scrolls horizontally.',
      },
      {
        role: 'files',
        files: [{ path: 'src/components/Nav.tsx', added: 18, removed: 6 }],
      },
    ],
    pane: {
      kind: 'diff',
      files: ['Nav.tsx', 'Nav.css'],
      lines: [
        { kind: 'ctx', text: 'export function Nav({ links }: NavProps) {' },
        { kind: 'add', text: '  const [open, setOpen] = useState(false)' },
        { kind: 'ctx', text: '  return (' },
        { kind: 'ctx', text: '    <nav className="nav">' },
        { kind: 'del', text: '      <ul className="nav-links">' },
        { kind: 'add', text: '      <button' },
        { kind: 'add', text: '        className="nav-toggle"' },
        { kind: 'add', text: '        aria-expanded={open}' },
        { kind: 'add', text: '        onClick={() => setOpen((v) => !v)}' },
        { kind: 'add', text: '      >' },
        { kind: 'add', text: '        Menu' },
        { kind: 'add', text: '      </button>' },
        { kind: 'add', text: "      <ul className={open ? 'nav-links open' : 'nav-links'}>" },
        { kind: 'ctx', text: '        {links.map((link) => (' },
        { kind: 'ctx', text: '          <li key={link.href}>' },
        { kind: 'del', text: '            <a href={link.href}>{link.label}</a>' },
        { kind: 'add', text: '            <a href={link.href} onClick={() => setOpen(false)}>' },
        { kind: 'add', text: '              {link.label}' },
        { kind: 'add', text: '            </a>' },
        { kind: 'ctx', text: '          </li>' },
        { kind: 'ctx', text: '        ))}' },
      ],
    },
  },
]

export const terminal = {
  title: 'Preview build',
  prompt: '~/northlight-studio',
  lines: [
    { text: 'Installing dependencies…', tone: 'dim' },
    { text: 'added 212 packages in 6s', tone: 'ok' },
    { text: 'Type-checking 38 files…', tone: 'dim' },
    { text: 'No type errors', tone: 'ok' },
    { text: 'Building for preview…', tone: 'dim' },
    { text: 'dist/assets/index-3f9c.js   142 kB', tone: 'plain' },
    { text: 'dist/assets/index-8a1e.css   11 kB', tone: 'plain' },
    { text: 'Preview ready on http://localhost:5173', tone: 'accent' },
  ],
} as const

export type TerminalLine = (typeof terminal.lines)[number]
