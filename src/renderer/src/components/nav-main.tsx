"use client"

import * as React from "react"
import { Link } from "@tanstack/react-router"

import { cn } from "@/utils/tailwind"

interface NavMainProps {
  items: {
    title: string
    url: string
    icon?: React.ComponentType<{ className?: string }>
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
}

export function NavMain({ items }: NavMainProps) {
  return (
    <div className="flex flex-col gap-1 px-2">
      {items.map((item) => (
        <div key={item.title}>
          <Link
            to={item.url}
            className={cn(
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              item.isActive && "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            {item.icon && (
              <item.icon className="size-4" />
            )}
            <span>{item.title}</span>
          </Link>
          {item.items && (
            <div className="ml-4 flex flex-col gap-0.5 border-l pl-2">
              {item.items.map((subItem) => (
                <Link
                  key={subItem.title}
                  to={subItem.url}
                  className="text-sidebar-foreground/70 hover:text-sidebar-foreground text-xs"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
