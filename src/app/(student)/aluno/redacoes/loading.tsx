export default function Loading() {
  return (
    <div className="max-w-3xl animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg mb-1" />
          <div className="h-4 w-32 bg-white/[0.04] rounded" />
        </div>
        <div className="h-9 w-36 bg-white/[0.06] rounded-xl" />
      </div>

      {/* Essay rows */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card-dark rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-3/4 bg-white/[0.06] rounded mb-2" />
              <div className="h-3 w-24 bg-white/[0.04] rounded" />
            </div>
            <div className="h-6 w-16 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
