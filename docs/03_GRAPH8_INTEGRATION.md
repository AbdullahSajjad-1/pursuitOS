# 03 — Graph8 API & MCP Integration Specification

## 1. Integration objective

The project must visibly and substantively use Graph8 throughout the full opportunity lifecycle. The integration is not a final “send email” step.

Target flow:

```text
Graph8 data read
  → Graph8 signal context
  → Pursuit reasoning
  → Graph8 record write
  → Graph8 work creation
  → Graph8 execution
  → Graph8 outcome read
```

## 2. Official API baseline

REST base URL:

```text
https://be.graph8.com/api/v1
```

Auth:

```http
Authorization: Bearer YOUR_API_KEY
```

Graph8 documents 50 requests/second and 1,000 requests/minute per organization. https://docs.graph8.com/developers/ and https://docs.graph8.com/developers/rate-limits/

The JavaScript SDK is preferred for TypeScript server code because it provides typed resource clients, retries, idempotency, pagination and a unified error type. https://docs.graph8.com/developers/sdk/

## 3. Integration matrix

| Graph8 family | Use in PursuitOS | MVP status | Notes |
|---|---|---:|---|
| Contacts | Existing stakeholders, roles, account coverage | Required | Read/write via API/SDK |
| Companies | Account resolution + account record | Required | Domain/company is the primary anchor |
| Search | Optional gap-filling for missing stakeholders | Optional | Not lead-gen; only pursuit-specific gaps |
| Enrichment | Resolve missing stakeholder details | Optional | Credit-bearing; budget it |
| Lists | Temporary pursuit audiences | Optional | Do not create lead-gen lists by default |
| Deals | Core pursuit object | Required | Graph8 source of truth |
| Deal contacts | Stakeholder mapping | Required | Associate roles explicitly |
| Notes | Persist decision rationale | Required | Evidence summary + council decision |
| Tasks | Pursuit workstreams | Required | Visible to Graph8 users |
| Fields | Pursuit status/score/risk fields | Required | Safer than gated custom objects |
| Quotes | Draft commercial proposal | MVP+ | Draft only unless approved |
| Pipelines | Map pursuit stage | Required | Read pipeline/stage first |
| Inbox | Relationship/history + approved communications | Required read; write optional | Unified email/SMS/LinkedIn |
| Meetings | History + next-step scheduling | Required read; write optional | Booking is a side effect |
| Activities | Timeline evidence | Required | Central to account reality |
| Intent | Current demand evidence | Required where enabled | Use existing keywords/signals |
| Hiring | Growth/initiative evidence | Required where enabled | Hiring Waves + Talent Moves |
| Social Listener | Current public/social evidence | Required where available | Use Graph8 source, no custom scraper |
| Radar | Competitive/account research | Required where available | Use for evidence, not unsupported claims |
| Buying Committees | Stakeholder coverage | Required where available | E/C/U/T roll-up |
| Campaigns | Optional pursuit outreach | Phase 2 | Avoid rebuilding Graph8 Campaign Studio |
| Sequences | Approved outreach | Phase 2 | Mutating and real-side-effect capable |
| Workflows | Pursuit automation | Phase 2 | Validate before execution |
| Skills | Optional reusable Graph8 skill | Phase 2 | Good extension if time remains |
| Agents | Optional Graph8-hosted execution | Phase 2 | Our council may remain external initially |
| Organization Knowledge | Proof, positioning, case studies | Required | Ground proposal reasoning |
| Security Questionnaires | Trigger a workstream / handoff | Phase 2 | Native Graph8 capability; do not rebuild |
| Webhooks | Outcome/event ingestion | Required | Use event-driven updates |
| Analytics | Measure pursuit/revenue outcomes | Phase 2 | Campaign/visitor/marketing analytics as relevant |
| OpenSearch | Advanced evidence retrieval | Optional | Only if sandbox exposes it cleanly |
| ClickHouse | Advanced behavioral analytics | Optional | Only if sandbox exposes it cleanly |
| Developer surface | Repo/install/snippets | Out of MVP | Not needed for core product |

## 4. Deterministic Graph8 calls

### Account resolution

1. `GET /companies?domain=...`
2. `GET /companies/{id}` when needed
3. `GET /companies/{id}/contacts` / equivalent company-contact surface

If company is not already in the workspace, use lookup/search only when required for the pursuit.

### Deal history

Use:

```text
GET /deals?company_id=...&outcome=won
GET /deals?company_id=...&outcome=lost
GET /deals?company_id=...&outcome=open
GET /deals/{deal_id}
```

Graph8's documented `outcome` filter distinguishes won, lost and open, which is important for true closed-lost cohorts. https://docs.graph8.com/developers/api-reference/operations/list_deals_deals_get/

### Stakeholder coverage

Read deal contacts and company contacts. Use Graph8's Buying Committee view/tooling when enabled. Do not invent stakeholder roles from job titles without marking them as inferred.

### Historical relationship

Read:
- notes
- activities
- inbox threads
- meetings
- meeting transcripts where available
- quotes

Graph8 meetings can return transcript text, key topics, action items, campaign mentions and participant links. https://docs.graph8.com/developers/meetings/

### Tasks

Create tasks linked directly to deal/company/contact records. Graph8 supports multiple record associations for tasks. https://docs.graph8.com/developers/tasks/

### Quotes

For an approved commercial plan, create a **draft** quote only. `POST /quotes` always starts in draft; sending a quote is a real email side effect and must remain behind approval. https://docs.graph8.com/developers/quotes/

### Sequences

Use sequences only when explicitly authorized. The Graph8 SDK/docs warn that enrollment triggers real outreach. For preview, use `/sequences/{id}/preview` or step listing instead of enrollment. https://docs.graph8.com/developers/sequences-lifecycle/

## 5. MCP integration strategy

Graph8's MCP server exposes large groups including:

- Sales & CRM
- Marketing & Campaigns
- Competitive Tracking
- Radar
- OpenSearch
- ClickHouse
- Organization Knowledge
- Developer
- Everything

The MCP server supports progressive tool discovery. If a needed tool is not visible, use the Graph8 MCP tool-search mechanism rather than hardcoding an assumed tool name. https://docs.graph8.com/developers/mcp/

### Our MCP policy

Use MCP for **read/reason tasks**:

```text
“Find everything Graph8 knows about this company that could affect a bid decision.”
```

The agent can discover the appropriate tools and return a normalized Evidence Bundle.

Use the typed API/SDK for **write tasks**:

```text
create/update deal
create tasks
set fields
create note
create quote draft
```

This minimizes model-driven mutation risk while still demonstrating deep MCP use.

## 6. Graph8 signals we will compose

### Hiring

Graph8 supports:
- Hiring Wave: matching companies/jobs, re-run daily.
- Talent Moves: contact/company job-change monitoring.

Matches can surface as signals and can auto-enroll into audiences. https://docs.graph8.com/signals/hiring/

### Intent

Use existing tracked keywords and page/visitor/company intent. Do not create hundreds of new keywords for a single pursuit. https://docs.graph8.com/developers/intent-signals/

### Social

Use Social Listener evidence where enabled. Treat social findings as dated observations, not ground truth. Cite the underlying observation and timestamp.

### Competitive Radar

Use Radar for:
- competitor records
- tracked page history
- content/advertising monitoring
- traffic estimates
- keyword gaps
- feature comparisons
- opportunities/initiatives

Radar documentation explicitly recommends reviewing the underlying source/date before turning a finding into a customer-facing claim. https://docs.graph8.com/signals/radar/

### Buying Committee

Use the E/C/U/T rollup as evidence of stakeholder coverage and intent. The feature depends on intent signals already collected and may be allowlisted per org. https://docs.graph8.com/signals/buying-committees/

## 7. Graph8-native data we should write back

Minimum custom fields on the Graph8 deal:

```text
pursuit_status
bid_decision
bid_confidence
strategic_fit
technical_fit
relationship_fit
competitive_risk
primary_blocker
pursuit_deadline
pursuit_id
last_pursuit_scan_at
```

Create fields only once and cache field IDs locally.

Graph8 supports contact/company custom fields and typed field discovery/creation. https://docs.graph8.com/developers/fields/

---


The current document already covers most of the Graph8 surface. I would add a **Voice & Call Execution** section.

```md

## 8. Voice & call execution

Graph8 voice is an optional execution channel for PursuitOS.

Use Graph8 rather than a separate voice provider for the hackathon whenever possible because the call remains inside the Graph8 revenue graph.

Relevant Graph8 capabilities include:

- voice agents
- voice twins
- custom voice cloning
- outbound call scripts
- dialer sessions
- call transcripts
- dispositions
- call summaries
- call history
- calendar-linked voice agents

### Read operations

Use Graph8 to retrieve:

- available voice agents
- prior calls
- call transcripts
- call dispositions
- contact call history

### Write operations

Potentially:

- create/select voice agent
- create paused dialer session
- generate/prepare call
- initiate call only after explicit approval

### Critical safety rule

Production Graph8 voice calls are real outbound calls and consume credits.

Therefore PursuitOS must expose:

```text
EXECUTION_MODE=demo
EXECUTION_MODE=sandbox
EXECUTION_MODE=live
## 9. Optional Graph8 workflow

After MVP, create one Graph8 workflow:

```text
Trigger: pursuit_status changes to APPROVED
    ↓
AI/Skill: create pursuit workstream
    ↓
Branch: security_required?
    ├─ yes → create security review task
    └─ no
    ↓
Create commercial task
    ↓
Create technical task
    ↓
Create executive review task
```

Use `POST /workflows/validate` before execution. Graph8 warns that workflow execution and outreach nodes can create real activity. https://docs.graph8.com/developers/workflows/

## 10. Webhooks

Subscribe the PursuitOS backend to relevant outcome events such as:

- reply received
- meeting booked
- contact enriched
- contact created
- sequence completed
- campaign launched
- form submitted
- visitor identified

Webhook payloads are HMAC-signed. Verify the signature before enqueueing an event. Graph8 documents retry behavior for failed deliveries. https://docs.graph8.com/developers/ and https://docs.graph8.com/developers/api-faq/

## 11. Credit strategy

Prefer free/read operations wherever possible.

Use paid operations only when they add material evidence:
- single-person/company enrichment
- AI draft generation inside Graph8 if needed
- Graph8 skill execution when useful
- meeting booking
- sequence/campaign actions

Use our Gemini/OSS model for document parsing and council reasoning so Graph8 credits are spent on Graph8-specific capabilities rather than generic language generation.

## 12. Important exclusions

Do not make these core dependencies:

- Graph8 custom objects: officially documented as preview/gated in the API reference. Use deals + custom fields instead. https://docs.graph8.com/developers/api-reference/operations/create_object_objects_post/
- A Graph8-native RFP signal detector: not assumed. RFP ingestion is our responsibility.
- Direct LinkedIn scraping: prohibited by project policy; use Graph8-returned social/Radar evidence.
- Security Questionnaire API as a required programmatic dependency: use the native module where the hackathon environment exposes it; otherwise create a pursuit task/workstream pointing into Graph8.
