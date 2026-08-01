"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsCaseACocher {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export function CaseACocher({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  description,
  className,
}: PropsCaseACocher) {
  return (
    <div className={cn("space-y-1", className)}>
      <label
        htmlFor={id}
        className={cn(
          "group inline-flex cursor-pointer items-start gap-2.5",
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <span className="relative mt-0.5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className={cn(
              "flex h-[18px] w-[18px] items-center justify-center rounded-md border-2 bg-white transition-all duration-200",
              checked
                ? "border-bleu-medical bg-bleu-medical"
                : "border-gris-bordure group-hover:border-bleu-medical/50",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-bleu-medical/30 peer-focus-visible:ring-offset-1"
            )}
          >
            <Check
              className={cn(
                "h-3 w-3 text-white transition-all duration-150",
                checked ? "scale-100 opacity-100" : "scale-75 opacity-0"
              )}
              strokeWidth={3}
            />
          </span>
        </span>
        <span className="select-none text-sm leading-snug text-texte-secondaire">
          {label}
        </span>
      </label>
      {description && (
        <p className="pl-7 text-xs leading-relaxed text-texte-secondaire/80">
          {description}
        </p>
      )}
    </div>
  );
}
