import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070c14] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-purple-700 text-white hover:bg-purple-600 hover:shadow-btn-primary hover:-translate-y-px',
        destructive:
          'bg-red-600 text-white hover:bg-red-500',
        outline:
          'border border-gray-700 text-gray-300 hover:border-purple-600 hover:text-white hover:bg-purple-700/10',
        secondary:
          'bg-white/[0.06] text-gray-300 hover:bg-white/[0.10] hover:text-white',
        ghost:
          'text-gray-400 hover:text-white hover:bg-white/[0.06]',
        link:
          'text-purple-400 underline-offset-4 hover:underline hover:text-purple-300 p-0 h-auto',
      },
      size: {
        default: 'h-10 px-5 py-2.5',
        sm:      'h-8 px-3 py-1.5 text-xs rounded-lg',
        lg:      'h-12 px-8 py-3 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
