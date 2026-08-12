"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, Eye, FileText, Printer } from "lucide-react";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

interface RapportItem {
  id: string;
  patient: string;
  numeroDossier: string;
  paroisse: string | null;
  termineLe: string | null;
  statut: string;
}

export function ContenuRapportsEglise({
  utilisateur,
}: {
  utilisateur: UtilisateurEglise;
}) {
  const { t } = useTranslation();
  const [rapports, setRapports] = useState<RapportItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    fetch("/api/eglise/rapports")
      .then(async (res) => {
        const data = (await res.json()) as {
          rapports?: RapportItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("eglise.rapports.erreur"));
        setRapports(data.rapports ?? []);
      })
      .catch((e: unknown) => {
        setErreur(e instanceof Error ? e.message : t("eglise.rapports.erreur"));
      })
      .finally(() => setChargement(false));
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const urlFichier = (id: string) => `/api/eglise/rapports/${id}`;

  return (
    <MiseEnPageEglise
      utilisateur={utilisateur}
      titre={t("eglise.rapports.titre")}
      sousTitre={t("eglise.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={FileText}
          titre={t("eglise.rapports.titre")}
          description={t("eglise.rapports.description")}
          fil={[
            { label: t("eglise.common.salle"), href: "/sigh/eglise" },
            { label: t("eglise.rapports.fil") },
          ]}
        />

        {chargement ? (
          <p className="mt-6 text-sm text-texte-secondaire">
            {t("eglise.common.chargement")}
          </p>
        ) : erreur ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-sm text-red-700">
            {erreur}
          </p>
        ) : rapports.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center">
            <p className="font-semibold text-texte-principal">
              {t("eglise.rapports.vide")}
            </p>
            <p className="mt-2 text-sm text-texte-secondaire">
              {t("eglise.rapports.videAide")}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="tableau-sigh">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-2 py-1.5">{t("eglise.rapports.patient")}</th>
                  <th className="px-2 py-1.5">{t("eglise.rapports.paroisse")}</th>
                  <th className="px-2 py-1.5">{t("eglise.rapports.date")}</th>
                  <th className="px-2 py-1.5">{t("eglise.rapports.statut")}</th>
                  <th className="px-2 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {rapports.map((r) => (
                  <tr key={r.id} className="border-t border-gris-bordure">
                    <td className="px-2 py-1.5">
                      <p className="font-medium text-texte-principal">{r.patient}</p>
                      <p className="text-xs text-texte-secondaire">
                        {r.numeroDossier}
                      </p>
                    </td>
                    <td className="px-2 py-1.5">{r.paroisse || "—"}</td>
                    <td className="px-2 py-1.5">
                      {r.termineLe
                        ? new Date(r.termineLe).toLocaleString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5">{r.statut}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Bouton
                          type="button"
                          variante="secondaire"
                          taille="petit"
                          onClick={() => window.open(urlFichier(r.id), "_blank")}
                        >
                          <Eye className="h-4 w-4" />
                          {t("eglise.rapports.consulter")}
                        </Bouton>
                        <a
                          href={urlFichier(r.id)}
                          download
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium hover:bg-gris-tres-clair"
                        >
                          <Download className="h-4 w-4" />
                          {t("eglise.rapports.telecharger")}
                        </a>
                        <Bouton
                          type="button"
                          variante="secondaire"
                          taille="petit"
                          onClick={() => {
                            const w = window.open(urlFichier(r.id), "_blank");
                            w?.addEventListener("load", () => w.print());
                          }}
                        >
                          <Printer className="h-4 w-4" />
                          {t("eglise.rapports.imprimer")}
                        </Bouton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MiseEnPageEglise>
  );
}
