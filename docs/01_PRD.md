# 01 — Product Requirements Document

## 1. Product

**Name:** PursuitOS  
**Tagline:** *Know when to bid. Know how to win.*  
**Category:** AI bid intelligence + pursuit orchestration  
**Primary backend:** Graph8 via REST/SDK + MCP  
**Target:** B2B services firms, consultancies, agencies, implementation partners, enterprise software/services sales teams

## 2. Problem

Complex revenue opportunities consume scarce expert time before the company knows whether the opportunity is worth pursuing.

A serious RFP or project brief can require sales, solution engineering, delivery, security, finance, legal, executives and procurement coordination. The failure mode is not only losing the bid; it is spending 20–100+ internal hours on a poor-fit opportunity, discovering delivery constraints too late, or missing a strong opportunity because the account context was fragmented across CRM records, inboxes, meetings and external buyer signals.

Graph8 already provides most of the underlying revenue primitives: company/contact data, enrichment, buyer signals, intent, hiring, social listening, competitive intelligence, CRM/deals, inbox, meetings, tasks, quotes, campaigns, sequences, workflows, agents and knowledge. PursuitOS must therefore solve the layer above those primitives rather than recreate them.

## 3. Product thesis

PursuitOS should answer five questions for every complex opportunity:

1. **What exactly are they asking for?**
2. **What do we already know about this account and relationship?**
3. **What has changed recently, and does it materially alter the opportunity?**
4. **Should we pursue it, under what conditions, and what are the risks?**
5. **If we pursue it, what work should happen next—and can Graph8 execute that work?**

The system must produce an evidence-backed decision, not a fabricated win probability.

## 4. Users

### Primary user — Revenue leader / services founder

Needs a fast bid/no-bid answer and confidence that the organization is not wasting scarce pursuit capacity.

### Secondary user — Account executive / business development lead

Needs account context, stakeholder gaps, competitive context, historical precedent, next actions, and a ready-to-run pursuit plan.

### Supporting users — CTO/solutions architect, delivery lead, security, finance, executive sponsor

Need only the portion of the pursuit relevant to them, with evidence and explicit unresolved questions.

## 5. Core workflow

```text
INPUT
  ├─ uploaded RFP / project brief
  ├─ existing Graph8 deal
  ├─ closed-lost opportunity
  └─ strategic account watch
       ↓
PARSE
  requirements • stakeholders • timeline • commercial constraints
       ↓
GRAPH8 ACCOUNT CONTEXT
  CRM • contacts • deals • inbox • meetings • activities • signals
  intent • hiring • social • Radar • buying committee • quotes
       ↓
ACCOUNT REALITY SCAN
  what changed / when / why it matters
       ↓
HISTORICAL MATCHING
  similar won/lost opportunities + reasons + delivery precedent
       ↓
BID COUNCIL
  Commercial • CTO/Delivery • CEO/Strategy • Relationship • Competitive
       ↓
BID / NO-BID / CONDITIONAL BID
       ↓
PURSUIT PLAN
  stakeholders • workstreams • tasks • meeting asks • quote • risks
       ↓
HUMAN APPROVAL
       ↓
GRAPH8 EXECUTION
  deal • tasks • notes • contacts • meetings • workflows • quote draft
       ↓
OUTCOME + LEARNING
```

## 6. Functional requirements

### FR-01 — Opportunity ingestion

The system must accept one of:
- PDF/DOCX/XLSX RFP or project brief.
- Existing Graph8 deal ID.
- Closed-lost Graph8 deal.
- Company/domain for a strategic-account watch.

The ingestion layer must preserve the source document and page/section references where available.

### FR-02 — Requirement extraction

Extract into structured categories:
- Scope
- Technical
- Integration
- Security/compliance
- Delivery
- Commercial
- Procurement/legal
- Timeline/deadline
- Stakeholders
- Evaluation criteria
- Required proof/case studies
- Open questions

Every extracted requirement has a `source_ref` back to the document.

### FR-03 — Graph8 account reconstruction

Use Graph8 to retrieve, when available:
- company record
- existing contacts
- deal history
- open/won/lost deals
- deal contacts/roles
- activities/notes
- inbox threads
- meetings and transcripts
- quotes
- buying committee state
- intent and visitor signals
- hiring/job-change signals
- social listener evidence
- Competitive Radar evidence
- organization knowledge relevant to the pursuit

No prospecting database should be rebuilt locally.

### FR-04 — Current account reality

The system must build a current-state snapshot from recent Graph8 evidence. Examples:
- New executive or champion
- Hiring wave
- Talent move
- Intent increase
- Website engagement
- Relevant social activity
- Competitor movement
- Technology/market changes surfaced by Graph8

The output must separate **observed evidence** from **model interpretation**.

### FR-05 — Historical precedent

For the account and the organization, identify:
- similar won deals
- similar lost deals
- loss reasons
- pricing/scope/timeline patterns
- relevant case studies/proof
- prior objections
- stakeholder patterns

This is our intelligence layer; Graph8 supplies the records.

### FR-06 — Bid Council

Minimum production council:
- Commercial Analyst
- CTO/Delivery Analyst
- CEO/Strategy Analyst
- Relationship/Account Analyst
- Competitive Analyst

Each analyst must return:
- assessment
- evidence IDs
- positive factors
- risks
- missing evidence
- required clarification
- recommendation

The synthesizer returns one of:
- `BID`
- `NO_BID`
- `CONDITIONAL_BID`

It must not claim a calibrated probability of winning unless we have actual validated statistical calibration.

### FR-07 — Pursuit plan

For a BID/CONDITIONAL_BID, create:
- deal record link
- pursuit status
- deadline
- owners
- missing stakeholders
- technical validation workstream
- security/compliance workstream
- commercial workstream
- relationship plan
- competitive plan
- evidence/proof plan
- meeting requests
- unresolved questions

### FR-08 — Graph8 execution

On approval, the system can:
- create/upsert company/contact records
- create/update deal
- associate contacts to deal
- create notes
- create tasks and assign executors
- create/update custom fields
- create a draft quote
- create/validate a workflow
- create or update a sequence only when outreach is explicitly approved
- book meetings only on explicit approval

### FR-09 — Auditability

Every recommendation and side effect must store:
- model/provider
- prompt/version identifier
- input snapshot ID
- Graph8 source IDs
- evidence timestamps
- output
- approval actor/time
- executed Graph8 action/result

### FR-10 — Learning

After outcome, the system records whether the pursuit was:
- won
- lost
- withdrawn
- no decision
- abandoned

The system uses this history to improve similarity retrieval and future recommendations. Learning is initially rule/statistical, not autonomous model fine-tuning.

## 7. Non-goals

PursuitOS will not:
- replace Graph8 prospect search
- replace Graph8 enrichment
- replace Graph8 campaign builder
- replace Graph8 sequencer
- replace Graph8 inbox
- replace Graph8 security questionnaire engine
- replace Graph8 quote/e-sign workflow
- scrape LinkedIn independently
- create a second CRM
- run unsupervised outbound without an approval boundary
- claim that an LLM output is factual without evidence

## 8. Success metrics

### Product metrics
- Time to first bid/no-bid decision
- % of recommendations with cited evidence
- % of required pursuit workstreams automatically created
- Human correction rate on extracted requirements
- Human override rate on council decision
- Duplicate/invalid Graph8 mutation rate

### Business metrics for the demo
- Hours of pursuit preparation avoided
- Time from opportunity intake to pursuit plan
- Number of relevant Graph8 objects updated by one approved run
- Quality of evidence trail

## 9. MVP acceptance criteria

A demo-ready MVP is complete when:

1. An RFP can be uploaded and parsed.
2. A Graph8 company/deal can be selected or resolved.
3. Account context can be pulled through Graph8.
4. Recent Graph8 signals and relationship evidence appear in an evidence timeline.
5. The council produces a structured bid/no-bid decision with citations.
6. An approved bid creates/updates a Graph8 deal and at least five traceable tasks/work items.
7. The app records the execution result and shows the updated Graph8 state.
8. The entire demo runs in Graph8 sandbox/test conditions with no real sends.
