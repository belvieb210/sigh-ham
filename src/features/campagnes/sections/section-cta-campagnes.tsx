"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Megaphone, Phone } from "lucide-react";
import { useContenuCampagnes } from "@/hooks/use-contenu-page";
import { Bouton } from "@/components/ui/bouton";

export function SectionCtaCampagnes() {
  const { cta } = useContenuCampagnes();

  return (
    <section aria-label="Contact campagnes">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#7a1f4e] via-[#2d2a6e] to-[#0f172a] py-14 text-white sm:py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA2KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"
          aria-hidden="true"
        />

        <div className="conteneur-principal relative">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <div>
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <Megaphone className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-extrabold sm:text-3xl lg:text-4xl">
                {cta.titre}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
                {cta.description}
              </p>

              <a
                href={`tel:${cta.telephone.replace(/\s/g, "")}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90 transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {cta.telephone}
              </a>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Link href={cta.bouton.href} className="flex-1">
                <Bouton
                  taille="grand"
                  className="w-full bg-white text-[#7a1f4e] hover:bg-white/90"
                  enTantQueEnfant
                >
                  {cta.bouton.etiquette}
                  <ArrowRight className="h-4 w-4" />
                </Bouton>
              </Link>
              <Link href={cta.boutonSecondaire.href} className="flex-1">
                <Bouton
                  taille="grand"
                  variante="contour"
                  className="w-full border-white/40 bg-white/10 text-white hover:bg-white/20"
                  enTantQueEnfant
                >
                  <Calendar className="h-4 w-4" />
                  {cta.boutonSecondaire.etiquette}
                </Bouton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
