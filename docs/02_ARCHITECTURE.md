# 02 — Architecture & Engineering Design

## 1. Architecture decision

Use a **modular monolith** for the hackathon. 
We must separate frontend and backend responsibilities, but avoid splitting into multiple independent services which would slow down the hackathon.

**The final architecture philosophy:**
- **Frontend**: Presentation and user interaction.
- **Backend**: All business logic, AI orchestration, Graph8 integration, authorization, and execution.
- **Worker**: Long-running/background processing.
- **Database**: Only PursuitOS's intelligence/evidence/audit state.
- **Graph8**: CRM + revenue data + signals + execution system of record.
- **AI providers**: Stateless reasoning layer.
- **Security layer**: Authentication → authorization → policy → approval → execution → audit.

This gives clean separation without introducing microservice overhead.

## 2. Runtime topology

```text
Browser
   │
   │ HTTPS
   ▼
PursuitOS API (Next.js/API)
   │
   ├── Graph8 MCP/API
   ├── Gemini/OpenAI/etc.
   └── Database
```

And background jobs:

```text
Background jobs
   ↓
RFP parsing / Graph8 research / Evidence refresh / Council execution
```

## 3. System-of-record rule

Don't store Graph8's entire CRM locally. Our local database should contain only:
- Pursuit
- RFP
- Requirement
- Evidence
- AgentRun
- Decision
- CommunicationRecommendation
- Approval
- AuditEvent

**Graph8 remains the source of truth for:**
- Contacts, Companies, Deals
- Activities, Signals, Sequences
- Calls, CRM records
- Notes, Tasks, Quotes, Workflows/skills

Never create a local “copy of the CRM”.

## 4. Frontend API Philosophy

**Do not expose the individual agents as frontend-controlled APIs.**
The frontend shouldn't be able to say: `POST /run-ceo-agent` with arbitrary data.

Instead, use intent-based endpoints like: `POST /pursuits/:id/analyze`
The backend determines:
- Which agents?
- What context and evidence?
- Which model and tools?
- What permissions?

That gives us much stronger control.

## 5. Request paths

### Deterministic path — REST/SDK
Use Graph8 SDK/REST for deterministic operations:
- get deal/company/contact, list deals, create/update deal
- create note/task/quote
- set custom fields

### Agentic path — MCP
Use Graph8 MCP for:
- account investigation, tool discovery through progressive search
- research across multiple Graph8 namespaces

Do not make core writes depend on a free-form agent tool call if a typed SDK/REST operation exists.

## 6. Evidence architecture

Agents may only make factual claims by referencing Evidence IDs.

```ts
interface Evidence {
  id: string;
  source: 'graph8' | 'document' | 'model';
  sourceType: 'company' | 'contact' | 'deal' | 'activity' | 'meeting' | 'signal' | 'radar' | 'quote' | 'document';
  sourceId?: string;
  retrievedAt: string;
  title: string;
  excerpt?: string;
  structuredValue?: unknown;
  confidence?: number;
}
```

## 7. Event grouping

We do not treat every signal as an opportunity. A single weak signal should normally result in `WATCH`, not `PURSUE`.

## 8. Model router

The router exposes stable roles rather than model names:
- Default provider: Gemini API
- Optional provider: OpenAI/Anthropic or local OSS models
Models are replaceable without changing domain code.

## 9. Async execution

Use database-backed worker jobs for:
- RFP extraction, account scans, historical matching
- council runs, Graph8 mutation plans
MVP can use one worker process polling `job_runs` with row locking.

## 10. Execution Boundary

We must have an explicit execution boundary. PursuitOS can eventually send emails, call people, create deals, or launch workflows—these are **side effects**.
The AI should never be able to freely execute them.

```text
AI Agent → Proposed Action → Policy / Permission Check → Human Approval → Execution Service → Graph8
```

For example:
```json
{
  "action": "PHONE_CALL",
  "target": "contact_123",
  "requires_approval": true,
  "execution_mode": "demo"
}
```
The execution service checks if the action is allowed, authorized, permitted by RFP, human-approved, and if the current execution mode allows it. Only then can it execute.

## 11. Security

Security is a first-class part of this architecture.
**The browser must never have access to Graph8 credentials, AI provider secrets, or unrestricted execution capabilities.** (e.g., Browser → Graph8 API key ❌)

### Secrets Management
`.env` must **never enter Git**. We should use an empty `.env.example`.
Actual secrets live only in the deployment environment:
```env
GRAPH8_API_KEY=
GRAPH8_MCP_URL=
GEMINI_API_KEY=
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
AUTH_SECRET=
```

### Execution Mode Safety
`execution_mode` acts as a hard safety mechanism to prevent accidentally contacting Graph8's real contacts:

- **DEMO** (Default)
  - no real calls, no real emails, no sequence enrollment, no quote sends, no irreversible CRM mutations.
- **SANDBOX**
  - Graph8 test/simulated execution.
- **LIVE**
  - explicitly enabled.

### Audit Trail
Every meaningful AI decision should produce an `AuditEvent` recording:
who, what, when, why, source evidence, model, prompt/version, decision, action, approval, and execution result.

Example:
```text
09:42 | CEO Agent → recommended BID
Evidence: EV-102, EV-107 | Confidence: 0.84 | Human: Abdullah approved
Result: Graph8 deal created successfully
```
This is incredibly useful during the demo because you can literally show: **“The AI didn't hallucinate this decision. Here is the evidence that caused it.”**
