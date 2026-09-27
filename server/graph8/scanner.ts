import { g8 } from './client';
import * as reader from './reader';
import { db } from '../db/client';
import { pursuits } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export interface LostDeal {
  dealId: string;
  dealName: string;
  companyId: string;
  companyName: string;
  companyDomain: string;
  amount: number;
  closedDate: string;
  lossReason: string | null;
  accountNotes?: string | null;
  daysSinceLost: number;
  hasActiveRevival?: boolean;
  activePursuitId?: string;
  activePursuitStatus?: string;
}

const CLOSED_LOST_STAGE_ID = '264c3d8f-88ab-404b-aca2-4b83231f9d3c';

export async function scanClosedLostDeals(): Promise<LostDeal[]> {
  try {
    // 1. Fetch closed-lost deals from Graph8
    const rawDeals = await reader.getAllDeals({ stage_id: CLOSED_LOST_STAGE_ID, limit: 100 });
    
    // Also include any deals where stage indicates lost in case of variations
    const lostDealsList = rawDeals.filter(
      d => d.stageId === CLOSED_LOST_STAGE_ID || 
           d.stage.toLowerCase().includes('lost') || 
           d.stageName?.toLowerCase().includes('lost')
    );

    // 2. Fetch existing revival pursuits from local DB to flag existing pursuits
    let existingPursuits: any[] = [];
    try {
      existingPursuits = await db.select().from(pursuits);
    } catch (dbErr) {
      console.warn('[scanner] Could not query pursuits table for status check:', dbErr);
    }

    const companyCache = new Map<string, { name: string; domain: string }>();
    const results: LostDeal[] = [];

    for (const deal of lostDealsList) {
      let companyName = '';
      let companyDomain = '';

      if (deal.companyId) {
        if (companyCache.has(deal.companyId)) {
          const cached = companyCache.get(deal.companyId)!;
          companyName = cached.name;
          companyDomain = cached.domain;
        } else {
          try {
            const comp = await reader.getCompany(deal.companyId);
            if (comp) {
              companyName = comp.name;
              companyDomain = comp.domain;
              companyCache.set(deal.companyId, { name: comp.name, domain: comp.domain });
            }
          } catch (err: any) {
            console.warn(`[scanner] Failed to get company for deal ${deal.id}:`, err?.message || err);
          }
        }
      }

      // Fetch deal notes to extract loss reason
      let lossReason: string | null = null;
      let accountNotes: string | null = null;

      try {
        const notes = await reader.getDealNotes(deal.id);
        if (notes.length > 0) {
          // Combine or parse notes
          for (const n of notes) {
            const content = n.content || '';
            if (content.includes('HISTORICAL LOSS REASON:')) {
              const parts = content.split('ACCOUNT NOTES:');
              lossReason = parts[0].replace('HISTORICAL LOSS REASON:', '').trim();
              if (parts[1]) {
                accountNotes = parts[1].trim();
              }
            } else if (!lossReason) {
              lossReason = content.trim();
            }
          }
        }
      } catch (noteErr: any) {
        console.warn(`[scanner] Failed to get notes for deal ${deal.id}:`, noteErr?.message || noteErr);
      }

      // Calculate days since lost
      let daysSinceLost = 0;
      if (deal.closeDate) {
        const closeTimestamp = new Date(deal.closeDate).getTime();
        if (!isNaN(closeTimestamp)) {
          daysSinceLost = Math.max(0, Math.floor((Date.now() - closeTimestamp) / (1000 * 60 * 60 * 24)));
        }
      }

      // Check if active revival pursuit exists
      const matchingPursuit = existingPursuits.find(
        p => p.sourceDealId === deal.id || (p.dealId === deal.id && p.pursuitType === 'REVIVAL')
      );

      results.push({
        dealId: deal.id,
        dealName: deal.name,
        companyId: deal.companyId,
        companyName: companyName || deal.name.split(' ')[0] || 'Unknown Company',
        companyDomain: companyDomain,
        amount: deal.amount,
        closedDate: deal.closeDate || deal.createdAt,
        lossReason: lossReason || 'No recorded loss reason in CRM notes',
        accountNotes: accountNotes || null,
        daysSinceLost,
        hasActiveRevival: !!matchingPursuit,
        activePursuitId: matchingPursuit?.id,
        activePursuitStatus: matchingPursuit?.status
      });
    }

    // Sort by daysSinceLost ascending (most recent first) or by amount descending
    results.sort((a, b) => b.amount - a.amount);
    return results;
  } catch (error: any) {
    console.error('[scanner] scanClosedLostDeals failed:', error);
    throw error;
  }
}
