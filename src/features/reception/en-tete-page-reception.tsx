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
    <header className={cn("mb-3 lg:mb-6", className)}>
      {/* Mobile : description courte seulement (le titre est dans l'en-tête sticky) */}
      {description ? (
        <p className="text-sm leading-snug text-texte-secondaire lg:hidden">{description}</p>
      ) : null}

      {/* Desktop : fil + titre complet */}
      <div className="hidden lg:block">
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bleu-medical-clair text-bleu-medical">
            <Icone className="h-6 w-6" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-texte-principal">{titre}</h1>
            {description && (
              <p className="mt-1 text-sm text-texte-secondaire">{description}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
