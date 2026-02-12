import { Outlet } from '@tanstack/react-router'
import { SidebarInset } from '@/components/ui/sidebar'
import { AppHeader } from '@/components/ui/app-header'
import { EditModeBadge } from '@/components/ui/edit-mode-badge'
import { useTranslation } from 'react-i18next'

export function AppLayout() {
  const { t } = useTranslation()

  return (
    <SidebarInset className="bg-sidebar">
      <AppHeader actions={<EditModeBadge>{t('dashboard.editMode')}</EditModeBadge>} />
      <Outlet />
    </SidebarInset>
  )
}
