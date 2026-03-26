export default function Loading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg mb-2" />
          <div className="h-4 w-64 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-white/[0.06] rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-white/[0.06]" />
              <div className="h-3 w-16 bg-white/[0.04] rounded" />
            </div>
            <div className="h-9 w-16 bg-white/[0.06] rounded mb-1" />
            <div className="h-3 w-20 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Last correction card */}
      <div className="card-dark rounded-2xl p-5 h-36" />
    </div>
  )
}
