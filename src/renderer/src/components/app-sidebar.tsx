"use client";

import { Link, useLocation } from "@tanstack/react-router";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  Car,
  ClipboardList,
  Download,
  FileText,
  GraduationCap,
  Home,
  type LucideIcon,
  MapPin,
  Search,
  Settings2,
  ShieldAlert,
  Stethoscope,
  Trash2,
  Users,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  useAlerts,
  useCaces,
  useDrivingAuthorizations,
  useMedicalVisits,
  useOnlineTrainings,
} from "@/hooks";
import { UpdateSidebarBanner } from "./update-sidebar-banner";

interface NavItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

function NavItem({ path, icon: Icon, label, badge }: NavItemProps) {
  const location = useLocation();
  const isActive =
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className="data-active:border data-active:border-sidebar-accent data-active:bg-sidebar-accent/50"
        isActive={isActive}
        tooltip={label}
      >
        <Link to={path}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
      {badge !== undefined && badge > 0 && (
        <SidebarMenuBadge>{badge}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  );
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onQuickActionsClick?: () => void;
}

export function AppSidebar({ onQuickActionsClick, ...props }: AppSidebarProps) {
  const { t } = useTranslation();
  const [_appVersion, setAppVersion] = React.useState("0.0.0");
  const [, setMounted] = React.useState(() => typeof window !== "undefined");

  // Get counts for sidebar badges
  const { data: alerts = [] } = useAlerts();
  const { data: caces = [] } = useCaces();
  const { data: medicalVisits = [] } = useMedicalVisits();
  const { data: drivingAuthorizations = [] } = useDrivingAuthorizations();
  const { data: onlineTrainings = [] } = useOnlineTrainings();

  React.useEffect(() => {
    getAppVersion().then(setAppVersion);
    setMounted(true);
  }, []);

  // Handle Cmd+K / Ctrl+K keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        onQuickActionsClick?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onQuickActionsClick]);

  return (
    <>
      <Sidebar
        className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
        collapsible="icon"
        {...props}
      >
        <SidebarContent className="bg-card">
          {/* Quick actions - hidden when collapsed */}
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupContent>
              <Button
                className="w-full justify-start gap-2"
                onClick={onQuickActionsClick}
                size="sm"
                variant="outline"
              >
                <Search className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-left text-muted-foreground text-xs">
                  Search...
                </span>
                <kbd className="pointer-events-none absolute top-1/2 right-2 hidden h-5 -translate-y-1/2 select-none items-center gap-1 rounded border bg-muted px-1.5 font-medium font-mono text-[10px] text-muted-foreground sm:flex">
                  <span className="text-xs">⌘K</span>
                </kbd>
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.overview")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem icon={Home} label={t("sidebar.dashboard")} path="/" />
                <NavItem
                  icon={Users}
                  label={t("sidebar.employees")}
                  path="/employees"
                />
                <NavItem
                  badge={alerts.length}
                  icon={AlertTriangle}
                  label={t("sidebar.alerts")}
                  path="/alerts"
                />
                <NavItem
                  icon={Building2}
                  label={t("agencies.title")}
                  path="/agencies"
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.management")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  icon={FileText}
                  label={t("sidebar.documents")}
                  path="/documents"
                />
                <NavItem
                  badge={caces.length}
                  icon={ShieldAlert}
                  label={t("sidebar.caces")}
                  path="/caces"
                />
                <NavItem
                  badge={medicalVisits.length}
                  icon={Stethoscope}
                  label={t("sidebar.medicalVisits")}
                  path="/medical-visits"
                />
                <NavItem
                  badge={drivingAuthorizations.length}
                  icon={Car}
                  label={t("sidebar.drivingAuthorizations")}
                  path="/driving-authorizations"
                />
                <NavItem
                  badge={onlineTrainings.length}
                  icon={GraduationCap}
                  label={t("sidebar.onlineTrainings")}
                  path="/online-trainings"
                />
                <NavItem
                  icon={FileText}
                  label={t("sidebar.contracts")}
                  path="/contracts"
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>{t("sidebar.referenceData")}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  icon={Briefcase}
                  label={t("positions.title")}
                  path="/positions"
                />
                <NavItem
                  icon={MapPin}
                  label={t("workLocations.title")}
                  path="/work-locations"
                />
                <NavItem
                  icon={Building2}
                  label={t("departments.title")}
                  path="/departments"
                />
                <NavItem
                  icon={ClipboardList}
                  label={t("contractTypes.title")}
                  path="/contract-types"
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto pb-4">
            <SidebarGroupContent>
              <SidebarMenu>
                <NavItem
                  icon={Settings2}
                  label={t("sidebar.settings")}
                  path="/settings"
                />
                <NavItem
                  icon={Trash2}
                  label={t("sidebar.trash")}
                  path="/trash"
                />
                <NavItem
                  icon={Download}
                  label={t("sidebar.exports", "Exports")}
                  path="/exports"
                />
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Update notification banner */}
          <UpdateSidebarBanner />
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </>
  );
}
