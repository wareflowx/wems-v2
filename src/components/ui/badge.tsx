import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

export type ColorVariant =
  | "gray"
  | "red"
  | "yellow"
  | "green"
  | "blue"
  | "indigo"
  | "purple"
  | "pink"
  | "teal"
  | "orange"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }

const colorClasses: Record<ColorVariant, string> = {
  gray: "bg-gray-600/15 border-gray-600/25 text-gray-700",
  red: "bg-red-500/15 border-red-500/25 text-red-700",
  yellow: "bg-yellow-600/15 border-yellow-600/25 text-yellow-700",
  green: "bg-green-600/15 border-green-600/25 text-green-700",
  blue: "bg-blue-500/15 border-blue-500/25 text-blue-700",
  indigo: "bg-indigo-600/15 border-indigo-600/25 text-indigo-700",
  purple: "bg-purple-600/15 border-purple-600/25 text-purple-700",
  pink: "bg-pink-500/15 border-pink-500/25 text-pink-700",
  teal: "bg-teal-600/15 border-teal-600/25 text-teal-700",
  orange: "bg-orange-600/15 border-orange-600/25 text-orange-700",
}

const dotColorClasses: Record<ColorVariant, string> = {
  gray: "bg-gray-500",
  red: "bg-red-500",
  yellow: "bg-yellow-600",
  green: "bg-green-600",
  blue: "bg-blue-500",
  indigo: "bg-indigo-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  teal: "bg-teal-600",
  orange: "bg-orange-600",
}

export interface StatusBadgeProps extends React.ComponentProps<"span"> {
  color: ColorVariant
  children: React.ReactNode
}

export function StatusBadge({ color, className, children, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        colorClasses[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export interface DetailBadgeProps extends React.ComponentProps<"span"> {
  color: ColorVariant
  children: React.ReactNode
}

export function DetailBadge({ color, className, children, ...props }: DetailBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border border-border",
        className
      )}
      {...props}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColorClasses[color])} />
      {children}
    </span>
  )
}
