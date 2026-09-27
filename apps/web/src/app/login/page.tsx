'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief loading, then redirect
    setTimeout(() => {
      router.push('/pursuits');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-[380px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-7 h-7 rounded-[6px] bg-accent flex items-center justify-center flex-shrink-0">
            <Command size={14} className="text-white" />
          </div>
          <span className="text-primary font-semibold text-[16px] tracking-tight">PursuitOS</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[22px] font-semibold text-primary tracking-tight mb-1.5">
            Sign in
          </h1>
          <p className="text-[13px] text-secondary">
            Executive deal intelligence workspace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-secondary mb-1.5 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@graph8.com"
              className="w-full bg-surface border border-border-subtle rounded-md px-3 py-2.5 text-[13px] text-primary placeholder-disabled focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[12px] font-medium text-secondary mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-surface border border-border-subtle rounded-md px-3 py-2.5 pr-10 text-[13px] text-primary placeholder-disabled focus:outline-none focus:border-accent transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-disabled hover:text-secondary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-canvas hover:bg-white rounded-md px-4 py-2.5 text-[13px] font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border border-canvas border-t-transparent rounded-full animate-spin" />
                  Signing in
                </span>
              ) : (
                <>
                  Continue
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-10 pt-8 border-t border-border-subtle">
          <p className="text-[11px] text-disabled text-center">
            Powered by{' '}
            <a
              href="https://graph8.com"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-secondary transition-colors"
            >
              Graph8
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
