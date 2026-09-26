export default function PursuitDetailLoading() {
  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-canvas">
      
      {/* 70% MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 border-r border-border-subtle relative">
        
        {/* Header Skeleton */}
        <div className="mb-12">
          <div className="w-24 h-4 bg-surface-2 animate-pulse rounded mb-3" />
          <div className="w-3/4 h-8 bg-surface-2 animate-pulse rounded mb-4" />
          <div className="flex gap-6">
            <div className="w-20 h-4 bg-surface-2 animate-pulse rounded" />
            <div className="w-24 h-4 bg-surface-2 animate-pulse rounded" />
            <div className="w-32 h-4 bg-surface-2 animate-pulse rounded" />
          </div>
        </div>

        {/* DECISION Skeleton */}
        <div className="mb-16 border-t border-border-subtle pt-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-2.5 h-2.5 rounded-full bg-surface-2 animate-pulse mt-1.5" />
            <div>
              <div className="w-32 h-6 bg-surface-2 animate-pulse rounded mb-2" />
              <div className="w-24 h-4 bg-surface-2 animate-pulse rounded" />
            </div>
          </div>
          <div className="space-y-3 ml-6">
            <div className="w-full h-4 bg-surface-2 animate-pulse rounded" />
            <div className="w-5/6 h-4 bg-surface-2 animate-pulse rounded" />
            <div className="w-4/6 h-4 bg-surface-2 animate-pulse rounded" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="mb-16 border-t border-border-subtle pt-8">
          <div className="w-32 h-5 bg-surface-2 animate-pulse rounded mb-6" />
          <div className="space-y-4">
            <div className="w-full h-10 bg-surface-2 animate-pulse rounded" />
            <div className="w-full h-10 bg-surface-2 animate-pulse rounded" />
            <div className="w-full h-10 bg-surface-2 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* 30% DECISION RAIL */}
      <div className="w-full lg:w-[380px] bg-surface flex-shrink-0 flex flex-col h-full border-l border-border-subtle">
        <div className="p-8 flex-1">
          <div className="w-32 h-4 bg-surface-2 animate-pulse rounded mb-8" />
          
          <div className="space-y-4 mb-12">
            <div className="w-24 h-4 bg-surface-2 animate-pulse rounded mb-4" />
            <div className="w-full h-4 bg-surface-2 animate-pulse rounded" />
            <div className="w-5/6 h-4 bg-surface-2 animate-pulse rounded" />
          </div>

          <div className="space-y-4">
            <div className="w-32 h-4 bg-surface-2 animate-pulse rounded mb-4" />
            <div className="w-full h-16 bg-surface-2 animate-pulse rounded-md" />
            <div className="w-full h-16 bg-surface-2 animate-pulse rounded-md" />
          </div>
        </div>
        
        <div className="p-6 border-t border-border-subtle bg-surface-2">
          <div className="w-full h-10 bg-surface-3 animate-pulse rounded-md" />
        </div>
      </div>

    </div>
  );
}
