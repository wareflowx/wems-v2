import type { LucideIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/tailwind";

interface AnimatedEmptyProps {
  title: string;
  description: string;
  icons?: LucideIcon[];
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  bordered?: boolean;
}

export function AnimatedEmpty({
  title,
  description,
  icons = [],
  action,
  className,
  bordered = true,
}: AnimatedEmptyProps) {
  return (
    <div
      className={cn(
        "border-border bg-background text-center hover:border-border/80",
        bordered && "rounded-xl border border-dashed",
        "mx-auto w-full p-14",
        "group transition duration-500 hover:duration-200",
        className
      )}
    >
      <div className="isolate flex justify-center">
        {icons.length === 3 ? (
          <>
            <div className="relative top-1.5 left-2.5 grid size-12 -rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-x-5 group-hover:-translate-y-0.5 group-hover:-rotate-12 group-hover:duration-200">
              {React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
            <div className="relative z-10 grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
              {React.createElement(icons[1], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
            <div className="relative top-1.5 right-2.5 grid size-12 rotate-6 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:translate-x-5 group-hover:-translate-y-0.5 group-hover:rotate-12 group-hover:duration-200">
              {React.createElement(icons[2], {
                className: "w-6 h-6 text-muted-foreground",
              })}
            </div>
          </>
        ) : (
          <div className="grid size-12 place-items-center rounded-xl bg-background shadow-lg ring-1 ring-border transition duration-500 group-hover:-translate-y-0.5 group-hover:duration-200">
            {icons[0] &&
              React.createElement(icons[0], {
                className: "w-6 h-6 text-muted-foreground",
              })}
          </div>
        )}
      </div>
      <h2 className="mt-6 font-medium text-foreground">{title}</h2>
      <p className="mt-1 whitespace-pre-line text-muted-foreground text-sm">
        {description}
      </p>
      {action && (
        <Button
          className={cn("mt-4", "shadow-sm active:shadow-none")}
          onClick={action.onClick}
          variant="outline"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
