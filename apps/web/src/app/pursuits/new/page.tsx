'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle2, Building2, Search, ArrowRight } from 'lucide-react';

export default function NewPursuitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    if (step === 1 && file) setStep(2);
    else if (step === 2 && domain) setStep(3);
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // 1. Create the Pursuit record in the database
      const createRes = await fetch('/api/pursuits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file ? file.name.replace(/\.[^/.]+$/, "") : `Pursuit for ${domain}`,
          companyDomain: domain,
        }),
      });
      
      if (!createRes.ok) throw new Error('Failed to create pursuit');
      const { pursuit } = await createRes.json();

      // 2. Trigger the synchronous analysis pipeline
      const analyzeRes = await fetch(`/api/pursuits/${pursuit.id}/analyze`, {
        method: 'POST',
      });
      
      if (!analyzeRes.ok) throw new Error('Failed to analyze pursuit');

      // 3. Navigate to the beautiful new Executive Briefing screen
      router.push(`/pursuits/${pursuit.id}`);
    } catch (e) {
      console.error(e);
      alert('Failed to initialize pipeline. Check server logs.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle bg-canvas flex items-center gap-4">
        <Link href="/pursuits" className="text-secondary hover:text-primary text-[13px] font-medium transition-colors">
          Pursuits
        </Link>
        <span className="text-border-subtle">/</span>
        <h1 className="text-[14px] font-semibold text-primary tracking-tight">New pursuit</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-auto flex justify-center py-16">
        <div className="w-full max-w-2xl px-6">
          
          {/* Step Indicator */}
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

          {/* STEP 1: Upload */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Start with an RFP</h2>
                <p className="text-[13px] text-secondary mt-1">Upload a PDF or DOCX, or connect an existing Graph8 deal.</p>
              </div>

              <div className="border border-border-subtle border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center bg-surface hover:bg-surface-2 transition-colors group relative cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx"
                />
                <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={20} className="text-secondary" />
                </div>
                <h3 className="text-[14px] font-medium text-primary mb-1">
                  {file ? file.name : "Drop document here"}
                </h3>
                <p className="text-[13px] text-muted">
                  {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "or click to browse"}
                </p>
              </div>

              <div className="flex items-center justify-end mt-8 pt-6 border-t border-border-subtle">
                <button 
                  onClick={handleContinue}
                  disabled={!file}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    file ? 'bg-primary text-canvas hover:bg-white' : 'bg-surface-3 text-disabled cursor-not-allowed'
                  }`}
                >
                  Continue <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Account */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Account Resolution</h2>
                <p className="text-[13px] text-secondary mt-1">We'll use Graph8 to resolve the account and retrieve relevant historical context.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-medium text-secondary uppercase tracking-wider">Company Domain</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input 
                    type="text" 
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. acme.com" 
                    className="w-full bg-surface border border-border-subtle rounded-md pl-10 pr-4 py-2.5 text-[14px] text-primary placeholder-muted focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
                <button onClick={() => setStep(1)} className="text-[13px] text-secondary hover:text-primary font-medium">
                  Back
                </button>
                <button 
                  onClick={handleContinue}
                  disabled={!domain}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    domain ? 'bg-primary text-canvas hover:bg-white' : 'bg-surface-3 text-disabled cursor-not-allowed'
                  }`}
                >
                  Resolve Account <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-[18px] font-semibold text-primary">Ready for Analysis</h2>
                <p className="text-[13px] text-secondary mt-1">PursuitOS has successfully parsed the document and resolved the Graph8 account.</p>
              </div>

              <div className="bg-surface border border-border-subtle rounded-lg divide-y divide-border-subtle">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-bid" />
                    <div>
                      <div className="text-[13px] font-medium text-primary">Document parsed</div>
                      <div className="text-[12px] text-secondary">RFP contains 42 pages, 137 requirements detected.</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-bid" />
                    <div>
                      <div className="text-[13px] font-medium text-primary">Graph8 Account resolved</div>
                      <div className="text-[12px] text-secondary">Found {domain} (ID: G8-48291). 3 historical deals located.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border-subtle">
                <button onClick={() => setStep(2)} className="text-[13px] text-secondary hover:text-primary font-medium" disabled={isAnalyzing}>
                  Back
                </button>
                <button 
                  onClick={handleStartAnalysis}
                  disabled={isAnalyzing}
                  className={`px-4 py-2 rounded-md text-[13px] font-medium transition-colors flex items-center gap-2 ${
                    isAnalyzing ? 'bg-accent/50 text-white cursor-wait' : 'bg-accent text-white hover:bg-accent-hover'
                  }`}
                >
                  {isAnalyzing ? 'Initializing Pipeline...' : 'Start Pipeline Analysis'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
