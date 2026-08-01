"use client";

import { useContenuRendezVous } from "@/hooks/use-contenu-page";
import { cn } from "@/lib/utils";

interface PropsBarreProgression {
  etapeCourante: number;
}

export function BarreProgressionReservation({ etapeCourante }: PropsBarreProgression) {
  const { form } = useContenuRendezVous();
  const etapes = form.etapes.map((libelle, index) => ({
    numero: index + 1,
    libelle,
  }));

  return (
    <nav aria-label="Progression de la réservation" className="mb-8">
      <ol className="flex items-center justify-between gap-1 sm:gap-2">
        {etapes.map((etape, index) => {
          const estComplete = etapeCourante > etape.numero;
          const estActive = etapeCourante === etape.numero;

          return (
            <li
              key={etape.numero}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex w-full items-center">
                {index > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      estComplete || estActive
                        ? "bg-bleu-medical"
                        : "bg-gris-bordure"
                    )}
                    aria-hidden="true"
                  />
                )}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors sm:h-9 sm:w-9 sm:text-sm",
                    estComplete
                      ? "bg-bleu-medical text-white"
                      : estActive
                        ? "bg-[#2d2a6e] text-white ring-4 ring-bleu-medical/20"
                        : "bg-gris-tres-clair text-texte-secondaire"
                  )}
                  aria-current={estActive ? "step" : undefined}
                >
                  {estComplete ? "✓" : etape.numero}
                </div>
                {index < etapes.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      etapeCourante > etape.numero
                        ? "bg-bleu-medical"
                        : "bg-gris-bordure"
                    )}
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={cn(
                  "hidden text-center text-[10px] font-semibold sm:block sm:text-xs",
                  estActive ? "text-bleu-medical" : "text-texte-secondaire"
                )}
              >
                {etape.libelle}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
