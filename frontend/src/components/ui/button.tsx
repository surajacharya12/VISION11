import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variants = {
      default: "bg-[#10b981] text-black hover:bg-[#059669] font-bold shadow-md shadow-emerald-500/20",
      outline: "border border-white/10 bg-transparent hover:bg-white/5 text-white",
      secondary: "bg-white/10 text-white hover:bg-white/15",
      ghost: "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
      destructive: "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30",
      link: "text-emerald-400 underline-offset-4 hover:underline",
    };
    const sizes = {
      default: "h-10 px-4 py-2 text-xs md:text-sm",
      sm: "h-8 px-3 text-xs",
      lg: "h-12 px-6 text-sm md:text-base font-bold",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
