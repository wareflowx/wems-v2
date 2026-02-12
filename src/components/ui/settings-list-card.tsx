import { ReactNode, createContext, useContext } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DetailBadge } from "./badge";

type IconColor = "blue" | "purple" | "orange" | "green" | "red" | "gray" | "yellow";

interface SettingsListCardContextValue {
  iconColor?: IconColor;
}

const SettingsListCardContext = createContext<SettingsListCardContextValue>({});

export const SettingsListCard = ({ children }: { children: ReactNode }) => {
  return (
    <Card className="gap-0">
      {children}
    </Card>
  );
};

export const SettingsListCardHeader = ({ children }: { children: ReactNode }) => {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        {children}
      </div>
    </CardHeader>
  );
};

export const SettingsListCardTitle = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center gap-2">
      <h3 className="text-base font-semibold">{children}</h3>
    </div>
  );
};

export const SettingsListCardCount = ({ children }: { children: ReactNode }) => {
  return (
    <span className="text-sm text-muted-foreground">{children}</span>
  );
};

export const SettingsListCardBadge = ({
  color,
  children,
}: {
  color: IconColor;
  children: ReactNode;
}) => {
  return <DetailBadge color={color}>{children}</DetailBadge>;
};

export const SettingsListCardContent = ({ children }: { children: ReactNode }) => {
  return (
    <CardContent className="space-y-2 py-3">
      {children}
    </CardContent>
  );
};

export const SettingsListCardItem = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex items-center justify-between py-2 px-3 border rounded-md hover:bg-muted/50">
      {children}
    </div>
  );
};

export const SettingsListCardItemIcon = ({
  icon: Icon,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: IconColor;
}) => {
  const colorClasses = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    green: "text-green-600",
    red: "text-red-600",
    gray: "text-gray-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
    </div>
  );
};

export const SettingsListCardItemLabel = ({ children }: { children: ReactNode }) => {
  return <span className="text-sm">{children}</span>;
};

export const SettingsListCardItemActions = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const SettingsListCardItemList = ({ children }: { children: ReactNode }) => {
  return <div className="space-y-1">{children}</div>;
};

export const SettingsListCardFooter = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const SettingsListCardAddButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Button className="w-full gap-2" size="sm" onClick={onClick}>
      <Plus className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
};
