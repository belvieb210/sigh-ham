"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useContenuRendezVous } from "@/hooks/use-contenu-page";
import { cn } from "@/lib/utils";

export function SectionFaqRendezVous() {
  const { faq, faqSection } = useContenuRendezVous();
  const [ouvertId, setOuvertId] = useState<string | null>(
    faq[0]?.id ?? null
  );

  return (
    <section
      className="section-faq-rdv bg-white py-12 sm:py-16 lg:py-20"
      aria-labelledby="titre-faq-rdv"
    >
      <div className="conteneur-principal">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7a1f4e]">
              {faqSection.surtitre}
            </p>
            <h2
              id="titre-faq-rdv"
              className="mt-3 text-2xl font-extrabold text-[#2d2a6e] sm:text-3xl"
            >
              {faqSection.titre}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-texte-secondaire sm:text-base">
              {faqSection.sousTitre}
            </p>

            <div className="mt-8 hidden rounded-2xl border border-gris-bordure bg-gris-tres-clair p-6 lg:block">
              <HelpCircle className="h-8 w-8 text-bleu-medical" />
              <p className="mt-4 text-sm font-semibold text-texte-principal">
                {faqSection.aideTitre}
              </p>
              <p className="mt-2 text-sm text-texte-secondaire">
                {faqSection.aideTexte}
              </p>
              <a
                href="/contact"
                className="mt-4 inline-block text-sm font-semibold text-bleu-medical hover:underline"
              >
                {faqSection.aideLien}
              </a>
            </div>
          </div>

          <div className="divide-y divide-gris-bordure rounded-2xl border border-gris-bordure bg-white shadow-sm">
            {faq.map((item, index) => {
              const estOuvert = ouvertId === item.id;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <button
                    type="button"
                    onClick={() => setOuvertId(estOuvert ? null : item.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors sm:px-6 sm:py-5",
                      estOuvert ? "bg-bleu-medical-clair/40" : "hover:bg-gris-tres-clair"
                    )}
                    aria-expanded={estOuvert}
                  >
                    <span className="text-sm font-semibold text-texte-principal sm:text-base">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-bleu-medical transition-transform duration-200",
                        estOuvert && "rotate-180"
                      )}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {estOuvert && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-gris-bordure/60 px-5 pb-5 pt-3 text-sm leading-relaxed text-texte-secondaire sm:px-6">
                          {item.reponse}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
