import Link from 'next/link';
import { db } from '@pursuitos/server/db/client';
import { pursuits } from '@pursuitos/server/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function PursuitsDashboard() {
  const allPursuits = await db.select().from(pursuits).orderBy(desc(pursuits.createdAt));

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white">Active Pursuits</h1>
        <Link 
          href="/pursuits/new" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          New Pursuit
        </Link>
      </div>

      {allPursuits.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-12 text-center text-gray-400">
          No active pursuits found. Create one to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPursuits.map(pursuit => (
            <Link key={pursuit.id} href={`/pursuits/${pursuit.id}`}>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-colors h-full flex flex-col justify-between group">
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {pursuit.name}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">{pursuit.companyDomain}</p>
                </div>
                
                <div className="mt-6 flex justify-between items-end">
                  <div className="text-xs font-mono text-gray-500">
                    {new Date(pursuit.createdAt).toLocaleDateString()}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    pursuit.status === 'BID' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    pursuit.status === 'CONDITIONAL_BID' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    pursuit.status === 'NO_BID' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    pursuit.status === 'ANALYZING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse' :
                    'bg-gray-800 text-gray-300 border-gray-700'
                  }`}>
                    {pursuit.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
