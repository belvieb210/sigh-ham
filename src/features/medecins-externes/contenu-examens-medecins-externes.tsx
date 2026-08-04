"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import {
  MiseEnPageMedecinsExternes,
  type UtilisateurMedecinsExternes,
} from "@/features/medecins-externes/mise-en-page-medecins-externes";
import type {
  ExamenMedecinsResume,
  PatientFileMedecins,
  TypeExamenMedecins,
} from "@/lib/medecins/types";

interface Props {
  utilisateur: UtilisateurMedecinsExternes;
}

export function ContenuExamensMedecinsExternes({ utilisateur }: Props) {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier")?.trim() ?? "";

  const [patients, setPatients] = useState<PatientFileMedecins[]>([]);
  const [types, setTypes] = useState<TypeExamenMedecins[]>([]);
  const [examens, setExamens] = useState<ExamenMedecinsResume[]>([]);
  const [dossierId, setDossierId] = useState(dossierUrl);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const typesParCategorie = useMemo(() => {
    const map = new Map<string, TypeExamenMedecins[]>();
    for (const type of types) {
      const liste = map.get(type.categorie) ?? [];
      liste.push(type);
      map.set(type.categorie, liste);
    }
    return [...map.entries()];
  }, [types]);

  useEffect(() => {
    if (dossierUrl) setDossierId(dossierUrl);
  }, [dossierUrl]);

  useEffect(() => {
    let annule = false;
    (async () => {
      try {
        const [resPatients, resTypes] = await Promise.all([
          fetch("/api/medecins-externes/patients"),
          fetch("/api/medecins-externes/examens?types=1"),
        ]);
        const dataPatients = (await resPatients.json()) as {
          patients?: PatientFileMedecins[];
        };
        const dataTypes = (await resTypes.json()) as {
          types?: TypeExamenMedecins[];
        };
        if (annule) return;
        setPatients(dataPatients.patients ?? []);
        setTypes(dataTypes.types ?? []);
      } catch {
        if (!annule) setErreur(t("medecinsExternes.examens.erreur"));
      } finally {
        if (!annule) setChargement(false);
      }
    })();
    return () => {
      annule = true;
    };
  }, [t]);

  useEffect(() => {
    if (!dossierId) {
      setExamens([]);
      return;
    }
    let annule = false;
    (async () => {
      const res = await fetch(
        `/api/medecins-externes/examens?dossierId=${encodeURIComponent(dossierId)}`
      );
      const data = (await res.json()) as { examens?: ExamenMedecinsResume[] };
      if (!annule) setExamens(data.examens ?? []);
    })();
    return () => {
      annule = true;
    };
  }, [dossierId]);

  function toggle(id: string) {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function prescrire() {
    if (!dossierId || selection.size === 0) {
      setErreur(t("medecinsExternes.examens.selectionRequise"));
      return;
    }
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/medecins-externes/examens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          typeExamenIds: [...selection],
          orienterVersCaisse: true,
        }),
      });
      const data = (await res.json()) as {
        examens?: ExamenMedecinsResume[];
        transfertCaisse?: { ok: boolean; message?: string };
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("medecinsExternes.actions.erreurInattendue"));
        return;
      }
      setExamens((prev) => [...(data.examens ?? []), ...prev]);
      setSelection(new Set());
      if (data.transfertCaisse?.ok) {
        setMessage(t("medecinsExternes.examens.prescritAvecCaisse"));
      } else if (data.transfertCaisse && !data.transfertCaisse.ok) {
        setMessage(
          t("medecinsExternes.examens.prescritSansCaisse", {
            raison: data.transfertCaisse.message ?? "",
          })
        );
      } else {
        setMessage(t("medecinsExternes.examens.hintCaisse"));
      }
    } catch {
      setErreur(t("medecinsExternes.actions.erreurInattendue"));
    } finally {
      setEnCours(false);
    }
  }

  const champ =
    "w-full rounded-lg border border-gris-bordure bg-white px-3 py-2 text-sm outline-none focus:border-bleu-medical";

  return (
    <MiseEnPageMedecinsExternes
      utilisateur={utilisateur}
      titre={t("medecinsExternes.examens.titre")}
      sousTitre={t("medecinsExternes.examens.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px] space-y-5">
        {chargement ? (
          <div className="flex items-center gap-2 text-sm text-texte-secondaire">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("medecinsExternes.examens.chargement")}
          </div>
        ) : (
          <>
            <select
              className={champ}
              value={dossierId}
              onChange={(e) => setDossierId(e.target.value)}
            >
              <option value="">{t("medecinsExternes.consultation.choisirPatient")}</option>
              {patients.map((p) => (
                <option key={p.dossierId} value={p.dossierId}>
                  {p.nomComplet} — {p.numeroDossier}
                </option>
              ))}
            </select>

            {dossierId ? (
              <>
                <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">
                    {t("medecinsExternes.examens.prescrire")}
                  </h3>
                  <div className="mt-3 space-y-4">
                    {typesParCategorie.map(([categorie, liste]) => (
                      <div key={categorie}>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire">
                          {categorie}
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {liste.map((type) => (
                            <label
                              key={type.id}
                              className="flex items-start gap-2 rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={selection.has(type.id)}
                                onChange={() => toggle(type.id)}
                                className="mt-0.5"
                              />
                              <span>
                                <span className="font-medium">{type.libelle}</span>
                                <span className="block text-xs text-texte-secondaire">
                                  {type.code} · ${type.prix}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={enCours}
                    onClick={() => void prescrire()}
                    className="mt-4 rounded-lg bg-bleu-medical px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {enCours ? (
                      <Loader2 className="inline h-4 w-4 animate-spin" />
                    ) : (
                      t("medecinsExternes.examens.boutonPrescrire")
                    )}
                  </button>
                </div>

                {message && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    {message}
                  </p>
                )}
                {erreur && <p className="text-sm text-red-600">{erreur}</p>}

                <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-semibold">
                    {t("medecinsExternes.examens.liste")}
                  </h3>
                  {examens.length === 0 ? (
                    <p className="mt-2 text-sm text-texte-secondaire">
                      {t("medecinsExternes.examens.vide")}
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y divide-gris-bordure">
                      {examens.map((e) => (
                        <li
                          key={e.id}
                          className="flex items-center justify-between py-2 text-sm"
                        >
                          <span>
                            {e.typeExamen.libelle}
                            <span className="ml-2 text-xs text-texte-secondaire">
                              {e.typeExamen.code}
                            </span>
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
                            {e.statut}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-texte-secondaire">
                {t("medecinsExternes.consultation.aideSelection")}
              </p>
            )}
          </>
        )}
      </div>
    </MiseEnPageMedecinsExternes>
  );
}
