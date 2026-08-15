"use client";

import { cn } from "@/lib/utils";

export function BadgeTypePersonneCaisse({
  estClientWalkIn,
  className,
}: {
  estClientWalkIn?: boolean;
  className?: string;
}) {
  if (!estClientWalkIn) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-800",
          className
        )}
      >
        Patient
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-800",
        className
      )}
    >
      Client
    </span>
  );
}
