"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/utils/tailwind";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  );
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModalContent({ children, className, ...props }: ModalContentProps) {
  return (
    <DialogContent className={cn("p-0 gap-0 max-w-[500px] overflow-hidden", className)} {...props}>
      {children}
    </DialogContent>
  );
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  return (
    <DialogContent className={cn("sr-only", className)} {...props}>
      {children}
    </DialogContent>
  );
}

interface ModalTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function ModalTrigger({ asChild, children }: ModalTriggerProps) {
  return <DialogTrigger asChild={asChild}>{children}</DialogTrigger>;
}
