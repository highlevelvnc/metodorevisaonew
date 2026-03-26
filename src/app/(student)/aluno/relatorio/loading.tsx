export default function RelatorioLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Masthead */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="h-3 w-36 bg-white/[0.04] rounded mb-2" />
          <div className="h-8 w-48 bg-white/[0.06] rounded-lg mb-2" />
          <div className="h-4 w-64 bg-white/[0.04] rounded" />
        </div>
        <div className="h-9 w-40 bg-white/[0.06] rounded-xl" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card-dark p-5 rounded-2xl">
            <div className="h-3 w-16 bg-white/[0.04] rounded mb-3" />
            <div className="h-10 w-14 bg-white/[0.06] rounded mb-2" />
            <div className="h-1 bg-white/[0.06] rounded-full mb-1.5" />
            <div className="h-3 w-20 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Narrative */}
      <div className="card-dark rounded-2xl p-6 mb-6">
        <div className="h-4 w-40 bg-white/[0.06] rounded mb-5 pb-5 border-b border-white/[0.06]" />
        <div className="space-y-3">
          <div className="h-3.5 w-full bg-white/[0.04] rounded" />
          <div className="h-3.5 w-5/6 bg-white/[0.04] rounded" />
          <div className="h-3.5 w-full bg-white/[0.04] rounded" />
          <div className="h-3.5 w-4/5 bg-white/[0.04] rounded" />
          <div className="rounded-xl bg-purple-500/[0.04] border border-purple-500/10 px-4 py-3 mt-4">
            <div className="h-3.5 w-full bg-white/[0.04] rounded mb-2" />
            <div className="h-3.5 w-3/4 bg-white/[0.04] rounded" />
          </div>
        </div>
      </div>

      {/* Competency evolution */}
      <div className="card-dark rounded-2xl p-5 mb-6">
        <div className="h-4 w-48 bg-white/[0.06] rounded mb-5" />
        <div className="space-y-5">
          {[...Array(5)].map((_, i) => (
            <div key={i}>
              <div className="flex justify-between mb-2">
                <div className="h-3.5 w-44 bg-white/[0.06] rounded" />
                <div className="h-3.5 w-24 bg-white/[0.04] rounded" />
              </div>
              <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/[0.08] rounded-full"
                  style={{ width: `${40 + i * 12}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 h-32" />
        ))}
      </div>
    </div>
  )
}
