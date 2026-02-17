import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { DetailBadge } from '@/components/ui/badge'

interface SettingsListCardProps {
  children: React.ReactNode
}

export function SettingsListCard({ children }: SettingsListCardProps) {
  return (
    <Card className="bg-card h-full">
      {children}
    </Card>
  )
}

export function SettingsListCardHeader({ children }: { children: React.ReactNode }) {
  return (
    <CardHeader className="pb-3">
      {children}
    </CardHeader>
  )
}

export function SettingsListCardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold">{children}</h3>
  )
}

export function SettingsListCardCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm text-muted-foreground">({children})</span>
  )
}

export function SettingsListCardBadge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <DetailBadge color={color as any}>{children}</DetailBadge>
  )
}

export function SettingsListCardContent({ children }: { children: React.ReactNode }) {
  return (
    <CardContent className="space-y-3">
      {children}
    </CardContent>
  )
}

export function SettingsListCardItemList({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      {children}
    </div>
  )
}

export function SettingsListCardItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
      {children}
    </div>
  )
}

export function SettingsListCardItemIcon({ icon: Icon, color }: { icon: LucideIcon; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
  }

  return (
    <div className={cn('p-1.5 rounded-md', colorClasses[color] || 'text-gray-600 bg-gray-100')}>
      <Icon className="h-4 w-4" />
    </div>
  )
}

export function SettingsListCardItemLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium flex-1">{children}</span>
  )
}

export function SettingsListCardItemActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center">
      {children}
    </div>
  )
}

export function SettingsListCardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-2 border-t">
      {children}
    </div>
  )
}

export function SettingsListCardAddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <Button variant="ghost" className="w-full justify-start gap-2" onClick={onClick}>
      <Plus className="h-4 w-4" />
      {children}
    </Button>
  )
}
