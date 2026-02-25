import { type LucideIcon, Plus } from "lucide-react";
import { DetailBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/utils/tailwind";

interface SettingsListCardProps {
  children: React.ReactNode;
}

export function SettingsListCard({ children }: SettingsListCardProps) {
  return <Card className="h-full bg-card">{children}</Card>;
}

export function SettingsListCardHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CardHeader className="pb-3">{children}</CardHeader>;
}

export function SettingsListCardTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return <h3 className="font-semibold text-lg">{children}</h3>;
}

export function SettingsListCardCount({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="text-muted-foreground text-sm">({children})</span>;
}

export function SettingsListCardBadge({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return <DetailBadge color={color as any}>{children}</DetailBadge>;
}

export function SettingsListCardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CardContent className="space-y-3">{children}</CardContent>;
}

export function SettingsListCardItemList({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="space-y-1">{children}</div>;
}

export function SettingsListCardItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md p-2 transition-colors hover:bg-muted/50">
      {children}
    </div>
  );
}

export function SettingsListCardItemIcon({
  icon: Icon,
  color,
}: {
  icon: LucideIcon;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 bg-blue-100",
    purple: "text-purple-600 bg-purple-100",
    orange: "text-orange-600 bg-orange-100",
  };

  return (
    <div
      className={cn(
        "rounded-md p-1.5",
        colorClasses[color] || "bg-gray-100 text-gray-600"
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function SettingsListCardItemLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return <span className="flex-1 font-medium text-sm">{children}</span>;
}

export function SettingsListCardItemActions({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex items-center">{children}</div>;
}

export function SettingsListCardFooter({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="border-t pt-2">{children}</div>;
}

export function SettingsListCardAddButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Button
      className="w-full justify-start gap-2"
      onClick={onClick}
      variant="ghost"
    >
      <Plus className="h-4 w-4" />
      {children}
    </Button>
  );
}
