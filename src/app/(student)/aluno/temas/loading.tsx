export default function TemasLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Masthead */}
      <div className="mb-8">
        <div className="h-3 w-20 bg-white/[0.04] rounded mb-2" />
        <div className="h-8 w-56 bg-white/[0.06] rounded-lg mb-2" />
        <div className="h-4 w-80 bg-white/[0.04] rounded" />
      </div>

      {/* Year pills */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`h-7 bg-white/[0.04] rounded-full ${i === 0 ? 'w-12' : 'w-10'}`} />
        ))}
      </div>

      {/* Theme rows */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card-dark rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-10 bg-white/[0.04] rounded-full" />
                <div className="h-4 w-16 bg-white/[0.04] rounded-full" />
              </div>
              <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
            </div>
            <div className="h-8 w-24 bg-white/[0.04] rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
