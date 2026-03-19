import { type LucideIcon, Search } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Modal,
  ModalContent,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/modal";
import { cn } from "@/utils/tailwind";

export type CommandItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: LucideIcon;
  shortcut?: string;
  action?: () => void;
};

type SearchModalProps = {
  children: React.ReactNode;
  data: CommandItem[];
  onAction?: (action: () => void) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function SearchModal({
  children,
  data,
  onAction,
  open: externalOpen,
  onOpenChange: externalOnOpenChange,
}: SearchModalProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setOpen]);

  const filteredData = React.useMemo(() => {
    if (!query) {
      return data;
    }
    const searchLower = query.toLowerCase();
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
    );
  }, [data, query]);

  const handleSelect = (item: CommandItem) => {
    if (item.action) {
      item.action();
    }
    setOpen(false);
  };

  return (
    <Modal
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setOpen(false);
        }
      }}
      open={open}
    >
      <ModalTrigger asChild>{children}</ModalTrigger>
      <ModalContent
        className="gap-0 p-0"
        onInteractOutside={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <ModalTitle className="sr-only">Search</ModalTitle>
        <Command className="rounded-md">
          <CommandInput
            className={cn(
              "flex h-12 w-full rounded-md border-b bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            )}
            onValueChange={setQuery}
            placeholder="Search..."
            value={query}
          />
          <CommandList className="max-h-[380px] min-h-[380px] px-2">
            <CommandEmpty className="flex min-h-[280px] flex-col items-center justify-center">
              <Search className="mb-2 size-6 text-muted-foreground" />
              <p className="mb-1 text-muted-foreground text-xs">
                No commands found for "{query}"
              </p>
              <Button onClick={() => setQuery("")} variant="ghost">
                Clear search
              </Button>
            </CommandEmpty>
            <CommandGroup>
              {filteredData.map((item) => {
                return (
                  <CommandItem
                    className="flex cursor-pointer items-center gap-3"
                    key={item.id}
                    onSelect={() => handleSelect(item)}
                    value={item.title}
                  >
                    {item.icon && (
                      <item.icon className="size-5 shrink-0 text-muted-foreground" />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <p className="truncate font-medium text-sm">
                        {item.title}
                      </p>
                      <p className="truncate text-muted-foreground text-xs">
                        {item.description}
                      </p>
                    </div>
                    <p className="shrink-0 text-muted-foreground text-xs">
                      {item.category}
                    </p>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </ModalContent>
    </Modal>
  );
}
