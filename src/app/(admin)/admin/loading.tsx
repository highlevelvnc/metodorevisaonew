export default function Loading() {
  return (
    <div className="max-w-5xl animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-56 bg-white/[0.06] rounded-lg mb-1" />
        <div className="h-4 w-48 bg-white/[0.04] rounded" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-3 w-16 bg-white/[0.04] rounded" />
            </div>
            <div className="h-9 w-12 bg-white/[0.06] rounded mb-1" />
            <div className="h-3 w-24 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <div className="h-4 w-40 bg-white/[0.04] rounded mb-3" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-dark rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.06]" />
              <div className="flex-1">
                <div className="h-3.5 w-32 bg-white/[0.06] rounded mb-1.5" />
                <div className="h-3 w-48 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="card-dark rounded-2xl p-5 h-40" />
      </div>
    </div>
  )
}
