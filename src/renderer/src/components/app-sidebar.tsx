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
import { getAppVersion } from "@/actions/app";
import { SearchModal, type CommandItem } from "@/components/ui/search-modal";
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
  const [mounted, setMounted] = React.useState(() => typeof window !== "undefined");
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

  // Quick actions command palette
  const quickActions: CommandItem[] = [
    {
      id: "home",
      title: "Dashboard",
      description: "Go to dashboard",
      category: "Navigation",
      shortcut: "G H",
      action: () => navigate({ to: "/" }),
      icon: Home,
    },
    {
      id: "employees",
      title: "Employees",
      description: "Manage employees",
      category: "Navigation",
      shortcut: "G E",
      action: () => navigate({ to: "/employees" }),
      icon: Users,
    },
    {
      id: "alerts",
      title: "Alerts",
      description: "View alerts",
      category: "Navigation",
      shortcut: "G A",
      action: () => navigate({ to: "/alerts" }),
      icon: AlertTriangle,
    },
    {
      id: "documents",
      title: "Documents",
      description: "Manage documents",
      category: "Navigation",
      shortcut: "G D",
      action: () => navigate({ to: "/documents" }),
      icon: FileText,
    },
    {
      id: "caces",
      title: "CACES",
      description: "Manage CACES",
      category: "Navigation",
      shortcut: "G C",
      action: () => navigate({ to: "/caces" }),
      icon: ShieldAlert,
    },
    {
      id: "medical-visits",
      title: "Medical Visits",
      description: "Manage medical visits",
      category: "Navigation",
      shortcut: "G M",
      action: () => navigate({ to: "/medical-visits" }),
      icon: Stethoscope,
    },
    {
      id: "driving-authorizations",
      title: "Driving Authorizations",
      description: "Manage driving authorizations",
      category: "Navigation",
      shortcut: "G R",
      action: () => navigate({ to: "/driving-authorizations" }),
      icon: Car,
    },
    {
      id: "online-trainings",
      title: "Online Trainings",
      description: "Manage online trainings",
      category: "Navigation",
      shortcut: "G T",
      action: () => navigate({ to: "/online-trainings" }),
      icon: GraduationCap,
    },
    {
      id: "contracts",
      title: "Contracts",
      description: "Manage contracts",
      category: "Navigation",
      shortcut: "G O",
      action: () => navigate({ to: "/contracts" }),
      icon: FileText,
    },
    {
      id: "positions",
      title: "Positions",
      description: "Manage positions",
      category: "Reference Data",
      shortcut: "P P",
      action: () => navigate({ to: "/positions" }),
      icon: Briefcase,
    },
    {
      id: "work-locations",
      title: "Work Locations",
      description: "Manage work locations",
      category: "Reference Data",
      shortcut: "P W",
      action: () => navigate({ to: "/work-locations" }),
      icon: MapPin,
    },
    {
      id: "departments",
      title: "Departments",
      description: "Manage departments",
      category: "Reference Data",
      shortcut: "P D",
      action: () => navigate({ to: "/departments" }),
      icon: Building2,
    },
    {
      id: "contract-types",
      title: "Contract Types",
      description: "Manage contract types",
      category: "Reference Data",
      shortcut: "P C",
      action: () => navigate({ to: "/contract-types" }),
      icon: ClipboardList,
    },
    {
      id: "create-employee",
      title: "New Employee",
      description: "Create a new employee",
      category: "Create",
      shortcut: "C E",
      action: () => openDialog("create-employee"),
      icon: Plus,
    },
    {
      id: "create-document",
      title: "New Document",
      description: "Create a new document",
      category: "Create",
      shortcut: "C D",
      action: () => openDialog("create-document"),
      icon: Plus,
    },
    {
      id: "create-caces",
      title: "New CACES",
      description: "Create a new CACES",
      category: "Create",
      shortcut: "C C",
      action: () => openDialog("create-caces"),
      icon: Plus,
    },
    {
      id: "create-medical-visit",
      title: "New Medical Visit",
      description: "Create a new medical visit",
      category: "Create",
      shortcut: "C M",
      action: () => openDialog("create-medical-visit"),
      icon: Plus,
    },
    {
      id: "create-driving-authorization",
      title: "New Driving Authorization",
      description: "Create a new driving authorization",
      category: "Create",
      shortcut: "C R",
      action: () => openDialog("create-driving-authorization"),
      icon: Plus,
    },
    {
      id: "create-online-training",
      title: "New Online Training",
      description: "Create a new online training",
      category: "Create",
      shortcut: "C T",
      action: () => openDialog("create-online-training"),
      icon: Plus,
    },
    {
      id: "create-contract",
      title: "New Contract",
      description: "Create a new contract",
      category: "Create",
      shortcut: "C O",
      action: () => openDialog("create-contract"),
      icon: Plus,
    },
    {
      id: "settings",
      title: "Settings",
      description: "Go to settings",
      category: "Settings",
      shortcut: "S S",
      action: () => navigate({ to: "/settings" }),
      icon: Settings2,
    },
    {
      id: "trash",
      title: "Trash",
      description: "View deleted items",
      category: "Settings",
      shortcut: "S T",
      action: () => navigate({ to: "/trash" }),
      icon: Trash2,
    },
  ];

  return (
    <>
      {mounted && (
        <SearchModal
          data={quickActions}
          open={open}
          onOpenChange={setOpen}
        >
          <div />
        </SearchModal>
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
        {/* Quick actions - visible even when sidebar is collapsed */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div
              className="mt-1 flex cursor-pointer items-center gap-2 rounded-md border bg-muted/50 px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
              onClick={() => setOpen(true)}
            >
              <Search className="size-4" />
              <span className="flex-1 text-xs group-data-[collapsible=icon]:hidden">Quick actions</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 group-data-[collapsible=icon]:hidden">
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
