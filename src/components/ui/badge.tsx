import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border text-xs font-semibold px-2.5 py-0.5 transition-colors',
  {
    variants: {
      variant: {
        default:     'bg-purple-600/10 border-purple-500/25 text-purple-300',
        secondary:   'bg-white/[0.06] border-white/10 text-gray-400',
        success:     'bg-green-500/10 border-green-500/20 text-green-400',
        warning:     'bg-amber-500/10 border-amber-500/25 text-amber-400',
        destructive: 'bg-red-500/10 border-red-500/20 text-red-400',
        outline:     'border-gray-700 text-gray-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
