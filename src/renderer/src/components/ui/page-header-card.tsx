import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface PageHeaderCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  rightContent?: ReactNode;
}

export function PageHeaderCard({
  icon,
  title,
  description,
  rightContent,
}: PageHeaderCardProps) {
  return (
    <div className="mb-2">
      <Card className="rounded-md bg-card p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1">
            <p className="text-gray-700">
              <span className="font-medium">{title}</span> - {description}
            </p>
          </div>
          {rightContent && <div>{rightContent}</div>}
        </div>
      </Card>
    </div>
  );
}
