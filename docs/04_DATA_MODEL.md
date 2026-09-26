# 04 — Data Model & Domain Contracts

## 1. Design goal

Keep the local database small. It exists to make PursuitOS reliable, resumable and auditable—not to duplicate Graph8.

## 2. Core entities

### `pursuits`

```text
id
status
source_type             # rfp | deal | lost_deal | account_watch
source_document_id
company_graph8_id
deal_graph8_id
primary_contact_graph8_id
bid_decision            # pending | bid | conditional_bid | no_bid
bid_confidence          # decision-support confidence, not win probability
strategic_fit
a technical_fit
t echnical_fit
relationship_fit
competitive_risk
primary_blocker
pursuit_deadline
summary
created_at
updated_at
```

> Rename typo-prone fields during implementation; this schema is conceptual.

Recommended final fields:

```text
id
status
source_type
source_document_id
graph8_company_id
graph8_deal_id
graph8_primary_contact_id
bid_decision
bid_confidence
strategic_fit
technical_fit
relationship_fit
competitive_risk
primary_blocker
pursuit_deadline
summary
created_at
updated_at
```

### `opportunity_requirements`

```text
id
pursuit_id
category
text
priority
source_ref
status                  # unknown | verified | satisfied | blocked
owner_role
notes
created_at
```

### `evidence`

```text
id
pursuit_id
source
source_type
source_id
title
excerpt
structured_value_json
observed_at
retrieved_at
freshness_days
confidence
citation_json
created_at
```

### `evidence_events`

Groups individual signals into business events.

```text
id
pursuit_id
title
summary
strength
first_observed_at
last_observed_at
evidence_ids_json
model_reasoning
status                 # observed | watch | material | stale
```

### `historical_matches`

```text
id
pursuit_id
graph8_deal_id
match_type             # won | lost | open
similarity_score
matched_dimensions_json
outcome_reason
source_evidence_ids_json
```

Similarity is for retrieval/ranking, not a predicted outcome probability.

### `council_runs`

```text
id
pursuit_id
run_number
provider
model
prompt_version
status
started_at
completed_at
input_snapshot_id
output_json
```

### `council_reviews`

```text
id
council_run_id
role
decision
assessment
positive_factors_json
risks_json
missing_evidence_json
evidence_ids_json
score
```

Scores are internal decision-support values and should not be presented as calibrated win probabilities.

### `pursuit_actions`

```text
id
pursuit_id
action_type
description
risk_level
approval_required
status                  # proposed | approved | executing | succeeded | failed | cancelled
graph8_operation
request_key
request_payload_hash
result_json
created_at
executed_at
```

### `documents`

```text
id
pursuit_id
file_name
mime_type
storage_key
sha256
page_count
parse_status
created_at
```

### `jobs`

```text
id
job_type
pursuit_id
status
attempts
run_after
locked_at
last_error
payload_json
created_at
updated_at
```

## 3. Graph8 references

Never store full mutable Graph8 objects as the primary local representation.

Store:

```text
provider = graph8
graph8_entity_type = company|contact|deal|task|quote|meeting|signal|etc
graph8_entity_id = string
```

On display, fetch fresh data or use a short-lived cache.

## 4. Evidence rules

Every model-generated factual statement must map to one or more evidence IDs.

Example:

```json
{
  "claim": "The company expanded its data organization.",
  "evidence_ids": ["ev_104", "ev_111", "ev_118"]
}
```

The UI should let the user click the claim and inspect:
- source
- date
- Graph8 record ID
- excerpt/summary
- freshness

## 5. Decision schema

```json
{
  "decision": "CONDITIONAL_BID",
  "confidence": 0.86,
  "why": ["..."],
  "risks": ["..."],
  "missing_evidence": ["..."],
  "required_before_submission": ["..."],
  "evidence_ids": ["..."],
  "recommended_next_action": "..."
}
```

`confidence` describes confidence in the **decision support**, not probability of winning the deal.

## 6. Graph8 write projection

The local pursuit is projected back into Graph8 using standard deal + custom fields:

```text
Graph8 Deal
├── pursuit_status
├── bid_decision
├── bid_confidence
├── strategic_fit
├── technical_fit
├── relationship_fit
├── competitive_risk
├── primary_blocker
├── pursuit_deadline
├── pursuit_id
└── last_pursuit_scan_at
```

Notes capture the human-readable council summary. Tasks capture operational next actions.

## 7. State machine

```text
DRAFT
  ↓
INGESTING
  ↓
ANALYZING
  ↓
READY_FOR_REVIEW
  ├───────────────┐
  ↓               ↓
NO_BID          CONDITIONAL_BID
                  ↓
                 BID
                  ↓
            EXECUTION_PLANNED
                  ↓
             EXECUTION_ACTIVE
                  ↓
         ┌────────┼─────────┐
         ↓        ↓         ↓
        WON      LOST     WITHDRAWN
```

## 8. Idempotent operation keys

Every action needs a deterministic key:

```text
pursuit:{id}:deal-sync
pursuit:{id}:fields-sync
pursuit:{id}:note:council:v{run}
pursuit:{id}:task:{taskKey}:v1
pursuit:{id}:quote:draft:v1
```

## 9. Data retention

Hackathon defaults:
- raw uploaded documents retained locally for the project
- model inputs/outputs retained for audit
- Graph8 PII references retained as IDs where possible
- no unnecessary duplicate contact/company PII

Production-ready retention can be tightened after the demo.
