"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value: string;
  onValueChange: (val: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SelectContext = React.createContext<SelectContextType | null>(null);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  return (
    <button
      type="button"
      onClick={() => ctx.setOpen((prev) => !prev)}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#151c30] px-3.5 py-2.5 text-xs text-white outline-none transition-colors hover:border-white/20",
        className
      )}
    >
      {children}
      <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${ctx.open ? "rotate-180" : ""}`} />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const ctx = React.useContext(SelectContext);
  return <span>{ctx?.value || placeholder || "Select..."}</span>;
}

export function SelectContent({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx || !ctx.open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => ctx.setOpen(false)} />
      <div
        className={cn(
          "absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#151c30] p-1.5 shadow-2xl animate-in fade-in-0 zoom-in-95",
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0.5">{children}</div>;
}

export function SelectLabel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400", className)}>{children}</div>;
}

export function SelectItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) return null;

  const isSelected = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => {
        ctx.onValueChange(value);
        ctx.setOpen(false);
      }}
      className={cn(
        "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors text-left",
        isSelected ? "bg-emerald-500/20 text-emerald-300 font-bold" : "text-slate-200 hover:bg-white/10 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}
