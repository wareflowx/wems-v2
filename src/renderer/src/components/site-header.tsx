import DragWindowRegion from "@/components/drag-window-region";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center border-b bg-card">
      <div className="flex h-(--header-height) w-full items-center gap-2">
        <DragWindowRegion title="WEMS" />
      </div>
    </header>
  );
}
