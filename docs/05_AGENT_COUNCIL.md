# 05 — Multi-Agent Bid Council

## 1. Purpose

The Bid Council is not a theatrical multi-agent debate. It is a structured decision system where each agent owns a different risk dimension and must cite evidence.

## 2. Agents

### A. Commercial Analyst

**Mission:** Determine commercial attractiveness and constraints.

Inputs:
- opportunity value
- requested pricing model
- historical Graph8 quotes/deals
- similar wins/losses
- scope/timeline

Must answer:
- Does this fit our commercial model?
- What pricing risks exist?
- What commercial clarification is needed?

Never invent margins or costs that are not in organizational knowledge or supplied inputs.

### B. CTO / Delivery Analyst

**Mission:** Determine technical and delivery feasibility.

Inputs:
- technical requirements
- integrations
- implementation schedule
- historical delivery/deal notes
- company technology context
- organization knowledge

Must answer:
- What requirements look straightforward?
- What appears risky?
- What requires an architecture/discovery call?

### C. CEO / Strategy Analyst

**Mission:** Determine strategic value.

Inputs:
- account size
- strategic fit
- sector relevance
- existing relationship
- account expansion signals
- competitive environment
- prior customer history

Must answer:
- Is this worth executive attention?
- Is there strategic upside beyond the first deal?

### D. Relationship Analyst

**Mission:** Determine whether there is a credible path into the account.

Inputs:
- Graph8 contacts
- deal contact roles
- buying committee
- meetings
- inbox history
- previous objections
- engagement

Must answer:
- Who is the champion?
- Who is missing?
- Who is the economic buyer?
- Are relationships current or stale?

### E. Competitive Analyst

**Mission:** Identify credible competitive risks from Graph8 evidence.

Inputs:
- Radar
- monitored competitors
- page history
- competitor activity
- intent around competitors
- historical deal notes

Must answer:
- Are competitors present?
- What proof or differentiation is required?
- Is the competitive evidence fresh enough to matter?

## 3. Council protocol

Do not let agents see one another's scores before their first independent assessment. This reduces anchoring.

```text
Opportunity + Evidence Bundle
        │
  ┌─────┼─────┬──────┬──────┐
  ↓     ↓     ↓      ↓      ↓
Comm   CTO   CEO   Relation Compete
  │     │     │      │       │
  └─────┴─────┴──────┴───────┘
                 ↓
          Council Synthesizer
                 ↓
       BID / NO-BID / CONDITIONAL
```

## 4. Evidence contract

Each agent must produce:

```json
{
  "role": "CTO",
  "assessment": "...",
  "evidence": ["ev_1", "ev_9"],
  "risks": ["..."],
  "missing_evidence": ["..."],
  "required_actions": ["..."],
  "score": 0
}
```

The score is a relative decision-support number inside the council. The UI must label it as such.

## 5. Synthesizer rubric

Suggested starting weights:

```text
Commercial fit       20%
Technical/delivery   25%
Relationship path    20%
Strategic fit        15%
Competitive position 10%
Evidence quality     10%
```

Risk is not just subtracted from the score. Some risks are hard gates.

### Example hard gates

- impossible delivery deadline with no path to clarification
- legal/security requirement known to be impossible
- opportunity explicitly outside the organization's offering
- no evidence of a legitimate buyer or project requirement

### Conditional bid

Use when the opportunity is attractive but a small number of missing facts can materially change the decision.

## 6. Anti-hallucination rules

1. No factual sentence without an evidence ID or document source.
2. If a source is stale, state its age.
3. If a social post cannot be verified, label it as an observation, not a fact about buying intent.
4. Never infer a budget from headcount alone.
5. Never infer a competitor from generic category interest.
6. Never infer “likely to buy” from one signal.
7. Never claim that a person is an economic buyer merely from a job title; distinguish Graph8's known role from our inference.
8. Never create a quote amount unless the user/organization has supplied pricing context.

## 7. Current-account research module

This is where the earlier re-engagement idea becomes a component, not the entire product.

The module creates a **THEN / NOW / DELTA** brief:

```text
THEN
- previous deal
- previous objections
- prior stakeholders
- old scope/quote

NOW
- hiring/job change evidence
- intent
- current social evidence
- competitive movement
- current contacts/roles
- recent activities

DELTA
- what materially changed?
- is the change relevant to this opportunity?
- does it reduce/increase risk?
```

## 8. Model selection

Start with one high-quality hosted model through a provider abstraction. Gemini is acceptable for the hackathon.

Optional local/OSS models can handle:
- requirement classification
- evidence deduplication
- embeddings
- cheap routing

Do not spend the weekend fine-tuning unless a measurable extraction/ranking failure appears in evaluation.



## 9. Model prompts

### System prompt — Evidence Analyst

> You are the evidence analyst for a B2B pursuit. Use only supplied evidence. Every factual statement must cite evidence IDs. Separate observations from interpretations. Do not infer a commercial intention from a weak signal. Flag stale, conflicting, or missing evidence.

### System prompt — CTO Analyst

> You are the technical/delivery reviewer. Determine whether the opportunity is technically and operationally pursuable from the supplied requirements and evidence. Identify hidden requirements, delivery risks, dependencies, and questions that must be answered. Never invent technical capabilities.

### System prompt — CEO Analyst

> You are the strategic reviewer. Evaluate whether this opportunity deserves disproportionate organizational attention. Consider strategic fit, account trajectory, relationship access, expansion potential and competitive context. Cite every factual premise.

### System prompt — Relationship Analyst

> You are the account-relationship reviewer. Reconstruct who knows whom, who engaged, what was previously discussed, which stakeholders are missing, and whether the relationship evidence is current.

### System prompt — Competitive Analyst

> You are the competitive reviewer. Use only Graph8/Radar evidence supplied to you. Distinguish monitored observations from assumptions. Identify competitive risks, evidence gaps and required differentiation.

### System prompt — Synthesizer

> You are the final Bid Council. Reconcile independent assessments. Do not average away a hard blocker. Choose BID, NO_BID, or CONDITIONAL_BID. Every material conclusion must cite evidence. Return a concise pursuit plan with owners, missing facts, and the next decision-changing action.

## 10. Council output

The final output must be concise enough to read in under 30 seconds:

```text
DECISION: CONDITIONAL_BID

Why:
+ Strong historical fit
+ Existing technical relationship
+ Current account expansion

Risks:
! Delivery timeline
! Security requirement

Need before submission:
1. Technical feasibility confirmation
2. Security review
3. CIO/CTO clarification call

Recommended next action:
Book 30-minute technical discovery with CTO.
```

## 11. Communication Strategist

The Communication Strategist converts the council decision into the safest and highest-value buyer interaction.

It must choose one:

- WAIT
- EMAIL
- CLARIFICATION_EMAIL
- PHONE_CALL
- MEETING
- EXECUTIVE_INTRO
- PROCUREMENT_PORTAL
- HUMAN_REVIEW

The strategist receives:

- final council decision
- RFP communication policy
- requirement gaps
- current stakeholder coverage
- relationship history
- current Graph8 signals
- previous communications

It must never override a hard communication restriction from the RFP.

### Phone-call gate

A PHONE_CALL recommendation requires:

1. Direct contact is permitted.
2. A valid business phone number exists.
3. A clear call objective exists.
4. The call is more efficient than email for the identified objective.
5. The recommended contact is relevant to the objective.
6. No unresolved procurement restriction exists.

The output schema:

```json
{
  "action": "PHONE_CALL",
  "contact_id": "g8_contact_id",
  "objective": "Clarify whether UAT is included in the six-month deadline.",
  "reason": "...",
  "evidence_ids": ["ev_101", "ev_110"],
  "questions": ["..."],
  "avoid_topics": ["pricing"],
  "expected_disposition": "timeline_clarified",
  "requires_human_approval": true
}
