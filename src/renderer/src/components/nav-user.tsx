"use client";

import { User } from "lucide-react";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
}) {
  return (
    <div className="flex flex-col gap-1 px-2 py-2">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
          <User className="size-4" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{user.name}</span>
          <span className="truncate text-sidebar-foreground/70 text-xs">
            {user.email}
          </span>
        </div>
      </div>
    </div>
  );
}
