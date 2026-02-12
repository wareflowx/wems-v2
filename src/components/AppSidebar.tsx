import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  FileText,
  Home,
  ShieldAlert,
  Stethoscope,
  Users,
  Briefcase,
  MapPin,
  Plus,
} from "lucide-react";
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
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CreatePositionDialog } from "./settings/CreatePositionDialog";
import { CreateWorkLocationDialog } from "./settings/CreateWorkLocationDialog";

export const AppSidebar = () => {
  const { t } = useTranslation();
  const [isPositionDialogOpen, setIsPositionDialogOpen] = useState(false);
  const [isWorkLocationDialogOpen, setIsWorkLocationDialogOpen] =
    useState(false);

  return (
    <>
      <SidebarHeader className="h-14 border-b bg-card">
        <div className="flex items-center justify-center gap-3 px-3 py-2">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 rounded-lg">
            <Users className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">
            {t("app.name")}
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.application")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.dashboard")}>
                  <Link to="/home">
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
                <SidebarMenuBadge>7</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.medicalVisits")}>
                  <Link to="/medical-visits">
                    <Stethoscope />
                    <span>{t("sidebar.medicalVisits")}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>9</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.alerts")}>
                  <Link to="/alerts">
                    <AlertTriangle />
                    <span>{t("sidebar.alerts")}</span>
                  </Link>
                </SidebarMenuButton>
                <SidebarMenuBadge>16</SidebarMenuBadge>
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
          <SidebarGroupLabel>{t("sidebar.settings")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.alerts")}>
                  <Link to="/settings/alerts">
                    <AlertTriangle />
                    <span>{t("sidebar.alerts")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.referenceData")}>
                  <Link to="/settings/reference-data">
                    <FileText />
                    <span>{t("sidebar.referenceData")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.backup")}>
                  <Link to="/settings/backup">
                    <Calendar />
                    <span>{t("sidebar.backup")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.system")}>
                  <Link to="/settings/system">
                    <CheckCircle2 />
                    <span>{t("sidebar.system")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("sidebar.quickActions")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("sidebar.addPosition")}
                  onClick={() => setIsPositionDialogOpen(true)}
                >
                  <Briefcase />
                  <span>{t("sidebar.addPosition")}</span>
                  <Plus className="ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("sidebar.addWorkLocation")}
                  onClick={() => setIsWorkLocationDialogOpen(true)}
                >
                  <MapPin />
                  <span>{t("sidebar.addWorkLocation")}</span>
                  <Plus className="ml-auto" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <CreatePositionDialog
        open={isPositionDialogOpen}
        onOpenChange={setIsPositionDialogOpen}
      />
      <CreateWorkLocationDialog
        open={isWorkLocationDialogOpen}
        onOpenChange={setIsWorkLocationDialogOpen}
      />
    </>
  );
};
