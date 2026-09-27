/**
 * Communication Strategist — runs after the council synthesis to generate
 * the exact buyer communication strategy and script.
 */

import { getAI, getModelForRole, withRetry } from '../ai/router';
import { SynthesisResult } from './synthesizer';

export interface TargetContact {
  name: string;
  title: string;
  email: string;
  phone?: string;
}

export interface CommunicationStrategyResult {
  action: 'PHONE_CALL' | 'EMAIL' | 'CLARIFICATION_EMAIL' | 'MEETING' | 'EXECUTIVE_INTRO' | 'WAIT';
  voice_agent_directive: 'OUTBOUND_CALL' | 'DISPATCH_EMAIL_DO_NOT_CALL' | 'STAND_DOWN';
  target_name: string;
  target_role: string;
  target_phone: string;
  target_email: string;
  objective: string;
  spoken_script: string;
  script_or_draft: string;
  key_questions: string[];
}

const StrategySchema = {
  type: 'object',
  properties: {
    action: { 
      type: 'string', 
      enum: ['PHONE_CALL', 'EMAIL', 'CLARIFICATION_EMAIL', 'MEETING', 'EXECUTIVE_INTRO', 'WAIT'] 
    },
    voice_agent_directive: {
      type: 'string',
      enum: ['OUTBOUND_CALL', 'DISPATCH_EMAIL_DO_NOT_CALL', 'STAND_DOWN']
    },
    objective: { type: 'string' },
    target_role: { type: 'string' },
    spoken_script: { type: 'string', description: 'Exact natural spoken phone script if calling' },
    script_or_draft: { type: 'string', description: 'Written message or email draft' },
    key_questions: {
      type: 'array',
      items: { type: 'string' },
    }
  },
  required: ['action', 'voice_agent_directive', 'objective', 'target_role', 'spoken_script', 'script_or_draft', 'key_questions']
};

export async function runCommunicationStrategist(
  pursuitName: string,
  companyDomain: string,
  synthesis: SynthesisResult,
  contact?: TargetContact
): Promise<CommunicationStrategyResult> {
  console.log('[strategist] Running Communication Strategist with Voice Agent directives...');
  const ai = getAI();
  const model = getModelForRole('synthesis');

  const contactName = contact?.name || 'Primary Procurement Sponsor';
  const contactRole = contact?.title || 'Decision Maker';
  const contactPhone = contact?.phone || 'Direct phone on file';
  const contactEmail = contact?.email || `procurement@${companyDomain}`;

  const system = `You are the COMMUNICATION STRATEGIST & VOICE AGENT DIRECTOR.
Your job is to read the Chief Strategy Officer's final decision and determine the exact next interaction with the buyer.
You must choose one action: PHONE_CALL, EMAIL, CLARIFICATION_EMAIL, MEETING, EXECUTIVE_INTRO, or WAIT.

VOICE AGENT RULES:
1. If the action is PHONE_CALL:
   - Set voice_agent_directive = "OUTBOUND_CALL"
   - Produce a concise, natural, professional spoken script tailored to ${contactName} (${contactRole}). No robotic language.
2. If the action is EMAIL or CLARIFICATION_EMAIL:
   - Set voice_agent_directive = "DISPATCH_EMAIL_DO_NOT_CALL"
   - Produce a structured email draft in script_or_draft.
3. If the action is WAIT:
   - Set voice_agent_directive = "STAND_DOWN"
   - Do not call or email.

Never output raw database UUIDs. Address ${contactName} directly.`;

  const user = `PURSUIT: ${pursuitName}
COMPANY: ${companyDomain}
PRIMARY CONTACT: ${contactName} (${contactRole}, Phone: ${contactPhone}, Email: ${contactEmail})

COUNCIL SYNTHESIS:
Decision: ${synthesis.decision}
Confidence: ${synthesis.confidence}
Rationale: ${synthesis.rationale}
Key Risks: ${synthesis.key_risks.join(', ')}
Conditions: ${synthesis.conditions.join(', ')}

Provide the communication strategy JSON.`;

  try {
    const response = await withRetry(
      () => ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: user }] }],
        config: {
          systemInstruction: system,
          responseMimeType: 'application/json',
          responseSchema: StrategySchema as any,
          temperature: 0.4,
        },
      }),
      'synthesis',
    );

    const raw = JSON.parse(response.text || '{}');
    const isCall = raw.action === 'PHONE_CALL';
    const isWait = raw.action === 'WAIT' || synthesis.decision === 'no_bid';

    return {
      action: raw.action || (isWait ? 'WAIT' : 'PHONE_CALL'),
      voice_agent_directive: isWait ? 'STAND_DOWN' : isCall ? 'OUTBOUND_CALL' : 'DISPATCH_EMAIL_DO_NOT_CALL',
      target_name: contactName,
      target_role: contactRole,
      target_phone: contactPhone,
      target_email: contactEmail,
      objective: raw.objective || 'Evaluate initial RFP alignment',
      spoken_script: raw.spoken_script || `Hello ${contactName}, I am calling from PursuitOS regarding the ${pursuitName} opportunity to clarify key operational timelines.`,
      script_or_draft: raw.script_or_draft || '',
      key_questions: raw.key_questions || []
    };
  } catch (err) {
    console.error('[strategist] Communication strategist error, using safe fallback:', err);
    const isWait = synthesis.decision === 'no_bid';
    return {
      action: isWait ? 'WAIT' : 'PHONE_CALL',
      voice_agent_directive: isWait ? 'STAND_DOWN' : 'OUTBOUND_CALL',
      target_name: contactName,
      target_role: contactRole,
      target_phone: contactPhone,
      target_email: contactEmail,
      objective: `Clarify cutover requirements and establish executive sponsorship with ${contactName}.`,
      spoken_script: `Hi ${contactName}, Abdullah calling regarding ${companyDomain}'s RFP for ${pursuitName}. Our architecture council reviewed the requirements and identified a critical question regarding integration boundaries before we finalize our proposal. Do you have two minutes?`,
      script_or_draft: `Hi ${contactName},\n\nWe have completed our technical assessment for ${pursuitName} and would like to confirm key integration cutover requirements before finalizing our response.\n\nBest regards,\nPursuitOS Team`,
      key_questions: [
        'What are the critical integration milestones for the legacy architecture?',
        'Can discovery sessions be arranged with the technical steering committee?'
      ]
    };
  }
}
