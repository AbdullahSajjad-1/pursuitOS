'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, AlertTriangle, ArrowRight, XCircle, Info, ChevronRight, Check, Phone, Mail, Mic, ShieldCheck, Copy, ArrowLeft } from 'lucide-react';

export default function PursuitScreenClient({ 
  pursuit, requirements, synthesis, strategy, reviews, events, pricing 
}: any) {
  const router = useRouter();
  const isAlreadyExecuted = pursuit?.status === 'EXECUTED';
  const isAlreadyDenied = pursuit?.status === 'DENIED';
  const [selectedEvidenceText, setSelectedEvidenceText] = useState<string | null>(null);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<'factor' | 'risk' | null>(null);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executeSuccess, setExecuteSuccess] = useState(isAlreadyExecuted);
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineResult, setDeclineResult] = useState<any>(isAlreadyDenied ? { 
    pitch: `Pursuit marked as Denied in database and recorded in Graph8 CRM.` 
  } : null);
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Derived state guaranteeing consistent disabled/completed state
  const isExecuted = executeSuccess || isAlreadyExecuted || pursuit?.status === 'EXECUTED';
  const isDenied = Boolean(declineResult) || isAlreadyDenied || pursuit?.status === 'DENIED';

  // Sync state if pursuit prop updates
  useEffect(() => {
    if (pursuit?.status === 'EXECUTED') {
      setExecuteSuccess(true);
    } else if (pursuit?.status === 'DENIED') {
      setDeclineResult({ pitch: `Pursuit marked as Denied in database and recorded in Graph8 CRM.` });
    }
  }, [pursuit?.status]);

  // Restore selected review from URL on refresh
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const reviewRole = params.get('review');
    if (reviewRole && reviews?.length > 0) {
      const match = reviews.find((r: any) => r.role.toLowerCase() === reviewRole.toLowerCase());
      if (match) setSelectedReview(match);
    }
  }, [reviews]);

  const handleSelectReview = (review: any | null) => {
    setSelectedReview(review);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (review) {
        url.searchParams.set('review', review.role);
      } else {
        url.searchParams.delete('review');
      }
      window.history.replaceState(null, '', url.toString());
    }
  };

  // Fallbacks for data shape
  const conditions = synthesis?.conditions || [];
  const recommendedActions = synthesis?.recommendedAction ? [synthesis.recommendedAction] : [];

  const handleExecute = async () => {
    if (isExecuted) return;
    setIsExecuting(true);
    try {
      const res = await fetch(`/api/pursuits/${pursuit.id}/execute`, { method: 'POST' });
      if (!res.ok) throw new Error('Execution failed');
      const data = await res.json();
      setExecuteSuccess(true);
      if (data?.result?.dealId) {
        pursuit.dealId = data.result.dealId;
      }
      pursuit.status = 'EXECUTED';
      setRedirecting(true);
      router.refresh();
      setTimeout(() => {
        router.push('/pursuits');
      }, 1200);
    } catch (e) {
      alert('Failed to execute actions in Graph8.');
      setIsExecuting(false);
    }
  };

  const handleDecline = async () => {
    if (isDenied) return;
    setIsDeclining(true);
    try {
      const res = await fetch(`/api/pursuits/${pursuit.id}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Bid Council evaluation: scope alignment and current delivery bandwidth' })
      });
      if (!res.ok) throw new Error('Failed to decline pursuit');
      const data = await res.json();
      setDeclineResult(data.result);
      pursuit.status = 'DENIED';
      setRedirecting(true);
      router.refresh();
      setTimeout(() => {
        router.push('/pursuits');
      }, 1500);
    } catch (e) {
      alert('Failed to decline pursuit.');
      setIsDeclining(false);
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
            <Link href="/pursuits" className="hover:text-primary transition-colors flex items-center gap-1 font-semibold text-accent">
              <ArrowLeft size={13} /> Pursuits
            </Link>
            <span className="text-border-subtle">/</span>
            <span>{pursuit.companyDomain}</span>
            <span className="text-border-subtle">/</span>
            <span>RFP</span>
          </div>
          <h1 className="text-[26px] font-semibold tracking-tight text-primary">{pursuit.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-[13px] text-muted">
            <div><span className="text-secondary">Added:</span> {pursuit.createdAt ? String(pursuit.createdAt).split('T')[0] : ''}</div>
            <div className="flex items-center gap-2">
              <span className="text-secondary">Status:</span>{' '}
              {isExecuted ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-bid/10 text-bid border border-bid/20">
                  <Check size={12} /> EXECUTED (In CRM)
                </span>
              ) : isDenied ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-nobid/10 text-nobid border border-nobid/20">
                  <XCircle size={12} /> DENIED
                </span>
              ) : (
                <span className="text-primary font-medium">{pursuit.status}</span>
              )}
            </div>
            {(pursuit.dealId || isExecuted) && (
              <div className="flex items-center gap-2">
                <span className="text-secondary">Graph8 Deal:</span>{' '}
                <span className="font-mono text-primary text-[12px] bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                  {pursuit.dealId || 'Synced'}
                </span>
              </div>
            )}
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

        {/* COMMERCIAL PRICING & BID SIZING */}
        {pricing && (
          <div className="mb-16 border-t border-border-subtle pt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-primary">Commercial Strategy & Deal Sizing</h3>
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surface border border-border-subtle text-secondary">
                Sweet Spot: $2.5M - $10.0M
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-md border border-border-subtle bg-surface/30">
                <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Target Bid Proposal</div>
                <div className="text-[24px] font-bold text-primary font-mono">
                  ${pricing.targetBidAmount ? pricing.targetBidAmount.toLocaleString() : '0'} <span className="text-[13px] font-normal text-secondary font-sans">USD</span>
                </div>
                <div className="text-[12px] text-bid mt-1 font-medium">
                  {pricing.clientBudget ? `${pricing.discountPercentage}% headroom below client ceiling` : 'Engineered for optimal competitive positioning'}
                </div>
              </div>

              <div className="p-4 rounded-md border border-border-subtle bg-surface/30">
                <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Client RFP Budget Ceiling</div>
                <div className="text-[24px] font-bold text-primary font-mono">
                  {pricing.clientBudget ? (
                    <>${pricing.clientBudget.toLocaleString()} <span className="text-[13px] font-normal text-secondary font-sans">USD</span></>
                  ) : (
                    <span className="text-[18px] text-secondary font-sans font-normal">Not Specified in RFP</span>
                  )}
                </div>
                <div className="text-[12px] text-secondary mt-1">
                  {pricing.clientBudget ? 'Extracted directly from RFP cover & specifications' : 'Estimated via 85+ engineer delivery bench baseline'}
                </div>
              </div>
            </div>

            <p className="text-[13px] text-secondary leading-relaxed mb-4">
              {pricing.pricingRationale}
            </p>

            {pricing.milestones && pricing.milestones.length > 0 && (
              <div className="border border-border-subtle rounded-md overflow-hidden bg-surface/20">
                <div className="px-4 py-2 bg-surface/60 border-b border-border-subtle text-[11px] font-semibold uppercase tracking-wider text-secondary">
                  Proposed Milestone Delivery Schedule
                </div>
                <div className="divide-y divide-border-subtle">
                  {pricing.milestones.map((m: any, idx: number) => (
                    <div key={idx} className="px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px]">
                      <div>
                        <span className="font-medium text-primary">{m.name}</span>
                        <p className="text-[11px] text-muted">{m.description}</p>
                      </div>
                      <span className="font-mono font-semibold text-primary sm:text-right flex-shrink-0">
                        ${m.amount.toLocaleString()} USD
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                  <tr 
                    key={review.id} 
                    onClick={() => handleSelectReview(review)}
                    className="group hover:bg-surface transition-colors cursor-pointer border-b border-border-subtle/30"
                  >
                    <td className="py-4 pr-4 font-medium text-primary capitalize w-1/5">{review.role.replace('_', ' ')}</td>
                    <td className="py-4 px-4 text-secondary truncate max-w-[200px] sm:max-w-xs">{review.assessment}</td>
                    <td className="py-4 px-4 w-1/5">
                      <span className={`inline-flex items-center gap-1.5 ${getDecisionColor(review.recommendation)}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${review.recommendation === 'bid' ? 'bg-bid' : review.recommendation === 'no_bid' ? 'bg-nobid' : 'bg-conditional'}`} />
                        {review.recommendation.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-primary tabular-nums w-1/5">{review.score}</td>
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
          
          <h3 className="text-[12px] font-medium text-secondary uppercase tracking-wider mb-4">Execution Plan</h3>

          {/* Outbound Safeguard Indicator */}
          <div className="mb-6 p-2.5 bg-bid/10 border border-bid/25 rounded-md flex items-start gap-2 text-[11px]">
            <ShieldCheck size={14} className="text-bid flex-shrink-0 mt-0.5" />
            <div className="text-primary leading-tight">
              <span className="font-semibold text-bid uppercase tracking-wide block mb-0.5">Simulation Mode Active</span>
              Outbound carrier phone dialing and live email dispatch are strictly simulated. All scripts and drafts are staged safely for internal operator review.
            </div>
          </div>

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
            {recommendedActions.length > 0 || strategy?.action !== 'WAIT' ? (
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
                
                {strategy && strategy.action !== 'WAIT' && (
                  <div className="p-4 bg-surface-2 border border-border-subtle rounded-md text-[13px] border-l-2 border-l-accent space-y-3">
                    
                    {/* Voice Agent Action Directive Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                      <div className="flex items-center gap-1.5 font-semibold text-[12px] tracking-wide text-primary">
                        {strategy.voice_agent_directive === 'OUTBOUND_CALL' || strategy.action === 'PHONE_CALL' ? (
                          <>
                            <Phone size={13} className="text-bid" />
                            <span className="text-bid uppercase font-mono">Voice Agent: Call Directive</span>
                          </>
                        ) : (
                          <>
                            <Mail size={13} className="text-accent" />
                            <span className="text-accent uppercase font-mono">Voice Agent: Email Directive</span>
                          </>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-mono bg-surface-3 px-2 py-0.5 rounded text-secondary border border-border-subtle">
                        {strategy.action.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Target Contact Details */}
                    <div className="space-y-1 bg-surface p-2.5 rounded border border-border-subtle">
                      <div className="text-[12px] font-medium text-primary">
                        {strategy.target_name || 'Primary Contact'}{' '}
                        <span className="text-muted font-normal">({strategy.target_role})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-secondary">
                        {strategy.target_phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={11} className="text-muted" />
                            <span className="font-mono text-primary">{strategy.target_phone}</span>
                          </div>
                        )}
                        {strategy.target_email && (
                          <div className="flex items-center gap-1">
                            <Mail size={11} className="text-muted" />
                            <span className="font-mono text-primary">{strategy.target_email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Objective */}
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-0.5">Objective</div>
                      <div className="text-secondary italic text-[12px]">"{strategy.objective}"</div>
                    </div>

                    {/* Spoken Voice Script or Email Draft */}
                    {strategy.spoken_script && (strategy.voice_agent_directive === 'OUTBOUND_CALL' || strategy.action === 'PHONE_CALL') && (
                      <div className="bg-surface p-2.5 rounded border border-border-subtle">
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-bid mb-1">
                          <Mic size={12} />
                          <span>Spoken Phone Script (AI Voice Bot):</span>
                        </div>
                        <p className="text-[12px] text-primary leading-relaxed bg-surface-2 p-2 rounded border border-border-subtle font-sans">
                          "{strategy.spoken_script}"
                        </p>
                      </div>
                    )}

                    {strategy.script_or_draft && strategy.action !== 'PHONE_CALL' && (
                      <div className="bg-surface p-2.5 rounded border border-border-subtle">
                        <div className="text-[11px] font-medium text-secondary mb-1">Email Draft:</div>
                        <p className="text-[12px] text-primary whitespace-pre-line leading-relaxed bg-surface-2 p-2 rounded border border-border-subtle font-sans">
                          {strategy.script_or_draft}
                        </p>
                      </div>
                    )}

                    {/* Key Questions */}
                    {strategy.key_questions?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-medium text-primary mb-1 uppercase tracking-wider">Discovery Questions:</div>
                        <ul className="text-secondary pl-3 space-y-1 list-disc text-[12px]">
                          {strategy.key_questions.map((q: string, j: number) => (
                            <li key={j}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-secondary">No actions proposed.</p>
            )}
          </div>

          {/* Polite Capability Pitch & Future Partnership Draft (when Declined) */}
          {declineResult && (
            <div className="mb-6 p-4 bg-nobid/10 border border-nobid/30 rounded-lg space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-nobid uppercase tracking-wider font-mono">
                  Pursuit Status: Denied
                </span>
                <span className="text-[10px] bg-surface-3 px-2 py-0.5 rounded text-secondary font-mono border border-border-subtle">
                  Safe Staging
                </span>
              </div>
              <p className="text-[12px] text-secondary leading-snug">
                This pursuit is marked as <strong>DENIED</strong> in Graph8 CRM. Instead of a blunt rejection, our AI generated a strategic executive capability pitch to keep the door open for future engagements:
              </p>
              <div className="bg-surface p-3 rounded border border-border-subtle text-[12px] text-primary whitespace-pre-line leading-relaxed font-sans max-h-64 overflow-y-auto">
                {declineResult.politeLetter}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(declineResult.politeLetter);
                  setCopiedLetter(true);
                  setTimeout(() => setCopiedLetter(false), 2000);
                }}
                className="w-full py-1.5 px-3 bg-surface border border-border-subtle hover:border-secondary rounded text-[12px] font-medium text-primary flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedLetter ? <Check size={13} className="text-bid" /> : <Copy size={13} />}
                {copiedLetter ? 'Copied Pitch to Clipboard' : 'Copy Polite Capability Pitch Draft'}
              </button>
            </div>
          )}

        </div>

        {/* Sticky Execute & Decline Bar at bottom of rail */}
        <div className="p-6 border-t border-border-subtle bg-surface-2 flex flex-col gap-2.5">
          <button 
            onClick={handleExecute}
            disabled={isExecuting || isExecuted || isDenied}
            className={`w-full py-2 px-4 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2 ${
              isExecuted 
                ? 'bg-surface-2 border border-border-subtle text-secondary cursor-not-allowed' 
                : isExecuting
                  ? 'bg-accent/50 text-white cursor-wait'
                  : isDenied
                    ? 'bg-surface-3 text-disabled cursor-not-allowed'
                    : 'bg-accent hover:bg-accent-hover text-white'
            }`}
          >
            {redirecting ? (
              <span className="flex items-center gap-1.5"><Check size={14} className="text-bid animate-pulse" /> Finalized — Returning to Dashboard...</span>
            ) : isExecuted ? (
              <span className="flex items-center gap-1.5"><Check size={14} className="text-bid" /> Deal Executed in Graph8 CRM</span>
            ) : isExecuting ? (
              'Executing...'
            ) : isDenied ? (
              <span className="flex items-center gap-1.5 text-nobid"><XCircle size={14} /> Pursuit Denied</span>
            ) : (
              <span className="flex items-center gap-1.5">Approve and Execute <ArrowRight size={14} /></span>
            )}
          </button>

          {isExecuted && (
            <div className="space-y-2">
              <div className="text-center text-[11px] text-secondary font-medium py-0.5">
                Opportunity is active in Graph8 pipeline with target bid.
              </div>
              <Link 
                href="/pursuits"
                className="w-full py-1.5 px-3 rounded-md text-[12px] font-medium border border-border-subtle bg-surface text-secondary hover:text-primary hover:border-secondary flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} /> Back to Pursuits
              </Link>
            </div>
          )}

          {!isExecuted && !isDenied && (
            <button
              onClick={handleDecline}
              disabled={isDeclining}
              className="w-full py-2 px-4 rounded-md text-[13px] font-medium transition-colors flex items-center justify-center gap-2 border border-border-subtle text-secondary hover:text-nobid hover:border-nobid/40 hover:bg-nobid/5"
            >
              {isDeclining ? 'Staging Decline Pitch...' : 'Decline Pursuit (Keep in Denied)'}
            </button>
          )}

          {isDenied && (
            <div className="space-y-2">
              <div className="text-center text-[11px] text-nobid font-medium py-1">
                Pursuit marked as Denied. Polite pitch staged in Graph8.
              </div>
              <Link 
                href="/pursuits"
                className="w-full py-1.5 px-3 rounded-md text-[12px] font-medium border border-border-subtle bg-surface text-secondary hover:text-primary hover:border-secondary flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowLeft size={13} /> Back to Pursuits
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* EVIDENCE DRAWER OVERLAY */}
      {selectedEvidenceText && (
        <div className="absolute inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-canvas/40 backdrop-blur-sm" onClick={() => setSelectedEvidenceText(null)} />
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

      {/* COUNCIL REVIEW MODAL */}
      {selectedReview && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-canvas/60 backdrop-blur-sm" onClick={() => setSelectedReview(null)} />
          <div className="w-full max-w-2xl bg-surface-2 border border-border-subtle rounded-xl shadow-2xl relative z-10 flex flex-col animate-in zoom-in-95 duration-150 max-h-full overflow-hidden">
            <div className="px-6 py-5 border-b border-border-subtle flex justify-between items-center bg-surface">
              <div className="flex items-center gap-3">
                <h3 className="text-[16px] font-semibold text-primary capitalize">{selectedReview.role.replace('_', ' ')} Analysis</h3>
                <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedReview.recommendation === 'bid' ? 'bg-bid/10 text-bid' : selectedReview.recommendation === 'no_bid' ? 'bg-nobid/10 text-nobid' : 'bg-conditional/10 text-conditional'}`}>
                  {selectedReview.recommendation.replace('_', ' ')}
                </span>
              </div>
              <button onClick={() => handleSelectReview(null)} className="text-secondary hover:text-primary transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-8">
              <div>
                <h4 className="text-[11px] font-medium text-secondary uppercase tracking-wider mb-3">Professional Assessment</h4>
                <div className="text-[14px] text-primary leading-relaxed bg-surface p-5 border border-border-subtle rounded-lg">
                  {selectedReview.assessment}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {selectedReview.positive_factors?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-bid uppercase tracking-wider mb-3 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Supporting Factors
                    </h4>
                    <ul className="space-y-2 text-[13px] text-secondary">
                      {selectedReview.positive_factors.map((f: string, i: number) => (
                        <li key={i} className="flex gap-2"><span className="text-border-subtle">-</span><span className="leading-snug">{f}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedReview.risks?.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-conditional uppercase tracking-wider mb-3 flex items-center gap-2">
                      <AlertTriangle size={14} /> Identified Risks
                    </h4>
                    <ul className="space-y-2 text-[13px] text-secondary">
                      {selectedReview.risks.map((r: string, i: number) => (
                        <li key={i} className="flex gap-2"><span className="text-border-subtle">-</span><span className="leading-snug">{r}</span></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedReview.required_actions?.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-[11px] font-medium text-secondary uppercase tracking-wider mb-3">Required Actions</h4>
                  <div className="bg-surface border border-border-subtle rounded-lg divide-y divide-border-subtle">
                    {selectedReview.required_actions.map((action: string, i: number) => (
                      <div key={i} className="p-3 text-[13px] text-primary flex items-start gap-3">
                        <ArrowRight size={14} className="mt-0.5 text-secondary flex-shrink-0" />
                        <span className="leading-snug">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
