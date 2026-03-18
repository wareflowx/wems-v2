import { TooltipProvider } from "@/components/ui/tooltip";

export const Page = {
  Root: function PageRoot({ children }: { children?: React.ReactNode }) {
    return (
      <TooltipProvider>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="min-h-full space-y-3">{children}</div>
        </div>
      </TooltipProvider>
    );
  },
  Content: function PageContent({ children }: { children?: React.ReactNode }) {
    return <div className="flex flex-col gap-2">{children}</div>;
  },
};