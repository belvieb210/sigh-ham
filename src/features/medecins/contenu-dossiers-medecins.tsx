"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { FolderOpen, Loader2, Search } from "lucide-react";
import {
  MiseEnPageMedecins,
  type UtilisateurMedecins,
} from "@/features/medecins/mise-en-page-medecins";
import type { DossierRechercheMedecins } from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecins;
}

export function ContenuDossiersMedecins({ utilisateur }: Props) {
  const { t } = useTranslation();
  const [q, setQ] = useState("");
  const [recherche, setRecherche] = useState("");
  const [dossiers, setDossiers] = useState<DossierRechercheMedecins[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async (terme?: string) => {
    setChargement(true);
    setErreur(null);
    try {
      const params = new URLSearchParams();
      if (terme?.trim()) params.set("q", terme.trim());
      const res = await fetch(`/api/medecins/dossiers?${params.toString()}`);
      const data = (await res.json()) as {
        dossiers?: DossierRechercheMedecins[];
        erreur?: string;
      };
      if (!res.ok || !data.dossiers) {
        setErreur(data.erreur ?? t("medecins.dossiers.erreur"));
        return;
      }
      setDossiers(data.dossiers);
    } catch {
      setErreur(t("medecins.dossiers.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setRecherche(q);
      void charger(q);
    }, 300);
    return () => window.clearTimeout(id);
  }, [q, charger]);

  return (
    <MiseEnPageMedecins
      utilisateur={utilisateur}
      titre={t("medecins.dossiers.titre")}
      sousTitre={t("medecins.dossiers.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-4">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("medecins.dossiers.recherche")}
            className="w-full rounded-lg border border-gris-bordure bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-bleu-medical"
          />
        </div>

        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecins.dossiers.chargement")}
          </div>
        ) : erreur ? (
          <p className="text-sm text-red-600">{erreur}</p>
        ) : dossiers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gris-bordure bg-white p-8 text-center text-sm text-texte-secondaire">
            {t("medecins.dossiers.vide")}
            {recherche ? ` (« ${recherche} »)` : ""}
          </p>
        ) : (
          <ul className="divide-y divide-gris-bordure overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            {dossiers.map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gris-tres-clair/50"
              >
                <FolderOpen className="h-4 w-4 shrink-0 text-bleu-medical" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-texte-principal">
                    {d.nomComplet}
                  </p>
                  <p className="truncate text-xs text-texte-secondaire">
                    {d.numero}
                    {d.telephone ? ` · ${d.telephone}` : ""}
                    {d.age != null ? ` · ${d.age} ans` : ""}
                    {d.sexe ? ` · ${d.sexe}` : ""}
                  </p>
                </div>
                <Link
                  href={`/sigh/medecins/consultation?dossier=${encodeURIComponent(d.id)}`}
                  className="shrink-0 rounded-lg border border-gris-bordure px-2.5 py-1.5 text-xs font-medium text-texte-principal hover:bg-gris-tres-clair"
                >
                  {t("medecins.dossiers.ouvrir")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </MiseEnPageMedecins>
  );
}
