"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import ExternalLink from "@/components/external-link"

interface NavSecondaryProps {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}

export function NavSecondary({ items }: NavSecondaryProps) {
  return (
    <div className="flex flex-col gap-1 px-2">
      {items.map((item) => (
        <ExternalLink
          key={item.title}
          href={item.url}
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-xs flex w-full items-center gap-2 rounded-md px-2 py-1.5"
        >
          {item.icon && <item.icon className="size-4" />}
          <span>{item.title}</span>
        </ExternalLink>
      ))}
    </div>
  )
}
