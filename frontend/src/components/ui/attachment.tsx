import * as React from "react";
import { cn } from "@/lib/utils";

export function Attachment({
  state = "done",
  className,
  children,
}: {
  state?: "idle" | "uploading" | "processing" | "error" | "done";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 bg-[#151c30] border-white/10 text-white transition-all",
        state === "done" && "border-emerald-500/30 bg-emerald-500/10",
        state === "error" && "border-red-500/30 bg-red-500/10",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AttachmentMedia({
  variant = "icon",
  children,
}: {
  variant?: "icon" | "image";
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
      {children}
    </div>
  );
}

export function AttachmentContent({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 flex-1 leading-tight">{children}</div>;
}

export function AttachmentTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("block truncate text-xs font-bold text-white", className)}>{children}</span>;
}

export function AttachmentDescription({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn("block truncate text-[11px] text-slate-400 mt-0.5", className)}>{children}</span>;
}
