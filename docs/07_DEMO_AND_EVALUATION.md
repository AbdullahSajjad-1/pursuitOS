# 07 — Demo, Judging & Product Story

## 1. Demo thesis

Do not demo “AI reading an RFP.”

Demo this:

> **A $1.2M opportunity appears. PursuitOS spends 30 seconds reconstructing the account from Graph8, proves why the opportunity is or is not worth pursuing, shows the people and risks involved, then turns an approved decision into real Graph8 revenue work.**

## 2. Recommended four-minute flow

### 0:00–0:20 — The problem

Show the RFP.

Say:

> “A serious RFP just landed. The team could waste two days deciding whether to bid.”

### 0:20–0:55 — Account reality

Show Graph8 evidence:

```text
Existing relationship
Previous $620K opportunity
New CTO
Hiring wave
Intent activity
Competitive movement
```

Explain:

> “We aren't generating these signals. Graph8 already has them. Our job is to reason across them.”

### 0:55–1:40 — Council

Show five panels:

```text
CEO        STRATEGIC FIT
CTO        DELIVERY FIT
SALES      RELATIONSHIP
COMMERCIAL ECONOMICS
COMPETE    COMPETITIVE RISK
```

Then show the decision.

### 1:40–2:15 — Why

Open the decision explanation and click evidence.

The judge should see actual Graph8 records.

### 2:15–3:10 — Pursuit creation

Click:

> **START PURSUIT**

Watch Graph8 update:

- deal
- custom fields
- note
- stakeholders
- tasks
- optional quote draft

### 3:10–3:40 — Missing work

Show:

```text
Security owner missing
CTO clarification needed
Procurement contact missing
Timeline risk unresolved
```

### 3:40–4:00 — Closing line

> “Graph8 already knows the buyer, the account, the signals and the revenue system. PursuitOS is the layer that decides whether a complex opportunity deserves the organization’s attention—and then turns that decision back into Graph8 work.”

## 3. Judging alignment

The hackathon rubric emphasizes:

### 35 — Works end-to-end on Graph8

We should visibly read and write multiple Graph8 domains in one run.

### 25 — Useful to a real team that sells, books or bills

The user saves real pursuit time and gets a bid decision plus operating plan.

### 20 — Product taste / UX

Keep the interface focused:
- one decision
- evidence drawer
- clear risks
- clear next action
- no “AI dashboard” clutter

### 20 — Technical quality / platform usage

Show:
- typed SDK/API adapter
- MCP agentic research
- rate limiting
- idempotency
- evidence contracts
- approval boundaries
- Graph8 writes
- Graph8 webhooks
- reproducible run history

## 4. What not to say

Avoid:

> “We built a better Apollo.”

> “Our AI predicts who will buy.”

> “Our agents simulate the customer perfectly.”

> “We scrape LinkedIn every day.”

> “We trained our own foundation model.”

None is necessary and several are weaker than the actual product.

## 5. What to say

Preferred positioning:

> “Graph8 gives us the revenue graph. PursuitOS reasons across it.”

> “We don't replace Graph8 signals. We correlate them.”

> “We don't generate another lead list. We decide whether a real opportunity deserves pursuit capacity.”

> “Every decision is traceable to Graph8 evidence.”

## 6. Backup demo scenarios

### Scenario A — BID

Strong relationship + high strategic fit + manageable technical risk.

### Scenario B — CONDITIONAL BID

Strong value, but timeline/security clarification required.

### Scenario C — NO-BID

Large opportunity but clear delivery mismatch and weak relationship path.

Showing NO-BID is important: it proves the system is an advisor, not a machine designed to say yes.

## 7. Technical questions judges may ask

### Why not build this inside Graph8?

> “We are building a product layer on top of Graph8's public developer surface. The differentiator is the decision system and pursuit orchestration, while Graph8 remains the data and execution backend.”

### Why use Gemini instead of training your own model?

> “The difficult problem here is not language-model pretraining. It is evidence retrieval, structured reasoning, Graph8 integration, safe execution and evaluation. We use a replaceable model provider and invest engineering effort where the product moat is.”

### Why a local database?

> “Graph8 remains the source of truth for revenue records. Supabase only stores pursuit runs, document state, evidence snapshots and audit history that don't belong in Graph8's CRM.”

### Why MCP and REST both?

> “MCP is ideal for dynamic agentic investigation across Graph8's large tool surface. REST/SDK is better for deterministic, testable mutations.”

### Why not directly scrape LinkedIn?

> “Graph8 already provides Social Listener/Radar/LinkedIn-related intelligence. We use those supported sources and their timestamps instead of creating a brittle, prohibited scraper.”

## 8. Post-hackathon roadmap

### v1.1

- Closed-lost recovery watch
- account-change watch
- better historical similarity
- outcome feedback

### v1.2

- reusable Graph8 skill
- Graph8 workflow templates
- pursuit portfolio dashboard

### v2

- vertical-specific bid playbooks
- learned bid/no-bid heuristics per organization
- proposal response collaboration
- deeper commercial/quote analysis

## 9. Product moat

The moat is not the Gemini prompt.

It is:

```text
Graph8 revenue data
        +
organization-specific history
        +
account change intelligence
        +
historical pursuit outcomes
        +
structured evidence graph
        +
execution feedback
        ↓
organization-specific pursuit intelligence
```

The more the system is used, the more accurately it can identify which opportunity patterns are worth pursuing for that specific organization.
