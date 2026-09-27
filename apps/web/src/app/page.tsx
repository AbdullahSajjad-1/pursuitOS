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
  ChevronLeft,
  Eye,
  ShieldCheck,
  Cpu,
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
    <span className="text-accent">
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

const FEATURES = [
  {
    icon: FileText,
    badge: 'Ingestion',
    title: 'Document parsing',
    description: 'Upload PDFs, Word docs, or RFP specs. Requirements are extracted and categorized automatically into structured graph schemas.',
  },
  {
    icon: Brain,
    badge: 'Deliberation',
    title: 'AI Council',
    description: 'Five specialist agents deliberate in parallel,  commercial, CTO, CEO, relationship, and competitive postures.',
  },
  {
    icon: Zap,
    badge: 'Live Context',
    title: 'Graph8 Integration',
    description: 'Every decision is verified against company, contact, deal history, and buyer signals from graph8.',
  },
  {
    icon: RotateCcw,
    badge: 'Automation',
    title: 'Revival Scanner',
    description: 'Scan lost or paused opportunities. When market triggers align, PursuitOS surfaces deals ready to re-engage.',
  },
  {
    icon: ShieldCheck,
    badge: 'Governance',
    title: 'Audit Trail',
    description: 'Inspect every claim, risk assessment, and council transcript with verifiable evidence references.',
  },
  {
    icon: Cpu,
    badge: 'Execution',
    title: 'CRM Write-Back',
    description: 'One-click sync to push approved decisions, stage progressions, battle-card summaries, and task lists.',
  },
];

// ─── Main Landing Page ───────────────────────────────────────────────────────

export default function LandingPage() {
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const scrollFeatures = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-primary selection:bg-accent/30 selection:text-primary">

      {/* ── Sticky Nav ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${headerScrolled
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
        <h1 className="text-[52px] leading-[1.08] font-semibold tracking-tight text-primary max-w-3xl mb-6">
          Pursue every deal with{' '}
          <Typewriter />
        </h1>

        <p className="text-[17px] text-secondary leading-relaxed max-w-xl mb-10">
          PursuitOS runs a five-member AI council on every RFP: commercial, CTO, CEO, relationship, and competitive, then hands you a structured bid/no-bid decision backed by evidence from graph8.
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

      {/* ── Horizontally Scrollable Features ── */}
      <section id="features" className="border-t border-border-subtle bg-surface py-24 scroll-mt-20 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-medium text-disabled uppercase tracking-wider mb-3">Features</p>
              <h2 className="text-[32px] font-semibold tracking-tight text-primary max-w-lg">
                Everything your deal team needs
              </h2>
            </div>

            {/* Scroll Navigation Controls */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollFeatures('left')}
                className="w-8 h-8 rounded-md border border-border-subtle flex items-center justify-center text-secondary hover:text-primary hover:border-muted transition-colors cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollFeatures('right')}
                className="w-8 h-8 rounded-md border border-border-subtle flex items-center justify-center text-secondary hover:text-primary hover:border-muted transition-colors cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {FEATURES.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="snap-start flex-shrink-0 w-[280px] sm:w-[320px] border border-border-subtle rounded-xl p-6 bg-canvas hover:border-muted transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-9 h-9 rounded-lg border border-border-subtle flex items-center justify-center text-secondary group-hover:text-primary group-hover:border-muted transition-colors">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-border-subtle text-muted">
                        {item.badge}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-medium text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[13px] text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center text-[12px] text-muted group-hover:text-primary transition-colors">
                    <span>Explore capability</span>
                    <ChevronRight size={13} className="ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })}
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
