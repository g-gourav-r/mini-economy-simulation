import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80 bg-blue-600 text-white",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 bg-slate-800 text-slate-300",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 bg-red-600 text-white",
        outline: "text-foreground border-slate-700 text-slate-300",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-bold",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-300 font-bold",
        danger: "border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
