import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-white/[0.05]',
        className
      )}
    />
  )
}

export function StatCardSkeleton() {
  return (
    <div className="card-dark p-5 rounded-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-16 mb-1" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

export function EssayRowSkeleton() {
  return (
    <div className="card-dark rounded-2xl p-5 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-6 w-12 rounded-full" />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
      {/* Main content */}
      <div className="card-dark rounded-2xl p-6 space-y-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}
