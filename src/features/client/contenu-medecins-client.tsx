"use client";

import { useState } from "react";
import { Stethoscope } from "lucide-react";
import {
  MiseEnPageClient,
  type UtilisateurClient,
} from "@/features/client/mise-en-page-client";
import {
  GestionComptesEgliseClient,
  GestionComptesMedecinsExternesClient,
} from "@/features/client/gestion-comptes-partenaires-client";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { value: "externes", label: "Comptes médecins externes" },
  { value: "eglise", label: "Comptes conventionnés (Église)" },
] as const;

export function ContenuMedecinsClient({
  utilisateur,
}: {
  utilisateur: UtilisateurClient;
}) {
  const [section, setSection] = useState<(typeof SECTIONS)[number]["value"]>("externes");

  return (
    <MiseEnPageClient
      utilisateur={utilisateur}
      titre="Médecins et conventions"
      sousTitre="Gestion des comptes partenaires liés à votre salle."
    >
      <div className="mx-auto w-full max-w-[1200px] space-y-4">
        <EnTetePageReception
          icone={Stethoscope}
          titre="Comptes partenaires"
          description="Ajoutez les comptes médecins externes et conventionnés avec une interface proche de la gestion admin."
          fil={[
            { label: "Service client", href: "/sigh/client" },
            { label: "Comptes partenaires" },
          ]}
        />

        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Les comptes créés ici se connectent dans leur salle dédiée. Les profils publics
          internes du site sont gérés séparément dans <strong>Admin &gt; Gouvernance</strong>.
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border border-gris-bordure bg-white p-2 shadow-sm">
          {SECTIONS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setSection(item.value)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:text-sm",
                section === item.value
                  ? "bg-[#2d2a6e] text-white"
                  : "text-texte-secondaire hover:bg-gris-tres-clair"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {section === "externes" ? (
          <GestionComptesMedecinsExternesClient />
        ) : (
          <GestionComptesEgliseClient />
        )}
      </div>
    </MiseEnPageClient>
  );
}
