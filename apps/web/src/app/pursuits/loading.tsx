export default function PursuitsLoading() {
  return (
    <div className="h-full flex flex-col bg-canvas">
      {/* Header Skeleton */}
      <header className="px-8 py-6 border-b border-border-subtle bg-canvas">
        <div className="flex justify-between items-center mb-6">
          <div className="w-32 h-8 bg-surface-2 animate-pulse rounded-md" />
          <div className="w-24 h-8 bg-surface-2 animate-pulse rounded-md" />
        </div>
        
        {/* Filters Bar Skeleton */}
        <div className="flex gap-4 items-center">
          <div className="w-12 h-4 bg-surface-2 animate-pulse rounded" />
          <div className="w-20 h-4 bg-surface-2 animate-pulse rounded" />
          <div className="w-12 h-4 bg-surface-2 animate-pulse rounded" />
          <div className="ml-auto w-48 h-8 bg-surface-2 animate-pulse rounded-md" />
        </div>
      </header>

      {/* Table Content Skeleton */}
      <div className="flex-1 overflow-auto bg-canvas">
        <table className="w-full text-left border-collapse">
          <thead className="bg-canvas border-b border-border-subtle">
            <tr>
              <th className="py-3 pl-8 pr-4"><div className="w-20 h-3 bg-surface-2 rounded" /></th>
              <th className="py-3 px-4"><div className="w-16 h-3 bg-surface-2 rounded" /></th>
              <th className="py-3 px-4"><div className="w-16 h-3 bg-surface-2 rounded" /></th>
              <th className="py-3 px-4"><div className="w-16 h-3 bg-surface-2 rounded" /></th>
              <th className="py-3 px-4"><div className="w-24 h-3 bg-surface-2 rounded" /></th>
              <th className="py-3 pr-8 pl-4"><div className="w-12 h-3 bg-surface-2 rounded ml-auto" /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {[1, 2, 3, 4, 5, 6].map((row) => (
              <tr key={row}>
                <td className="py-4 pl-8 pr-4"><div className="w-48 h-4 bg-surface-2 animate-pulse rounded" /></td>
                <td className="py-4 px-4"><div className="w-24 h-4 bg-surface-2 animate-pulse rounded" /></td>
                <td className="py-4 px-4"><div className="w-20 h-4 bg-surface-2 animate-pulse rounded" /></td>
                <td className="py-4 px-4"><div className="w-16 h-4 bg-surface-2 animate-pulse rounded" /></td>
                <td className="py-4 px-4"><div className="w-24 h-4 bg-surface-2 animate-pulse rounded" /></td>
                <td className="py-4 pr-8 pl-4"><div className="w-20 h-4 bg-surface-2 animate-pulse rounded ml-auto" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
