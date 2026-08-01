import Link from "next/link";
import { ChevronRight, UserPlus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropsEnTetePageReception {
  titre: string;
  description?: string;
  fil?: { label: string; href?: string }[];
  icone?: LucideIcon;
  className?: string;
}

export function EnTetePageReception({
  titre,
  description,
  fil,
  icone: Icone = UserPlus,
  className,
}: PropsEnTetePageReception) {
  return (
    <header className={cn("mb-4 lg:mb-6", className)}>
      {fil && fil.length > 0 && (
        <nav
          aria-label="Fil d'Ariane"
          className="mb-3 flex flex-wrap items-center gap-1 text-xs text-texte-secondaire"
        >
          {fil.map((item, index) => (
            <span key={item.label} className="flex items-center gap-1">
              {index > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden />}
              {item.href ? (
                <Link href={item.href} className="hover:text-bleu-medical hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-texte-principal">{item.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bleu-medical-clair text-bleu-medical lg:h-12 lg:w-12">
          <Icone className="h-5 w-5 lg:h-6 lg:w-6" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-texte-principal lg:text-xl">{titre}</h1>
          {description && (
            <p className="mt-1 text-sm text-texte-secondaire">{description}</p>
          )}
        </div>
      </div>
    </header>
  );
}
