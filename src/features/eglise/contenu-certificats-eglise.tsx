"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import {
  MiseEnPageEglise,
  type UtilisateurEglise,
} from "@/features/eglise/mise-en-page-eglise";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";

interface CertificatItem {
  id: string;
  patient: string;
  numeroDossier: string;
  paroisse: string | null;
  conjointNom: string | null;
  dateMariage: string | null;
  certificatUrl: string | null;
  rapportPdfUrl: string | null;
  peutEmettre: boolean;
}

export function ContenuCertificatsEglise({
  utilisateur,
}: {
  utilisateur: UtilisateurEglise;
}) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CertificatItem[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCoursId, setEnCoursId] = useState<string | null>(null);

  const charger = useCallback(() => {
    setChargement(true);
    setErreur(null);
    fetch("/api/eglise/certificats")
      .then(async (res) => {
        const data = (await res.json()) as {
          certificats?: CertificatItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("eglise.certificats.erreur"));
        setItems(data.certificats ?? []);
      })
      .catch((e: unknown) => {
        setErreur(
          e instanceof Error ? e.message : t("eglise.certificats.erreur")
        );
      })
      .finally(() => setChargement(false));
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const emettre = async (id: string) => {
    setEnCoursId(id);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch(`/api/eglise/certificats/${id}`, { method: "POST" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("eglise.certificats.erreur"));
      setMessage(data.message ?? t("eglise.certificats.succes"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("eglise.certificats.erreur"));
    } finally {
      setEnCoursId(null);
    }
  };

  const urlCertificat = (id: string) =>
    `/api/eglise/rapports/${id}?type=certificat`;

  return (
    <MiseEnPageEglise
      utilisateur={utilisateur}
      titre={t("eglise.certificats.titre")}
      sousTitre={t("eglise.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <EnTetePageReception
          icone={Award}
          titre={t("eglise.certificats.titre")}
          description={t("eglise.certificats.description")}
          fil={[
            { label: t("eglise.common.salle"), href: "/sigh/eglise" },
            { label: t("eglise.certificats.fil") },
          ]}
        />

        {message && (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-2 py-1.5 text-sm text-green-800">
            {message}
          </p>
        )}

        {chargement ? (
          <p className="mt-6 text-sm text-texte-secondaire">
            {t("eglise.common.chargement")}
          </p>
        ) : erreur ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-sm text-red-700">
            {erreur}
          </p>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-16 text-center">
            <p className="font-semibold text-texte-principal">
              {t("eglise.certificats.vide")}
            </p>
            <p className="mt-2 text-sm text-texte-secondaire">
              {t("eglise.certificats.videAide")}
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
            <table className="tableau-sigh">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-2 py-1.5">{t("eglise.certificats.patient")}</th>
                  <th className="px-2 py-1.5">{t("eglise.certificats.paroisse")}</th>
                  <th className="px-2 py-1.5">{t("eglise.certificats.conjoint")}</th>
                  <th className="px-2 py-1.5">{t("eglise.certificats.dateMariage")}</th>
                  <th className="px-2 py-1.5" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-gris-bordure">
                    <td className="px-2 py-1.5">
                      <p className="font-medium">{item.patient}</p>
                      <p className="text-xs text-texte-secondaire">
                        {item.numeroDossier}
                      </p>
                    </td>
                    <td className="px-2 py-1.5">{item.paroisse || "—"}</td>
                    <td className="px-2 py-1.5">{item.conjointNom || "—"}</td>
                    <td className="px-2 py-1.5">
                      {item.dateMariage
                        ? new Date(item.dateMariage).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        {item.certificatUrl ? (
                          <>
                            <Bouton
                              type="button"
                              variante="secondaire"
                              taille="petit"
                              onClick={() =>
                                window.open(urlCertificat(item.id), "_blank")
                              }
                            >
                              <Eye className="h-4 w-4" />
                              {t("eglise.certificats.consulter")}
                            </Bouton>
                            <a
                              href={urlCertificat(item.id)}
                              download
                              className="inline-flex items-center gap-1.5 rounded-lg border border-gris-bordure px-3 py-1.5 text-xs font-medium hover:bg-gris-tres-clair"
                            >
                              <Download className="h-4 w-4" />
                              {t("eglise.certificats.telecharger")}
                            </a>
                          </>
                        ) : item.peutEmettre ? (
                          <Bouton
                            type="button"
                            taille="petit"
                            disabled={enCoursId === item.id}
                            onClick={() => void emettre(item.id)}
                          >
                            {enCoursId === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Award className="h-4 w-4" />
                            )}
                            {t("eglise.certificats.emettre")}
                          </Bouton>
                        ) : (
                          <span className="text-xs text-texte-secondaire">—</span>
                        )}
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
