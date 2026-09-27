'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  RotateCcw, 
  DollarSign, 
  Clock, 
  Building2, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  TrendingUp,
  FileText,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface LostDeal {
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

export default function RevivalScannerPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<LostDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingDealId, setAnalyzingDealId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeStage, setActiveStage] = useState('');
  const [deliberationLogs, setDeliberationLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!analyzingDealId) return;
    const deal = deals.find(d => d.dealId === analyzingDealId);

    const streamEvents = [
      { delay: 600, progress: 20, stage: 'Ingesting Lost Deal History', speaker: 'Graph8 Connector', role: 'system', text: `Extracted historical deal data for ${deal?.dealName}. Loss reason: ${deal?.lossReason?.substring(0, 50)}...` },
      { delay: 1800, progress: 35, stage: 'Delta V2 Extraction', speaker: 'Intelligence Engine', role: 'system', text: `Evaluating Delta V2 metrics and executive turnover for 'Why Now' justification at ${deal?.companyName}.` },
      { delay: 3500, progress: 50, stage: 'Convening Revival Council', speaker: 'Council Orchestrator', role: 'system', text: 'Convening autonomous 5-Agent Council to debate if historical blockers have been resolved.' },
      { delay: 5000, progress: 65, stage: 'Technical Blocker Review', speaker: 'CTO Agent', role: 'cto', text: 'CTO Agent: Analyzing if previous technical limitations or missing integrations have been shipped since we lost the deal.' },
      { delay: 7000, progress: 75, stage: 'Economic Feasibility', speaker: 'Commercial Agent', role: 'commercial', text: 'Commercial Agent: Checking if budget constraints have eased or if pricing structures match current thresholds.' },
      { delay: 8500, progress: 85, stage: 'Executive & Champion Review', speaker: 'CEO Agent', role: 'ceo', text: 'CEO Agent: Verifying strategic timing and if our previous champions still hold influence.' },
      { delay: 10000, progress: 95, stage: 'Synthesizing Revival Strategy', speaker: 'Synthesis Engine', role: 'system', text: 'Synthesizing all 5 agent reviews into actionable Re-Pursuit Plan or Watch list recommendation.' }
    ];

    const timeouts = streamEvents.map((evt) => {
      return setTimeout(() => {
        setAnalysisProgress(evt.progress);
        setActiveStage(evt.stage);
        setDeliberationLogs((prev) => [
          ...prev,
          { id: `log-${Date.now()}-${Math.random()}`, speaker: evt.speaker, role: evt.role, text: evt.text, timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
        ]);
      }, evt.delay);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [analyzingDealId, deals]);

  const fetchLostDeals = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/revival/scan');
      if (!res.ok) throw new Error('Failed to scan closed-lost deals from Graph8');
      const data = await res.json();
      setDeals(data.deals || []);
    } catch (err: any) {
      console.error('Scan error:', err);
      setError(err?.message || 'Error scanning deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLostDeals();
  }, []);

  const handleLaunchRevival = async (deal: LostDeal) => {
    if (analyzingDealId) return;
    setAnalyzingDealId(deal.dealId);
    setAnalysisProgress(10);
    setActiveStage('Initializing Re-Pursuit Engine');
    setDeliberationLogs([]);
    try {
      const res = await fetch('/api/revival/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealId: deal.dealId,
          companyId: deal.companyId,
          companyDomain: deal.companyDomain,
          dealName: deal.dealName,
          amount: deal.amount,
          lossReason: deal.lossReason,
          accountNotes: deal.accountNotes
        })
      });

      if (!res.ok) throw new Error('Failed to initiate revival pursuit');
      const data = await res.json();
      
      if (data?.pursuitId) {
        router.push(`/pursuits/${data.pursuitId}`);
      }
    } catch (err: any) {
      alert(`Could not launch revival analysis: ${err?.message || 'Unknown error'}`);
      setAnalyzingDealId(null);
    }
  };

  const filteredDeals = deals.filter(d => 
    d.dealName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.companyDomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.lossReason && d.lossReason.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPipeline = deals.reduce((acc, d) => acc + (d.amount || 0), 0);
  const activeRevivalsCount = deals.filter(d => d.hasActiveRevival).length;

  return (
    <div className="h-full flex flex-col bg-canvas overflow-y-auto">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle bg-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-accent/15 text-accent border border-accent/25">
                <Sparkles size={12} />
                Graph8 Intelligence Proactive Engine
              </span>
            </div>
            <h1 className="text-[22px] font-semibold tracking-tight text-primary">Deal Revival Scanner</h1>
            <p className="text-[13px] text-secondary mt-1">
              Proactively identify closed-lost enterprise pursuits in Graph8, evaluate recent catalysts and blocker resolutions, and launch strategic re-pursuits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchLostDeals}
              disabled={loading || !!analyzingDealId}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-2 hover:bg-surface-3 border border-border-subtle text-primary text-[13px] font-medium transition-colors disabled:opacity-50"
            >
              <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Scanning CRM...' : 'Re-Scan Deals'}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-surface-2 border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Closed-Lost Deals</div>
            <div className="text-[20px] font-semibold text-primary">{deals.length}</div>
          </div>
          <div className="bg-surface-2 border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Recoverable Pipeline</div>
            <div className="text-[20px] font-semibold text-bid">
              ${(totalPipeline / 1000000).toFixed(1)}M USD
            </div>
          </div>
          <div className="bg-surface-2 border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Active Re-Pursuits</div>
            <div className="text-[20px] font-semibold text-accent">{activeRevivalsCount}</div>
          </div>
          <div className="bg-surface-2 border border-border-subtle rounded-lg p-3.5">
            <div className="text-[11px] uppercase tracking-wider text-muted font-medium mb-1">Sweet Spot Fit</div>
            <div className="text-[20px] font-semibold text-primary">100% ($2.5M - $10M)</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="p-8 flex-1">
        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by deal, account, or loss blocker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-2 border border-border-subtle rounded-md pl-9 pr-3 py-1.5 text-[13px] text-primary placeholder-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div className="text-[12px] text-muted">
            Showing <span className="font-medium text-primary">{filteredDeals.length}</span> candidates
          </div>
        </div>

        {/* Content States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 size={28} className="animate-spin text-accent mb-3" />
            <p className="text-[14px] font-medium text-primary">Scanning Graph8 for historical closed-lost deals...</p>
            <p className="text-[12px] text-muted mt-1">Inspecting CRM pipeline, deal notes, and loss reasons across accounts.</p>
          </div>
        ) : error ? (
          <div className="bg-nobid/10 border border-nobid/25 rounded-lg p-6 text-center max-w-md mx-auto my-12">
            <AlertCircle size={24} className="text-nobid mx-auto mb-2" />
            <p className="text-[14px] font-medium text-primary mb-1">Scan Failed</p>
            <p className="text-[12px] text-secondary mb-4">{error}</p>
            <button
              onClick={fetchLostDeals}
              className="px-3 py-1.5 rounded bg-surface border border-border-subtle text-[12px] font-medium text-primary hover:bg-surface-2"
            >
              Retry Scan
            </button>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="text-center py-16 bg-surface-2 rounded-lg border border-border-subtle p-8">
            <Building2 size={32} className="text-muted mx-auto mb-3" />
            <p className="text-[14px] font-medium text-primary">No closed-lost deals match your query</p>
            <p className="text-[12px] text-secondary mt-1">Try broadening your search term or trigger a re-scan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredDeals.map((deal) => {
              const isBeingAnalyzed = analyzingDealId === deal.dealId;

              return (
                <div 
                  key={deal.dealId}
                  className="bg-surface hover:bg-surface/80 border border-border-subtle hover:border-border rounded-lg p-5 transition-all relative flex flex-col justify-between"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left: Deal info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-[15px] text-primary">
                          {deal.dealName}
                        </span>
                        <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-surface-2 text-secondary border border-border-subtle">
                          {deal.companyDomain}
                        </span>
                        {deal.hasActiveRevival && (
                          <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded border ${
                            deal.activePursuitStatus === 'BID' ? 'bg-bid/10 text-bid border-bid/20' :
                            deal.activePursuitStatus === 'CONDITIONAL_BID' ? 'bg-conditional/10 text-conditional border-conditional/20' :
                            deal.activePursuitStatus === 'WATCH' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-accent/10 text-accent border-accent/20'
                          }`}>
                            {deal.activePursuitStatus || 'Revival Active'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[12px] text-muted mb-3">
                        <span className="flex items-center gap-1 font-semibold text-bid">
                          ${deal.amount.toLocaleString()} USD
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> Lost {deal.daysSinceLost} days ago ({new Date(deal.closedDate).toLocaleDateString()})
                        </span>
                        <span>•</span>
                        <span>{deal.companyName}</span>
                      </div>

                      {/* Historical Loss Reason Callout */}
                      <div className="bg-surface-2/80 border border-border-subtle rounded-md p-3 text-[12px]">
                        <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <AlertCircle size={12} />
                          Historical Loss Blocker & Objections
                        </div>
                        <p className="text-secondary leading-relaxed">
                          {deal.lossReason}
                        </p>
                        {deal.accountNotes && (
                          <div className="mt-2 pt-2 border-t border-border-subtle text-muted">
                            <span className="font-medium text-secondary">Account Intel: </span>
                            {deal.accountNotes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="lg:w-64 flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 flex-shrink-0 pt-2 lg:pt-0">
                      {deal.hasActiveRevival && deal.activePursuitId ? (
                        <Link
                          href={`/pursuits/${deal.activePursuitId}`}
                          className="w-full text-center flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-surface-2 hover:bg-surface-3 border border-accent/40 text-primary text-[13px] font-medium transition-colors"
                        >
                          View Pursuit Analysis
                          <ArrowRight size={14} className="text-accent" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleLaunchRevival(deal)}
                          disabled={!!analyzingDealId}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary hover:bg-white text-canvas text-[13px] font-medium transition-all shadow-sm disabled:opacity-50"
                        >
                          {isBeingAnalyzed ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-canvas" />
                              <span>Running Pipeline...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} />
                              <span>Analyze for Re-Pursuit</span>
                            </>
                          )}
                        </button>
                      )}

                      <span className="text-[11px] text-muted text-center lg:text-right">
                        {deal.hasActiveRevival ? 'Pursuit dossier active' : 'Runs Evidence → Why Now → Council'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Stream Overlay */}
      {analyzingDealId && (
        <div className="absolute inset-0 bg-canvas/90 backdrop-blur-md z-50 flex items-center justify-center p-8">
          <div className="w-full max-w-3xl bg-surface-2 border border-border-subtle rounded-xl shadow-2xl p-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-[20px] font-semibold text-primary mb-1">Autonomous Deal Revival</h2>
                <div className="text-[13px] text-secondary flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-accent" />
                  {activeStage || 'Initializing...'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[32px] font-mono font-bold text-primary">{analysisProgress}%</div>
              </div>
            </div>

            <div className="w-full bg-surface-3 h-1.5 rounded-full mb-8 overflow-hidden border border-border-subtle">
              <div 
                className="h-full bg-accent transition-all duration-700 ease-out"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>

            <div className="bg-surface rounded-lg border border-border-subtle p-4 h-[320px] overflow-y-auto space-y-3 font-mono text-[12px]">
              {deliberationLogs.map((log) => (
                <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-start gap-3">
                    <div className="text-muted w-16 flex-shrink-0 pt-0.5">{log.timestamp}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {log.role === 'system' ? (
                          <span className="text-accent font-semibold">[{log.speaker}]</span>
                        ) : log.role === 'cto' ? (
                          <span className="text-blue-400 font-semibold">[{log.speaker}]</span>
                        ) : log.role === 'sales' ? (
                          <span className="text-emerald-400 font-semibold">[{log.speaker}]</span>
                        ) : log.role === 'legal' ? (
                          <span className="text-nobid font-semibold">[{log.speaker}]</span>
                        ) : (
                          <span className="text-amber-400 font-semibold">[{log.speaker}]</span>
                        )}
                      </div>
                      <div className="text-secondary leading-relaxed font-sans">{log.text}</div>
                    </div>
                  </div>
                </div>
              ))}
              {analysisProgress < 100 && (
                <div className="flex items-center gap-2 text-muted pt-2 animate-pulse">
                  <ChevronRight size={14} /> Processing next instruction...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
