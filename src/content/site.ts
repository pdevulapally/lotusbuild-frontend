// Marketing copy is kept separate from presentation. Prices and allowances come
// from the backend catalogue, never from this file.
export const site = {
  name: "LotusBuild",
  headline: "Turn your ideas into software that works.",
  description:
    "LotusBuild brings AI, code, and a cloud desktop together — so agencies, first-time builders, and developers can build in one workspace.",
  navigation: [
    { label: "Home", href: "/#home" },
    { label: "Features", href: "/#features" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Plans", href: "/#plans" },
    { label: "FAQs", href: "/#questions" },
  ],
  audiences: ["Agencies", "First-time builders", "Developers"],
  features: [
    {
      eyebrow: "AI SOFTWARE BUILDER",
      title: "Start with what you want to build.",
      description:
        "Describe your idea in plain language. Work with an AI agent that can write files, run commands, and work through your project in a cloud environment.",
      points: [
        "Give your project a clear starting point",
        "Build and refine through conversation",
        "Keep code and execution in one workspace",
      ],
      visual: "workflow",
    },
    {
      eyebrow: "CLOUD DESKTOP",
      title: "See the work as it happens.",
      description:
        "Follow the agent inside its cloud desktop. See the browser, terminal, and development environment as your software takes shape.",
      points: [
        "A desktop running in an E2B sandbox",
        "View the agent’s desktop activity",
        "Preview your project as you iterate",
      ],
      visual: "desktop",
    },
    {
      eyebrow: "PROJECT WORKSPACE",
      title: "Give every idea a place to grow.",
      description:
        "Bring your projects into a personal workspace. Move between your ideas, review your work, and return to the project you want to build next.",
      points: [
        "Organise work around individual projects",
        "Keep project files together",
        "Choose a plan for your building needs",
      ],
      visual: "project",
    },
  ],
  steps: [
    {
      title: "Describe",
      description:
        "Start with an idea, the people it is for, and what you want your software to do.",
    },
    {
      title: "Build",
      description:
        "Work with an AI agent that can write code and use its own cloud development environment.",
    },
    {
      title: "Refine",
      description:
        "Review the preview, give feedback, and keep shaping the result around your needs.",
    },
  ],
  audienceCards: [
    {
      title: "For agencies.",
      description:
        "A workspace for turning client briefs into software projects.",
      points: [
        "Client ideas",
        "Project-based work",
        "Code and preview together",
      ],
    },
    {
      title: "For first-time builders.",
      description:
        "Begin with the problem you want to solve, and explain it in your own words.",
      points: [
        "Plain-language prompts",
        "A visible building process",
        "Room to experiment",
      ],
    },
    {
      title: "For developers.",
      description:
        "An AI-assisted environment with real files, commands, and a cloud desktop.",
      points: ["Source code", "Cloud execution", "Desktop visibility"],
    },
  ],
  faqs: [
    {
      question: "What is LotusBuild?",
      answer:
        "LotusBuild is a cloud-based software builder. It brings an AI agent, project files, and a cloud desktop together in a workspace for building software.",
    },
    {
      question: "Who is it for?",
      answer:
        "LotusBuild is being built for agencies, nontechnical builders, and developers. You can start with a plain-language brief or a more technical description of your project.",
    },
    {
      question: "Where does my project run?",
      answer:
        "The agent works inside an E2B cloud sandbox. Its environment includes the tools it needs to edit files, run commands, and operate a desktop.",
    },
    {
      question: "Can I watch the cloud desktop?",
      answer:
        "Yes. The desktop stream lets you watch the agent’s environment. The current customer desktop stream is view-only.",
    },
    {
      question: "What do the plans include?",
      answer:
        "The plan cards above show the current catalogue from the LotusBuild backend, including available capabilities and usage allowances. Included usage and hard limits may differ on paid plans.",
    },
    {
      question: "How do I access my account?",
      answer:
        "Create an account or sign in with your email and password, then verify your email to enter your personal workspace. Project creation and billing checkout are not connected in this frontend yet.",
    },
  ],
} as const;
