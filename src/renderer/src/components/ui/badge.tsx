import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "@/utils/tailwind";

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 font-medium text-[0.625rem] transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20",
        outline:
          "border-border bg-input/20 text-foreground dark:bg-input/30 [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost:
          "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      data-slot="badge"
      data-variant={variant}
      {...props}
    />
  );
}

interface StatusBadgeProps {
  color:
    | "blue"
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "teal"
    | "gray"
    | "purple"
    | "cyan"
    | "violet"
    | "indigo"
    | "emerald"
    | "amber"
    | "rose";
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ color, children, className }: StatusBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-500/15 border border-blue-500/25 text-blue-600",
    green: "bg-green-500/15 border border-green-500/25 text-green-600",
    yellow: "bg-yellow-500/15 border border-yellow-500/25 text-yellow-600",
    orange: "bg-orange-500/15 border border-orange-500/25 text-orange-600",
    red: "bg-red-500/15 border border-red-500/25 text-red-600",
    teal: "bg-teal-500/15 border border-teal-500/25 text-teal-600",
    gray: "bg-gray-500/15 border border-gray-500/25 text-gray-600",
    purple: "bg-purple-500/15 border border-purple-500/25 text-purple-600",
    cyan: "bg-cyan-500/15 border border-cyan-500/25 text-cyan-600",
    violet: "bg-violet-500/15 border border-violet-500/25 text-violet-600",
    indigo: "bg-indigo-500/15 border border-indigo-500/25 text-indigo-600",
    emerald: "bg-emerald-500/15 border border-emerald-500/25 text-emerald-600",
    amber: "bg-amber-500/15 border border-amber-500/25 text-amber-600",
    rose: "bg-rose-500/15 border border-rose-500/25 text-rose-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}

interface DetailBadgeProps {
  color:
    | "blue"
    | "green"
    | "yellow"
    | "orange"
    | "red"
    | "teal"
    | "gray"
    | "purple"
    | "cyan"
    | "violet"
    | "indigo"
    | "emerald"
    | "amber"
    | "rose";
  children: React.ReactNode;
  className?: string;
}

export function DetailBadge({ color, children, className }: DetailBadgeProps) {
  const colorClasses = {
    blue: "bg-blue-500/15 border border-blue-500/25 text-blue-600",
    green: "bg-green-500/15 border border-green-500/25 text-green-600",
    yellow: "bg-yellow-500/15 border border-yellow-500/25 text-yellow-600",
    orange: "bg-orange-500/15 border border-orange-500/25 text-orange-600",
    red: "bg-red-500/15 border border-red-500/25 text-red-600",
    teal: "bg-teal-500/15 border border-teal-500/25 text-teal-600",
    gray: "bg-gray-500/15 border border-gray-500/25 text-gray-600",
    purple: "bg-purple-500/15 border border-purple-500/25 text-purple-600",
    cyan: "bg-cyan-500/15 border border-cyan-500/25 text-cyan-600",
    violet: "bg-violet-500/15 border border-violet-500/25 text-violet-600",
    indigo: "bg-indigo-500/15 border border-indigo-500/25 text-indigo-600",
    emerald: "bg-emerald-500/15 border border-emerald-500/25 text-emerald-600",
    amber: "bg-amber-500/15 border border-amber-500/25 text-amber-600",
    rose: "bg-rose-500/15 border border-rose-500/25 text-rose-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 font-medium text-xs",
        colorClasses[color],
        className
      )}
    >
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
