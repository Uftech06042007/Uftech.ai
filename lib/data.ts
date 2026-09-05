export type ServiceVisualKind = "agents" | "genai" | "copilots" | "automation" | "governance" | "mlops";

export interface ServiceItem {
  k: string;
  t: string;
  // Optional real screen-capture video — takes priority over the 3D scene.
  video?: string;
  // Slight zoom-out (e.g. 0.98) for clips whose edge content is otherwise
  // cropped tight by the default cover fit. Defaults to 1 (no zoom).
  videoZoom?: number;
  visual: ServiceVisualKind;
  b: string;
  l: string[];
  s1: string;
  s1l: string;
  s2: string;
  s2l: string;
}

export const SERVICES: ServiceItem[] = [
  {
    k: "01 / Agents",
    t: "Custom AI Agents",
    video: "/videos/custom-agent.mp4",
    visual: "agents",
    b: "Agents that plan, reason and act across your workflows — sourcing candidates, answering customers, triaging requests — wired into the platforms your team already uses, with every step logged and auditable.",
    l: [
      "Multi-step task orchestration",
      "Tool-use & API integration",
      "Long-running task memory",
      "Guardrails & per-step audit trails",
    ],
    s1: "8×",
    s1l: "Throughput vs. manual work",
    s2: "24/7",
    s2l: "Always-on operation",
  },
  {
    k: "02 / GenAI",
    t: "GenAI & RAG Systems",
    video: "/videos/ai-rag.mp4",
    visual: "genai",
    b: "GenAI grounded in real business data. We build retrieval-augmented systems over your documents, policies and databases, so models answer from facts, cite their sources, and rank answers you can trust to production.",
    l: [
      "Semantic search & RAG",
      "Vector retrieval on Postgres / PG Vector",
      "Document & database loaders",
      "Eval harness before rollout",
    ],
    s1: "92%",
    s1l: "Answer accuracy in RAG evals",
    s2: "11",
    s2l: "Document families live",
  },
  {
    k: "03 / Copilots",
    t: "AI Copilots",
    video: "/videos/ai-copilot.mp4",
    visual: "copilots",
    b: "Personal AI assistants embedded in the tools your people already open — drafting, summarizing, fetching, generating. We ground them in your own knowledge so they answer your way, and stay quiet when they lack evidence.",
    l: [
      "In-app assistants & chat",
      "Enterprise knowledge grounding",
      "Role-based fine-tuning",
      "Human-in-the-loop review",
    ],
    s1: "65%",
    s1l: "Time saved on routine work",
    s2: "0",
    s2l: "Ungrounded answers shipped",
  },
  {
    k: "04 / Automation",
    t: "Enterprise Automation",
    video: "/videos/ai-business_automation.mp4",
    visual: "automation",
    b: "Intelligent automation of business processes start to finish — onboarding, payroll orchestration, claims and data reconciliation — removing manual handoffs and error while keeping a clean audit trail.",
    l: [
      "Process mapping & optimisation",
      "Workflow & report automation",
      "Batch & event-driven runs",
      "Metrics & exception queues",
    ],
    s1: "−40%",
    s1l: "Cost of routine workflows",
    s2: "6",
    s2l: "Systems integrated",
  },
  {
    k: "05 / Risk AI",
    t: "Risk & Fraud Intelligence",
    video: "/videos/ai-fraud.mp4",
    visual: "governance",
    b: "AI that flags fraud as it happens and scores creditworthiness at the point of decision — trained on your transaction and repayment data, tuned to your risk appetite, and explainable enough for auditors and regulators.",
    l: [
      "Real-time fraud & anomaly detection",
      "Credit scoring & underwriting models",
      "Explainable risk decisioning",
      "Regulatory & audit-ready reporting",
    ],
    s1: "−60%",
    s1l: "Fraud losses caught early",
    s2: "<200ms",
    s2l: "Real-time scoring latency",
  },
  {
    k: "06 / Deployment",
    t: "Model Deployment & MLOps",
    video: "/videos/ai-mlops.mp4",
    visual: "mlops",
    b: "Production deployment of your models and agents — containerised, versioned, and served on infrastructure you control. We own uptime, rollback and monitoring, so your team never has to.",
    l: [
      "Containerised deployment",
      "Model registry & versioning",
      "Rollback & canary releases",
      "Serving uptime monitoring",
    ],
    s1: "99.9%",
    s1l: "Served uptime",
    s2: "<2m",
    s2l: "Rollback time",
  },
];

export const SHORT: string[] = [
  "Agents that plan, reason and act across your workflows.",
  "GenAI grounded in your documents and data.",
  "Copilots embedded in the tools people already use.",
  "Automation that removes manual, repetitive work.",
  "Real-time fraud detection and credit risk scoring.",
  "Containerised, versioned deployment with rollback.",
];

/* ---------- Named tools that sit above the service cards ---------- */
/* These are products a visitor can go and use, not engagements we scope — so
   they lead the services section as their own tier rather than joining the six
   cards below, which all open a detail panel instead of leaving the site. */

export interface FeaturedService {
  /* Short label above the title, in place of the service cards’ numbering. */
  badge: string;
  t: string;
  b: string;
  href: string;
  cta: string;
}

export const FEATURED_SERVICES: FeaturedService[] = [
  {
    badge: "AI tool",
    t: "Build Your CV",
    b: "Rewrite and restructure your CV for the role you are going after, step by step, and take the finished version away with you.",
    href: "https://uftech.in/enhance-cv",
    cta: "Build your CV",
  },
  {
    badge: "AI tool",
    t: "AI Interview",
    b: "Sit a practice interview with an AI that asks what the role would ask, then tells you how your answers landed.",
    href: "https://uftech.in/mock-interview",
    cta: "Try AI Interview",
  },
];

export type ProductVisualKind = "talent-crm" | "talent" | "hrms" | "crm" | "support-bots";

export interface ProductFeat {
  t: string;
  d: string;
}

export interface ProductItem {
  k: string;
  t: string;
  tag: string;
  // A self-contained HTML reel of the real product, embedded in the card.
  // Takes priority over both the video and the 3D scene.
  demo?: string;
  // Optional real screen-capture video — takes priority over the 3D scene.
  video?: string;
  visual: ProductVisualKind;
  short: string;
  chips: string[];
  feats: ProductFeat[];
  s1: string;
  s1l: string;
  s2: string;
  s2l: string;
}

export const PRODUCTS: ProductItem[] = [
  {
    k: "01 / Talent + CRM",
    t: "AI Talent & CRM",
    tag: "PRODUCT · TALENT & CRM",
    demo: "/demos/ta-crm-loop.html",
    visual: "talent-crm",
    short: "Hire the team, then run the pipeline — sourcing and revenue in one product.",
    chips: ["AI sourcing", "Resume screening", "Lead scoring", "Pipeline forecasting"],
    feats: [
      { t: "Auto-screen", d: "fit-scored shortlists" },
      { t: "Interview ops", d: "scheduler built in" },
      { t: "Lead intake", d: "dedupe & route" },
      { t: "Forecast", d: "pipeline made visible" },
    ],
    s1: "−45%",
    s1l: "Time-to-hire",
    s2: "28%",
    s2l: "Faster sales cycle",
  },
  {
    k: "02 / HRMS & Compliance",
    t: "AI HRMS & Compliance",
    tag: "PRODUCT · AI HRMS & COMPLIANCE",
    demo: "/demos/hrms-chatbot-loop.html",
    visual: "hrms",
    short: "From onboarding to payroll to statutory filings, one system. Humans handled, compliance covered.",
    chips: [
      "Payroll automation",
      "Attendance & leave",
      "Performance cycles",
      "Employee self-service",
      "Statutory compliance",
    ],
    feats: [
      { t: "Lifecycle", d: "onboard to offboard" },
      { t: "Payroll", d: "payslips in one tap" },
      { t: "Appraisals", d: "continuous review loops" },
      { t: "People analytics", d: "headcount pulses" },
      { t: "Compliance", d: "PF, ESI, TDS tracked & filed" },
      { t: "Audit trail", d: "every change logged" },
    ],
    s1: "35%",
    s1l: "Less admin time",
    s2: "10k+",
    s2l: "Employees managed",
  },
  {
    k: "03 / Finance Bot",
    t: "AI Finance Bot",
    tag: "PRODUCT · CONVERSATIONAL AI",
    demo: "/demos/finance-bot-loop.html",
    visual: "support-bots",
    short: "A conversational agent for Procure-to-Pay — vendor invoice status and issue handling, on demand.",
    chips: ["Vendor invoice status", "P2P query handling", "Auto-escalation", "24/7, human handoff"],
    feats: [
      { t: "Invoice status", d: "due, blocked, paid, or debit balance — on request" },
      { t: "Auto-escalation", d: "emails finance staff the moment an invoice issue is flagged" },
      { t: "P2P guidance", d: "walks vendors & staff through invoice issues, e.g. payment disputes" },
      { t: "Natural language", d: "handles free text, typos and phrasing without a rigid form" },
    ],
    s1: "24/7",
    s1l: "Vendor query coverage",
    s2: "70%",
    s2l: "Fewer hours on manual follow-ups",
  },
];

export interface Stage {
  num: string;
  t: string;
  b: string;
}

export const STAGES: Stage[] = [
  {
    num: "Stage 01",
    t: "Diagnose",
    b: "Two weeks inside your data and your workflows. An honest verdict on what AI will move — and where it will not pay.",
  },
  {
    num: "Stage 02",
    t: "Prototype",
    b: "A working, grounded AI on one real workflow, against one measurable number you want to beat.",
  },
  {
    num: "Stage 03",
    t: "Embed",
    b: "Rollout, evaluation, guardrails and an audit trail — then into the hands of the team that owns the outcome.",
  },
  {
    num: "Stage 04",
    t: "Operate",
    b: "We run it, or we train your people to. Either way, the plan is written down before we start.",
  },
  {
    num: "Stage 05",
    t: "Support",
    b: "Launch isn't the finish line. We stay on for monitoring, patches and SLA-backed fixes, so what we build keeps working long after go-live.",
  },
];

export const INDUSTRIES: string[] = [
  "BFSI",
  "Healthcare",
  "Manufacturing",
  "FMCG",
  "Pharmacy",
  "Education",
  "Enterprises",
  "Startups",
];

/* ---------- About page ---------- */

export interface AboutStat {
  n: string;
  l: string;
}

export const ABOUT_STATS: AboutStat[] = [
  { n: "400+", l: "Global employees" },
  { n: "4.5M+", l: "Man-hours delivered" },
  { n: "2003", l: "In operation since" },
  { n: "9001:2015", l: "ISO certified" },
];

export interface AboutStrength {
  k: string;
  t: string;
  b: string;
}

export const ABOUT_STRENGTHS: AboutStrength[] = [
  { k: "01", t: "Reliable & trusted", b: "Over 20 years of experience providing excellent service and building strong relationships." },
  { k: "02", t: "Cost-effective pricing", b: "Competitive pricing that offers great value without sacrificing quality." },
  { k: "03", t: "Customised solutions", b: "We tailor services and products to meet your unique needs and specifications." },
  { k: "04", t: "Mature delivery", b: "ISO 9001:2015 certified, with a predictable, mature delivery process." },
];

/* ---------- Contact page ---------- */

export const CONTACT_HELP_OPTIONS: string[] = [
  "AI Services",
  "Engineering Services",
  "Talent Acquisition",
  "Software Services",
  "Manufacturing Solutions",
  "General inquiry",
  "Press/partnerships",
];
