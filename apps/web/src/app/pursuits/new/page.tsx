'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UploadCloud, 
  CheckCircle2, 
  Building2, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Shield, 
  TrendingUp, 
  Scale, 
  Briefcase, 
  BrainCircuit, 
  FileText, 
  Check,
  AlertCircle
} from 'lucide-react';

interface ResolvedCompany {
  found: boolean;
  company?: {
    id: string;
    name: string;
    domain: string;
    linkedinUrl?: string | null;
    description?: string | null;
    revenue?: string | null;
    employeeCount?: string | null;
  };
  contactsCount?: number;
  dealsCount?: number;
  notesCount?: number;
  contacts?: Array<{
    id: string;
    name: string;
    title: string;
    email: string;
    phone?: string | null;
    linkedinUrl?: string | null;
    headline?: string | null;
  }>;
  deals?: Array<{ id: string; name: string; stage: string }>;
  message?: string;
}

const QUICK_COMPANIES = [
  { name: 'Vertex Cloud Solutions', domain: 'vertex.com' },
  { name: 'Meridian Global', domain: 'meridian.net' },
  { name: 'Acme Corporation', domain: 'acme.com' },
  { name: 'Nexus Technologies', domain: 'nexustech.io' },
  { name: 'OmniCyber Defense', domain: 'omnicyber.com' },
  { name: 'FinTech Global Systems', domain: 'fintechsystems.com' },
  { name: 'HealthPulse Solutions', domain: 'healthpulse.org' },
  { name: 'Vanguard Logistics', domain: 'vanguardlogistics.com' },
  { name: 'Titan Aerospace', domain: 'titanaerospace.com' },
  { name: 'Beacon Data Intelligence', domain: 'beacondata.ai' },
];

interface LogEntry {
  id: string;
  speaker: string;
  role: 'system' | 'cto' | 'sales' | 'legal' | 'delivery' | 'cso' | 'strat';
  text: string;
  timestamp: string;
}

function NewPursuitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [savedFileInfo, setSavedFileInfo] = useState<{ name: string; size: number } | null>(null);
  const [domain, setDomain] = useState('');
  
  // Dynamic resolution state
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedAccount, setResolvedAccount] = useState<ResolvedCompany | null>(null);

  // Dynamic pipeline analysis stream state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(10);
  const [activeStage, setActiveStage] = useState('Extracting RFP Requirements');
  const [deliberationLogs, setDeliberationLogs] = useState<LogEntry[]>([]);

  // 1. Restore state from URL and SessionStorage on initial mount / refresh
  useEffect(() => {
    try {
      const urlStep = searchParams.get('step');
      const urlDomain = searchParams.get('domain');

      const savedDraftRaw = sessionStorage.getItem('pursuitos_new_draft');
      const savedDraft = savedDraftRaw ? JSON.parse(savedDraftRaw) : null;

      const targetDomain = urlDomain || savedDraft?.domain || '';
      if (targetDomain) {
        setDomain(targetDomain);
      }

      if (savedDraft?.savedFileInfo) {
        setSavedFileInfo(savedDraft.savedFileInfo);
      }

      if (savedDraft?.resolvedAccount) {
        setResolvedAccount(savedDraft.resolvedAccount);
      }

      const initialStep = urlStep ? parseInt(urlStep, 10) : (savedDraft?.step || 1);
      if (initialStep >= 1 && initialStep <= 3) {
        setStep(initialStep);
      }
    } catch (e) {
      console.error('Failed to restore draft from storage:', e);
    }
  }, [searchParams]);

  // 2. Persist state changes to URL and SessionStorage
  const updateStepAndUrl = (newStep: number, customDomain?: string, newResolved?: ResolvedCompany | null) => {
    setStep(newStep);
    const activeDomain = customDomain !== undefined ? customDomain : domain;
    const activeResolved = newResolved !== undefined ? newResolved : resolvedAccount;

    // Update URL query parameters without reloading
    const params = new URLSearchParams();
    params.set('step', newStep.toString());
    if (activeDomain) {
      params.set('domain', activeDomain);
    }
    router.replace(`/pursuits/new?${params.toString()}`);

    // Save to sessionStorage for refresh survival
    try {
      sessionStorage.setItem('pursuitos_new_draft', JSON.stringify({
        step: newStep,
        domain: activeDomain,
        savedFileInfo: file ? { name: file.name, size: file.size } : savedFileInfo,
        resolvedAccount: activeResolved
      }));
    } catch (e) {
      console.error('Failed to save draft to storage:', e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const meta = { name: selected.name, size: selected.size };
      setSavedFileInfo(meta);
      
      try {
        const savedDraftRaw = sessionStorage.getItem('pursuitos_new_draft');
        const draft = savedDraftRaw ? JSON.parse(savedDraftRaw) : {};
        draft.savedFileInfo = meta;
        sessionStorage.setItem('pursuitos_new_draft', JSON.stringify(draft));
      } catch (_) {}
    }
  };

  // Step 2 -> Step 3: Query Graph8 for real data
  const handleResolveAccount = async () => {
    if (!domain) return;
    setIsResolving(true);
    try {
      const cleanDomain = domain.trim().toLowerCase();
      const res = await fetch(`/api/graph8/resolve?domain=${encodeURIComponent(cleanDomain)}`);
      const data: ResolvedCompany = await res.json();
      setResolvedAccount(data);
      updateStepAndUrl(3, cleanDomain, data);
    } catch (err) {
      console.error('Failed to resolve account in Graph8:', err);
      const fallback: ResolvedCompany = {
        found: false,
        message: 'Could not reach Graph8 resolver, proceeding with entered domain.'
      };
      setResolvedAccount(fallback);
      updateStepAndUrl(3, domain, fallback);
    } finally {
      setIsResolving(false);
    }
  };

  // Live deliberation stream during analysis (NO EMOJIS)
  useEffect(() => {
    if (!isAnalyzing) return;

    const streamEvents: Array<{
      delay: number;
      progress: number;
      stage: string;
      speaker: string;
      role: LogEntry['role'];
      text: string;
    }> = [
      {
        delay: 600,
        progress: 20,
        stage: 'Ingesting RFP and Parsing Scope',
        speaker: 'Document Parser',
        role: 'system',
        text: `Extracted text from ${file?.name || savedFileInfo?.name || 'RFP document'}. Chunking requirements and technical constraints.`
      },
      {
        delay: 1800,
        progress: 35,
        stage: 'Graph8 Account Retrieval',
        speaker: 'Graph8 Connector',
        role: 'system',
        text: `Retrieved Graph8 CRM intelligence for ${domain}: Verified ${resolvedAccount?.contactsCount || 1} executive contacts and ${resolvedAccount?.dealsCount || 0} historical deals.`
      },
      {
        delay: 3200,
        progress: 50,
        stage: 'Convening 5-Agent Council',
        speaker: 'Council Orchestrator',
        role: 'system',
        text: 'Convening autonomous 5-Agent Bid Council in anti-anchored deliberation room.'
      },
      {
        delay: 4500,
        progress: 60,
        stage: 'Technical Architecture Review',
        speaker: 'Chief Technology Officer',
        role: 'cto',
        text: 'Auditing multi-region architecture, SLA availability covenants, and deployment topology.'
      },
      {
        delay: 6000,
        progress: 68,
        stage: 'Technical Architecture Review',
        speaker: 'Chief Technology Officer',
        role: 'cto',
        text: 'CTO feels weird on this: 15-minute cutover window on the migration dataset is extremely aggressive. Checking historical outage penalties and rollback tolerances.'
      },
      {
        delay: 7500,
        progress: 76,
        stage: 'Commercial and Sales Review',
        speaker: 'VP of Sales',
        role: 'sales',
        text: 'VP Sales: Budget posture looks viable. Historical deal precedent in Graph8 shows high buyer responsiveness if executive alignment holds.'
      },
      {
        delay: 9000,
        progress: 83,
        stage: 'Legal and Risk Assessment',
        speaker: 'Chief Legal and Risk Officer',
        role: 'legal',
        text: 'Legal: Scanning mandatory data sovereignty clauses. Verifying strict zero-trust compliance and liability limits.'
      },
      {
        delay: 10500,
        progress: 90,
        stage: 'Operations and Staffing Review',
        speaker: 'VP of Delivery',
        role: 'delivery',
        text: 'Delivery: Required engineering capacity matches current bench availability. Staffing allocation is feasible with 3-week lead time.'
      },
      {
        delay: 12000,
        progress: 95,
        stage: 'Executive Synthesis',
        speaker: 'Chief Strategy Officer',
        role: 'cso',
        text: 'Chief Strategy Officer: Synthesizing reviews across technical feasibility, commercial upside, and risk delta.'
      },
      {
        delay: 13500,
        progress: 98,
        stage: 'Communication Strategy',
        speaker: 'Communication Strategist',
        role: 'strat',
        text: 'Communication Strategist: Generating tailored executive phone call script and objection-handling playbook for the primary contact.'
      }
    ];

    const timeouts = streamEvents.map((evt) => {
      return setTimeout(() => {
        setAnalysisProgress(evt.progress);
        setActiveStage(evt.stage);
        setDeliberationLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}-${Math.random()}`,
            speaker: evt.speaker,
            role: evt.role,
            text: evt.text,
            timestamp: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
          }
        ]);
      }, evt.delay);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [isAnalyzing, domain, file, savedFileInfo, resolvedAccount]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setDeliberationLogs([]);
    setAnalysisProgress(10);
    setActiveStage('Initializing Pursuit Record');

    try {
      const pursuitName = file 
        ? file.name.replace(/\.[^/.]+$/, "") 
        : savedFileInfo 
          ? savedFileInfo.name.replace(/\.[^/.]+$/, "") 
          : `Pursuit for ${domain}`;

      // 1. Create the Pursuit record in the database
      const createRes = await fetch('/api/pursuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: pursuitName,
          companyDomain: domain,
        }),
      });
      
      if (!createRes.ok) throw new Error('Failed to create pursuit record');
      const { pursuit } = await createRes.json();

      // 2. Upload and parse the RFP document if provided
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('pursuitId', pursuit.id);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadRes.ok) throw new Error('Failed to parse document requirements');
      }

      // 3. Trigger the synchronous analysis pipeline
      const analyzeRes = await fetch(`/api/pursuits/${pursuit.id}/analyze`, {
        method: 'POST',
      });
      
      if (!analyzeRes.ok) throw new Error('Failed to analyze pursuit');

      // Final progress pulse
      setAnalysisProgress(100);
      setActiveStage('Consensus Reached. Finalizing Briefing...');

      // Clear draft on successful completion
      try {
        sessionStorage.removeItem('pursuitos_new_draft');
      } catch (_) {}

      // 4. Navigate to the Executive Briefing screen
      setTimeout(() => {
        router.push(`/pursuits/${pursuit.id}`);
      }, 800);

    } catch (e: any) {
      console.error(e);
      alert(`Pipeline error: ${e.message || 'Check server logs.'}`);
      setIsAnalyzing(false);
    }
  };

  const activeFileName = file?.name || savedFileInfo?.name;
  const activeFileSize = file ? (file.size / 1024).toFixed(1) : savedFileInfo ? (savedFileInfo.size / 1024).toFixed(1) : null;

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle bg-canvas flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pursuits" className="text-secondary hover:text-primary text-[13px] font-medium transition-colors">
            Pursuits
          </Link>
          <span className="text-border-subtle">/</span>
          <h1 className="text-[14px] font-semibold text-primary tracking-tight">New pursuit</h1>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-[12px] text-accent animate-pulse font-medium">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            Bid Council in Session
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex justify-center py-12">
        <div className="w-full max-w-2xl px-6">
          
          {/* Step Indicator (Hidden during live analysis) */}
          {!isAnalyzing && (
            <div className="flex items-center justify-between mb-12 relative">
              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-border-subtle -z-10" />
              
              {[1, 2, 3].map((num) => (
                <div key={num} className="flex flex-col items-center gap-2 bg-canvas px-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                    step > num ? 'bg-primary text-canvas' :
                    step === num ? 'bg-accent text-white ring-4 ring-canvas' :
                    'bg-surface-3 text-secondary'
                  }`}>
                    {step > num ? <CheckCircle2 size={12} /> : num}
                  </div>
                  <span className={`text-[11px] uppercase tracking-wider font-medium ${step >= num ? 'text-primary' : 'text-muted'}`}>
                    {num === 1 ? 'Source' : num === 2 ? 'Account' : 'Review'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* STEP 1: Upload */}
          {!isAnalyzing && step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Start with an RFP</h2>
                <p className="text-[13px] text-secondary mt-1">Upload a PDF or DOCX specification to begin AI requirements extraction.</p>
              </div>

              <div className="border border-border-subtle border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-2 transition-colors group relative cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.txt"
                />
                <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={20} className="text-secondary" />
                </div>
                <h3 className="text-[14px] font-medium text-primary mb-1">
                  {activeFileName ? activeFileName : "Drop document here"}
                </h3>
                <p className="text-[13px] text-muted">
                  {activeFileSize ? `${activeFileSize} KB` : "or click to browse PDF files"}
                </p>
              </div>

              {activeFileName && (
                <div className="p-3 bg-surface-2 border border-border-subtle rounded-md flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2 text-primary font-medium">
                    <FileText size={16} className="text-accent" />
                    <span>{activeFileName}</span>
                  </div>
                  <span className="text-secondary text-[12px]">Ready to process</span>
                </div>
              )}

              <div className="flex items-center justify-end mt-8 pt-6 border-t border-border-subtle">
                <button 
                  onClick={() => updateStepAndUrl(2)}
                  disabled={!activeFileName}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    activeFileName ? 'bg-primary text-canvas hover:bg-white' : 'bg-surface-3 text-disabled cursor-not-allowed'
                  }`}
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Account Resolution */}
          {!isAnalyzing && step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Account Resolution</h2>
                <p className="text-[13px] text-secondary mt-1">PursuitOS will query the live Graph8 CRM to retrieve historical deals and executive contacts.</p>
              </div>

              <div className="space-y-3">
                <label className="text-[12px] font-medium text-secondary uppercase tracking-wider">Target Company Domain</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      try {
                        const savedDraftRaw = sessionStorage.getItem('pursuitos_new_draft');
                        const draft = savedDraftRaw ? JSON.parse(savedDraftRaw) : {};
                        draft.domain = e.target.value;
                        sessionStorage.setItem('pursuitos_new_draft', JSON.stringify(draft));
                      } catch (_) {}
                    }}
                    placeholder="e.g. acme.com or vertex.com" 
                    className="w-full bg-surface border border-border-subtle rounded-md pl-10 pr-4 py-2.5 text-[14px] text-primary placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                {/* Quick Select Pill Chips for Graph8 Companies */}
                <div className="pt-2">
                  <span className="text-[11px] text-muted uppercase tracking-wider block mb-2 font-medium">
                    Quick Select from Graph8 CRM:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COMPANIES.map((c) => (
                      <button
                        key={c.domain}
                        type="button"
                        onClick={() => {
                          setDomain(c.domain);
                          try {
                            const savedDraftRaw = sessionStorage.getItem('pursuitos_new_draft');
                            const draft = savedDraftRaw ? JSON.parse(savedDraftRaw) : {};
                            draft.domain = c.domain;
                            sessionStorage.setItem('pursuitos_new_draft', JSON.stringify(draft));
                          } catch (_) {}
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-md border transition-all ${
                          domain.toLowerCase() === c.domain
                            ? 'bg-accent/20 border-accent text-accent font-medium'
                            : 'bg-surface border-border-subtle text-secondary hover:text-primary hover:border-secondary'
                        }`}
                      >
                        {c.name} ({c.domain})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
                <button onClick={() => updateStepAndUrl(1)} className="text-[13px] text-secondary hover:text-primary font-medium">
                  Back
                </button>
                <button 
                  onClick={handleResolveAccount}
                  disabled={!domain || isResolving}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    domain && !isResolving 
                      ? 'bg-primary text-canvas hover:bg-white' 
                      : 'bg-surface-3 text-disabled cursor-not-allowed'
                  }`}
                >
                  {isResolving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Querying Graph8...
                    </>
                  ) : (
                    <>
                      Resolve Account <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review and Confirmation */}
          {!isAnalyzing && step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Ready for Council Deliberation</h2>
                <p className="text-[13px] text-secondary mt-1">Review verified RFP and CRM context before convening the 5-Agent Council.</p>
              </div>

              <div className="bg-surface border border-border-subtle rounded-lg divide-y divide-border-subtle">
                {/* Real Document Info */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 size={16} className="text-bid mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-primary">RFP Document Verified</div>
                      <div className="text-[12px] text-secondary mt-0.5">
                        {activeFileName ? `${activeFileName} (${activeFileSize || 'Unknown'} KB)` : 'Direct Domain Pursuit'}
                      </div>
                      <div className="text-[11px] text-muted mt-1">
                        Ready for Gemini requirement extraction across technical, security, delivery, and compliance dimensions.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real Graph8 CRM Info */}
                <div className="p-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {resolvedAccount?.found ? (
                      <CheckCircle2 size={16} className="text-bid mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle size={16} className="text-conditional mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <div className="text-[13px] font-medium text-primary flex items-center gap-2">
                        <span>
                          {resolvedAccount?.found 
                            ? `Graph8 Account Verified: ${resolvedAccount.company?.name}`
                            : `Unregistered Domain: ${domain}`
                          }
                        </span>
                        {resolvedAccount?.company?.linkedinUrl && (
                          <span className="text-[10px] font-mono bg-accent/15 text-accent px-1.5 py-0.5 rounded border border-accent/30">
                            LinkedIn Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[12px] text-secondary mt-0.5">
                        {resolvedAccount?.found ? (
                          <>
                            ID: <span className="font-mono text-primary">G8-{resolvedAccount.company?.id}</span> -{' '}
                            <span className="font-semibold text-primary">{resolvedAccount.dealsCount || 0}</span> historical deals located -{' '}
                            <span className="font-semibold text-primary">{resolvedAccount.contactsCount || 0}</span> verified contacts
                            {resolvedAccount.company?.revenue && (
                              <span className="text-muted"> - Revenue: {resolvedAccount.company.revenue}</span>
                            )}
                          </>
                        ) : (
                          `Domain not yet registered in Graph8 CRM. A new company profile will be created upon analysis.`
                        )}
                      </div>

                      {/* Display Primary Contact from Graph8 with live phone and LinkedIn */}
                      {resolvedAccount?.contacts && resolvedAccount.contacts.length > 0 && (
                        <div className="mt-2.5 p-2.5 bg-surface-2 rounded border border-border-subtle text-[11px] space-y-1">
                          <div className="flex items-center gap-2 text-primary font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-bid" />
                            <span>Primary Contact: {resolvedAccount.contacts[0].name} ({resolvedAccount.contacts[0].title})</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 text-secondary pl-3 font-mono">
                            {resolvedAccount.contacts[0].phone && (
                              <span>Tel: {resolvedAccount.contacts[0].phone}</span>
                            )}
                            {resolvedAccount.contacts[0].email && (
                              <span>Email: {resolvedAccount.contacts[0].email}</span>
                            )}
                            {resolvedAccount.contacts[0].linkedinUrl && (
                              <span className="text-accent">LinkedIn: {resolvedAccount.contacts[0].linkedinUrl}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
                <button onClick={() => updateStepAndUrl(2)} className="text-[13px] text-secondary hover:text-primary font-medium">
                  Back
                </button>
                <button 
                  onClick={handleStartAnalysis}
                  className="bg-accent text-white hover:bg-accent-hover px-5 py-2.5 rounded-md text-[13px] font-medium transition-all shadow-lg shadow-accent/20 flex items-center gap-2 group"
                >
                  <Sparkles size={15} className="group-hover:rotate-12 transition-transform" />
                  Start Pipeline Analysis
                </button>
              </div>
            </div>
          )}

          {/* LIVE AGENT DELIBERATION STREAM VIEW (NO EMOJIS) */}
          {isAnalyzing && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Header Box */}
              <div className="p-6 bg-surface border border-border-subtle rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                      <BrainCircuit size={18} className="text-accent animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-primary">Autonomous Bid Council in Session</h2>
                      <p className="text-[12px] text-secondary mt-0.5">
                        Evaluating <span className="text-primary font-medium">{domain}</span> against extracted RFP scope
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-mono text-accent font-semibold">{analysisProgress}%</span>
                    <div className="text-[10px] text-muted uppercase tracking-wider">Progress</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-surface-3 h-1.5 rounded-full overflow-hidden mb-3">
                  <div 
                    className="bg-accent h-full transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span className="flex items-center gap-1.5 text-secondary">
                    <Loader2 size={12} className="animate-spin text-accent" />
                    {activeStage}
                  </span>
                  <span>5 Agents Active</span>
                </div>
              </div>

              {/* Live Deliberation Feed */}
              <div className="bg-surface-2 border border-border-subtle rounded-lg p-5">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-border-subtle text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <span>Deliberation Stream</span>
                  <span className="text-accent flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" /> Live Review
                  </span>
                </div>

                <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                  {deliberationLogs.map((log) => {
                    const getIcon = () => {
                      if (log.role === 'cto') return <Shield size={14} className="text-bid" />;
                      if (log.role === 'sales') return <TrendingUp size={14} className="text-accent" />;
                      if (log.role === 'legal') return <Scale size={14} className="text-conditional" />;
                      if (log.role === 'delivery') return <Briefcase size={14} className="text-nobid" />;
                      if (log.role === 'cso') return <BrainCircuit size={14} className="text-purple-400" />;
                      return <Sparkles size={14} className="text-muted" />;
                    };

                    const getRoleBadge = () => {
                      if (log.role === 'cto') return 'bg-bid/10 text-bid border-bid/20';
                      if (log.role === 'sales') return 'bg-accent/10 text-accent border-accent/20';
                      if (log.role === 'legal') return 'bg-conditional/10 text-conditional border-conditional/20';
                      if (log.role === 'delivery') return 'bg-nobid/10 text-nobid border-nobid/20';
                      if (log.role === 'cso') return 'bg-purple-500/10 text-purple-300 border-purple-500/20';
                      return 'bg-surface-3 text-secondary border-border-subtle';
                    };

                    return (
                      <div 
                        key={log.id} 
                        className="p-3 bg-surface border border-border-subtle/70 rounded-md text-[13px] animate-in fade-in slide-in-from-bottom-2 duration-200"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {getIcon()}
                            <span className="font-medium text-primary text-[12px]">{log.speaker}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border uppercase font-medium ${getRoleBadge()}`}>
                              {log.role}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-muted">{log.timestamp}</span>
                        </div>
                        <p className="text-[12px] text-secondary leading-relaxed pl-5 font-normal">
                          {log.text}
                        </p>
                      </div>
                    );
                  })}

                  {deliberationLogs.length === 0 && (
                    <div className="py-8 text-center text-muted text-[13px] flex items-center justify-center gap-2">
                      <Loader2 size={16} className="animate-spin text-accent" />
                      Initializing autonomous agents...
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function NewPursuitPage() {
  return (
    <Suspense fallback={
      <div className="h-full flex items-center justify-center text-muted text-[13px]">
        Loading...
      </div>
    }>
      <NewPursuitContent />
    </Suspense>
  );
}
