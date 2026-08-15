"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Loader2, Receipt } from "lucide-react";

export type DetailExamensFacture = {
  numeroFacture: string;
  statutFacture: string;
  examensDisponibles: { id: string; libelle: string; statut: string; disponible: boolean }[];
  examensEnAttente: { id: string; libelle: string; statut: string; disponible: boolean }[];
};

interface PropsSectionExamensFacturePanneauCaisse {
  dossierId: string | null;
  /** ex. `/api/caisse/examens-disponibles` ou `/api/reception/examens-disponibles` */
  prefixeApi?: string;
  /** ex. `caisse.examensDisponibles` ou `reception.examensDisponibles` */
  prefixeCle?: string;
}

const PREFIXE_API_DEFAUT = "/api/caisse/examens-disponibles";
const PREFIXE_CLE_DEFAUT = "caisse.examensDisponibles";

export function SectionExamensFacturePanneauCaisse({
  dossierId,
  prefixeApi = PREFIXE_API_DEFAUT,
  prefixeCle = PREFIXE_CLE_DEFAUT,
}: PropsSectionExamensFacturePanneauCaisse) {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<DetailExamensFacture | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const charger = useCallback(async () => {
    if (!dossierId) {
      setDetail(null);
      setErreur(null);
      return;
    }
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(
        `${prefixeApi}/${encodeURIComponent(dossierId)}`
      );
      const data = (await res.json()) as {
        detail?: DetailExamensFacture;
        erreur?: string;
      };
      if (!res.ok) {
        setDetail(null);
        setErreur(data.erreur ?? t(`${prefixeCle}.erreurDetail`));
        return;
      }
      setDetail(data.detail ?? null);
    } catch {
      setDetail(null);
      setErreur(t(`${prefixeCle}.erreurDetail`));
    } finally {
      setChargement(false);
    }
  }, [dossierId, prefixeApi, prefixeCle, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  if (!dossierId) return null;

  return (
    <section className="min-w-0 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
            {t(`${prefixeCle}.factureTitre`)}
          </h2>
          {detail?.numeroFacture ? (
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-texte-secondaire">
              <Receipt className="h-3.5 w-3.5 shrink-0" />
              {detail.numeroFacture}
            </p>
          ) : null}
        </div>
      </div>

      {chargement ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-bleu-medical" />
        </div>
      ) : erreur ? (
        <p className="text-xs text-rose-600">{erreur}</p>
      ) : !detail ? null : (
        <div className="space-y-3">
          {detail.examensDisponibles.length > 0 ? (
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                {t(`${prefixeCle}.examensDisponiblesFacture`, {
                  count: detail.examensDisponibles.length,
                })}
              </p>
              <ul className="space-y-1.5">
                {detail.examensDisponibles.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-center gap-2 rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-2.5 py-2 text-xs text-emerald-950"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span className="min-w-0 font-medium">{ex.libelle}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.examensEnAttente.length > 0 ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                {t(`${prefixeCle}.examensEnAttente`, {
                  count: detail.examensEnAttente.length,
                })}
              </p>
              <p className="mb-2 text-[11px] leading-relaxed text-amber-900/80">
                {t(`${prefixeCle}.examensEnAttenteInfo`)}
              </p>
              <ul className="space-y-1.5">
                {detail.examensEnAttente.map((ex) => (
                  <li
                    key={ex.id}
                    className="flex items-center gap-2 rounded-lg border border-amber-200/60 bg-white/80 px-2.5 py-2 text-xs text-amber-950"
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                    <span className="min-w-0 font-medium">{ex.libelle}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-texte-secondaire">
              {t(`${prefixeCle}.tousExamensDisponibles`)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
