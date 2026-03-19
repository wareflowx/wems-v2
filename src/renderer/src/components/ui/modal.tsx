"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import type * as React from "react";
import { cn } from "@/utils/tailwind";

interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  return (
    <DialogPrimitive.Root
      defaultOpen
      forceMount
      modal
      onOpenChange={onOpenChange}
      open={open}
    >
      {children}
    </DialogPrimitive.Root>
  );
}

interface ModalContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function ModalContent({
  children,
  className,
  ...props
}: ModalContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=closed]:animate-out data-[state=open]:animate-in sm:rounded-lg",
          className
        )}
        onEscapeKeyDown={(e) => e.preventDefault()}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

interface ModalTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export function ModalTitle({ children, className, ...props }: ModalTitleProps) {
  return (
    <DialogPrimitive.Title
      className={cn("font-semibold text-lg", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

interface ModalTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

export function ModalTrigger({ asChild, children }: ModalTriggerProps) {
  return (
    <DialogPrimitive.Trigger asChild={asChild}>
      {children}
    </DialogPrimitive.Trigger>
  );
}
