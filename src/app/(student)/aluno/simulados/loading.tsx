export default function SimuladosLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-3 w-20 bg-white/[0.04] rounded mb-2" />
          <div className="h-8 w-52 bg-white/[0.06] rounded-lg mb-2" />
          <div className="h-4 w-72 bg-white/[0.04] rounded" />
        </div>
        <div className="h-9 w-36 bg-white/[0.06] rounded-xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="card-dark rounded-2xl p-5">
            <div className="h-3 w-28 bg-white/[0.04] rounded mb-2" />
            <div className="h-9 w-16 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="card-dark rounded-2xl p-6 mb-6">
        <div className="h-4 w-44 bg-white/[0.06] rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="w-9 h-9 bg-white/[0.04] rounded-xl mb-3" />
              <div className="h-3.5 w-32 bg-white/[0.06] rounded mb-2" />
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-white/[0.04] rounded" />
                <div className="h-3 w-4/5 bg-white/[0.04] rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <div className="h-4 w-40 bg-white/[0.06] rounded mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card-dark rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-white/[0.06] rounded mb-1.5" />
                <div className="h-3 w-24 bg-white/[0.04] rounded" />
              </div>
              <div className="h-6 w-20 bg-white/[0.04] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
