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
  MapPin,
  Search,
  Settings2,
  ShieldAlert,
  Stethoscope,
  Trash2,
  Users,
  LucideIcon,
} from "lucide-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import { useAlerts, useCaces, useDrivingAuthorizations, useMedicalVisits, useOnlineTrainings } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface NavItemProps {
  path: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

function NavItem({ path, icon: Icon, label, badge }: NavItemProps) {
  const location = useLocation();
  const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={label}
        className="data-active:bg-sidebar-accent/50 data-active:border data-active:border-sidebar-accent"
      >
        <Link to={path}>
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
      {badge !== undefined && badge > 0 && <SidebarMenuBadge>{badge}</SidebarMenuBadge>}
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
              variant="outline"
              onClick={onQuickActionsClick}
              size="sm"
            >
              <Search className="size-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-left text-xs text-muted-foreground">Search...</span>
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                <span className="text-xs">⌘K</span>
              </kbd>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.overview")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem path="/" icon={Home} label={t("sidebar.dashboard")} />
              <NavItem path="/employees" icon={Users} label={t("sidebar.employees")} />
              <NavItem path="/alerts" icon={AlertTriangle} label={t("sidebar.alerts")} badge={alerts.length} />
              <NavItem path="/agencies" icon={Building2} label={t("agencies.title")} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem path="/documents" icon={FileText} label={t("sidebar.documents")} />
              <NavItem path="/caces" icon={ShieldAlert} label={t("sidebar.caces")} badge={caces.length} />
              <NavItem path="/medical-visits" icon={Stethoscope} label={t("sidebar.medicalVisits")} badge={medicalVisits.length} />
              <NavItem path="/driving-authorizations" icon={Car} label={t("sidebar.drivingAuthorizations")} badge={drivingAuthorizations.length} />
              <NavItem path="/online-trainings" icon={GraduationCap} label={t("sidebar.onlineTrainings")} badge={onlineTrainings.length} />
              <NavItem path="/contracts" icon={FileText} label={t("sidebar.contracts")} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.referenceData")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem path="/positions" icon={Briefcase} label={t("positions.title")} />
              <NavItem path="/work-locations" icon={MapPin} label={t("workLocations.title")} />
              <NavItem path="/departments" icon={Building2} label={t("departments.title")} />
              <NavItem path="/contract-types" icon={ClipboardList} label={t("contractTypes.title")} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem path="/settings" icon={Settings2} label={t("sidebar.settings")} />
              <NavItem path="/trash" icon={Trash2} label={t("sidebar.trash")} />
              <NavItem path="/exports" icon={Download} label={t("sidebar.exports", "Exports")} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
    </>
  );
}
