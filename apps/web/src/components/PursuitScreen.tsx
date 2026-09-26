'use client';

import { useState } from 'react';

// The main client component that receives the fetched data
export default function PursuitScreenClient({ 
  pursuit, requirements, synthesis, reviews, events 
}: any) {
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Parse conditions & actions if they exist
  const conditions = synthesis?.conditions || [];
  const recommendedActions = synthesis?.recommendedAction ? [synthesis.recommendedAction] : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8 pb-24">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{pursuit.name}</h1>
        <p className="text-gray-400 mt-1">{pursuit.companyDomain} • Status: {pursuit.status.replace('_', ' ')}</p>
      </div>

      {/* DECISION BANNER */}
      {synthesis && (
        <div className={`p-6 rounded-xl border ${
          synthesis.decision === 'BID' ? 'bg-green-900/20 border-green-500/30 text-green-300' :
          synthesis.decision === 'CONDITIONAL_BID' ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300' :
          'bg-red-900/20 border-red-500/30 text-red-300'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold uppercase tracking-wider">
              {synthesis.decision.replace('_', ' ')}
            </h2>
            <div className="text-right">
              <div className="text-sm font-semibold opacity-80 uppercase tracking-wider">Confidence</div>
              <div className="text-xl font-bold capitalize">{synthesis.confidence}</div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-current/20">
            <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80 mb-2">Synthesis Rationale</h3>
            <p className="text-current/90 leading-relaxed">
              {synthesis.rationale}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Council & Events */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* COUNCIL REVIEWS */}
          {reviews?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Council Assessments</h3>
              <div className="space-y-4">
                {reviews.map((review: any) => (
                  <div key={review.id} className="p-4 rounded-lg bg-gray-950 border border-gray-800">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-blue-400 uppercase tracking-wide text-sm">{review.role} Analyst</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        review.recommendation === 'bid' ? 'border-green-500/30 text-green-400' :
                        review.recommendation === 'conditional_bid' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-red-500/30 text-red-400'
                      }`}>
                        {review.score}/100 • {review.recommendation.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">{review.assessment}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs mt-3 pt-3 border-t border-gray-800">
                      <div>
                        <strong className="text-gray-500 block mb-1">Key Positives</strong>
                        <ul className="list-disc pl-4 text-gray-400 space-y-1">
                          {review.positiveFactors?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                      <div>
                        <strong className="text-gray-500 block mb-1">Key Risks</strong>
                        <ul className="list-disc pl-4 text-gray-400 space-y-1">
                          {review.risks?.map((r: string, i: number) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EVENTS TIMELINE */}
          {events?.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Material Events Timeline</h3>
              <div className="space-y-4">
                {events.map((event: any) => (
                  <div key={event.id} className="relative pl-6 pb-4 border-l border-gray-800 last:border-0">
                    <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                      event.impact === 'positive' ? 'bg-green-500' :
                      event.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`} />
                    <h4 className="font-semibold text-gray-200 text-sm">
                      <span className="text-gray-500 mr-2">[{event.severity.toUpperCase()}]</span> 
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Actions & Conditions */}
        <div className="space-y-8">
          
          {/* CONDITIONS */}
          {conditions.length > 0 && (
            <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Required Conditions
              </h3>
              <ul className="space-y-3">
                {conditions.map((cond: string, i: number) => (
                  <li key={i} className="text-sm text-yellow-200/90 flex gap-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>{cond}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* NEXT ACTIONS */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Proposed Actions</h3>
            {recommendedActions.length > 0 ? (
              <div className="space-y-3">
                {/* For the MVP, we just render the raw string or mapped object */}
                {recommendedActions.map((action: string, i: number) => (
                  <div key={i} className="p-3 bg-gray-950 border border-gray-800 rounded-lg flex gap-3 items-start">
                    <input type="checkbox" className="mt-1 rounded bg-gray-800 border-gray-700 text-blue-500 focus:ring-blue-500" />
                    <span className="text-sm text-gray-300">{action}</span>
                  </div>
                ))}
                
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  Approve Selected Actions
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No specific actions recommended yet.</p>
            )}
          </div>
          
          {/* REQUIREMENTS SUMMARY */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">RFP Requirements</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {requirements.map((req: any) => (
                <div key={req.id} className="text-xs p-2 bg-gray-950 rounded border border-gray-800">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold mr-2 ${
                    req.priority === 'critical' ? 'bg-red-900/30 text-red-400' :
                    req.priority === 'important' ? 'bg-yellow-900/30 text-yellow-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {req.category}
                  </span>
                  <span className="text-gray-300">{req.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* FIXED DEMO BANNER */}
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900/90 text-blue-100 text-center py-2 text-xs border-t border-blue-500/30 backdrop-blur-sm z-50">
        <span className="font-bold">PursuitOS Demo Mode</span> — Actions require manual approval before Graph8 execution.
      </div>
    </div>
  );
}
