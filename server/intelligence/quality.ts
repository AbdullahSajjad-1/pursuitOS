export type FreshnessCategory = 'current' | 'recent' | 'aging' | 'stale';

export interface EvidenceQualityAssessment {
  evidenceType: string;
  freshness: FreshnessCategory;
  qualityScore: number; // 0 - 100
  confidence: number;   // 0.0 - 1.0
  claim: string;
}

export function computeFreshness(days: number | null | undefined): FreshnessCategory {
  if (days == null || isNaN(days)) return 'recent';
  if (days <= 7) return 'current';
  if (days <= 30) return 'recent';
  if (days <= 90) return 'aging';
  return 'stale';
}

export function assessEvidenceRecord(record: {
  source: string;
  sourceType: string;
  content: string;
  freshnessDays?: number | null;
  observedAt?: Date | string | null;
}): EvidenceQualityAssessment {
  let parsedContent: any = {};
  try {
    parsedContent = typeof record.content === 'string' ? JSON.parse(record.content) : record.content;
  } catch (_) {
    parsedContent = { text: record.content };
  }

  const freshnessDays = record.freshnessDays ?? 7;
  const freshness = computeFreshness(freshnessDays);

  // Freshness decay factor
  const decayMap: Record<FreshnessCategory, number> = {
    current: 1.0,
    recent: 0.9,
    aging: 0.75,
    stale: 0.55
  };
  const decay = decayMap[freshness];

  let evidenceType = 'general_intel';
  let baseScore = 70;
  let claim = 'Account intelligence observed';

  switch (record.sourceType) {
    case 'company':
    case 'company_linkedin': {
      evidenceType = 'company_firmographics';
      baseScore = 90;
      const name = parsedContent.name || parsedContent.companyName || 'Target account';
      const size = parsedContent.employeeCount ? `${parsedContent.employeeCount} employees` : '';
      const rev = parsedContent.annualRevenue || parsedContent.revenueBracket ? `rev: ${parsedContent.annualRevenue || parsedContent.revenueBracket}` : '';
      const ind = parsedContent.industry ? `in ${parsedContent.industry}` : '';
      claim = `${name} profile verified ${[ind, size, rev].filter(Boolean).join(', ')}`;
      break;
    }

    case 'contact': {
      const title = (parsedContent.title || parsedContent.job_title || '').toLowerCase();
      const isExec = title.includes('chief') || title.includes('cto') || title.includes('ciso') ||
                     title.includes('cio') || title.includes('cfo') || title.includes('ceo') ||
                     title.includes('vp') || title.includes('vice president') || title.includes('head of');
      
      evidenceType = isExec ? 'executive_change' : 'relationship_coverage';
      baseScore = isExec ? 95 : 85;
      const fullName = `${parsedContent.firstName || ''} ${parsedContent.lastName || ''}`.trim() || parsedContent.email || 'Executive';
      const roleStr = parsedContent.title || 'Stakeholder';
      claim = `${roleStr} (${fullName}) identified with active contact channels in Graph8 CRM`;
      break;
    }

    case 'deal': {
      evidenceType = 'historical_precedent';
      baseScore = 92;
      const dealName = parsedContent.name || 'Prior Deal';
      const stage = parsedContent.stage || parsedContent.stageName || 'closed';
      const amountStr = parsedContent.amount ? ` valued at $${Number(parsedContent.amount).toLocaleString()}` : '';
      claim = `Prior deal "${dealName}"${amountStr} recorded at stage ${stage}`;
      break;
    }

    case 'signal': {
      evidenceType = 'intent_signal';
      baseScore = 80;
      const topic = parsedContent.topic || 'solutions';
      claim = `Active buying signal detected on "${topic}" with score ${parsedContent.score || 'high'}`;
      break;
    }

    case 'radar': {
      evidenceType = 'competitive_movement';
      baseScore = 82;
      const competitor = parsedContent.competitorName || 'Competitor';
      claim = `Competitive movement observed: ${competitor} activity detected on account`;
      break;
    }

    case 'note': {
      const text = parsedContent.content || parsedContent.text || '';
      if (text.includes('HISTORICAL LOSS REASON:') || text.toLowerCase().includes('lost to') || text.toLowerCase().includes('budget')) {
        evidenceType = 'historical_loss_context';
        baseScore = 94;
        claim = `Historical blocker/loss documented: ${text.slice(0, 140).replace(/[\r\n]+/g, ' ')}`;
      } else {
        evidenceType = 'account_notes';
        baseScore = 78;
        claim = `Account internal context: ${text.slice(0, 140).replace(/[\r\n]+/g, ' ')}`;
      }
      break;
    }

    default: {
      evidenceType = record.sourceType || 'general_intel';
      baseScore = 75;
      claim = `Evidence record from ${record.source}: ${record.content.slice(0, 100)}`;
    }
  }

  const qualityScore = Math.min(100, Math.max(10, Math.round(baseScore * decay)));
  const confidence = Math.round((qualityScore / 100) * 100) / 100;

  return {
    evidenceType,
    freshness,
    qualityScore,
    confidence,
    claim
  };
}

export function assessEvidenceQuality(
  records: Array<{
    source: string;
    sourceType: string;
    content: string;
    freshnessDays?: number | null;
    observedAt?: Date | string | null;
  }>
) {
  return records.map(record => ({
    ...record,
    quality: assessEvidenceRecord(record)
  }));
}
