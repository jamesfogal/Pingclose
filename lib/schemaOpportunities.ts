import type { TechStackResult } from '@/lib/htmlAudit';
import type { LawFaqResult } from '@/lib/agents/lawFaqAgent';
import type { LawyerSchemaResult } from '@/lib/agents/lawyerSchemaAgent';

export interface SchemaTypeBreakdown {
  type: string;
  opportunities: number;
  used: number;
  missed: number;
}

export interface SchemaOpportunitiesResult {
  breakdown: SchemaTypeBreakdown[];
  totalOpportunities: number;
  totalUsed: number;
  totalMissed: number;
}

function row(type: string, opportunities: number, used: number): SchemaTypeBreakdown {
  const cappedUsed = Math.min(used, opportunities);
  return { type, opportunities, used: cappedUsed, missed: opportunities - cappedUsed };
}

// Rolls up every schema check the audit already runs into one set of totals — each
// check stays independently owned by its own agent, this just sums what's already
// been computed. No new detection logic, no new network calls.
export function buildSchemaOpportunities(
  tech: TechStackResult,
  lawFaq: LawFaqResult,
  lawyerSchema: LawyerSchemaResult
): SchemaOpportunitiesResult {
  const breakdown: SchemaTypeBreakdown[] = [
    row('LocalBusiness', 1, tech.hasLocalBusinessSchema ? 1 : 0),
    row('Review / Rating', 1, tech.hasReviewSchema ? 1 : 0),
    row('Pricing (PriceSpecification)', 1, tech.hasPricingSchema ? 1 : 0),
  ];

  if (lawFaq.isLawFirm) {
    breakdown.push(row('FAQ / Question (Q&A)', lawFaq.qaContentCount, lawFaq.visibleFaqSchemaCount));
  }

  if (lawyerSchema.isLawFirm) {
    breakdown.push(row('Attorney / LegalService', lawyerSchema.opportunityCount, lawyerSchema.usedCount));
  }

  const totalOpportunities = breakdown.reduce((sum, r) => sum + r.opportunities, 0);
  const totalUsed = breakdown.reduce((sum, r) => sum + r.used, 0);
  const totalMissed = totalOpportunities - totalUsed;

  return { breakdown, totalOpportunities, totalUsed, totalMissed };
}
