"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Calendar, FileText, CreditCard, Headphones } from "lucide-react";
import { ACCES_RAPIDES } from "@/constants/navigation";

const CARTE_ICONES_ACCES = {
  calendrier: Calendar,
  resultats: FileText,
  paiement: CreditCard,
  support: Headphones,
} as const;

export function SectionAccesRapide() {
  const { t } = useTranslation();

  const CLES_ACCES: Record<string, "rdv" | "resultats" | "paiement" | "support"> = {
    rdv: "rdv",
    resultats: "resultats",
    paiement: "paiement",
    support: "support",
  };

  return (
    <section
      className="section-acces-rapide border-y border-gris-bordure/60 bg-white py-8 lg:py-10"
      aria-label="Accès rapide"
    >
      <div className="conteneur-principal">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
          {ACCES_RAPIDES.map((acces, index) => {
            const Icone = CARTE_ICONES_ACCES[acces.icone];
            return (
              <motion.div
                key={acces.id}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={acces.href}
                  className="groupe-acces group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-all hover:border-bleu-medical/15 hover:bg-bleu-medical-clair/40 lg:gap-4 lg:p-4"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-bleu-medical-clair to-white text-bleu-medical shadow-sm ring-1 ring-bleu-medical/10 transition-all group-hover:from-bleu-medical group-hover:to-[#2d2a6e] group-hover:text-white lg:h-12 lg:w-12">
                    <Icone className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-tight text-[#2d2a6e] lg:text-sm">
                      {t(`accueil.accesRapide.${CLES_ACCES[acces.id]}.titre`)}
                    </p>
                    <p className="text-[11px] text-texte-secondaire lg:text-xs">
                      {t(`accueil.accesRapide.${CLES_ACCES[acces.id]}.sousTitre`)}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
