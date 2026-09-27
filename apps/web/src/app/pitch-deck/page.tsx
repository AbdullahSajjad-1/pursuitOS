'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  FileText,
  Brain,
  TrendingUp,
  Users,
  Sword,
  Building2,
  Database,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ShieldCheck,
  Home,
  X,
} from 'lucide-react';

// ─── Slide Definitions ───────────────────────────────────────────────────────

const SLIDES = [
  'title',
  'problem',
  'question',
  'solution',
  'graph8-foundation',
  'what-ai-sees',
  'council',
  'verdict',
  'writeback',
  'revival',
  'big-picture',
  'closing',
] as const;

type SlideId = typeof SLIDES[number];

// ─── Main Pitch Deck ─────────────────────────────────────────────────────────

export default function PitchDeck() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [transitioning, setTransitioning] = useState(false);

  const total = SLIDES.length;

  const go = useCallback((next: number) => {
    if (transitioning || next < 0 || next >= total) return;
    setDirection(next > current ? 'forward' : 'back');
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(next);
      setTransitioning(false);
    }, 280);
  }, [current, total, transitioning]);

  const prev = () => go(current - 1);
  const next = () => go(current + 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        next();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
      if (e.key === 'Escape') {
        router.push('/');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, transitioning]);

  const slideId = SLIDES[current];

  return (
    <div className="relative h-screen w-screen bg-canvas overflow-hidden font-sans select-none">

      {/* Top Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[5px] bg-accent flex items-center justify-center">
            <Command size={12} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-primary tracking-tight">PursuitOS</span>
          <span className="text-[11px] text-disabled ml-1">· Pitch Deck</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-disabled tabular-nums">
            {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <button
            onClick={() => router.push('/')}
            className="w-7 h-7 flex items-center justify-center rounded-md text-muted hover:text-primary hover:bg-surface-2 transition-colors cursor-pointer"
            title="Exit to home"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 inset-x-0 z-40 h-0.5 bg-border-subtle">
        <div
          className="h-full bg-accent transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Slide Container */}
      <div
        className={`h-full w-full transition-all duration-280 ease-out ${
          transitioning
            ? direction === 'forward'
              ? 'opacity-0 translate-x-6'
              : 'opacity-0 -translate-x-6'
            : 'opacity-100 translate-x-0'
        }`}
        style={{ transitionDuration: '280ms' }}
      >
        {slideId === 'title' && <Slide_Title />}
        {slideId === 'problem' && <Slide_Problem />}
        {slideId === 'question' && <Slide_Question />}
        {slideId === 'solution' && <Slide_Solution />}
        {slideId === 'graph8-foundation' && <Slide_Graph8Foundation />}
        {slideId === 'what-ai-sees' && <Slide_WhatAISees />}
        {slideId === 'council' && <Slide_Council />}
        {slideId === 'verdict' && <Slide_Verdict />}
        {slideId === 'writeback' && <Slide_WriteBack />}
        {slideId === 'revival' && <Slide_Revival />}
        {slideId === 'big-picture' && <Slide_BigPicture />}
        {slideId === 'closing' && <Slide_Closing />}
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 inset-x-0 z-30 flex items-center justify-between px-8">
        {/* Dot Indicators */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === current
                  ? 'w-5 h-1.5 bg-accent'
                  : 'w-1.5 h-1.5 bg-border-subtle hover:bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Arrow Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={current === 0}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-secondary hover:text-primary hover:border-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={next}
            disabled={current === total - 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-border-subtle text-secondary hover:text-primary hover:border-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ───────────────────────────────────────────────────────

function SlideWrap({ children, center = true }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className={`h-full w-full flex flex-col ${center ? 'items-center justify-center' : ''} px-20 py-20 pt-20`}>
      {children}
    </div>
  );
}

function SlideLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted mb-4">
      {children}
    </div>
  );
}

function SlideSub({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <p className={`text-[18px] text-secondary leading-relaxed ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}>
      {children}
    </p>
  );
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span className="text-accent">{children}</span>;
}

function Divider() {
  return <div className="w-8 h-px bg-accent my-8 opacity-70" />;
}

// ─── Slide 01: Title ─────────────────────────────────────────────────────────

function Slide_Title() {
  return (
    <SlideWrap>
      <div className="text-center max-w-4xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border-subtle bg-surface-2 text-[11px] font-mono text-muted mb-8 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Graph8 Hackathon 2025
        </div>
        <h1 className="text-[64px] lg:text-[80px] font-semibold tracking-tight text-primary leading-[1.0] mb-6">
          PursuitOS
        </h1>
        <p className="text-[22px] text-secondary font-light max-w-xl mx-auto mb-10 leading-relaxed">
          The <Accent>autonomous decision engine</Accent> for enterprise deal pursuits — grounded in Graph8.
        </p>

        <div className="flex items-center justify-center gap-6 text-[12px] font-mono text-muted">
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-bid" />
            RFP Intelligence
          </span>
          <span className="text-border-subtle">·</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-conditional" />
            5-Agent Council
          </span>
          <span className="text-border-subtle">·</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1 h-1 rounded-full bg-accent" />
            Graph8 Powered
          </span>
        </div>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 02: Problem ───────────────────────────────────────────────────────

function Slide_Problem() {
  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-3xl">
        <SlideLabel>01 — The Problem</SlideLabel>
        <h1 className="text-[52px] font-semibold tracking-tight text-primary leading-[1.06] mb-6">
          Hundreds of pages.<br />
          <Accent>Four days.</Accent><br />
          Still guessing.
        </h1>
        <Divider />
        <p className="text-[17px] text-secondary leading-relaxed max-w-2xl mb-8">
          Enterprise RFPs arrive as dense stacks of requirements, security questionnaires, technical specifications, and commercial conditions.
        </p>
        <p className="text-[17px] text-secondary leading-relaxed max-w-2xl">
          From finding an RFP to deciding whether to pursue it, companies often wait <span className="text-primary font-medium">four days or more</span> — gathering opinions from Solutions Architects, Commercial leads, Sales leadership, and Legal — before anyone even commits to an answer.
        </p>
      </div>

      <div className="absolute right-20 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        {['Technical Specifications', 'Security Questionnaire', 'Compliance Annex', 'Commercial Terms'].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-subtle bg-surface text-[13px] text-secondary"
            style={{ transform: `rotate(${(i % 2 === 0 ? 1 : -1) * 1.2}deg)` }}
          >
            <FileText size={14} className="text-muted flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

// ─── Slide 03: The Question ───────────────────────────────────────────────────

function Slide_Question() {
  return (
    <SlideWrap>
      <div className="text-center max-w-4xl">
        <SlideLabel>02 — The Core Question</SlideLabel>
        <h1 className="text-[52px] lg:text-[68px] font-semibold tracking-tight text-primary leading-[1.06] mb-8">
          "Can we actually win this —<br />
          <Accent>and should we even try?</Accent>"
        </h1>
        <Divider />
        <p className="text-[18px] text-secondary mx-auto max-w-xl leading-relaxed">
          That question deserves a fast, structured, evidence-backed answer. Not four days of committee emails.
        </p>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 04: Solution ───────────────────────────────────────────────────────

function Slide_Solution() {
  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-3xl">
        <SlideLabel>03 — The Solution</SlideLabel>
        <h1 className="text-[48px] font-semibold tracking-tight text-primary leading-[1.06] mb-6">
          That is what we built<br />
          <Accent>PursuitOS</Accent> to solve.
        </h1>
        <Divider />
        <p className="text-[17px] text-secondary leading-relaxed mb-6">
          PursuitOS ingests an RFP — or an existing opportunity — and turns that unstructured information into a structured, evidence-backed pursuit in minutes.
        </p>
        <p className="text-[17px] text-secondary leading-relaxed">
          But the RFP alone doesn't tell you whether you should bid. That's where <span className="text-primary font-medium">Graph8 becomes the foundation.</span>
        </p>
      </div>

      <div className="absolute right-16 top-1/2 -translate-y-1/2 w-[320px]">
        <div className="border border-border-subtle rounded-xl overflow-hidden bg-surface">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center gap-2 bg-surface-2">
            <span className="w-2 h-2 rounded-full bg-nobid opacity-60" />
            <span className="w-2 h-2 rounded-full bg-conditional opacity-60" />
            <span className="w-2 h-2 rounded-full bg-bid opacity-60" />
            <span className="ml-2 text-[11px] text-muted font-mono">pursuitOS</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <FileText size={14} className="text-accent" />
              <span className="text-[12px] text-secondary">RFP Ingested</span>
              <CheckCircle2 size={12} className="text-bid ml-auto" />
            </div>
            <div className="flex items-center gap-2.5">
              <Database size={14} className="text-accent" />
              <span className="text-[12px] text-secondary">Graph8 Resolved</span>
              <CheckCircle2 size={12} className="text-bid ml-auto" />
            </div>
            <div className="flex items-center gap-2.5">
              <Brain size={14} className="text-accent" />
              <span className="text-[12px] text-secondary">Council Deliberating...</span>
              <div className="ml-auto flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 05: Graph8 Foundation ─────────────────────────────────────────────

function Slide_Graph8Foundation() {
  const signals = [
    { icon: Users, label: 'Contacts & Buying Committee' },
    { icon: Database, label: 'Previous Deals & Loss Reasons' },
    { icon: TrendingUp, label: 'Intent & Hiring Signals' },
    { icon: Sword, label: 'Competitive Intelligence' },
    { icon: Building2, label: 'Account Relationships' },
  ];

  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-xl">
        <SlideLabel>04 — Graph8 as Foundation</SlideLabel>
        <h1 className="text-[44px] font-semibold tracking-tight text-primary leading-[1.06] mb-6">
          Graph8 is where<br />
          the <Accent>account reality</Accent><br />
          lives.
        </h1>
        <Divider />
        <p className="text-[16px] text-secondary leading-relaxed">
          We resolve the company directly against Graph8, then pull the complete intelligence picture behind that account.
        </p>
      </div>

      <div className="absolute right-16 top-1/2 -translate-y-1/2 w-[300px] space-y-2">
        {signals.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border-subtle bg-surface text-[13px] text-secondary hover:border-muted hover:text-primary transition-colors"
          >
            <s.icon size={15} className="text-accent flex-shrink-0" />
            {s.label}
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

// ─── Slide 06: What the AI Sees ───────────────────────────────────────────────

function Slide_WhatAISees() {
  const questions = [
    { q: 'What does the customer want?', icon: FileText },
    { q: 'What do we know about this account?', icon: Building2 },
    { q: 'What happened the last time we tried to win them?', icon: Database },
    { q: "What's changed since then?", icon: TrendingUp },
  ];

  return (
    <SlideWrap>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <SlideLabel>05 — What the AI Sees</SlideLabel>
          <h1 className="text-[44px] font-semibold tracking-tight text-primary leading-[1.06]">
            Not a document.<br /><Accent>An account.</Accent>
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {questions.map((item, i) => (
            <div key={i} className="border border-border-subtle rounded-xl p-6 bg-surface hover:border-muted transition-colors group">
              <item.icon size={18} className="text-accent mb-3" />
              <p className="text-[16px] font-medium text-primary leading-snug">{item.q}</p>
            </div>
          ))}
        </div>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 07: The Council ─────────────────────────────────────────────────────

function Slide_Council() {
  const agents = [
    { icon: TrendingUp, role: 'Commercial', focus: 'Economics, margin, contract risk' },
    { icon: Brain, role: 'CTO', focus: 'Technical feasibility, SLAs, architecture' },
    { icon: Building2, role: 'CEO', focus: 'Strategic fit, brand, opportunity cost' },
    { icon: Users, role: 'Relationship', focus: 'Buying committee, sponsors, champions' },
    { icon: Sword, role: 'Competitive', focus: 'Incumbents, win rates, differentiation' },
  ];

  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-md">
        <SlideLabel>06 — The AI Bid Council</SlideLabel>
        <h1 className="text-[40px] font-semibold tracking-tight text-primary leading-[1.08] mb-6">
          Five specialists.<br />
          One <Accent>structured verdict.</Accent>
        </h1>
        <Divider />
        <p className="text-[16px] text-secondary leading-relaxed">
          Each agent deliberates over the same live evidence independently — eliminating groupthink and surfacing blind spots before commitments are made.
        </p>
      </div>

      <div className="absolute right-12 top-20 bottom-20 flex flex-col justify-center w-[340px] space-y-2.5">
        {agents.map((agent, i) => (
          <div key={i} className="flex items-start gap-3 border border-border-subtle rounded-xl px-4 py-3.5 bg-surface hover:border-muted hover:bg-surface-2 transition-colors group">
            <div className="w-8 h-8 rounded-md border border-border-subtle flex items-center justify-center flex-shrink-0 text-muted group-hover:text-primary group-hover:border-muted transition-colors">
              <agent.icon size={15} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-primary leading-tight">{agent.role} Agent</p>
              <p className="text-[11px] text-muted mt-0.5 leading-tight">{agent.focus}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

// ─── Slide 08: The Verdict ─────────────────────────────────────────────────────

function Slide_Verdict() {
  return (
    <SlideWrap>
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <SlideLabel>07 — The Verdict</SlideLabel>
          <h1 className="text-[44px] font-semibold tracking-tight text-primary leading-[1.06] mb-4">
            Structured decision. <Accent>Cited evidence.</Accent>
          </h1>
          <p className="text-[16px] text-secondary max-w-xl mx-auto">
            The council produces one of three structured verdicts — with the exact evidence trail behind every claim.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="border border-bid/40 rounded-xl p-6 bg-bid/5 text-center">
            <CheckCircle2 size={28} className="text-bid mx-auto mb-3" />
            <p className="text-[15px] font-medium text-bid mb-1">Bid</p>
            <p className="text-[12px] text-secondary">Strong commercial & technical alignment. Go.</p>
          </div>
          <div className="border border-conditional/40 rounded-xl p-6 bg-conditional/5 text-center">
            <Clock size={28} className="text-conditional mx-auto mb-3" />
            <p className="text-[15px] font-medium text-conditional mb-1">Conditional Bid</p>
            <p className="text-[12px] text-secondary">Viable with specific conditions met first.</p>
          </div>
          <div className="border border-nobid/40 rounded-xl p-6 bg-nobid/5 text-center">
            <XCircle size={28} className="text-nobid mx-auto mb-3" />
            <p className="text-[15px] font-medium text-nobid mb-1">No Bid</p>
            <p className="text-[12px] text-secondary">Evidence doesn't support pursuit. Pass.</p>
          </div>
        </div>

        <div className="mt-6 border border-border-subtle rounded-xl p-4 bg-surface">
          <div className="text-[10px] font-mono text-disabled uppercase tracking-wider mb-3">Evidence Chain</div>
          <div className="space-y-1.5">
            {[
              { id: 'EV-042', text: 'Graph8: 3 prior lost deals on compliance grounds — all since remediated' },
              { id: 'EV-107', text: 'Graph8 Radar: New CISO hired Q3 2025, prior vendor of ours' },
              { id: 'EV-119', text: 'Commercial: ACV $420k at 82% projected margin — within target band' },
            ].map((e, i) => (
              <div key={i} className="flex items-start gap-3 text-[11px] font-mono">
                <span className="text-accent flex-shrink-0">{e.id}</span>
                <span className="text-muted">{e.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 09: Write-Back ────────────────────────────────────────────────────

function Slide_WriteBack() {
  const steps = [
    { label: 'Opportunity Created', detail: 'New deal provisioned in Graph8 pipeline' },
    { label: 'Stage Updated', detail: 'Discovery → Technical Qualification' },
    { label: 'Decision Logged', detail: 'Council rationale written to account notes' },
    { label: 'Tasks Assigned', detail: 'AE & SE follow-ups scheduled automatically' },
  ];

  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-xl">
        <SlideLabel>08 — Graph8 Write-Back</SlideLabel>
        <h1 className="text-[40px] font-semibold tracking-tight text-primary leading-[1.06] mb-4">
          Graph8 isn't just<br />
          where we get data.
        </h1>
        <p className="text-[20px] text-accent font-medium mb-6">
          It's the system of record, the intelligence layer, and the execution layer.
        </p>
        <Divider />
        <p className="text-[16px] text-secondary leading-relaxed">
          Once a human approves the decision, PursuitOS writes the full outcome directly into Graph8 — closing the loop from intelligence to execution.
        </p>
      </div>

      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[320px] space-y-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 border border-border-subtle rounded-lg px-4 py-3 bg-surface">
            <CheckCircle2 size={14} className="text-bid flex-shrink-0" />
            <div>
              <p className="text-[12px] font-medium text-primary">{s.label}</p>
              <p className="text-[11px] text-muted">{s.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideWrap>
  );
}

// ─── Slide 10: Revival Scanner ────────────────────────────────────────────────

function Slide_Revival() {
  return (
    <SlideWrap center={false}>
      <div className="flex-1 flex flex-col justify-center max-w-xl">
        <SlideLabel>09 — Revival Scanner</SlideLabel>
        <h1 className="text-[40px] font-semibold tracking-tight text-primary leading-[1.06] mb-6">
          Companies don't just lose<br />
          opportunities because they're<br />
          <Accent>bad opportunities.</Accent>
        </h1>
        <Divider />
        <p className="text-[16px] text-secondary leading-relaxed mb-4">
          Sometimes the timing is wrong. PursuitOS scans closed-lost deals in Graph8 and asks:
        </p>
        <div className="space-y-2.5 mt-2">
          {[
            'Why did we lose this?',
            'Has that blocker changed?',
            'Is there a reason to pursue this account again now?',
          ].map((q, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <ArrowRight size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <p className="text-[15px] text-primary">{q}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute right-12 top-1/2 -translate-y-1/2 w-[300px]">
        <div className="border border-border-subtle rounded-xl p-5 bg-surface space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <RotateCcw size={14} className="text-accent" />
            <span className="text-[12px] font-mono text-muted uppercase tracking-wider">Revival Detected</span>
          </div>
          <div className="space-y-2">
            <div className="text-[13px] font-medium text-primary">Tenbound Global</div>
            <div className="space-y-1.5">
              {[
                { icon: Users, text: 'New VP of Engineering hired' },
                { icon: TrendingUp, text: 'Hiring spike: ML Infrastructure' },
                { icon: Zap, text: 'Incumbent contract window open' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-secondary">
                  <item.icon size={11} className="text-accent flex-shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-[11px] text-muted">Revival Score</span>
              <span className="text-[13px] font-medium text-bid">87 / 100</span>
            </div>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 11: Big Picture ────────────────────────────────────────────────────

function Slide_BigPicture() {
  return (
    <SlideWrap>
      <div className="max-w-3xl text-center">
        <SlideLabel>10 — The Real Problem We Solve</SlideLabel>
        <h1 className="text-[44px] font-semibold tracking-tight text-primary leading-[1.06] mb-8">
          We're not building<br />
          another <span className="text-secondary line-through">document summarizer.</span>
        </h1>
        <div className="border border-accent/30 rounded-2xl p-8 bg-accent/5 mb-8">
          <p className="text-[20px] text-primary leading-relaxed font-medium">
            "Should we spend our company's time, money, engineering resources, and executive attention pursuing this opportunity?"
          </p>
        </div>
        <p className="text-[17px] text-secondary leading-relaxed max-w-2xl mx-auto">
          That is the question PursuitOS answers — by combining the RFP with the live reality of the account in Graph8, running it through an executive deliberation council, and turning the result into an executable pursuit.
        </p>
      </div>
    </SlideWrap>
  );
}

// ─── Slide 12: Closing ────────────────────────────────────────────────────────

function Slide_Closing() {
  return (
    <SlideWrap>
      <div className="text-center max-w-3xl">
        <div className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-8 h-8 rounded-[6px] bg-accent flex items-center justify-center">
            <Command size={16} className="text-white" />
          </div>
          <span className="text-[18px] font-semibold text-primary tracking-tight">PursuitOS</span>
        </div>

        <h1 className="text-[52px] lg:text-[64px] font-semibold tracking-tight text-primary leading-[1.06] mb-6">
          From RFP to decision —<br />
          <Accent>grounded in Graph8.</Accent>
        </h1>

        <Divider />

        <p className="text-[18px] text-secondary mb-10">
          That's PursuitOS.
        </p>

        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <div className="border border-border-subtle rounded-xl p-4 bg-surface">
            <ShieldCheck size={16} className="text-accent mb-2" />
            <p className="text-[12px] font-medium text-primary mb-0.5">Evidence-Backed</p>
            <p className="text-[11px] text-muted">Every claim cites a Graph8 record or document</p>
          </div>
          <div className="border border-border-subtle rounded-xl p-4 bg-surface">
            <Brain size={16} className="text-accent mb-2" />
            <p className="text-[12px] font-medium text-primary mb-0.5">Multi-Agent Council</p>
            <p className="text-[11px] text-muted">5 specialist perspectives, one structured verdict</p>
          </div>
          <div className="border border-border-subtle rounded-xl p-4 bg-surface">
            <Zap size={16} className="text-accent mb-2" />
            <p className="text-[12px] font-medium text-primary mb-0.5">Graph8 Native</p>
            <p className="text-[11px] text-muted">SOR, intelligence layer & execution layer</p>
          </div>
        </div>
      </div>
    </SlideWrap>
  );
}


