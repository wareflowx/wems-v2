import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface PageHeaderCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function PageHeaderCard({
  icon,
  title,
  description,
}: PageHeaderCardProps) {
  return (
    <div className="mb-2">
      <Card className="p-3 bg-card shadow-sm rounded-md">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="flex-1">
            <p className="text-gray-700">
              <span className="font-medium">{title}</span> - {description}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
