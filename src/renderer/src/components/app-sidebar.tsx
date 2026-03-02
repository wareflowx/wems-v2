"use client";

import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Lock,
  MapPin,
  MessageCircleQuestion,
  Pen,
  Plus,
  Search,
  Settings2,
  ShieldAlert,
  SquareTerminal,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Command, CommandList, CommandEmpty, CommandGroup } from "cmdk";
import { getAppVersion } from "@/actions/app";
import { useAlerts, useCaces, useDrivingAuthorizations, useMedicalVisits, useOnlineTrainings } from "@/hooks";
import { useDialogStore } from "@/stores/dialog-store";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const _data = {
  user: {
    name: "User",
    email: "user@example.com",
  },
  navMain: [
    {
      title: "Playground",
      url: "/",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/",
        },
        {
          title: "Posts",
          url: "/posts",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const [_appVersion, setAppVersion] = React.useState("0.0.0");
  const [canWrite, setCanWrite] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const navigate = useNavigate();
  const openDialog = useDialogStore((state) => state.openDialog);

  // Get counts for sidebar badges
  const { data: alerts = [] } = useAlerts();
  const { data: caces = [] } = useCaces();
  const { data: medicalVisits = [] } = useMedicalVisits();
  const { data: drivingAuthorizations = [] } = useDrivingAuthorizations();
  const { data: onlineTrainings = [] } = useOnlineTrainings();

  React.useEffect(() => {
    getAppVersion().then(setAppVersion);

    // Initial check for write mode
    window
      .getWriteMode?.()
      .then(setCanWrite)
      .catch(() => setCanWrite(true));

    // Listen for real-time lock status changes
    window.onLockStatusChanged?.((writeMode) => {
      setCanWrite(writeMode);
    });

    // Handle Cmd+K / Ctrl+K keyboard shortcut
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setMounted(true);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCommandSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  // Quick actions command palette
  const quickActions = [
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

  // Group items by heading
  const groupedActions = quickActions.reduce<{ heading?: string; items: typeof quickActions }[]>((acc, item) => {
    if ("heading" in item && item.heading) {
      acc.push({ heading: item.heading, items: [] });
    } else if (acc.length > 0) {
      acc[acc.length - 1].items.push(item);
    }
    return acc;
  }, []);

  return (
    <>
      {mounted && open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <Command className="relative z-10 w-full max-w-[500px] overflow-hidden rounded-xl border bg-popover shadow-lg">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Type a command or search..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") setOpen(false);
                }}
              />
              <button
                onClick={() => setOpen(false)}
                className="rounded-sm opacity-70 hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CommandList className="max-h-[300px] overflow-y-auto p-1">
              <CommandEmpty>No results found.</CommandEmpty>
              {groupedActions.map((group, groupIndex) => (
                <React.Fragment key={group.heading || `group-${groupIndex}`}>
                  {group.heading && (
                    <CommandGroup heading={group.heading} className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex cursor-default items-center rounded-md px-2 py-1.5 text-sm hover:bg-muted hover:text-foreground"
                          onClick={() => handleCommandSelect(item.action)}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          <span className="flex-1">{item.title}</span>
                          {item.shortcut && (
                            <span className="ml-auto text-xs text-muted-foreground">{item.shortcut}</span>
                          )}
                        </div>
                      ))}
                    </CommandGroup>
                  )}
                  {group.heading && groupIndex < groupedActions.length - 1 && (
                    <div className="-mx-1 my-1 h-px bg-border" />
                  )}
                </React.Fragment>
              ))}
            </CommandList>
          </Command>
        </div>
      )}
      <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="border-b bg-card">
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2 p-1">
            <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 p-1.5">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h1 className="font-semibold text-gray-900 text-lg group-data-[collapsible=icon]:hidden">
              {t("app.name")}
            </h1>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupContent>
            <div
              className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border bg-muted/50 px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setOpen(true)}
            >
              <Search className="size-4" />
              <span className="flex-1 text-xs">Quick actions</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                <span className="text-xs">Ctrl</span>
                <span>K</span>
              </kbd>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.overview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.dashboard")}>
                  <Link to="/">
                    <Home />
                    <span>{t("sidebar.dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.employees")}>
                  <Link to="/employees">
                    <Users />
                    <span>{t("sidebar.employees")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.alerts")}>
                  <Link to="/alerts">
                    <AlertTriangle />
                    <span>{t("sidebar.alerts")}</span>
                  </Link>
                </SidebarMenuButton>
                {alerts.length > 0 && <SidebarMenuBadge>{alerts.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.documents")}>
                  <Link to="/documents">
                    <FileText />
                    <span>{t("sidebar.documents")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.caces")}>
                  <Link to="/caces">
                    <ShieldAlert />
                    <span>{t("sidebar.caces")}</span>
                  </Link>
                </SidebarMenuButton>
                {caces.length > 0 && <SidebarMenuBadge>{caces.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.medicalVisits")}>
                  <Link to="/medical-visits">
                    <Stethoscope />
                    <span>{t("sidebar.medicalVisits")}</span>
                  </Link>
                </SidebarMenuButton>
                {medicalVisits.length > 0 && <SidebarMenuBadge>{medicalVisits.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.drivingAuthorizations")}>
                  <Link to="/driving-authorizations">
                    <Car />
                    <span>{t("sidebar.drivingAuthorizations")}</span>
                  </Link>
                </SidebarMenuButton>
                {drivingAuthorizations.length > 0 && <SidebarMenuBadge>{drivingAuthorizations.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.onlineTrainings")}>
                  <Link to="/online-trainings">
                    <GraduationCap />
                    <span>{t("sidebar.onlineTrainings")}</span>
                  </Link>
                </SidebarMenuButton>
                {onlineTrainings.length > 0 && <SidebarMenuBadge>{onlineTrainings.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.contracts")}>
                  <Link to="/contracts">
                    <FileText />
                    <span>{t("sidebar.contracts")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.referenceData")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("positions.title")}>
                  <Link to="/positions">
                    <Briefcase />
                    <span>{t("positions.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("workLocations.title")}>
                  <Link to="/work-locations">
                    <MapPin />
                    <span>{t("workLocations.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("departments.title")}>
                  <Link to="/departments">
                    <Building2 />
                    <span>{t("departments.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("contractTypes.title")}>
                  <Link to="/contract-types">
                    <ClipboardList />
                    <span>{t("contractTypes.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div
                  className={`flex items-center gap-2 rounded-md px-2 py-1.5  ${
                    canWrite
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  }`}
                >
                  {canWrite ? (
                    <Pen className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span className="group-data-[collapsible=icon]:hidden">
                    {canWrite ? "Write mode" : "Read only"}
                  </span>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.settings")}>
                  <Link to="/settings">
                    <Settings2 />
                    <span>{t("sidebar.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.trash")}>
                  <Link to="/trash">
                    <Trash2 />
                    <span>{t("sidebar.trash")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t bg-card">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("sidebar.toggle")}>
              <div className="flex w-full cursor-pointer items-center">
                <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">
                  {t("sidebar.toggle")}
                </span>
                <SidebarTrigger className="ml-auto size-4" />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
    </>
  );
}
