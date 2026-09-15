import { PRODUCTS, SERVICES, type ProductItem, type ServiceItem } from "@/lib/data";

/**
 * Search-facing copy for the per-service and per-product pages.
 *
 * Why this is not in lib/data.ts: that file is the grounding context for the
 * chatbot and the homepage, and it is deliberately terse — a card headline and
 * four bullets. A page that is meant to rank needs several hundred words on the
 * subject, which would drown the prompt in prose and be paid for on every chat
 * turn.
 *
 * What keeps the two honest is `key`: it must match a `k` in SERVICES or
 * PRODUCTS exactly, the join is checked at module load (see `joinOrThrow`), and
 * tests/seo.test.ts asserts the two sets line up in both directions. Nothing
 * here restates a claim from lib/data.ts — it expands on one.
 *
 * Copy rules, same as the assistant's: no pricing, no delivery timelines, no
 * client names, no guarantees beyond the Support stage in STAGES.
 */

export interface PageSection {
  t: string;
  p: string[];
}

export interface Faq {
  q: string;
  a: string;
}

export interface SeoPage {
  /** Must equal the `k` of the SERVICES / PRODUCTS entry this page is about. */
  key: string;
  slug: string;
  /** The <title>. Leads with the query, not the brand. */
  title: string;
  description: string;
  /** The on-page <h1>. Shorter and more human than the <title>. */
  h1: string;
  /** One-sentence standfirst under the h1. */
  lede: string;
  sections: PageSection[];
  faqs: Faq[];
}

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export const SERVICE_PAGES: SeoPage[] = [
  {
    key: "01 / Agents",
    slug: "custom-ai-agents",
    title: "Custom AI Agent Development Services",
    description:
      "We build custom AI agents that plan, reason and act across enterprise workflows — tool use, API integration, long-running memory, guardrails and a per-step audit trail.",
    h1: "Custom AI agent development",
    lede: "Agents that do the work, not just describe it — wired into the systems your team already uses.",
    sections: [
      {
        t: "What a production agent actually is",
        p: [
          "A chatbot answers a question. An agent decides what to do about it: it breaks a goal into steps, chooses a tool for each step, calls it, reads the result, and keeps going until the task is finished or it hits a limit you set. The difference matters commercially, because only the second one removes work from somebody's day.",
          "That autonomy is also the risk, which is why everything we build logs each step — the plan, the tool called, the arguments, the result, the decision that followed. When a colleague asks why the agent did something, the answer is a record rather than a guess.",
        ],
      },
      {
        t: "Where we wire them in",
        p: [
          "An agent is only as useful as the systems it can reach. We integrate against the APIs you already run — ATS and CRM, ticketing, ERP, payroll, internal databases and document stores — so the agent works inside your stack instead of asking people to copy data into a new one.",
          "Long-running work is handled as long-running work: tasks that span hours or days keep their own memory and resume where they left off, rather than starting from an empty context every time someone re-opens a window.",
        ],
      },
      {
        t: "Guardrails before autonomy",
        p: [
          "Every agent ships with limits that are written down before it runs: which tools it may call, which actions need a human to approve, what it must refuse, and what happens when it is unsure. Escalation to a person is a designed path, not a failure mode.",
          "We evaluate agents the way we evaluate models — against a fixed set of real tasks with known-good outcomes — so a prompt change that quietly makes things worse shows up before your users find it.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is the difference between an AI agent and a chatbot?",
        a: "A chatbot returns an answer. An agent plans a sequence of steps, calls tools and APIs to carry them out, checks the results and continues until the task is done. Agents change the state of your systems; chatbots describe it.",
      },
      {
        q: "Can an AI agent work with our existing software?",
        a: "Yes — that is the normal case. We integrate through the APIs of the platforms you already run, such as your ATS, CRM, ticketing, ERP or internal databases, so the agent operates inside your current stack rather than replacing it.",
      },
      {
        q: "How do you stop an AI agent from doing something it shouldn't?",
        a: "Through guardrails defined before it runs: an explicit list of tools it may use, actions that require human approval, and rules for what it must refuse or escalate. Every step it takes is logged, so any action can be traced after the fact.",
      },
      {
        q: "How do you know the agent is working?",
        a: "We run it against a fixed evaluation set of real tasks with known outcomes, and re-run that set on every change. In production the same per-step logs feed monitoring, so accuracy and failure rates are measured rather than assumed.",
      },
    ],
  },
  {
    key: "02 / GenAI",
    slug: "genai-rag-systems",
    title: "GenAI & RAG System Development Services",
    description:
      "Retrieval-augmented generation built on your own documents, policies and databases. Semantic search, vector retrieval on Postgres and pgvector, and an eval harness before rollout.",
    h1: "GenAI and RAG system development",
    lede: "Generative AI that answers from your facts, cites where they came from, and says nothing when it has no evidence.",
    sections: [
      {
        t: "Why retrieval, and not fine-tuning first",
        p: [
          "A general model knows the internet as of its training cut-off. It does not know your pricing policy, last quarter's board pack or the clause in your own contract template — and asked about them, it will produce something plausible. Retrieval-augmented generation fixes that by fetching the relevant passages from your own corpus first and requiring the model to answer from them.",
          "The practical payoff is traceability. Because the answer is assembled from retrieved passages, every claim can carry a citation back to the source document, which is what makes the output usable in regulated and audited settings.",
        ],
      },
      {
        t: "Building the retrieval layer",
        p: [
          "We load and chunk your documents, policies and database records, embed them, and index them for semantic search — commonly on Postgres with pgvector, so the vector store is the database your team already backs up, monitors and secures rather than a new system to operate.",
          "Retrieval quality is where most RAG projects are won or lost, so it gets the attention: chunking strategy, hybrid keyword-plus-vector search, re-ranking, and metadata filters that keep a user's results inside what their role is allowed to see.",
        ],
      },
      {
        t: "Evaluated before it ships",
        p: [
          "Before a RAG system goes anywhere near users, it is scored against a question set drawn from the real corpus with answers your subject experts agree on. That harness stays in place afterwards, so a change to chunking, a model swap or a prompt edit is measured rather than hoped about.",
          "Abstention is treated as a correct answer. A system that says it cannot find the answer is far more valuable to an enterprise than one that fills the gap with something convincing.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is retrieval-augmented generation (RAG)?",
        a: "RAG retrieves the passages most relevant to a question from your own documents or databases, then has the model answer using only those passages. Because the answer is grounded in retrieved text, it can cite its sources and can decline when nothing relevant is found.",
      },
      {
        q: "Do we need to fine-tune a model to use our own data?",
        a: "Usually not, and rarely first. Retrieval gets your current data into the answer without retraining, updates the moment a document changes, and shows its sources. Fine-tuning is worth considering for tone and task format, not for facts.",
      },
      {
        q: "Which vector database do you use?",
        a: "Most often Postgres with pgvector, so retrieval lives in a database your team already runs, backs up and secures. Where a workload genuinely needs a dedicated vector store, we will say so rather than add one by default.",
      },
      {
        q: "How do you stop a GenAI system from hallucinating?",
        a: "By grounding answers in retrieved passages, requiring citations, and instructing the system to abstain when retrieval returns nothing relevant. An evaluation harness then measures how often it answers correctly, wrongly, or not at all before rollout and after every change.",
      },
    ],
  },
  {
    key: "03 / Copilots",
    slug: "ai-copilots",
    title: "AI Copilot Development for Enterprise Teams",
    description:
      "AI copilots embedded in the tools your people already use, grounded in your own knowledge base, with role-based behaviour and human-in-the-loop review.",
    h1: "AI copilot development",
    lede: "An assistant inside the tool people already have open, grounded in what your company actually knows.",
    sections: [
      {
        t: "Adoption comes from placement",
        p: [
          "The reason most internal AI assistants go unused is not the model — it is the extra tab. A copilot earns its keep when it appears in the application where the work is already happening: the CRM record, the ticket, the document, the admin console.",
          "So we build copilots as embedded surfaces in your own products and internal tools, with the context of the screen already loaded. The user does not restate who the customer is or which policy applies; the copilot can already see it.",
        ],
      },
      {
        t: "Grounded, and role-aware",
        p: [
          "A copilot is only trusted if it answers from your material. We ground them in your knowledge base, policies and product documentation — the same retrieval approach behind our RAG work — so answers reflect your organisation rather than a general impression of your industry.",
          "Behaviour is shaped per role, because a support agent, an account manager and a finance approver need different defaults, different tone and different data. What each role may retrieve is enforced at the retrieval layer, not asked for politely in a prompt.",
        ],
      },
      {
        t: "A human stays in the loop",
        p: [
          "Drafting, summarising, fetching and generating are the tasks copilots do best, and all four end with a person deciding. We design for that: output is proposed, editable and attributable, never silently committed on someone's behalf.",
          "Where a copilot lacks evidence, it says so. Staying quiet is a deliberate behaviour, and it is what keeps people willing to rely on it for the answers it does give.",
        ],
      },
      {
        t: "Measured on use, not on impressions",
        p: [
          "The honest measure of a copilot is whether the work it touches gets done faster and to the same standard — not how many people opened it in week one. We instrument acceptance: how often a draft is used as-is, edited, or discarded, and which tasks account for each.",
          "That signal is what drives the next iteration. A prompt or retrieval change is evaluated against the same task set every time, so improvement is a number the team can see rather than an impression somebody formed in a demo.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is an AI copilot?",
        a: "An assistant embedded in an application your team already uses, which drafts, summarises, retrieves and generates in the context of what is on screen. Unlike a standalone chatbot, it starts with the record, ticket or document already in view.",
      },
      {
        q: "Can a copilot be added to our existing internal software?",
        a: "Yes. A copilot is normally built as a surface inside your current product or internal tool, using its APIs for context and actions, so people do not have to move to a separate application to use it.",
      },
      {
        q: "How do you keep a copilot from exposing data a user shouldn't see?",
        a: "Permissions are enforced where retrieval happens, so a user's role determines which documents and records can be fetched at all. The model never gets the chance to decline access to something it was already handed.",
      },
      {
        q: "What happens when the copilot doesn't know the answer?",
        a: "It says so. Copilots we build are instructed to abstain rather than improvise when grounding evidence is missing, and to point the user to a person or source instead.",
      },
    ],
  },
  {
    key: "04 / Automation",
    slug: "enterprise-ai-automation",
    title: "Enterprise AI Automation Services",
    description:
      "End-to-end automation of business processes with AI in the loop — onboarding, payroll orchestration, claims and reconciliation — with exception queues and a clean audit trail.",
    h1: "Enterprise AI automation",
    lede: "Whole processes automated end to end, with the exceptions routed to people instead of hidden from them.",
    sections: [
      {
        t: "Map the process before automating it",
        p: [
          "Automating a broken process makes it fail faster. We start by mapping the real one — including the spreadsheet step nobody documented and the approval that happens over chat — and then decide what should be removed, what should be automated, and what genuinely needs a person.",
          "That map is also the business case. It shows where the handoffs, the rework and the waiting are, which is usually a more honest guide to where automation pays than a list of tasks people say they dislike.",
        ],
      },
      {
        t: "Where AI adds something RPA cannot",
        p: [
          "Classical automation handles structured, deterministic steps well. It struggles the moment an input is an email in free text, a scanned invoice with a layout it has not seen, or a case that needs judgement. That is the part AI takes: classification, extraction, matching and summarisation over messy inputs, feeding the deterministic steps either side of it.",
          "Runs are both scheduled and event-driven, so a process can be a nightly batch, a reaction to a webhook, or both, without being rebuilt for each.",
        ],
      },
      {
        t: "Exceptions are a feature",
        p: [
          "No automated process is right one hundred per cent of the time, and the dangerous designs are the ones that pretend otherwise. Everything we build has an exception queue: cases the system is not confident about are held, surfaced with the reason, and routed to the person who can settle them.",
          "Metrics come as standard — volume processed, exception rate, time saved, cost per run — because a process nobody measures quietly degrades, and an audit trail of every change is what keeps the whole thing defensible later.",
        ],
      },
    ],
    faqs: [
      {
        q: "How is AI automation different from RPA?",
        a: "RPA repeats a fixed sequence of deterministic steps. AI automation handles the parts RPA cannot — reading unstructured documents and email, classifying, extracting, matching and judging — and hands the structured result back to the deterministic steps around it. In practice the two are used together.",
      },
      {
        q: "Which processes are worth automating first?",
        a: "The ones that are high volume, rules-heavy, and currently held together by manual handoffs — onboarding, payroll orchestration, claims handling and data reconciliation are common starting points. Process mapping is what identifies the right first candidate in your own organisation.",
      },
      {
        q: "What happens when the automation isn't sure?",
        a: "The case goes to an exception queue with the reason it was held, and a person decides. Confidence thresholds are set deliberately, so uncertainty surfaces as a review task rather than as a silently wrong outcome.",
      },
      {
        q: "Can automated processes be audited?",
        a: "Yes. Every run, decision and change is logged, so any individual case can be reconstructed after the fact — which is normally a requirement wherever the process touches payroll, statutory filings or customer money.",
      },
    ],
  },
  {
    key: "05 / Risk AI",
    slug: "ai-fraud-detection-risk",
    title: "AI Fraud Detection & Credit Risk Scoring",
    description:
      "Real-time fraud and anomaly detection, credit scoring and underwriting models, explainable risk decisioning and audit-ready reporting — trained on your own transaction data.",
    h1: "AI fraud detection and credit risk intelligence",
    lede: "Fraud flagged as it happens and credit scored at the point of decision — with reasons an auditor will accept.",
    sections: [
      {
        t: "Trained on your data, tuned to your appetite",
        p: [
          "Fraud patterns and credit behaviour are specific to a book of business. A model trained on somebody else's transactions will find somebody else's fraud, which is why we build on your transaction, application and repayment history rather than shipping a generic scorer.",
          "Thresholds are a business decision, not a technical one. False positives cost customer friction and review capacity; false negatives cost money. We tune the operating point with the people who own that trade-off, and make it adjustable afterwards.",
        ],
      },
      {
        t: "Real time means at the point of decision",
        p: [
          "A score that arrives after the payment has settled is a report, not a control. These models are served inline — scoring within the decision window, so a transaction can be held, stepped up or declined while it still can be.",
          "Anomaly detection runs alongside supervised scoring, because the useful signal in fraud is often the pattern nobody has labelled yet.",
        ],
      },
      {
        t: "Explainable, because it has to be",
        p: [
          "In lending and payments, a decision you cannot explain is a decision you may not be allowed to make. Every score comes with the factors that drove it, in terms a reviewer, a customer-facing team and a regulator can each read.",
          "Reporting is built for audit from the start: model versions, training data lineage, threshold changes and individual decisions are all recorded, so a review months later has something to look at.",
        ],
      },
      {
        t: "The review queue is part of the design",
        p: [
          "Every flagged transaction that is not auto-declined lands with a human, and the quality of that queue decides whether the model is an asset or an overhead. We design it to carry the reason for the flag and the comparable history, so a reviewer can settle a case rather than start an investigation.",
          "Those decisions feed back as labels. A review queue that records why an analyst overruled the model is the cheapest source of training data a fraud team has, and it is normally the difference between a model that ages well and one that quietly stops earning its keep.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can AI detect fraud in real time?",
        a: "Yes — models are served inline so a transaction is scored inside the decision window and can be held, stepped up or declined before it completes, rather than flagged after settlement.",
      },
      {
        q: "How is an AI credit decision explained to a regulator?",
        a: "Each score is returned with the factors that drove it and their contribution, alongside a record of the model version, its training lineage and the thresholds in force at the time. That combination is what makes a decision reconstructable in an audit.",
      },
      {
        q: "Do you use our data or a pre-built model?",
        a: "Yours. Fraud and credit patterns are specific to a portfolio, so models are trained on your transaction, application and repayment history and tuned to your own risk appetite.",
      },
      {
        q: "What about fraud patterns that have never been seen before?",
        a: "Supervised scoring is paired with anomaly detection, which looks for behaviour that departs from the established pattern rather than matching a known label. New fraud typically shows up there first.",
      },
    ],
  },
  {
    key: "06 / Deployment",
    slug: "mlops-model-deployment",
    title: "MLOps & AI Model Deployment Services",
    description:
      "Containerised deployment, model registry and versioning, canary releases and rollback, and serving uptime monitoring for models and agents on infrastructure you control.",
    h1: "Model deployment and MLOps",
    lede: "The unglamorous half of AI — versioning, serving, monitoring and rollback — owned by us so your team doesn't carry it.",
    sections: [
      {
        t: "A model in a notebook is not a system",
        p: [
          "Most AI work that fails to reach production does not fail on accuracy. It fails because nobody owned packaging, serving, versioning, monitoring or the path back when a new version turns out to be worse than the old one.",
          "We take models and agents from whatever state they are in and make them deployable artefacts: containerised, reproducible, versioned in a registry, and served behind an interface the rest of your stack can call.",
        ],
      },
      {
        t: "On infrastructure you control",
        p: [
          "Deployment targets are yours — your cloud account, your VPC, your on-premise hardware where data residency requires it. The point is that the thing running in production belongs to you, and does not become something only we can operate.",
          "Releases go out gradually. New versions are canaried against live traffic with the previous version still in place, and a rollback is a routine, rehearsed action rather than an incident.",
        ],
      },
      {
        t: "Monitored for the failures that matter",
        p: [
          "Serving uptime and latency are the easy half. The half that catches teams out is silent degradation — input distributions drifting away from the training set, a dependency changing behaviour, quality falling while every dashboard stays green. Monitoring covers both.",
          "This is also the stage where the Support commitment in our approach applies: monitoring, patches and SLA-backed fixes continue after go-live, because launch is not the end of the work.",
        ],
      },
      {
        t: "Handing it over, or keeping it",
        p: [
          "Two outcomes are legitimate and we decide which one before the work starts: your team operates the system with us on support, or we operate it for you. What we will not do is leave the arrangement vague, because that is how a production system ends up with no owner at three in the morning.",
          "Where your team takes it, handover is a deliverable rather than a farewell email — runbooks, the deployment pipeline, the monitoring dashboards and the rollback procedure, walked through with the people who will use them. Where we keep it, the same artefacts exist anyway, so the option to take it back is always open.",
        ],
      },
    ],
    faqs: [
      {
        q: "What is MLOps?",
        a: "The practice of running machine learning in production: packaging models as deployable artefacts, versioning them, serving them reliably, monitoring for degradation, and being able to roll back safely when a new version underperforms.",
      },
      {
        q: "Can models be deployed in our own cloud or on-premise?",
        a: "Yes. Deployment targets your own cloud account, VPC or on-premise hardware, which is normally what data residency and security review require. The running system stays yours to operate.",
      },
      {
        q: "How do you release a new model version safely?",
        a: "Through canary releases: the new version takes a share of live traffic while the previous version stays in place, metrics are compared, and the change is either promoted or rolled back. Rollback is a routine operation, not an emergency.",
      },
      {
        q: "How do you detect a model getting worse over time?",
        a: "By monitoring input distributions and output quality alongside uptime and latency, so drift is caught as a measured change rather than as a business complaint. Degradation is usually silent, which is exactly why it is monitored explicitly.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Products                                                            */
/* ------------------------------------------------------------------ */

export const PRODUCT_PAGES: SeoPage[] = [
  {
    key: "01 / Talent + CRM",
    slug: "ai-talent-crm",
    title: "AI Talent & CRM — AI Recruitment Software",
    description:
      "One product for hiring and revenue: AI sourcing, resume screening with fit-scored shortlists, interview scheduling, lead scoring, deduplication and pipeline forecasting.",
    h1: "AI Talent & CRM",
    lede: "Hire the team and run the pipeline in one product, because both are the same problem wearing different labels.",
    sections: [
      {
        t: "Two funnels, one system",
        p: [
          "Recruiting and selling are structurally identical: a stream of inbound and sourced records, a scoring step, a sequence of conversations, and a forecast someone is accountable for. Most organisations run them in two unconnected tools and reconcile by hand.",
          "AI Talent & CRM treats them as one product. Sourcing and screening feed the hiring funnel, lead intake and scoring feed the revenue funnel, and both share the same scoring, deduplication and forecasting machinery underneath.",
        ],
      },
      {
        t: "Screening that produces a shortlist, not a pile",
        p: [
          "Resumes are parsed and scored against the requirement rather than keyword-matched, so what comes back is a ranked shortlist with the reasoning attached — which is what makes it reviewable rather than something a hiring manager has to redo.",
          "Interview operations are part of the product: scheduling, panel coordination and follow-up sit alongside the shortlist instead of in somebody's inbox.",
        ],
      },
      {
        t: "A forecast built from what is actually there",
        p: [
          "Lead intake deduplicates and routes on the way in, so the pipeline reflects distinct real opportunities rather than the same company entered four times by three people.",
          "Forecasting then works off that cleaned pipeline — stage, age, movement and scoring — to make the shape of the quarter visible rather than asserted in a weekly meeting.",
        ],
      },
      {
        t: "Where the AI actually sits",
        p: [
          "It is worth being precise, because “AI recruitment software” covers everything from a keyword filter upwards. Here the model does three jobs: reading unstructured documents — resumes, job specs, inbound email — into structured records, scoring those records against a stated requirement, and summarising a history into something a person can act on in a few seconds.",
          "Everything downstream of that stays deterministic. Stages, routing rules, ownership and permissions behave the way a system of record has to behave, so nobody has to wonder whether the pipeline moved because of a rule or because of a model.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why combine recruitment and CRM in one product?",
        a: "Because the two funnels behave the same way — intake, scoring, a sequence of conversations, a forecast — and running them in separate tools means reconciling the same companies and contacts by hand. One system removes that reconciliation.",
      },
      {
        q: "How does AI resume screening work?",
        a: "Resumes are parsed and scored against the actual requirement rather than matched on keywords, and returned as a ranked shortlist with the reasoning shown, so a hiring manager can review the judgement instead of repeating the sift.",
      },
      {
        q: "Does it replace our existing ATS or CRM?",
        a: "It can, or it can run alongside one. Which makes sense depends on what your current tools are already doing well — that is a scoping conversation, not a fixed answer.",
      },
      {
        q: "Can a hiring manager see why a candidate was ranked where they were?",
        a: "Yes. Each shortlist entry carries the reasoning behind its score against the stated requirement, so the ranking is something a hiring manager reviews and can overrule, rather than a number they have to take on trust.",
      },
    ],
  },
  {
    key: "02 / HRMS & Compliance",
    slug: "ai-hrms-compliance",
    title: "AI HRMS & Payroll Compliance Software",
    description:
      "One system from onboarding to payroll to statutory filings: attendance and leave, performance cycles, employee self-service, PF, ESI and TDS tracked and filed, with a full audit trail.",
    h1: "AI HRMS & Compliance",
    lede: "The employee lifecycle end to end, with Indian statutory compliance handled rather than bolted on.",
    sections: [
      {
        t: "One lifecycle, not five systems",
        p: [
          "Onboarding, attendance, leave, payroll, appraisals and offboarding are usually spread across a core HR system, a spreadsheet, a payroll bureau and a compliance consultant, with data re-keyed between them. Every one of those handoffs is somewhere a number can be wrong.",
          "AI HRMS & Compliance holds the whole lifecycle in one place, so a joining date entered once is the same joining date that payroll, leave accrual and statutory filing all read.",
        ],
      },
      {
        t: "Compliance as part of the system",
        p: [
          "PF, ESI and TDS are tracked against the payroll they come from and filed on the cycle they are due on, rather than reconstructed at the end of a quarter from payslips. Statutory change is handled in the product, not left as a task for whoever remembers.",
          "Every change is logged — who changed what, when, and what it was before — which is what an audit, an employee dispute or an inspection actually needs.",
        ],
      },
      {
        t: "Self-service, so HR stops being a helpdesk",
        p: [
          "Payslips, leave balances, declarations and requests are things employees can get themselves, which removes the highest-volume, lowest-value part of an HR team's inbox.",
          "People analytics runs off the same data: headcount movement, attrition, leave patterns and appraisal cycles, as a live picture rather than a monthly export.",
        ],
      },
      {
        t: "Getting off the system you are on",
        p: [
          "Nobody replaces an HR system for fun, and the reason most migrations stall is history: years of leave balances, salary revisions, statutory records and documents that have to arrive intact and reconcile to the paise. Migration is treated as its own piece of work with its own verification, not as a setup step.",
          "The order that works is boring and deliberate: employee master and org structure first, then attendance and leave with balances reconciled against the outgoing system, then a payroll run computed in parallel on both before anything is cut over. Statutory filings move last, once a full cycle has already matched.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does it handle Indian statutory compliance?",
        a: "Yes — PF, ESI and TDS are tracked against the payroll run that generates them and filed on their due cycle, with the audit trail that a later inspection or dispute needs.",
      },
      {
        q: "Can employees access their own records?",
        a: "Yes. Self-service covers payslips, leave balances, declarations and requests, which takes the highest-volume queries out of the HR team's inbox.",
      },
      {
        q: "How many employees can the system handle?",
        a: "It is in use managing over 10,000 employees. Scale beyond that is an infrastructure question rather than a product limit, and one we will scope honestly.",
      },
      {
        q: "Is every change to payroll data recorded?",
        a: "Yes. Every change is logged with who made it, when, and the prior value, so any payslip or filing can be reconstructed after the fact.",
      },
      {
        q: "Can we move our existing employee and payroll history across?",
        a: "Yes, and it is treated as its own piece of work: the employee master and org structure first, then attendance and leave with balances reconciled against the outgoing system, then a payroll cycle run in parallel on both before anything is cut over.",
      },
    ],
  },
  {
    key: "03 / Finance Bot",
    slug: "ai-finance-bot",
    title: "AI Finance Bot — Procure-to-Pay Vendor Support",
    description:
      "A conversational agent for Procure-to-Pay: vendor invoice status on request, P2P queries in natural language, automatic escalation to finance staff, and 24/7 cover with human handoff.",
    h1: "AI Finance Bot",
    lede: "Vendors ask where their invoice is; the bot answers, and escalates the ones that need a human.",
    sections: [
      {
        t: "The query that eats a finance team's week",
        p: [
          "“Where is my invoice?” is the highest-volume question an accounts payable team receives, and answering it is pure lookup — due, blocked, paid, or sitting against a debit balance. It is also asked by email, at any hour, in whatever phrasing the vendor chose.",
          "The Finance Bot answers it on request, in natural language, without a rigid form and without the vendor needing a portal login they will forget.",
        ],
      },
      {
        t: "Escalation is the valuable half",
        p: [
          "An invoice with a genuine problem does not want an explanation, it wants a person. When the bot identifies an issue, it emails the relevant finance staff immediately with the context attached, so the exception starts moving instead of waiting for the next follow-up.",
          "Payment disputes and other Procure-to-Pay issues are walked through step by step, for vendors and internal staff alike, so the common cases resolve without a human and the uncommon ones arrive already framed.",
        ],
      },
      {
        t: "Always on, and forgiving of how people write",
        p: [
          "Vendor queries arrive outside your working hours and in your vendors' own phrasing, typos included. The bot handles free text rather than requiring a structured request, and covers the hours your team does not.",
          "Where it cannot help, it hands over to a person rather than looping — the same principle behind every agent we build.",
        ],
      },
      {
        t: "What it reads, and what it will not say",
        p: [
          "The bot answers from your Procure-to-Pay records, so its scope is exactly what those records contain: invoice state, the reason for a block, the payment run an item is sitting in. Anything outside that — a commitment about when a disputed invoice will now be paid, a change to terms — is a decision a person makes, and the bot says so rather than guessing on the finance team’s behalf.",
          "That boundary is also what makes it safe to give vendors. A vendor sees the status of their own invoices and nothing else, and the bot has no path to commit the business to anything. The valuable output is a vendor who stops emailing and a finance team who hears only about the exceptions.",
        ],
      },
    ],
    faqs: [
      {
        q: "What can the Finance Bot tell a vendor?",
        a: "The status of their invoice — whether it is due, blocked, paid, or held against a debit balance — on request, and it will walk them through Procure-to-Pay issues such as payment disputes.",
      },
      {
        q: "What happens when an invoice has a real problem?",
        a: "The bot emails the relevant finance staff the moment an issue is flagged, with the context attached, so the exception is picked up by a person rather than waiting for the vendor to chase again.",
      },
      {
        q: "Do vendors need to use a specific format or portal?",
        a: "No. It handles free text, including typos and unconventional phrasing, so vendors can ask the way they would ask a person.",
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Joining the two halves                                              */
/* ------------------------------------------------------------------ */

function joinOrThrow<T extends { k: string }>(
  items: T[],
  pages: SeoPage[],
  what: string,
): { page: SeoPage; item: T }[] {
  return pages.map((page) => {
    const item = items.find((i) => i.k === page.key);
    // A typo in `key` would otherwise ship a page with a live URL, a sitemap
    // entry and no content — the worst of the three possible outcomes.
    if (!item) throw new Error(`seo-pages: no ${what} in lib/data.ts with k="${page.key}"`);
    return { page, item };
  });
}

export interface ServiceEntry {
  page: SeoPage;
  item: ServiceItem;
}
export interface ProductEntry {
  page: SeoPage;
  item: ProductItem;
}

export const SERVICE_ENTRIES: ServiceEntry[] = joinOrThrow(SERVICES, SERVICE_PAGES, "service");
export const PRODUCT_ENTRIES: ProductEntry[] = joinOrThrow(PRODUCTS, PRODUCT_PAGES, "product");

export function serviceBySlug(slug: string): ServiceEntry | undefined {
  return SERVICE_ENTRIES.find((e) => e.page.slug === slug);
}

export function productBySlug(slug: string): ProductEntry | undefined {
  return PRODUCT_ENTRIES.find((e) => e.page.slug === slug);
}

/** Path helpers, so no route string is spelled out by hand anywhere else. */
export const servicePath = (slug: string) => `/services/${slug}`;
export const productPath = (slug: string) => `/products/${slug}`;

/** Slug for a SERVICES / PRODUCTS entry, for linking out of the homepage. */
export function slugForKey(key: string): string | undefined {
  return [...SERVICE_PAGES, ...PRODUCT_PAGES].find((p) => p.key === key)?.slug;
}
