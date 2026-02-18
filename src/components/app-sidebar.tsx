"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
import { getAppVersion } from "@/actions/app";
import { SiElectron, SiReact, SiVite } from "@icons-pack/react-simple-icons";
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
  SquareTerminal,
  BookOpen,
  Settings2,
  Trash2,
  MessageCircleQuestion
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const data = {
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
      title: "Documentation",
      url: "https://docs.luanroger.dev/electron-shadcn",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { t } = useTranslation();
  const [appVersion, setAppVersion] = React.useState("0.0.0");

  React.useEffect(() => {
    getAppVersion().then(setAppVersion);
  }, []);

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]!"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="border-b bg-card">
        <SidebarMenu>
          <SidebarMenuItem className="flex gap-2 p-1">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">
              {t("app.name")}
            </h1>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-card">
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
                <SidebarMenuBadge>16</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="group-data-[collapsible=icon]:bg-border mx-2" />

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

        <Separator className="group-data-[collapsible=icon]:bg-border mx-2" />

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

        <Separator className="group-data-[collapsible=icon]:bg-border mx-2" />

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
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
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={t("sidebar.help")}>
                  <Link to="/help">
                    <MessageCircleQuestion />
                    <span>{t("sidebar.help")}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-card border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={t("sidebar.toggle")}>
              <button className="w-full">
                <span className="flex-1 text-left group-data-[collapsible=icon]:hidden">{t("sidebar.toggle")}</span>
                <SidebarTrigger className="ml-auto size-4" />
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
