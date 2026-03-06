"use client";

import { Link, useLocation, useNavigate } from "@tanstack/react-router";
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
import { useAlerts, useCaces, useDrivingAuthorizations, useMedicalVisits, useOnlineTrainings } from "@/hooks";
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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onQuickActionsClick?: () => void;
}

export function AppSidebar({ onQuickActionsClick, ...props }: AppSidebarProps) {
  const { t } = useTranslation();
  const [_appVersion, setAppVersion] = React.useState("0.0.0");
  const [canWrite, setCanWrite] = React.useState(true);
  const [mounted, setMounted] = React.useState(() => typeof window !== "undefined");
  const navigate = useNavigate();
  const location = useLocation();

  // Helper to check if a path is active
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

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

    setMounted(true);
  }, []);

  return (
    <>
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
            
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.overview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/")} tooltip={t("sidebar.dashboard")}>
                  <Link to="/">
                    <Home />
                    <span>{t("sidebar.dashboard")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/employees")} tooltip={t("sidebar.employees")}>
                  <Link to="/employees">
                    <Users />
                    <span>{t("sidebar.employees")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/alerts")} tooltip={t("sidebar.alerts")}>
                  <Link to="/alerts">
                    <AlertTriangle />
                    <span>{t("sidebar.alerts")}</span>
                  </Link>
                </SidebarMenuButton>
                {alerts.length > 0 && <SidebarMenuBadge>{alerts.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/agencies")} tooltip={t("agencies.title")}>
                  <Link to="/agencies">
                    <Building2 />
                    <span>{t("agencies.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/documents")} tooltip={t("sidebar.documents")}>
                  <Link to="/documents">
                    <FileText />
                    <span>{t("sidebar.documents")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/caces")} tooltip={t("sidebar.caces")}>
                  <Link to="/caces">
                    <ShieldAlert />
                    <span>{t("sidebar.caces")}</span>
                  </Link>
                </SidebarMenuButton>
                {caces.length > 0 && <SidebarMenuBadge>{caces.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/medical-visits")} tooltip={t("sidebar.medicalVisits")}>
                  <Link to="/medical-visits">
                    <Stethoscope />
                    <span>{t("sidebar.medicalVisits")}</span>
                  </Link>
                </SidebarMenuButton>
                {medicalVisits.length > 0 && <SidebarMenuBadge>{medicalVisits.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/driving-authorizations")} tooltip={t("sidebar.drivingAuthorizations")}>
                  <Link to="/driving-authorizations">
                    <Car />
                    <span>{t("sidebar.drivingAuthorizations")}</span>
                  </Link>
                </SidebarMenuButton>
                {drivingAuthorizations.length > 0 && <SidebarMenuBadge>{drivingAuthorizations.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/online-trainings")} tooltip={t("sidebar.onlineTrainings")}>
                  <Link to="/online-trainings">
                    <GraduationCap />
                    <span>{t("sidebar.onlineTrainings")}</span>
                  </Link>
                </SidebarMenuButton>
                {onlineTrainings.length > 0 && <SidebarMenuBadge>{onlineTrainings.length}</SidebarMenuBadge>}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/contracts")} tooltip={t("sidebar.contracts")}>
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
                <SidebarMenuButton asChild isActive={isActive("/positions")} tooltip={t("positions.title")}>
                  <Link to="/positions">
                    <Briefcase />
                    <span>{t("positions.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/work-locations")} tooltip={t("workLocations.title")}>
                  <Link to="/work-locations">
                    <MapPin />
                    <span>{t("workLocations.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/departments")} tooltip={t("departments.title")}>
                  <Link to="/departments">
                    <Building2 />
                    <span>{t("departments.title")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/contract-types")} tooltip={t("contractTypes.title")}>
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
                <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip={t("sidebar.settings")}>
                  <Link to="/settings">
                    <Settings2 />
                    <span>{t("sidebar.settings")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/trash")} tooltip={t("sidebar.trash")}>
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
