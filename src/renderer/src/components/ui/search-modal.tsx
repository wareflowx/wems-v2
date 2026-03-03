import React from "react";
import {
    Modal,
    ModalContent,
    ModalTitle,
    ModalTrigger,
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

import { LucideIcon, Search } from "lucide-react";
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


export function SearchModal({ children, data, onAction, open: externalOpen, onOpenChange: externalOnOpenChange }: SearchModalProps) {
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
        if (!query) return data;
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
            open={open}
            onOpenChange={(isOpen) => {
                if (!isOpen) {
                    setOpen(false);
                }
            }}
        >
            <ModalTrigger asChild>{children}</ModalTrigger>
            <ModalContent
                className="p-0 gap-0"
                onInteractOutside={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
            >
                <ModalTitle className="sr-only">Search</ModalTitle>
                <Command className="rounded-md">
                    <CommandInput
                        className={cn(
                            "placeholder:text-muted-foreground flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50 border-b"
                        )}
                        placeholder="Search..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="max-h-[380px] min-h-[380px] px-2">
                        <CommandEmpty className="flex min-h-[280px] flex-col items-center justify-center">
                            <Search className="text-muted-foreground mb-2 size-6" />
                            <p className="text-muted-foreground mb-1 text-xs">
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
                                        key={item.id}
                                        className="flex cursor-pointer items-center gap-3"
                                        value={item.title}
                                        onSelect={() => handleSelect(item)}
                                    >
                                        {item.icon && <item.icon className="size-5 text-muted-foreground shrink-0" />}
                                        <div className="flex min-w-0 flex-1 flex-col">
                                            <p className="truncate text-sm font-medium">
                                                {item.title}
                                            </p>
                                            <p className="text-muted-foreground text-xs truncate">
                                                {item.description}
                                            </p>
                                        </div>
                                        <p className="text-muted-foreground shrink-0 text-xs">
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
