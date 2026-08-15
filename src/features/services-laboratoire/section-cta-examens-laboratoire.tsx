"use client";

import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { useContenuServicesLaboratoire } from "@/hooks/use-contenu-page";

export function SectionCtaExamensLaboratoire() {
  const { cta } = useContenuServicesLaboratoire();

  return (
    <section className="border-t border-gris-bordure bg-white py-10 sm:py-12">
      <div className="conteneur-principal">
        <div className="flex flex-col gap-5 rounded-2xl border border-bleu-medical/20 bg-gradient-to-r from-bleu-medical-clair/50 to-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bleu-medical text-white shadow-md">
              <Calendar className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-texte-principal sm:text-xl">
                {cta.titre}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-texte-secondaire">
                {cta.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:shrink-0">
            <Link href="/services">
              <Bouton variante="contour" taille="moyen" enTantQueEnfant>
                {cta.boutonServices}
              </Bouton>
            </Link>
            <Link href="/rendez-vous">
              <Bouton variante="primaire" taille="moyen" enTantQueEnfant>
                {cta.boutonRdv}
                <ArrowRight className="h-4 w-4" />
              </Bouton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
