import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
  iconSize?: number;
}

export function Logo({ className, variant = "dark" }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-1 group cursor-default select-none", className)}>
      <div className="relative">
        <span
          className={cn(
            "text-xl font-bold tracking-tight",
            isLight ? "text-black" : "text-white"
          )}
          style={{ fontFamily: "'Space Grotesk', monospace" }}
        >
          regle
        </span>
        <div className="absolute -top-0.5 -right-3">
          <div className="bg-[#00FFB2] text-[#0A0A0A] text-[8px] font-bold px-1 py-px rounded-sm group-hover:-translate-y-0.5 transition-transform">
            N
          </div>
        </div>
      </div>
    </div>
  );
}
