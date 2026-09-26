# 06 — MVP Build Plan

## 1. Guiding rule

Build the **smallest system that makes Graph8 look indispensable**.

No generic CRM. No lead-gen engine. No new scraping stack. No custom foundation model.

## 2. Weekend scope

### Must ship

1. RFP/document upload
2. Requirement extraction
3. Graph8 company/deal resolution
4. Graph8 historical context
5. Graph8 account reality scan
6. Evidence timeline
7. Five-agent council
8. Bid/No-bid decision
9. Pursuit dashboard
10. Approved Graph8 deal/task/note projection
11. Demo-safe execution with visible Graph8 changes

### Should ship

12. Existing closed-lost deal comparison
13. Buying committee coverage
14. Graph8 Radar/social evidence
15. Draft quote creation
16. Meeting scheduling proposal
17. Webhook-driven outcome update

### Stretch

18. Graph8 workflow creation
19. Graph8 skill for pursuit summary
20. Similar-deal retrieval using OpenSearch if available
21. Outcome feedback loop
22. Re-open/renewal watch mode

## 3. Day 1 — Foundation

### Hour 0–1: environment

- Initialize Next.js/TypeScript project.
- Connect Graph8 API key.
- Validate `@graph8/sdk` server-side.
- Connect Graph8 MCP in developer environment.
- Create Supabase project.
- Seed one demo account and one sample RFP.

### Hour 1–3: Graph8 adapter

Implement:

```text
getCompany()
getCompanyContacts()
getDeals()
getDeal()
getNotes()
getActivities()
getInbox()
getMeetings()
getQuotes()
getPipeline()
getFields()
createTask()
createNote()
createOrUpdateDeal()
setField()
createQuoteDraft()
```

Add a fake adapter implementation for unit tests.

### Hour 3–5: document parser

Support:
- PDF text extraction
- DOCX extraction
- XLSX row extraction

Fallback to Gemini multimodal parsing for scanned/complex pages.

Output normalized requirements.

### Hour 5–8: evidence engine

Implement parallel Graph8 reads and evidence normalization.

Output:

```text
Account snapshot
Historical deal snapshot
Current signal snapshot
Relationship snapshot
Competitive snapshot
```

### Hour 8–11: UI shell

Pages:

```text
/pursuits
/pursuits/new
/pursuits/:id
/pursuits/:id/council
/pursuits/:id/actions
```

Focus on one excellent pursuit screen rather than many dashboards.

## 4. Day 2 — Intelligence + execution

### Hour 12–15: council

Implement role prompts, structured outputs, parallel execution, validation and synthesis.

### Hour 15–18: pursuit plan

Generate:
- risks
- missing stakeholders
- workstreams
- Graph8 tasks
- next meeting request
- quote requirements

### Hour 18–21: Graph8 projection

Approval creates:
- Graph8 deal or updates existing deal
- custom fields
- note with decision summary
- tasks with associations
- optional quote draft

### Hour 21–24: evidence UX

Make every important claim clickable:

```text
“New CTO joined” → Graph8 source
“12 sales hires” → Hiring evidence
“Previous deal lost on timeline” → Graph8 deal
```

### Hour 24–28: reliability

- retry/backoff
- idempotency keys
- duplicate prevention
- failure states
- loading states
- demo data reset

### Hour 28–31: demo polish

- remove dead screens
- improve empty states
- make decision panel excellent
- add “Why?” drawers
- show Graph8 execution results

### Hour 31–34: rehearsal

Run from clean sandbox state 3 times.

### Hour 34–36: freeze

- public GitHub
- README update
- screenshots
- architecture diagram
- final demo data

## 5. Engineering work breakdown

### Person A — Graph8/backend

- Graph8 SDK adapter
- MCP integration
- Graph8 writes
- webhooks
- database

### Person B — AI/intelligence

- document parser
- evidence normalization
- historical matching
- council
- scoring

### Person C — frontend/product

- pursuit dashboard
- evidence timeline
- council visualization
- approval flow
- demo polish

Solo fallback: build in this order:

1. Graph8 adapter
2. RFP parser
3. council
4. pursuit page
5. write-back
6. polish

## 6. Test strategy

### Unit

- requirement extraction schema
- evidence normalization
- score calculation
- Graph8 request payloads
- approval guards

### Integration

- sandbox Graph8 reads
- create/update deal
- task creation
- custom fields
- quote draft

### E2E

One golden scenario:

```text
RFP upload
→ account resolve
→ context pull
→ council
→ conditional bid
→ approve
→ Graph8 write
→ verify
```

## 7. Performance optimizations

- Parallelize independent Graph8 reads.
- Cache company/contact/deal reads for the duration of a council run.
- Cache immutable document extraction.
- Request only relevant page/record ranges.
- Use `limit` deliberately; don't load 200 records to find 5.
- Batch writes where Graph8 supports them.
- Use Graph8 assert/upsert endpoints for idempotent creation.
- Use a single model call for each council role, then one synthesis call.
- Truncate irrelevant inbox threads/meeting transcripts after extracting relevant evidence.
- Never give the model the full CRM dump.

## 8. Demo-mode safeguards

A runtime flag controls external side effects:

```text
PURSUIT_EXECUTION_MODE=demo
```

In `demo` mode:
- sequence enrollment blocked
- campaign launch blocked
- quote send blocked
- outbound reply blocked
- meeting booking can be previewed but not committed unless explicitly needed
- workflow execute blocked unless sandbox-safe

The UI must show:

> **Demo mode — no external messages are being sent.**

## 9. Deferred features

Do not build before the core loop works:

- fine-tuning
- autonomous campaign optimization
- custom object app publishing
- vector database
- full document collaboration
- public user onboarding
- billing
- multi-tenant auth beyond what Graph8 requires
- general-purpose workflow builder
- native LinkedIn automation
- full proposal editor
