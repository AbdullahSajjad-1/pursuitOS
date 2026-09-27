'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Search, 
  Briefcase, 
  Building2, 
  Activity, 
  Files, 
  Settings,
  Command,
  Sparkles
} from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNavActive = (path: string) => pathname?.startsWith(path);

  return (
    <div className="flex h-screen bg-canvas overflow-hidden selection:bg-accent/30 selection:text-primary">
      {/* Sidebar Navigation */}
      <aside className="w-[240px] flex-shrink-0 border-r border-border-subtle bg-surface flex flex-col transition-all">
        
        {/* Header / Logo */}
        <div className="h-14 flex items-center px-4 border-b border-border-subtle">
          <div className="flex items-center gap-2 text-primary font-semibold text-[14px]">
            <div className="w-5 h-5 rounded-[4px] bg-accent flex items-center justify-center">
              <Command size={12} className="text-white" />
            </div>
            PursuitOS
          </div>
        </div>

        {/* Global Search Mock */}
        <div className="p-4">
          <button className="w-full flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-subtle bg-surface-2 text-muted text-[13px] hover:border-muted transition-colors">
            <Search size={14} />
            <span className="flex-1 text-left">Search...</span>
            <span className="text-[10px] border border-border-subtle px-1.5 rounded text-disabled">⌘K</span>
          </button>
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
              <Link href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors">
                <Building2 size={16} />
                Accounts
              </Link>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[11px] font-medium text-disabled uppercase tracking-wider">Intelligence</div>
            <div className="space-y-0.5">
              <Link href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors">
                <Activity size={16} />
                Signals
              </Link>
              <Link href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors">
                <Files size={16} />
                Evidence
              </Link>
            </div>
          </div>
          
        </nav>

        {/* Footer Settings */}
        <div className="p-3 border-t border-border-subtle">
          <Link href="#" className="flex items-center gap-3 px-3 py-1.5 rounded-md text-[13px] text-secondary hover:text-primary hover:bg-surface-2 transition-colors">
            <Settings size={16} />
            Settings
          </Link>
        </div>

      </aside>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col min-w-0 bg-canvas overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
