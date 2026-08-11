"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  FlaskConical,
  Loader2,
  Menu,
} from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import type {
  ExamenSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats";
import { cn } from "@/lib/utils";

interface PropsContenuSaisieResultatsLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  dossierId: string;
}

type EtatExamen = ExamenSaisieDto & {
  parametres: (ExamenSaisieDto["parametres"][number] & {
    valeur: string;
    nonRequis: boolean;
  })[];
  remarque: string;
};

function clonerEtat(saisie: SaisieResultatsDto): EtatExamen[] {
  return saisie.examens.map((ex) => ({
    ...ex,
    remarque: ex.remarque ?? "",
    parametres: ex.parametres.map((p) => ({
      ...p,
      valeur: p.valeur,
      nonRequis: p.nonRequis,
    })),
  }));
}

export function ContenuSaisieResultatsLaboratoire({
  utilisateur,
  dossierId,
}: PropsContenuSaisieResultatsLaboratoire) {
  const { t } = useTranslation();
  const router = useRouter();
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [patient, setPatient] = useState<Omit<SaisieResultatsDto, "examens"> | null>(
    null
  );
  const [examens, setExamens] = useState<EtatExamen[]>([]);
  const [examenOuvertId, setExamenOuvertId] = useState<string | null>(null);
  const [idsCoches, setIdsCoches] = useState<Set<string>>(new Set());
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/laboratoire/dossiers/${encodeURIComponent(dossierId)}/saisie-resultats`
      );
      const data = (await res.json()) as {
        saisie?: SaisieResultatsDto;
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("laboratoire.saisieResultats.erreurChargement"));
        return;
      }
      if (!data.saisie) {
        setErreur(t("laboratoire.saisieResultats.dossierIntrouvable"));
        return;
      }
      const { examens: liste, ...infosPatient } = data.saisie;
      setPatient(infosPatient);
      setExamens(clonerEtat(data.saisie));
      setExamenOuvertId((courant) => courant ?? liste[0]?.id ?? null);
    } catch {
      setErreur(t("laboratoire.saisieResultats.erreurChargement"));
    } finally {
      setChargement(false);
    }
  }, [dossierId, t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const examenOuvert = useMemo(
    () => examens.find((e) => e.id === examenOuvertId) ?? null,
    [examens, examenOuvertId]
  );

  const toutCoche =
    examens.length > 0 && examens.every((e) => idsCoches.has(e.id));

  const basculerTout = () => {
    if (toutCoche) {
      setIdsCoches(new Set());
      return;
    }
    setIdsCoches(new Set(examens.map((e) => e.id)));
  };

  const basculerExamen = (id: string) => {
    setExamenOuvertId((courant) => (courant === id ? null : id));
  };

  const mettreAJourParametre = (
    examenId: string,
    parametreId: string,
    patch: Partial<{ valeur: string; nonRequis: boolean }>
  ) => {
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id !== examenId
          ? ex
          : {
              ...ex,
              parametres: ex.parametres.map((p) =>
                p.id !== parametreId ? p : { ...p, ...patch }
              ),
            }
      )
    );
  };

  const mettreAJourRemarque = (examenId: string, remarque: string) => {
    setExamens((prev) =>
      prev.map((ex) => (ex.id !== examenId ? ex : { ...ex, remarque }))
    );
  };

  const envoyer = async (options: { verifier?: boolean; passerSuivant?: boolean }) => {
    if (!examenOuvert) return;
    setSauvegardeEnCours(true);
    setMessage(null);
    setErreur(null);
    try {
      const res = await fetch(
        `/api/laboratoire/examens/${encodeURIComponent(examenOuvert.id)}/resultats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lignes: examenOuvert.parametres.map((p) => ({
              parametreTypeExamenId: p.id,
              valeur: p.valeur,
              nonRequis: p.nonRequis,
            })),
            remarque: examenOuvert.remarque,
            verifier: options.verifier === true,
          }),
        }
      );
      const data = (await res.json()) as { message?: string; erreur?: string };
      if (!res.ok) {
        setErreur(data.erreur ?? t("laboratoire.saisieResultats.erreurSauvegarde"));
        return;
      }
      setMessage(data.message ?? t("laboratoire.saisieResultats.enregistre"));

      if (options.passerSuivant) {
        const idx = examens.findIndex((e) => e.id === examenOuvert.id);
        const suivant = examens[idx + 1];
        if (suivant) {
          setExamenOuvertId(suivant.id);
        }
      }

      await charger();
    } catch {
      setErreur(t("laboratoire.saisieResultats.erreurSauvegarde"));
    } finally {
      setSauvegardeEnCours(false);
    }
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={t("laboratoire.saisieResultats.titre")}
      sousTitre={
        patient
          ? t("laboratoire.saisieResultats.sousTitrePatient", {
              nom: `${patient.prenom} ${patient.nom}`,
              numero: patient.numeroEnregistrement,
            })
          : t("laboratoire.saisieResultats.sousTitre")
      }
    >
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {patient && (
          <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-texte-principal">
                  {patient.prenom} {patient.nom}
                </p>
                <p className="mt-1 text-sm text-texte-secondaire">
                  {t("laboratoire.saisieResultats.numeroEnregistrement")} :{" "}
                  <span className="font-mono font-medium text-texte-principal">
                    {patient.numeroEnregistrement}
                  </span>
                  {patient.numeroTransfert && (
                    <>
                      {" · "}
                      {t("laboratoire.saisieResultats.numeroTransfert")} :{" "}
                      <span className="font-mono">{patient.numeroTransfert}</span>
                    </>
                  )}
                </p>
                <p className="text-sm text-texte-secondaire">
                  {patient.age != null ? `${patient.age} ans` : "—"}
                  {patient.sexe ? ` / ${patient.sexe}` : ""}
                  {patient.telephone ? ` · ${patient.telephone}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/sigh/laboratoire/patients")}
                className="rounded-lg border border-gris-bordure px-3 py-1.5 text-sm text-texte-secondaire hover:bg-gris-tres-clair"
              >
                {t("laboratoire.saisieResultats.retourListe")}
              </button>
            </div>
          </div>
        )}

        {chargement && (
          <div className="flex items-center justify-center gap-2 py-16 text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
            {t("laboratoire.saisieResultats.chargement")}
          </div>
        )}

        {!chargement && erreur && (
          <div className="rounded-xl border border-rouge-alerte/30 bg-rouge-alerte/5 px-4 py-3 text-sm text-rouge-alerte">
            {erreur}
          </div>
        )}

        {message && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        )}

        {!chargement && !erreur && examens.length === 0 && (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-12 text-center text-sm text-texte-secondaire">
            {t("laboratoire.saisieResultats.aucunExamen")}
          </div>
        )}

        {!chargement && examens.length > 0 && (
          <>
            <label className="flex items-center gap-2 text-sm font-medium text-texte-principal">
              <input
                type="checkbox"
                checked={toutCoche}
                onChange={basculerTout}
                className="h-4 w-4 rounded border-gris-bordure"
              />
              {t("laboratoire.saisieResultats.toutSelectionner")}
            </label>

            <div className="space-y-2">
              {examens.map((ex) => {
                const ouvert = examenOuvertId === ex.id;
                return (
                  <div
                    key={ex.id}
                    className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm"
                  >
                    <div
                      className={cn(
                        "flex items-center gap-2 border-b px-3 py-2.5 sm:px-4",
                        ouvert ? "border-gris-bordure bg-[#f8fafc]" : "border-transparent"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={idsCoches.has(ex.id)}
                        onChange={() => {
                          setIdsCoches((prev) => {
                            const next = new Set(prev);
                            if (next.has(ex.id)) next.delete(ex.id);
                            else next.add(ex.id);
                            return next;
                          });
                        }}
                        className="h-4 w-4 shrink-0 rounded border-gris-bordure"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <FlaskConical className="h-4 w-4 shrink-0 text-amber-700" />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => basculerExamen(ex.id)}
                      >
                        <span className="block text-sm font-semibold uppercase tracking-wide text-texte-principal">
                          {ex.libelle}
                        </span>
                        <span className="text-xs text-texte-secondaire">
                          {ex.code} · {ex.categorie} · {ex.prix} USD
                        </span>
                      </button>
                      <AlertTriangle className="hidden h-4 w-4 shrink-0 text-amber-500 sm:block" />
                      <button
                        type="button"
                        className="rounded p-1 text-texte-secondaire hover:bg-gris-tres-clair"
                        aria-label={t("laboratoire.saisieResultats.menuExamen")}
                      >
                        <Menu className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => basculerExamen(ex.id)}
                        className="rounded p-1 text-texte-secondaire hover:bg-gris-tres-clair"
                        aria-expanded={ouvert}
                        aria-label={
                          ouvert
                            ? t("laboratoire.saisieResultats.replier")
                            : t("laboratoire.saisieResultats.deplier")
                        }
                      >
                        {ouvert ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {ouvert && (
                      <div className="p-3 sm:p-4">
                        <div className="mb-3 hidden grid-cols-[1fr_120px_60px_100px_100px] gap-2 border-b border-gris-bordure pb-2 text-xs font-semibold uppercase tracking-wide text-texte-secondaire sm:grid">
                          <span>{t("laboratoire.saisieResultats.colParametre")}</span>
                          <span>{t("laboratoire.saisieResultats.colValeur")}</span>
                          <span>{t("laboratoire.saisieResultats.colUnite")}</span>
                          <span>{t("laboratoire.saisieResultats.colReference")}</span>
                          <span>{t("laboratoire.saisieResultats.colNonRequis")}</span>
                        </div>

                        <div className="space-y-3">
                          {ex.parametres.map((p) => (
                            <div
                              key={p.id}
                              className="grid gap-2 rounded-lg border border-gris-bordure/70 bg-[#fafbfc] p-3 sm:grid-cols-[1fr_120px_60px_100px_100px] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
                            >
                              <div>
                                <p className="text-sm font-medium text-texte-principal">
                                  {p.nom}
                                </p>
                              </div>
                              <input
                                type="text"
                                value={p.valeur}
                                disabled={p.nonRequis}
                                placeholder={p.nom}
                                onChange={(e) =>
                                  mettreAJourParametre(ex.id, p.id, {
                                    valeur: e.target.value,
                                  })
                                }
                                className="w-full rounded-lg border border-gris-bordure px-2.5 py-1.5 text-sm disabled:bg-gris-tres-clair"
                              />
                              <span className="text-sm text-texte-secondaire sm:text-center">
                                {p.unite ?? "—"}
                              </span>
                              <span className="text-xs text-texte-secondaire sm:text-center">
                                {p.rangeUsuelle ?? "—"}
                              </span>
                              <label className="flex items-center gap-1.5 text-xs text-texte-secondaire">
                                <input
                                  type="checkbox"
                                  checked={p.nonRequis}
                                  onChange={(e) =>
                                    mettreAJourParametre(ex.id, p.id, {
                                      nonRequis: e.target.checked,
                                    })
                                  }
                                  className="h-3.5 w-3.5 rounded border-gris-bordure"
                                />
                                {t("laboratoire.saisieResultats.nonRequis")}
                              </label>
                            </div>
                          ))}
                        </div>

                        {ex.parametres.length === 0 && (
                          <p className="py-4 text-center text-sm text-texte-secondaire">
                            {t("laboratoire.saisieResultats.aucunParametre")}
                          </p>
                        )}

                        <div className="mt-4 border-t border-gris-bordure pt-4">
                          <label className="mb-1.5 block text-sm font-medium text-texte-principal">
                            {t("laboratoire.saisieResultats.remarque")}
                          </label>
                          <textarea
                            value={ex.remarque}
                            onChange={(e) => mettreAJourRemarque(ex.id, e.target.value)}
                            rows={3}
                            className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                            placeholder={t("laboratoire.saisieResultats.remarquePlaceholder")}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gris-bordure pt-4">
                          <button
                            type="button"
                            onClick={() => setMessage(t("laboratoire.actions.aVenir"))}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
                          >
                            <FileText className="h-4 w-4" />
                            {t("laboratoire.saisieResultats.pdfView")}
                          </button>
                          <button
                            type="button"
                            disabled={sauvegardeEnCours}
                            onClick={() => void envoyer({})}
                            className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            {t("laboratoire.saisieResultats.enregistrer")}
                          </button>
                          <button
                            type="button"
                            disabled={sauvegardeEnCours}
                            onClick={() => void envoyer({ verifier: true })}
                            className="rounded-lg border border-gris-bordure px-4 py-2 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair disabled:opacity-50"
                          >
                            {t("laboratoire.saisieResultats.verifier")}
                          </button>
                          <button
                            type="button"
                            disabled={sauvegardeEnCours}
                            onClick={() =>
                              void envoyer({ verifier: true, passerSuivant: true })
                            }
                            className="rounded-lg border border-gris-bordure px-4 py-2 text-sm font-medium text-texte-principal hover:bg-gris-tres-clair disabled:opacity-50"
                          >
                            {t("laboratoire.saisieResultats.verifierSuivant")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MiseEnPageLaboratoire>
  );
}
