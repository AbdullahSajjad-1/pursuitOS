'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import {
  Command,
  FileText,
  Brain,
  Zap,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Eye,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

// ─── Typewriter ───────────────────────────────────────────────────────────────

const WORDS = ['decisions', 'pipeline', 'intelligence', 'accuracy'];

function Typewriter() {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = WORDS[idx];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 60);
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2200);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % WORDS.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, idx]);

  return (
    <span className="text-accent inline-block whitespace-nowrap">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

function AnimatedNumber({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1200;
          const step = 16;
          const steps = duration / step;
          let i = 0;
          const timer = setInterval(() => {
            i++;
            setVal(Math.round((to * i) / steps));
            if (i >= steps) clearInterval(timer);
          }, step);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);

  return (
    <span ref={ref} className="tabular-nums">
      {val}{suffix}
    </span>
  );
}

// ─── Step Item ────────────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
  last = false,
}: {
  number: string;
  title: string;
  description: string;
  last?: boolean;
}) {
  return (
    <div className="flex gap-6 group">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full border border-border-subtle flex items-center justify-center flex-shrink-0 text-[12px] font-medium text-muted tabular-nums group-hover:border-muted group-hover:text-secondary transition-colors duration-300">
          {number}
        </div>
        {!last && <div className="w-px flex-1 bg-border-subtle mt-3" />}
      </div>
      <div className="pb-10">
        <h3 className="text-[14px] font-medium text-primary mb-1">{title}</h3>
        <p className="text-[13px] text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Decision Badge ───────────────────────────────────────────────────────────

function DecisionBadge({ type }: { type: 'bid' | 'no_bid' | 'conditional' | 'watch' }) {
  const map = {
    bid: { label: 'Bid', icon: CheckCircle2, cls: 'text-bid' },
    no_bid: { label: 'No Bid', icon: XCircle, cls: 'text-nobid' },
    conditional: { label: 'Conditional Bid', icon: Clock, cls: 'text-conditional' },
    watch: { label: 'Watch', icon: Eye, cls: 'text-amber-400' },
  };
  const { label, icon: Icon, cls } = map[type];
  return (
    <span className={`flex items-center gap-1.5 text-[12px] font-medium ${cls}`}>
      <Icon size={13} />
      {label}
    </span>
  );
}

// ─── Mini Pursuit Row ─────────────────────────────────────────────────────────

function PursuitRow({
  name,
  domain,
  decision,
}: {
  name: string;
  domain: string;
  decision: 'bid' | 'no_bid' | 'conditional' | 'watch';
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-border-subtle last:border-0 hover:bg-surface-2 transition-colors duration-200 cursor-default">
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium text-primary truncate">{name}</p>
        <p className="text-[12px] text-muted truncate">{domain}</p>
      </div>
      <DecisionBadge type={decision} />
    </div>
  );
}

// ─── Features Data ───────────────────────────────────────────────────────────

const VERTICAL_FEATURES = [
  {
    id: '01',
    icon: FileText,
    badge: 'Ingestion Engine',
    title: 'Automated Document Parsing & Decomposition',
    description:
      'Upload complex RFP questionnaires, technical specs, or multi-page PDFs. PursuitOS automatically extracts SLAs, compliance constraints, and scope items into structured verification nodes.',
    preview: {
      label: 'Extracted Criteria',
      items: [
        { label: 'Security & Auth', value: 'SAML 2.0 / Okta SCIM required' },
        { label: 'Latency SLA', value: '99.95% uptime with 200ms p99' },
        { label: 'Data Residency', value: 'EU-Frankfurt / GDPR enforced' },
      ],
    },
  },
  {
    id: '02',
    icon: Brain,
    badge: 'Multi-Agent Council',
    title: 'Autonomous Five-Member Deliberation',
    description:
      'Commercial, CTO, CEO, Relationship, and Competitive specialist agents cross-examine every requirement concurrently. Divergent perspectives eliminate confirmation bias before commitments are signed.',
    preview: {
      label: 'Agent Deliberation Matrix',
      items: [
        { label: 'CTO Council', value: 'Conditional — custom connectors needed' },
        { label: 'Commercial Agent', value: 'Favorable — ACV $380k at 78% margin' },
        { label: 'Relationship Agent', value: 'High — warm intro via former VP Eng' },
      ],
    },
  },
  {
    id: '03',
    icon: Zap,
    badge: 'Real-Time Verification',
    title: 'Live Graph8 Deal & Account Intelligence',
    description:
      'Every council recommendation is verified against active company, contact, deal history, and competitor presence from your graph8 data graph. Zero speculative assumptions.',
    preview: {
      label: 'Graph8 Graph Verification',
      items: [
        { label: 'Entity Match', value: 'graph8.com verified (14 connected deals)' },
        { label: 'Signal Stream', value: 'Hiring spike in ML Infrastructure' },
        { label: 'Confidence Score', value: '96.4% based on 22 empirical signals' },
      ],
    },
  },
  {
    id: '04',
    icon: RotateCcw,
    badge: 'Pipeline Revival',
    title: 'Continuous Revival Opportunity Scanner',
    description:
      'Deals lost months ago are monitored around the clock. When market triggers shift — competitor pricing increases, sponsor promotions, or tech changes — PursuitOS surfaces high-probability re-engagement plays.',
    preview: {
      label: 'Revival Signal Trigger',
      items: [
        { label: 'Detected Trigger', value: 'Incumbent contract renewal window' },
        { label: 'Target Account', value: 'Tenbound Global ($240k historical lost)' },
        { label: 'Revival Action', value: 'Drafted tailored re-engagement brief' },
      ],
    },
  },
  {
    id: '05',
    icon: ShieldCheck,
    badge: 'Decision Governance',
    title: 'Verifiable Evidence Trail & Board Summaries',
    description:
      'Complete visibility into how every verdict was formulated. Inspect cited requirements, agent deliberation logs, and counter-arguments with an immutable audit trail.',
    preview: {
      label: 'Audit Chain Record',
      items: [
        { label: 'Verdict ID', value: 'verdict_01J9K4M82P' },
        { label: 'Consensus', value: '4 Bid / 1 Conditional (Consensus 88%)' },
        { label: 'Signed Evidence', value: '18 cited graph8 records attached' },
      ],
    },
  },
  {
    id: '06',
    icon: Cpu,
    badge: 'CRM Automation',
    title: 'Bi-Directional CRM Stage Progression',
    description:
      'Approved decisions push straight to your CRM without manual data re-entry. PursuitOS updates opportunity stages, posts council summaries, and automatically schedules AE follow-up tasks.',
    preview: {
      label: 'Write-Back Confirmation',
      items: [
        { label: 'CRM Target', value: 'graph8 pipeline & deal table' },
        { label: 'Stage Transition', value: 'Discovery → Technical Validation' },
        { label: 'Generated Assets', value: 'Executive 1-pager & AE battle-card' },
      ],
    },
  },
];

// ─── Main Landing Page ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primary selection:bg-accent/30 selection:text-primary">

      {/* ── Sticky Nav ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          headerScrolled
            ? 'bg-canvas/95 backdrop-blur-sm border-b border-border-subtle shadow-sm'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-5xl mx-auto px-6 h-[60px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[5px] bg-accent flex items-center justify-center">
              <Command size={12} className="text-white" />
            </div>
            <span className="font-semibold text-[14px] tracking-tight text-primary">PursuitOS</span>
          </div>

          {/* Nav links with smooth scrolling */}
          <nav className="hidden md:flex items-center gap-7">
            <button
              type="button"
              onClick={() => smoothScrollTo('how-it-works')}
              className="text-[13px] text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => smoothScrollTo('features')}
              className="text-[13px] text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              Features
            </button>
          </nav>

          {/* CTA: Sign in only, routes to /login */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] text-secondary hover:text-primary transition-colors duration-200"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-5xl mx-auto px-6 pt-36 pb-24">
        <h1 className="text-[44px] sm:text-[54px] lg:text-[58px] leading-[1.08] font-semibold tracking-tight text-primary max-w-4xl mb-6">
          Pursue every deal<br className="hidden sm:inline" /> with{' '}
          <span className="inline-block whitespace-nowrap">
            <Typewriter />
          </span>
        </h1>

        <p className="text-[17px] text-secondary leading-relaxed max-w-xl mb-10">
          PursuitOS runs a five-member AI council on every RFP: commercial, CTO, CEO, relationship, and competitive — then hands you a structured bid/no-bid decision backed by evidence from graph8.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors duration-200"
          >
            Sign in
            <ChevronRight size={14} />
          </Link>
          <button
            type="button"
            onClick={() => smoothScrollTo('how-it-works')}
            className="text-[13px] text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
          >
            See how it works →
          </button>
        </div>
      </section>

      {/* ── Product preview ── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface">
          {/* Fake window chrome */}
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2 bg-surface-2">
            <span className="w-2.5 h-2.5 rounded-full bg-nobid opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-conditional opacity-70" />
            <span className="w-2.5 h-2.5 rounded-full bg-bid opacity-70" />
            <span className="ml-3 text-[12px] text-muted font-mono">pursuitOS / pursuits</span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[1fr_160px_160px] px-5 py-2.5 border-b border-border-subtle">
            <span className="text-[11px] font-medium text-disabled uppercase tracking-wider">Opportunity</span>
            <span className="text-[11px] font-medium text-disabled uppercase tracking-wider">Company</span>
            <span className="text-[11px] font-medium text-disabled uppercase tracking-wider">Decision</span>
          </div>

          {/* Rows */}
          <PursuitRow name="Enterprise Data Platform RFP" domain="graph8.com" decision="bid" />
          <PursuitRow name="GTM Infrastructure Renewal" domain="tenbound.com" decision="conditional" />
          <PursuitRow name="AI SDR Platform Replacement" domain="outreach.io" decision="watch" />
          <PursuitRow name="Legacy CRM Migration" domain="salesforce.com" decision="no_bid" />
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-border-subtle bg-surface">
        <div className="max-w-5xl mx-auto px-6 py-14 grid grid-cols-3 divide-x divide-border-subtle">
          <div className="px-8 first:pl-0 last:pr-0 text-center">
            <div className="text-[42px] font-semibold text-primary tabular-nums mb-1">
              <AnimatedNumber to={5} />
            </div>
            <p className="text-[13px] text-secondary">Council agents per pursuit</p>
          </div>
          <div className="px-8 text-center">
            <div className="text-[42px] font-semibold text-primary tabular-nums mb-1">
              <AnimatedNumber to={8} suffix=" min" />
            </div>
            <p className="text-[13px] text-secondary">Avg. time to decision</p>
          </div>
          <div className="px-8 text-center">
            <div className="text-[42px] font-semibold text-primary tabular-nums mb-1">
              100<span className="text-[28px] text-secondary">%</span>
            </div>
            <p className="text-[13px] text-secondary">graph8 data, no hallucination</p>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-24 scroll-mt-20">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-disabled uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-[32px] font-semibold tracking-tight text-primary max-w-lg">
            From RFP to decision in minutes
          </h2>
        </div>

        <div className="max-w-lg">
          <Step
            number="01"
            title="Upload your RFP"
            description="Paste the document or drop a file. PursuitOS extracts all requirements, constraints, and evaluation criteria automatically."
          />
          <Step
            number="02"
            title="Council deliberates"
            description="Five specialist AI agents analyze the opportunity from their unique lens — commercial viability, technical fit, exec alignment, relationship depth, and competitive posture."
          />
          <Step
            number="03"
            title="Receive a structured verdict"
            description="A bid / no-bid / conditional recommendation arrives with evidence chains, risk flags, and suggested next action — all grounded in live graph8 data."
          />
          <Step
            number="04"
            title="Write back to CRM"
            description="Approve the recommendation and PursuitOS creates the deal, sets the stage, logs the decision rationale, and schedules follow-up tasks."
            last
          />
        </div>
      </section>

      {/* ── Sticky Split Features Section (Big text left, vertical scroll right) ── */}
      <section id="features" className="border-t border-border-subtle bg-surface py-28 scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Sticky Big Text */}
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-border-subtle bg-surface-2 text-[11px] font-medium text-muted uppercase tracking-wider mb-4">
                <Layers size={13} className="text-accent" />
                Capabilities
              </div>
              <h2 className="text-[36px] sm:text-[42px] font-semibold tracking-tight text-primary leading-[1.1] mb-6">
                Everything your deal team needs to win.
              </h2>
              <p className="text-[15px] text-secondary leading-relaxed mb-8">
                PursuitOS replaces slow, unstructured committee debates with autonomous, evidence-backed deal intelligence grounded in graph8.
              </p>

              <div className="space-y-3 pt-6 border-t border-border-subtle">
                <div className="flex items-center gap-2 text-[13px] text-secondary">
                  <Sparkles size={14} className="text-accent flex-shrink-0" />
                  <span>5 specialist AI deliberation council agents</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-secondary">
                  <Zap size={14} className="text-accent flex-shrink-0" />
                  <span>Live graph8 entity & pipeline synchronization</span>
                </div>
                <div className="flex items-center gap-2 text-[13px] text-secondary">
                  <ShieldCheck size={14} className="text-accent flex-shrink-0" />
                  <span>Auditable decision record with evidence citations</span>
                </div>
              </div>

              <div className="mt-8 pt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-2 border border-border-subtle text-[13px] font-medium text-primary hover:border-muted hover:bg-surface-3 transition-colors"
                >
                  Start exploring
                  <ChevronRight size={14} className="text-muted" />
                </Link>
              </div>
            </div>

            {/* Right Column: Vertically Scrolling Features */}
            <div className="lg:col-span-7 space-y-8">
              {VERTICAL_FEATURES.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="border border-border-subtle rounded-xl p-7 bg-canvas hover:border-muted transition-all duration-300 group"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md border border-border-subtle flex items-center justify-center text-secondary group-hover:text-primary group-hover:border-muted transition-colors">
                          <Icon size={16} />
                        </div>
                        <span className="text-[12px] font-mono text-muted uppercase tracking-wider">
                          {feat.badge}
                        </span>
                      </div>
                      <span className="text-[12px] font-mono text-disabled font-medium">
                        {feat.id}
                      </span>
                    </div>

                    {/* Title & Copy */}
                    <h3 className="text-[17px] font-medium text-primary mb-2.5 group-hover:text-white transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-[13px] text-secondary leading-relaxed mb-6">
                      {feat.description}
                    </p>

                    {/* Live Evidence Preview Box */}
                    <div className="bg-surface-2 border border-border-subtle rounded-lg p-3.5 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-disabled">
                        {feat.preview.label}
                      </div>
                      <div className="space-y-1.5">
                        {feat.preview.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-start justify-between text-[11px] font-mono gap-3"
                          >
                            <span className="text-muted flex-shrink-0">{item.label}:</span>
                            <span className="text-primary truncate text-right">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <p className="text-[11px] font-medium text-disabled uppercase tracking-wider mb-4">Get started</p>
        <h2 className="text-[36px] font-semibold tracking-tight text-primary mb-4">
          Run your first pursuit
        </h2>
        <p className="text-[16px] text-secondary max-w-md mx-auto mb-10">
          Connect graph8, drop in an RFP, and have a council-backed decision in under ten minutes.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-[13px] font-medium hover:bg-accent/90 transition-colors duration-200"
          >
            Sign in to start
            <ChevronRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border-subtle">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] bg-accent flex items-center justify-center">
              <Command size={10} className="text-white" />
            </div>
            <span className="text-[13px] text-secondary">PursuitOS</span>
          </div>
          <div className="text-[12px] text-muted">
            Executive deal intelligence workspace
          </div>
        </div>
      </footer>

    </div>
  );
}
