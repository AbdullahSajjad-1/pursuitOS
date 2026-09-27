import { pgTable, serial, text, timestamp, boolean, integer, jsonb, uuid } from 'drizzle-orm/pg-core';

export const pursuits = pgTable('pursuits', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  companyId: text('company_id'),
  companyDomain: text('company_domain'),
  status: text('status').notNull().default('DRAFT'), // DRAFT, ANALYZING, READY_FOR_REVIEW, BID, NO_BID, CONDITIONAL_BID, EXECUTED, DENIED, WATCH
  bidConfidence: text('bid_confidence'), // low, medium, high
  dealId: text('deal_id'), // Graph8 Deal ID
  pursuitType: text('pursuit_type').default('NEW'), // NEW, REVIVAL
  sourceDealId: text('source_deal_id'), // Graph8 Deal ID that triggered revival
  whyNow: jsonb('why_now'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id),
  filename: text('filename').notNull(),
  fileHash: text('file_hash').notNull(),
  content: text('content'),
  status: text('status').default('PENDING'), // PENDING, PARSING, COMPLETED, ERROR
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const opportunityRequirements = pgTable('opportunity_requirements', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  category: text('category').notNull(),
  text: text('text').notNull(),
  priority: text('priority').notNull(), // critical, important, nice_to_have
  sourceRef: text('source_ref'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const evidence = pgTable('evidence', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  source: text('source').notNull(), // graph8, document, model
  sourceType: text('source_type').notNull(), // company, contact, deal, activity, meeting, signal, radar
  sourceId: text('source_id'), // Graph8 entity ID
  content: text('content').notNull(),
  confidence: text('confidence'),
  freshnessDays: integer('freshness_days'),
  evidenceType: text('evidence_type'), // executive_change, intent_signal, relationship_coverage, historical_precedent, hiring_wave, budget_change, etc.
  qualityScore: integer('quality_score'), // 0-100
  claim: text('claim'), // Human-readable assertion
  retrievedAt: timestamp('retrieved_at').defaultNow().notNull(),
  observedAt: timestamp('observed_at'),
});

export const evidenceEvents = pgTable('evidence_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  impact: text('impact'), // positive, negative, neutral
  severity: text('severity'), // observed, watch, material, stale
  evidenceIds: jsonb('evidence_ids').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const historicalMatches = pgTable('historical_matches', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  dealId: text('deal_id').notNull(), // Graph8 Deal ID
  similarityScore: integer('similarity_score'),
  lossReason: text('loss_reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const councilRuns = pgTable('council_runs', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  status: text('status').notNull().default('RUNNING'), // RUNNING, COMPLETED, ERROR
  decision: text('decision'), // bid, no_bid, conditional_bid, watch
  confidence: text('confidence'),
  synthesisRationale: text('synthesis_rationale'),
  recommendedAction: text('recommended_action'),
  communicationStrategy: jsonb('communication_strategy'),
  whyNow: jsonb('why_now'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const councilReviews = pgTable('council_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  runId: uuid('run_id').references(() => councilRuns.id).notNull(),
  role: text('role').notNull(), // commercial, cto, ceo, relationship, competitive
  assessment: text('assessment').notNull(),
  evidenceIds: jsonb('evidence_ids').$type<string[]>(),
  positiveFactors: jsonb('positive_factors').$type<string[]>(),
  risks: jsonb('risks').$type<string[]>(),
  missingEvidence: jsonb('missing_evidence').$type<string[]>(),
  requiredActions: jsonb('required_actions').$type<string[]>(),
  recommendation: text('recommendation'),
  confidence: text('confidence'),
  score: integer('score'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pursuitActions = pgTable('pursuit_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id).notNull(),
  actionType: text('action_type').notNull(), // deal_create, task_create, note_create
  payload: jsonb('payload').notNull(),
  status: text('status').notNull().default('PROPOSED'), // PROPOSED, APPROVED, EXECUTED, ERROR
  executionResult: jsonb('execution_result'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: text('type').notNull(),
  payload: jsonb('payload'),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const auditEvents = pgTable('audit_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  pursuitId: uuid('pursuit_id').references(() => pursuits.id),
  actionType: text('action_type').notNull(),
  actor: text('actor').notNull(), // system, human, agent
  description: text('description').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
