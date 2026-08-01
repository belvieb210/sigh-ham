"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CARTE_ICONES_SERVICES } from "@/components/icones/icones-medicales";
import { Bouton } from "@/components/ui/bouton";
import { cn } from "@/lib/utils";
import type { useContenuServices } from "@/hooks/use-contenu-page";

type ServiceItem = ReturnType<typeof useContenuServices>["services"][number];

interface PropsCarteService {
  service: ServiceItem;
  variante?: "standard" | "large";
}

export function CarteService({
  service,
  variante = "standard",
}: PropsCarteService) {
  const Icone = CARTE_ICONES_SERVICES[service.icone];
  const estLarge = variante === "large";
  const estPhare = "badge" in service;
  const imageUrl = "imageUrl" in service ? service.imageUrl : undefined;

  return (
    <article
      className={cn(
        "carte-service group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300",
        estLarge
          ? "border-bleu-medical/25 shadow-md hover:shadow-xl lg:col-span-2"
          : "border-gris-bordure/70 shadow-sm hover:-translate-y-1 hover:border-bleu-medical/25 hover:shadow-lg"
      )}
    >
      <div
        className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-bleu-medical to-[#7a1f4e] transition-all duration-300 group-hover:w-full"
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative overflow-hidden",
          estLarge ? "h-52 sm:h-60" : "h-40 sm:h-44"
        )}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes={estLarge ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          </>
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br",
              service.accent
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "rounded-2xl p-4 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110",
                  service.fondIcone,
                  service.couleurIcone
                )}
              >
                <Icone className="h-8 w-8" />
              </div>
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {estPhare && (
            <span className="rounded-full bg-[#7a1f4e] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
              {service.badge}
            </span>
          )}
          <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-bleu-medical shadow-sm backdrop-blur-sm">
            {service.categorie === "diagnostic"
              ? "Diagnostic"
              : service.categorie === "soins"
                ? "Soins"
                : "Urgences"}
          </span>
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col", estLarge ? "p-6 sm:p-7" : "p-5 sm:p-6")}>
        <div
          className={cn(
            "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl",
            service.fondIcone,
            service.couleurIcone
          )}
        >
          <Icone className="h-5 w-5" />
        </div>

        <h3
          className={cn(
            "font-bold leading-snug text-texte-principal transition-colors group-hover:text-bleu-medical",
            estLarge ? "text-xl sm:text-2xl" : "text-lg"
          )}
        >
          {service.titre}
        </h3>

        <p
          className={cn(
            "mt-2 flex-1 text-texte-secondaire",
            estLarge
              ? "text-sm leading-relaxed"
              : "text-sm leading-relaxed line-clamp-3"
          )}
        >
          {service.description}
        </p>

        <ul className="mt-4 space-y-2">
          {service.points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 text-xs text-texte-secondaire sm:text-sm"
            >
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-vert-sante" />
              {point}
            </li>
          ))}
        </ul>

        <Link href={service.href} className="mt-5">
          <Bouton
            variante={estLarge ? "primaire" : "contour"}
            taille="petit"
            className={cn(
              "w-full",
              !estLarge &&
                "border-gris-bordure group-hover:border-bleu-medical group-hover:text-bleu-medical"
            )}
            enTantQueEnfant
          >
            En savoir plus
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Bouton>
        </Link>
      </div>
    </article>
  );
}
