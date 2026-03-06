"use client";

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  MapPin,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "cmdk";
import { useDialogStore } from "@/stores/dialog-store";

interface QuickAction {
  id: string;
  title: string;
  shortcut?: string;
  action: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

interface QuickActionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickActionsDialog({
  open,
  onOpenChange,
}: QuickActionsDialogProps) {
  const navigate = useNavigate();
  const openDialog = useDialogStore((state) => state.openDialog);

  const quickActions: QuickAction[] = [
    {
      heading: "Navigation",
    },
    {
      id: "home",
      title: "Dashboard",
      shortcut: "G H",
      action: () => navigate({ to: "/" }),
      icon: Home,
    },
    {
      id: "employees",
      title: "Employees",
      shortcut: "G E",
      action: () => navigate({ to: "/employees" }),
      icon: Users,
    },
    {
      id: "alerts",
      title: "Alerts",
      shortcut: "G A",
      action: () => navigate({ to: "/alerts" }),
      icon: AlertTriangle,
    },
    {
      id: "documents",
      title: "Documents",
      shortcut: "G D",
      action: () => navigate({ to: "/documents" }),
      icon: FileText,
    },
    {
      id: "caces",
      title: "CACES",
      shortcut: "G C",
      action: () => navigate({ to: "/caces" }),
      icon: ShieldAlert,
    },
    {
      id: "medical-visits",
      title: "Medical Visits",
      shortcut: "G M",
      action: () => navigate({ to: "/medical-visits" }),
      icon: Stethoscope,
    },
    {
      id: "driving-authorizations",
      title: "Driving Authorizations",
      shortcut: "G R",
      action: () => navigate({ to: "/driving-authorizations" }),
      icon: Car,
    },
    {
      id: "online-trainings",
      title: "Online Trainings",
      shortcut: "G T",
      action: () => navigate({ to: "/online-trainings" }),
      icon: GraduationCap,
    },
    {
      id: "contracts",
      title: "Contracts",
      shortcut: "G O",
      action: () => navigate({ to: "/contracts" }),
      icon: FileText,
    },
    {
      heading: "Reference Data",
    },
    {
      id: "positions",
      title: "Positions",
      shortcut: "P P",
      action: () => navigate({ to: "/positions" }),
      icon: Briefcase,
    },
    {
      id: "work-locations",
      title: "Work Locations",
      shortcut: "P W",
      action: () => navigate({ to: "/work-locations" }),
      icon: MapPin,
    },
    {
      id: "departments",
      title: "Departments",
      shortcut: "P D",
      action: () => navigate({ to: "/departments" }),
      icon: Building2,
    },
    {
      id: "contract-types",
      title: "Contract Types",
      shortcut: "P C",
      action: () => navigate({ to: "/contract-types" }),
      icon: ClipboardList,
    },
    {
      heading: "Create",
    },
    {
      id: "create-employee",
      title: "New Employee",
      shortcut: "C E",
      action: () => openDialog("create-employee"),
      icon: Plus,
    },
    {
      id: "create-document",
      title: "New Document",
      shortcut: "C D",
      action: () => openDialog("create-document"),
      icon: Plus,
    },
    {
      id: "create-caces",
      title: "New CACES",
      shortcut: "C C",
      action: () => openDialog("create-caces"),
      icon: Plus,
    },
    {
      id: "create-medical-visit",
      title: "New Medical Visit",
      shortcut: "C M",
      action: () => openDialog("create-medical-visit"),
      icon: Plus,
    },
    {
      id: "create-driving-authorization",
      title: "New Driving Authorization",
      shortcut: "C R",
      action: () => openDialog("create-driving-authorization"),
      icon: Plus,
    },
    {
      id: "create-online-training",
      title: "New Online Training",
      shortcut: "C T",
      action: () => openDialog("create-online-training"),
      icon: Plus,
    },
    {
      id: "create-contract",
      title: "New Contract",
      shortcut: "C O",
      action: () => openDialog("create-contract"),
      icon: Plus,
    },
    {
      heading: "Settings",
    },
    {
      id: "settings",
      title: "Settings",
      shortcut: "S S",
      action: () => navigate({ to: "/settings" }),
      icon: Settings2,
    },
    {
      id: "trash",
      title: "Trash",
      shortcut: "S T",
      action: () => navigate({ to: "/trash" }),
      icon: Trash2,
    },
  ];

  const groupedActions = quickActions.reduce<{ heading?: string; items: QuickAction[] }[]>(
    (acc, item) => {
      if ("heading" in item && item.heading) {
        acc.push({ heading: item.heading, items: [] });
      } else if (acc.length > 0) {
        acc[acc.length - 1].items.push(item);
      }
      return acc;
    },
    []
  );

  const handleCommandSelect = (callback: () => void) => {
    callback();
    onOpenChange(false);
  };

  const [searchValue, setSearchValue] = React.useState("");

  const filteredGroups = React.useMemo(() => {
    if (!searchValue) return groupedActions;

    const searchLower = searchValue.toLowerCase();
    return groupedActions
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchLower) ||
            item.id.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groupedActions, searchValue]);

  if (!open) return null;

  const flatItems = filteredGroups.flatMap((group) =>
    group.items.map((item) => ({
      ...item,
      groupHeading: group.heading,
    }))
  );

  let lastHeading: string | undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <Command className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-xl border border-border/50 bg-background shadow-2xl">
        <div className="flex items-center border-b border-border/50 px-3 py-2">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <Command.Input
            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            placeholder="Search actions..."
            value={searchValue}
            onValueChange={setSearchValue}
            autoFocus
          />
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            ESC
          </kbd>
        </div>
        <CommandList className="max-h-[320px] overflow-y-auto p-1">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No actions found.
          </CommandEmpty>
          <CommandGroup>
            {flatItems.map((item) => {
              const showSeparator = lastHeading !== item.groupHeading;
              lastHeading = item.groupHeading;
              return (
                <React.Fragment key={item.id}>
                  {showSeparator && item.groupHeading && (
                    <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                      {item.groupHeading}
                    </div>
                  )}
                  <CommandItem
                    className="flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm aria-selected:bg-accent aria-selected:text-accent-foreground"
                    onSelect={() => handleCommandSelect(item.action)}
                  >
                    {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                    <span className="flex-1">{item.title}</span>
                    {item.shortcut && (
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                        {item.shortcut}
                      </kbd>
                    )}
                  </CommandItem>
                </React.Fragment>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
