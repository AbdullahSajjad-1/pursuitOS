# PursuitOS — Executive Deal Intelligence & RFP Decision Engine

> **Autonomous 5-Member AI Council grounded in live Graph8 CRM data, real-time buyer signals, and historical deal intelligence.**

PursuitOS transforms high-stakes enterprise deal pursuits and RFP evaluations from weeks of disjointed committee meetings into an evidence-backed, autonomous deliberation workflow. Within minutes, PursuitOS parses complex RFP specifications, cross-examines requirements through a specialized 5-agent AI council, grounds every claim against live Graph8 CRM data, renders a structured **Bid / No-Bid / Conditional** verdict, and writes back complete pipeline actions directly to Graph8.

---

## 🌟 Key Features

| Capability | Description |
|---|---|
| **📄 RFP Parsing & Decomposition** | Uploads multi-page PDFs, technical specs, or RFP questionnaires. Extracts SLAs, security constraints, integration requirements, and compliance criteria into structured verification schemas. |
| **🏛️ 5-Member AI Council** | Runs parallel, specialized deliberation agents (**Commercial**, **CTO**, **CEO**, **Relationship**, and **Competitive**) with distinct evaluation criteria to eliminate groupthink and uncover hidden risks. |
| **⚡ Live Graph8 Data Grounding** | Verifies all claims, win rates, executive ties, and buyer intent signals directly against Graph8 entities (Companies, Contacts, Deals, Signals, Hiring Moves, Radar). |
| **🔄 Continuous Revival Scanner** | Proactively scans historical closed-lost deals. When market triggers align (executive turnover, competitor pricing changes, tech stack shifts), PursuitOS surfaces re-engagement plays with pre-drafted outreach. |
| **🛡️ Verifiable Evidentiary Audit Trail** | Every council verdict, risk flag, and score is tagged with deterministic Evidence IDs and citations back to source documents or Graph8 records. |
| **✍️ Bi-Directional CRM Write-Back** | One-click synchronization to provision pipeline opportunities, advance stages, attach battle cards, write decision rationales to Graph8 notes, and schedule AE tasks. |
| **🎨 Graph8 Dark Mode Aesthetics** | Built with curated `#0D0F12` canvas, `#292F36` subtle borders, fluid sticky-split capabilities scroller, smooth transitions, and enterprise-grade UI precision. |

---

## 🏗️ System Architecture

PursuitOS is structured as a high-performance modular TypeScript application featuring a decoupled Next.js 16 App Router frontend, a typed backend domain layer, and deep integration with Graph8 APIs and MCP servers.

```
                     ┌────────────────────────────────────────────────────────┐
                     │                   Client Browser                       │
                     │  (Landing Page, Login, Pursuits Workspace, Revivals)  │
                     └───────────────────────────┬────────────────────────────┘
                                                 │ HTTPS / JSON
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PursuitOS Backend & API Layer                                     │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┤
│       Document Pipeline       │       AI Council Engine       │       Revival Scanner Engine     │
│   • PDF / Spec Ingestion      │   • Commercial Agent          │   • Closed-Lost Deal Monitor     │
│   • Requirement Extraction    │   • CTO Architecture Agent    │   • Market Trigger Detector      │
│   • SLA / Security Tagging    │   • CEO Strategic Agent       │   • Re-Engagement Playbook Gen   │
│                               │   • Relationship Agent        │   • Revival Scoring (0-100)      │
│                               │   • Competitive Intel Agent   │                                  │
├───────────────────────────────┴───────────────────────────────┴──────────────────────────────────┤
│                                  Evidence & Synthesis Matrix                                     │
│   • Evidence Graph Linking (EV-IDs)       • Consensus Scoring (Bid / No-Bid / Conditional)       │
│   • Risk & Blocker Identification         • Executive Brief & AE Action Plan Generation         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                Execution Boundary & Safety Layer                                 │
│   • DEMO / SANDBOX / LIVE Modes           • Human-in-the-Loop Approval Gating                    │
│   • Policy Enforcement Engine             • Comprehensive Audit Logging                          │
└───────────────────────────────┬───────────────────────────────┬──────────────────────────────────┘
                                │                               │
                                ▼                               ▼
┌───────────────────────────────────────────────┐ ┌────────────────────────────────────────────────┐
│               Graph8 Integration              │ │            Stateless Reasoning Layer           │
│  • Companies, Contacts, Deals (REST SDK)      │ │  • Gemini 2.5 Flash / Pro (Structured Output)  │
│  • Intent Signals & Hiring Waves              │ │  • Deterministic Schema Enforcement (Zod)      │
│  • Buying Committees & Relationship Maps      │ └────────────────────────────────────────────────┘
│  • CRM Notes, Tasks, & Stage Transitions      │
│  • Graph8 MCP Server (Account Investigation)  │
└───────────────────────────────────────────────┘
```

---

## 🏛️ The Five-Member Deliberation Council

Rather than relying on a single prompt, PursuitOS runs five distinct AI personas with complementary mandates:

```
                          ┌────────────────────────┐
                          │   RFP Requirements +   │
                          │   Live Graph8 Context  │
                          └───────────┬────────────┘
                                      │
         ┌──────────────┬─────────────┼─────────────┬──────────────┐
         ▼              ▼             ▼             ▼              ▼
  ┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐┌─────────────┐
  │ Commercial  ││     CTO     ││     CEO     ││Relationship ││ Competitive │
  │    Agent    ││    Agent    ││    Agent    ││    Agent    ││    Agent     │
  └──────┬──────┘└──────┬──────┘└──────┬──────┘└──────┬──────┘└──────┬──────┘
         │ Margin, ACV  │ Tech Feas., │ Strategy,   │ Stakeholder  │ Incumbent,   │
         │ & Contract   │ Architecture│ Brand & TAM │ Alignment    │ Win Rates    │
         └──────────────┼─────────────┼─────────────┼──────────────┘
                        │             │             │
                        ▼             ▼             ▼
  ┌─────────────────────────────────────────────────────────────────────────┐
  │                    Council Synthesis & Verdict Engine                   │
  │  • Stance Matrix: Bid / No-Bid / Conditional                            │
  │  • Overall Deal Confidence Score (0 - 100%)                             │
  │  • Consolidated Red Flags, Hard Blockers & Mitigation Strategy          │
  └─────────────────────────────────────────────────────────────────────────┘
```

1. **Commercial Agent**: Analyzes ACV potential, pricing structure, profit margins, discounting exposure, and resource cost models.
2. **CTO / Solutions Architect Agent**: Evaluates technical feasibility, custom integrations, cloud residency requirements, SLAs, security questionnaires, and maintenance overhead.
3. **CEO / Strategic Alignment Agent**: Weighs enterprise strategic fit, portfolio coherence, brand exposure, opportunity cost, and long-term customer lifetime value.
4. **Relationship / Buying Committee Agent**: Maps internal champions, executive sponsors, economic buyers, historical touchpoints, and stakeholder sentiment from Graph8 contact graphs.
5. **Competitive Posture Agent**: Identifies active incumbent vendors, head-to-head win rates, differentiation angles, pricing pressure, and defensive battle cards.

---

## 🔗 How Graph8 Powers PursuitOS

Graph8 is the foundational system of record and signal intelligence engine powering PursuitOS across every lifecycle phase:

```
[ RFP / Deal Ingestion ]
         │
         ▼
[ Graph8 Entity Resolution ]  ───►  Matches domain against Graph8 Companies & Contacts
         │
         ▼
[ Graph8 Signal Grounding ]   ───►  Retrieves Hiring Waves, Intent Signals, and Past Deal Outcomes
         │
         ▼
[ Council Deliberation ]      ───►  Agents cite live Graph8 entities with Evidence IDs (EV-xxx)
         │
         ▼
[ Human Approval ]           ───►  Review executive summary and agent verdicts
         │
         ▼
[ Graph8 CRM Write-Back ]     ───►  Creates Opportunity, updates Stage, posts Notes, & assigns Tasks
```

### 1. Account & Stakeholder Resolution
- **`GET /companies?domain={domain}`**: Instant entity resolution for incoming RFPs.
- **`GET /companies/{id}/contacts`**: Ingests organizational hierarchy, buying committees (Economic Buyer, Champion, Technical Evaluator, Blocker).

### 2. Historical & Intent Signal Ingestion
- **`GET /deals?company_id={id}&outcome={won|lost}`**: Ingests historical deal post-mortems, average deal sizes, and previous loss reasons.
- **`Graph8 Signals & Radar`**: Ingests real-time signals (funding rounds, executive turnover, hiring spikes, software renewals).

### 3. CRM Action & Write-Back Execution
- **Deal Provisioning**: Creates and advances pipeline deals to the appropriate qualification stage.
- **Decision Rationale Logging**: Generates comprehensive notes summarizing the council verdict, consensus score, and cited evidence.
- **Workstream Orchestration**: Automatically assigns follow-up tasks to account executives and sales engineers directly within Graph8.

---

## 🔄 Automated Revival Scanner

Lost deals are often neglected pipeline assets. The **Revival Scanner** continuously matches historical closed-lost deals against fresh market and organizational signals:

1. **Trigger Identification**: Identifies key catalyst events (e.g., replacement of an incumbent decision-maker, competitor outage, funding expansion).
2. **Revival Scoring ($0 - 100$)**: Algorithmic scoring evaluating signal strength, historical deal fit, and relationship warmth.
3. **Automated Playbook Generation**: Formulates customized re-engagement scripts, executive emails, and battle cards referencing why the previous bid was lost and what conditions have changed.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 with App Router & React 19
- **Language**: TypeScript (Strict Mode throughout frontend and backend)
- **Styling**: Vanilla CSS & Tailwind CSS (Custom Graph8 dark-mode tokens)
- **Icons & Animation**: Lucide React, Framer-motion compatible CSS micro-interactions
- **AI Models & Orchestration**: Google Gemini 2.5 Flash / Pro via `@google/genai` with Zod structured output schemas
- **CRM Integration**: Graph8 REST API v1 & Graph8 Model Context Protocol (MCP)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- npm 10+
- Graph8 API Key & Workspace
- Google Gemini API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/AbdullahSajjad-1/pursuitOS.git
cd pursuitOS

# Install dependencies across all workspaces
npm install
```

### Environment Configuration

Create a `.env` file in `server/` (or copy from `.env.example`):

```env
PORT=4000
NODE_ENV=development

# Graph8 Configuration
GRAPH8_API_KEY=your_graph8_api_key_here
GRAPH8_BASE_URL=https://be.graph8.com/api/v1
GRAPH8_MCP_URL=https://mcp.graph8.com

# AI Provider Configuration
GEMINI_API_KEY=your_gemini_api_key_here
DEFAULT_MODEL=gemini-2.5-flash

# Execution Mode (DEMO / SANDBOX / LIVE)
EXECUTION_MODE=DEMO
```

### Running Locally

```bash
# Start the full development stack (Next.js frontend + API)
npm run dev

# Or run the Next.js frontend directly:
npm run dev --workspace=web
```

The web application will be accessible at `http://localhost:3000`.

---

## 📂 Project Structure

```
pursuitOS/
├── apps/
│   └── web/                         # Next.js 16 Web Application
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx         # Executive Landing Page (Sticky-Split UX)
│       │   │   ├── login/           # Authentication Screen
│       │   │   ├── pursuits/        # Pursuits Workspace & Council Review
│       │   │   ├── revivals/        # Revival Scanner Pipeline
│       │   │   └── api/             # Backend API proxy endpoints
│       │   ├── components/
│       │   │   ├── AppShell.tsx     # Authenticated Sidebar Shell
│       │   │   ├── ConditionalShell.tsx # Layout router
│       │   │   └── PursuitScreen.tsx# Interactive Council UI & Audit Trail
│       │   └── globals.css          # Design tokens & smooth scroll utilities
├── server/                          # Backend Services & AI Core
│   ├── ai/                          # LLM Orchestrator & Zod Schemas
│   ├── council/                     # 5-Member Agent Prompts & Synthesizer
│   ├── graph8/                      # Graph8 REST SDK & MCP Client
│   ├── intelligence/                # Signal aggregators & intent miners
│   ├── commercial/                  # Pricing & margin analysis engine
│   └── pursuits/                    # Pursuit state machine & execution
├── docs/                            # Comprehensive Documentation
│   ├── 01_PRD.md                    # Product Requirements Document
│   ├── 02_ARCHITECTURE.md           # Engineering & Security Architecture
│   ├── 03_GRAPH8_INTEGRATION.md     # Graph8 API / MCP Specification
│   ├── 04_DATA_MODEL.md             # Entity & Evidence Schemas
│   ├── 05_AGENT_COUNCIL.md          # Multi-Agent Deliberation Design
│   ├── 06_MVP_BUILD_PLAN.md         # Implementation Milestones
│   ├── 07_DEMO_AND_EVALUATION.md    # Hackathon Demo Scripts & Judges Guide
│   └── 08_SYSTEM_OVERVIEW_AND_ANALYSIS.md # Deep-Dive System Analysis
└── package.json                     # Workspace Monorepo Root
```

---

## 🔒 Security & Safety Controls

1. **Zero Credential Exposure**: Graph8 API keys and Gemini credentials remain strictly confined to the backend layer.
2. **Execution Boundary**: AI agents cannot directly perform external side-effects (e.g. sending emails or dialing phone numbers). All mutating CRM actions require explicit human review and authorization.
3. **Execution Modes**:
   - `DEMO`: Mock side-effects; safe for public stage presentations.
   - `SANDBOX`: Writes to Graph8 test namespaces.
   - `LIVE`: Explicitly enables production CRM mutations with full audit logging.
4. **Verifiable Citations**: Every claim is tagged with an immutable evidence hash referencing specific source lines or CRM records.

---

## 📄 License

MIT License — Built for the Graph8 Hackathon.