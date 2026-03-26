export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-32 bg-white/[0.06] rounded-lg mb-1" />
          <div className="h-4 w-40 bg-white/[0.04] rounded" />
        </div>
      </div>

      {/* Section heading */}
      <div className="h-3 w-36 bg-white/[0.04] rounded mb-3" />

      {/* Rows */}
      <div className="space-y-2 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark rounded-2xl p-4 flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-32 bg-white/[0.06] rounded mb-1.5" />
              <div className="h-3 w-56 bg-white/[0.04] rounded" />
            </div>
            <div className="flex gap-2">
              <div className="h-7 w-20 bg-white/[0.06] rounded-full" />
              <div className="h-7 w-24 bg-white/[0.06] rounded-full" />
            </div>
            <div className="h-8 w-20 bg-white/[0.06] rounded-xl flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
