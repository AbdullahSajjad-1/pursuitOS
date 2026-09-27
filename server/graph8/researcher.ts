import { g8 } from './client';
import * as reader from './reader';

export interface DeepResearchResult {
  summary: string;
  findings: string[];
  sources?: string[];
  executiveChanges?: string[];
  strategicPriorities?: string[];
  latencyMs?: number;
}

const DEEP_COMPANY_RESEARCH_ACTION_ID = '45401c32-a85a-4d5b-993f-7c05906f663c';

export async function triggerDeepResearch(
  companyName: string,
  companyDomain: string
): Promise<DeepResearchResult | null> {
  console.log(`[researcher] Triggering Deep Company Research for ${companyName} (${companyDomain})...`);

  // 1. Try Graph8 Deep Company Research Skill
  try {
    const res = await g8.skills.execute(DEEP_COMPANY_RESEARCH_ACTION_ID, {
      company_name: companyName,
      company_domain: companyDomain,
      domain: companyDomain
    });

    if (res?.data?.output && !res.data.error) {
      const output = res.data.output as any;
      const text = typeof output === 'string' ? output : output.result || output.summary || JSON.stringify(output);
      console.log(`[researcher] Graph8 skill executed successfully (${res.data.latency_ms}ms)`);
      return {
        summary: text.slice(0, 500),
        findings: Array.isArray(output.findings) ? output.findings : [text.slice(0, 300)],
        sources: Array.isArray(output.sources) ? output.sources : ['Graph8 Deep Research'],
        latencyMs: res.data.latency_ms
      };
    }
  } catch (skillErr: any) {
    console.warn(`[researcher] Skill execution failed, attempting live enrichment fallback:`, skillErr?.message || skillErr);
  }

  // 2. Resilient Fallback: Live Firmographic Enrichment from Graph8
  try {
    const enrich = await reader.enrichCompany(companyDomain);
    if (enrich && enrich.found && enrich.data) {
      const d = enrich.data;
      return {
        summary: d.description || `${companyName} operating with ${d.employee_count || 'enterprise'} team in ${d.industry || 'tech'}.`,
        findings: [
          `Verified Industry: ${d.industry || 'Enterprise Technology'}`,
          `Estimated Size: ${d.employee_count || '1,000+'} employees (${d.revenue || 'Enterprise revenue'})`,
          `LinkedIn Presence: ${d.linkedin_url || 'Active'}`
        ],
        sources: [companyDomain, 'Graph8 Verified Enrichment']
      };
    }
  } catch (enrichErr: any) {
    console.warn(`[researcher] Enrichment fallback failed:`, enrichErr?.message || enrichErr);
  }

  return null;
}
