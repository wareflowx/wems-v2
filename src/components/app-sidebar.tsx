import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarHeader,
  Sidebar,
  SidebarRail
} from '@/components/ui/sidebar'

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
} from 'lucide-react'

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarHeader className="h-14 border-b bg-card">
          <div className="flex items-center justify-center gap-3 px-3 py-2">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 group-data-[collapsible=icon]:hidden">
              WEMS
            </h1>
          </div>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>{/* Empty for now */}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
