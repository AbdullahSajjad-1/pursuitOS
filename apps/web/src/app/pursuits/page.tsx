import Link from 'next/link';
import { db } from '@pursuitos/server/db/client';
import { pursuits } from '@pursuitos/server/db/schema';
import { desc } from 'drizzle-orm';
import { Clock, CheckCircle2, XCircle, AlertCircle, Search, Filter, Eye, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PursuitsDashboard() {
  const allPursuits = await db.select().from(pursuits).orderBy(desc(pursuits.createdAt));

  // Helper for status formatting
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return (
          <span className="flex items-center gap-1.5 text-bid text-[12px] font-medium">
            <CheckCircle2 size={13} className="text-bid" /> Executed (In CRM)
          </span>
        );
      case 'DENIED':
        return (
          <span className="flex items-center gap-1.5 text-nobid text-[12px] font-medium">
            <XCircle size={13} className="text-nobid" /> Denied
          </span>
        );
      case 'BID':
        return (
          <span className="flex items-center gap-1.5 text-bid text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-bid" /> Bid
          </span>
        );
      case 'CONDITIONAL_BID':
        return (
          <span className="flex items-center gap-1.5 text-conditional text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-conditional" /> Conditional Bid
          </span>
        );
      case 'WATCH':
        return (
          <span className="flex items-center gap-1.5 text-amber-400 text-[12px] font-medium">
            <Eye size={13} className="text-amber-400" /> Watch Monitor
          </span>
        );
      case 'NO_BID':
        return (
          <span className="flex items-center gap-1.5 text-nobid text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-nobid" /> No Bid
          </span>
        );
      case 'READY_FOR_REVIEW':
        return (
          <span className="flex items-center gap-1.5 text-accent text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-accent" /> Ready for Review
          </span>
        );
      case 'ANALYZING':
        return (
          <span className="flex items-center gap-2 text-accent text-[12px] font-medium">
            <Clock size={12} className="animate-spin" /> Analyzing
          </span>
        );
      case 'ERROR':
        return (
          <span className="flex items-center gap-2 text-nobid text-[12px] font-medium">
            <AlertCircle size={12} /> Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-secondary text-[12px] font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-disabled" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 border-b border-border-subtle bg-canvas">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[22px] font-semibold tracking-tight text-primary">Pursuits</h1>
          <div className="flex items-center gap-3">
            <Link 
              href="/revivals" 
              className="flex items-center gap-2 bg-surface-2 hover:bg-surface-3 border border-border-subtle text-primary px-3.5 py-2 rounded-md text-[13px] font-medium transition-colors"
            >
              <Sparkles size={14} className="text-accent" />
              Revival Scanner
            </Link>
            <Link 
              href="/pursuits/new" 
              className="bg-primary text-canvas hover:bg-white px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
            >
              New pursuit
            </Link>
          </div>
        </div>
        
        {/* Filters Bar Mock */}
        <div className="flex gap-4 items-center text-[13px]">
          <button className="flex items-center gap-2 text-secondary hover:text-primary transition-colors">
            All <span className="text-muted text-[11px] bg-surface-2 px-1.5 rounded">{allPursuits.length}</span>
          </button>
          <button className="text-muted hover:text-primary transition-colors">Needs review</button>
          <button className="text-muted hover:text-primary transition-colors">Active</button>
          <button className="text-muted hover:text-primary transition-colors">Decided</button>
          
          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-surface-2 border border-border-subtle rounded-md pl-8 pr-3 py-1 text-[13px] text-primary placeholder-muted focus:outline-none focus:border-accent w-48 transition-colors"
              />
            </div>
            <button className="flex items-center gap-2 text-muted hover:text-primary border border-border-subtle rounded-md px-2.5 py-1 transition-colors">
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>
      </header>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-canvas">
        {allPursuits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] text-center">
            <p className="text-primary font-medium text-[14px]">No pursuits yet</p>
            <p className="text-secondary text-[13px] mt-1 mb-4">Upload an RFP or connect an existing Graph8 opportunity to begin an analysis.</p>
            <Link 
              href="/pursuits/new" 
              className="bg-primary text-canvas px-4 py-2 rounded-md text-[13px] font-medium transition-colors hover:bg-white"
            >
              New pursuit
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-canvas sticky top-0 border-b border-border-subtle z-10">
              <tr>
                <th className="font-medium text-secondary text-[12px] py-3 pl-8 pr-4">Opportunity</th>
                <th className="font-medium text-secondary text-[12px] py-3 px-4">Company</th>
                <th className="font-medium text-secondary text-[12px] py-3 px-4">Decision</th>
                <th className="font-medium text-secondary text-[12px] py-3 pr-8 pl-4 text-right">Last updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {allPursuits.map((pursuit) => (
                <tr key={pursuit.id} className="group hover:bg-surface focus-within:bg-surface focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent transition-colors cursor-pointer relative">
                  {/* We make the whole row clickable via an absolute link inside the first cell */}
                  <td className="py-3 pl-8 pr-4 text-[13px] text-primary font-medium">
                    <Link href={`/pursuits/${pursuit.id}`} className="absolute inset-0 z-0 focus:outline-none" aria-label={`View ${pursuit.name}`}></Link>
                    <div className="relative z-10 flex items-center gap-2">
                      <span>{pursuit.name}</span>
                      {pursuit.pursuitType === 'REVIVAL' && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/25 flex-shrink-0">
                          Revival
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[13px] text-secondary relative z-10">
                    {pursuit.companyDomain || '—'}
                  </td>
                  <td className="py-3 px-4 relative z-10">
                    {getStatusDisplay(pursuit.status)}
                  </td>
                  <td className="py-3 pr-8 pl-4 text-[13px] text-muted tabular-nums relative z-10 text-right">
                    {new Date(pursuit.updatedAt || pursuit.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
