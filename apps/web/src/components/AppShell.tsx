'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  Building2, 
  Activity, 
  Files, 
  Settings,
  Command,
  Sparkles,
  LogOut,
  MoreHorizontal,
  ExternalLink,
  Shield,
  User
} from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isNavActive = (path: string) => pathname?.startsWith(path);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-canvas overflow-hidden selection:bg-accent/30 selection:text-primary">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] flex-shrink-0 border-r border-border-subtle bg-surface flex flex-col transition-all">
        
        {/* Header / Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
          <Link href="/pursuits" className="flex items-center gap-2 text-primary font-semibold text-[14px] hover:opacity-90 transition-opacity">
            <div className="w-5 h-5 rounded-[4px] bg-accent flex items-center justify-center">
              <Command size={12} className="text-white" />
            </div>
            PursuitOS
          </Link>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
          
          <div>
            <div className="px-3 mb-2 text-[11px] font-medium text-disabled uppercase tracking-wider">Workspace</div>
            <div className="space-y-0.5">
              <Link href="/pursuits" className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] transition-colors ${isNavActive('/pursuits') && !isNavActive('/revivals') ? 'bg-surface-3 text-primary font-medium' : 'text-secondary hover:text-primary hover:bg-surface-2'}`}>
                <Briefcase size={16} />
                Pursuits
              </Link>
              <Link href="/revivals" className={`flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] transition-colors ${isNavActive('/revivals') ? 'bg-surface-3 text-accent font-medium' : 'text-secondary hover:text-primary hover:bg-surface-2'}`}>
                <Sparkles size={16} className="text-accent" />
                Revival Scanner
              </Link>
            </div>
          </div>
          
        </nav>

        {/* Bottom User Profile with ChatGPT-Style Popover Menu */}
        <div className="p-3 border-t border-border-subtle relative" ref={menuRef}>
          
          {/* Popover Menu (opens upward) */}
          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-surface border border-border-subtle rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              
              {/* User Identity Header */}
              <div className="px-3.5 py-2.5 border-b border-border-subtle">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[13px] font-medium text-primary leading-none">Deal Team Lead</p>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">PRO</span>
                </div>
                <p className="text-[11px] text-muted truncate">team@graph8.com</p>
              </div>

              {/* Menu Links */}
              <div className="py-1">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors text-left cursor-pointer"
                >
                  <User size={14} className="text-muted" />
                  Account Profile
                </button>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors text-left cursor-pointer"
                >
                  <Settings size={14} className="text-muted" />
                  Settings & API Keys
                </button>

                <a
                  href="https://graph8.com"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Shield size={14} className="text-muted" />
                    Graph8 Workspace
                  </span>
                  <ExternalLink size={12} className="text-disabled" />
                </a>
              </div>

              <div className="my-1 border-t border-border-subtle" />

              {/* Logout Option */}
              <div className="py-0.5">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[12px] text-nobid hover:bg-nobid/10 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            </div>
          )}

          {/* Trigger Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-left ${
              menuOpen ? 'bg-surface-2 border border-border-subtle' : 'hover:bg-surface-2 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-[11px] font-semibold flex-shrink-0">
                DT
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-primary truncate leading-tight">Deal Team</p>
                <p className="text-[10px] text-muted truncate leading-tight">Graph8 Executive</p>
              </div>
            </div>
            <MoreHorizontal size={14} className="text-muted flex-shrink-0 ml-1" />
          </button>
        </div>

      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
