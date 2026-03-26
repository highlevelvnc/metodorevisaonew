export default function EvolucaoLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-8 w-44 bg-white/[0.06] rounded-lg mb-2" />
          <div className="h-4 w-56 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="h-9 w-40 bg-white/[0.06] rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-5 rounded-2xl">
            <div className="h-3 w-16 bg-white/[0.04] rounded mb-3" />
            <div className="h-9 w-14 bg-white/[0.06] rounded mb-2" />
            <div className="h-3 w-20 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Bar chart card */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="h-4 w-32 bg-white/[0.06] rounded mb-5" />
        <div className="flex items-end gap-1.5 mb-3" style={{ height: '96px' }}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-white/[0.06] rounded-t-sm"
              style={{ height: `${40 + Math.sin(i) * 30}px` }}
            />
          ))}
        </div>
        <div className="h-3 w-48 bg-white/[0.04] rounded" />
      </div>

      {/* Competency bars */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="h-4 w-48 bg-white/[0.06] rounded mb-5" />
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <div className="h-3.5 w-40 bg-white/[0.06] rounded" />
                <div className="h-3.5 w-16 bg-white/[0.04] rounded" />
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/[0.08] rounded-full"
                  style={{ width: `${45 + i * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card-dark rounded-2xl p-5 h-32" />
        <div className="card-dark rounded-2xl p-5 h-32" />
      </div>
    </div>
  )
}
