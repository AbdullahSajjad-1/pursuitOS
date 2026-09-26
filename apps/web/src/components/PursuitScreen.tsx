'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, XCircle, Info, ChevronRight, Check } from 'lucide-react';

export default function PursuitScreenClient({ 
  pursuit, requirements, synthesis, reviews, events 
}: any) {
  const [selectedEvidenceText, setSelectedEvidenceText] = useState<string | null>(null);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<'factor' | 'risk' | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeSuccess, setExecuteSuccess] = useState(false);

  // Fallbacks for data shape
  const conditions = synthesis?.conditions || [];
  const recommendedActions = synthesis?.recommendedAction ? [synthesis.recommendedAction] : [];

  const handleExecute = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch(`/api/pursuits/${pursuit.id}/execute`, { method: 'POST' });
      if (!res.ok) throw new Error('Execution failed');
      setExecuteSuccess(true);
    } catch (e) {
      alert('Failed to execute actions in Graph8.');
    } finally {
      setIsExecuting(false);
    }
  };

  const getDecisionColor = (decision: string) => {
    if (decision === 'bid') return 'text-bid';
    if (decision === 'no_bid') return 'text-nobid';
    return 'text-conditional';
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-canvas">
      
      {/* 70% MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 border-r border-border-subtle relative">
        
        {/* Header Briefing */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-secondary text-[12px] font-medium tracking-wide uppercase mb-3">
            <span>{pursuit.companyDomain}</span>
            <span className="text-border-subtle">/</span>
            <span>RFP</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-primary">{pursuit.name}</h1>
          <div className="mt-4 flex gap-6 text-[13px] text-muted">
            <div><span className="text-secondary">Added:</span> {new Date(pursuit.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        {/* DECISION */}
        {synthesis && (
          <div className="mb-16 border-t border-border-subtle pt-8">
            <div className="flex items-start gap-4 mb-4">
              <div className={`mt-1.5 w-2.5 h-2.5 rounded-full ${synthesis.decision === 'bid' ? 'bg-bid' : synthesis.decision === 'no_bid' ? 'bg-nobid' : 'bg-conditional'}`} />
              <div>
                <h2 className={`text-[16px] font-bold uppercase tracking-wide ${getDecisionColor(synthesis.decision)}`}>
                  {synthesis.decision.replace('_', ' ')}
                </h2>
                <div className="text-[12px] text-secondary font-medium uppercase tracking-wider mt-1">
                  Confidence: {synthesis.confidence}
                </div>
              </div>
            </div>
            
            <p className="text-[14px] text-primary leading-relaxed max-w-3xl ml-6">
              {synthesis.rationale}
            </p>

            {/* Inline Evidence Links (Dynamic) */}
            <div className="mt-6 ml-6 space-y-2">
              {synthesis.positive_factors?.map((factor: string, i: number) => (
                <button 
                  key={`factor-${i}`}
                  onClick={() => { setSelectedEvidenceText(factor); setSelectedEvidenceType('factor'); }}
                  className="flex items-center gap-2 text-[12px] text-secondary hover:text-primary transition-colors group text-left"
                >
                  <Check size={14} className="text-bid flex-shrink-0" />
                  <span className="border-b border-dashed border-border-subtle group-hover:border-secondary">{factor}</span>
                </button>
              ))}
              {synthesis.risks?.map((risk: string, i: number) => (
                <button 
                  key={`risk-${i}`}
                  onClick={() => { setSelectedEvidenceText(risk); setSelectedEvidenceType('risk'); }}
                  className="flex items-center gap-2 text-[12px] text-secondary hover:text-primary transition-colors group text-left"
                >
                  <AlertTriangle size={14} className="text-conditional flex-shrink-0" />
                  <span className="border-b border-dashed border-border-subtle group-hover:border-secondary">{risk}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* COUNCIL TABULAR VIEW */}
        {reviews?.length > 0 && (
          <div className="mb-16 border-t border-border-subtle pt-8">
            <h3 className="text-[14px] font-semibold text-primary mb-6">Council Analysis</h3>
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-border-subtle text-secondary font-medium">
                  <th className="pb-3 pr-4 font-medium w-1/5">Role</th>
                  <th className="pb-3 px-4 font-medium w-2/5">Assessment</th>
                  <th className="pb-3 px-4 font-medium w-1/5">Recommendation</th>
                  <th className="pb-3 pl-4 font-medium text-right w-1/5">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {reviews.map((review: any) => (
                  <tr key={review.id} className="group hover:bg-surface transition-colors">
                    <td className="py-4 pr-4 font-medium text-primary capitalize">{review.role}</td>
                    <td className="py-4 px-4 text-secondary truncate max-w-xs">{review.assessment}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 ${getDecisionColor(review.recommendation)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${review.recommendation === 'bid' ? 'bg-bid' : review.recommendation === 'no_bid' ? 'bg-nobid' : 'bg-conditional'}`} />
                        {review.recommendation.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-primary tabular-nums">{review.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 30% DECISION RAIL (STICKY ON DESKTOP) */}
      <div className="w-full lg:w-[380px] bg-surface flex-shrink-0 flex flex-col lg:h-full border-t lg:border-t-0 lg:border-l border-border-subtle">
        <div className="p-6 lg:p-8 flex-1 overflow-y-auto">
          
          <h3 className="text-[12px] font-medium text-secondary uppercase tracking-wider mb-6">Execution Plan</h3>

          {/* Blockers / Conditions */}
          {conditions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-conditional text-[13px] font-medium mb-3">
                <AlertTriangle size={14} />
                Pending Conditions
              </div>
              <ul className="space-y-3">
                {conditions.map((cond: string, i: number) => (
                  <li key={i} className="text-[13px] text-primary flex items-start gap-2 leading-snug">
                    <span className="text-border-subtle mt-1">-</span>
                    {cond}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-primary text-[13px] font-medium mb-3">
              <CheckCircle2 size={14} className="text-secondary" />
              Graph8 Actions
            </div>
            {recommendedActions.length > 0 ? (
              <div className="space-y-3">
                <div className="p-4 bg-surface-2 border border-border-subtle rounded-md text-[13px]">
                  <div className="text-primary font-medium mb-1">Create Deal</div>
                  <div className="text-secondary">Stage: Qualification</div>
                </div>
                {recommendedActions.map((action: string, i: number) => (
                  <div key={i} className="p-4 bg-surface-2 border border-border-subtle rounded-md text-[13px]">
                    <div className="text-primary font-medium mb-1">Create Task</div>
                    <div className="text-secondary">{action}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-secondary">No actions proposed.</p>
            )}
          </div>

        </div>

        {/* Sticky Execute Bar at bottom of rail */}
        <div className="p-6 border-t border-border-subtle bg-surface-2">
          <button 
            onClick={handleExecute}
            disabled={isExecuting || executeSuccess}
            className={`w-full py-2 px-4 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2 ${
              executeSuccess 
                ? 'bg-surface-2 border border-border-subtle text-secondary cursor-not-allowed' 
                : isExecuting
                  ? 'bg-accent/50 text-white cursor-wait'
                  : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {executeSuccess ? (
              <>✓ Executed in Graph8</>
            ) : isExecuting ? (
              'Executing...'
            ) : (
              <>Approve & Execute <ArrowRight size={14} /></>
            )}
          </button>
        </div>
      </div>

      {/* EVIDENCE DRAWER OVERLAY */}
      {selectedEvidenceText && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-canvas/40" onClick={() => setSelectedEvidenceText(null)} />
          <div className="w-full max-w-[480px] h-full bg-surface-2 border-l border-border-subtle shadow-2xl relative z-10 flex flex-col animate-in slide-in-from-right duration-150">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface">
              <h3 className="text-[14px] font-semibold text-primary">Evidence Details</h3>
              <button onClick={() => setSelectedEvidenceText(null)} className="text-secondary hover:text-primary">
                <XCircle size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="text-[11px] font-medium text-secondary uppercase tracking-wider mb-2">Observation</div>
                <div className="text-[14px] text-primary leading-relaxed bg-surface p-4 border border-border-subtle rounded-md">
                  {selectedEvidenceText}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-medium text-secondary uppercase tracking-wider mb-2">Impact Type</div>
                <div className="text-[13px] text-secondary leading-relaxed">
                  {selectedEvidenceType === 'factor' ? 'Positive Factor for Pursuit' : 'Potential Risk / Condition'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
