"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  Paperclip,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import type {
  ExamenSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";
import { cn } from "@/lib/utils";

interface PropsContenuSaisieResultatsLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  dossierId: string;
}

type ParametreEtat = ExamenSaisieDto["parametres"][number] & {
  valeur: string;
  nonRequis: boolean;
  selectionne: boolean;
};

type EtatExamen = Omit<ExamenSaisieDto, "parametres" | "remarque"> & {
  parametres: ParametreEtat[];
  remarque: string;
};

type FichierJoint = {
  id: string;
  nom: string;
  file: File;
  parametreId?: string;
};

function clonerEtat(saisie: SaisieResultatsDto): EtatExamen[] {
  return saisie.examens.map((ex) => ({
    ...ex,
    remarque: ex.remarque ?? "",
    parametres: ex.parametres.map((p) => ({
      ...p,
      valeur: p.valeur,
      nonRequis: p.nonRequis,
      selectionne: Boolean(p.valeur.trim()),
    })),
  }));
}

function genererIdFichier() {
  return `f-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ContenuSaisieResultatsLaboratoire({
  utilisateur,
  dossierId,
}: PropsContenuSaisieResultatsLaboratoire) {
  const { t } = useTranslation();
  const router = useRouter();
  const inputFichierRef = useRef<HTMLInputElement>(null);
  const cibleFichierRef = useRef<{ examenId: string; parametreId?: string } | null>(
    null
  );

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
  const [piecesJointesOuvertes, setPiecesJointesOuvertes] = useState<
    Record<string, boolean>
  >({});
  const [fichiersParExamen, setFichiersParExamen] = useState<
    Record<string, FichierJoint[]>
  >({});

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
    patch: Partial<{ valeur: string; nonRequis: boolean; selectionne: boolean }>
  ) => {
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id !== examenId
          ? ex
          : {
              ...ex,
              parametres: ex.parametres.map((p): ParametreEtat =>
                p.id !== parametreId
                  ? p
                  : {
                      ...p,
                      ...patch,
                      selectionne: patch.selectionne ?? p.selectionne,
                    }
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

  const effacerParametre = (examenId: string, parametreId: string) => {
    mettreAJourParametre(examenId, parametreId, {
      valeur: "",
      selectionne: false,
      nonRequis: false,
    });
  };

  const ouvrirSelecteurFichier = (examenId: string, parametreId?: string) => {
    cibleFichierRef.current = { examenId, parametreId };
    inputFichierRef.current?.click();
  };

  const onFichiersSelectionnes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cible = cibleFichierRef.current;
    const liste = event.target.files;
    if (!cible || !liste?.length) return;

    const nouveaux: FichierJoint[] = Array.from(liste).map((file) => ({
      id: genererIdFichier(),
      nom: file.name,
      file,
      parametreId: cible.parametreId,
    }));

    setFichiersParExamen((prev) => ({
      ...prev,
      [cible.examenId]: [...(prev[cible.examenId] ?? []), ...nouveaux],
    }));

    event.target.value = "";
    cibleFichierRef.current = null;
  };

  const retirerFichier = (examenId: string, fichierId: string) => {
    setFichiersParExamen((prev) => ({
      ...prev,
      [examenId]: (prev[examenId] ?? []).filter((f) => f.id !== fichierId),
    }));
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

  const parametresAvecValeur = (ex: EtatExamen) =>
    ex.parametres.filter((p) => p.valeur.trim() && !p.nonRequis);

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
      <input
        ref={inputFichierRef}
        type="file"
        multiple
        accept="*/*"
        className="hidden"
        onChange={onFichiersSelectionnes}
      />

      <div className="w-full space-y-4">
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
                const fichiers = fichiersParExamen[ex.id] ?? [];
                const pjOuvert = piecesJointesOuvertes[ex.id] ?? false;

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
                      <div className="grid min-h-[420px] grid-cols-1 lg:grid-cols-2">
                        {/* Colonne gauche — saisie */}
                        <div className="min-w-0 border-b border-gris-bordure lg:border-b-0 lg:border-r">
                          <div className="border-b border-gris-bordure bg-[#f1f5f9] px-4 py-2.5">
                            <p className="text-sm font-bold uppercase tracking-wide text-texte-principal">
                              {ex.libelle}
                            </p>
                          </div>

                          <div className="max-h-[520px] overflow-y-auto px-3 py-2 sm:px-4">
                            {ex.parametres.length === 0 ? (
                              <p className="py-6 text-center text-sm text-texte-secondaire">
                                {t("laboratoire.saisieResultats.aucunParametre")}
                              </p>
                            ) : (
                              <div className="divide-y divide-gris-bordure/60">
                                {ex.parametres.map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2.5"
                                  >
                                    <span className="w-full shrink-0 text-xs font-semibold uppercase tracking-wide text-texte-principal sm:w-[130px] sm:text-right">
                                      {p.nom}
                                    </span>
                                    <span className="hidden text-texte-secondaire sm:inline">
                                      :
                                    </span>
                                    <input
                                      type="checkbox"
                                      checked={p.selectionne}
                                      onChange={(e) =>
                                        mettreAJourParametre(ex.id, p.id, {
                                          selectionne: e.target.checked,
                                        })
                                      }
                                      className="h-3.5 w-3.5 shrink-0 rounded border-gris-bordure"
                                      title={p.nom}
                                    />
                                    <input
                                      type="text"
                                      value={p.valeur}
                                      disabled={p.nonRequis}
                                      placeholder={p.nom}
                                      onChange={(e) =>
                                        mettreAJourParametre(ex.id, p.id, {
                                          valeur: e.target.value,
                                          selectionne: e.target.value.trim().length > 0,
                                        })
                                      }
                                      className="min-w-[90px] flex-1 rounded border border-[#f0d4d8] bg-[#fffafa] px-2 py-1 text-sm disabled:bg-gris-tres-clair"
                                    />
                                    <span className="shrink-0 text-xs text-texte-secondaire">
                                      {p.unite ?? "—"}
                                    </span>
                                    <span className="shrink-0 text-[11px] text-texte-secondaire">
                                      {p.rangeUsuelle ?? "—"}
                                    </span>
                                    <label className="flex shrink-0 items-center gap-1 text-[11px] text-texte-secondaire">
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
                                    <button
                                      type="button"
                                      onClick={() => effacerParametre(ex.id, p.id)}
                                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gris-bordure text-texte-secondaire hover:bg-red-50 hover:text-red-600"
                                      aria-label={t(
                                        "laboratoire.saisieResultats.effacerValeur"
                                      )}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        ouvrirSelecteurFichier(ex.id, p.id)
                                      }
                                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-gris-bordure text-texte-secondaire hover:bg-sky-50 hover:text-sky-700"
                                      aria-label={t(
                                        "laboratoire.saisieResultats.joindreFichier"
                                      )}
                                    >
                                      <Plus className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gris-bordure">
                            <button
                              type="button"
                              onClick={() =>
                                setPiecesJointesOuvertes((prev) => ({
                                  ...prev,
                                  [ex.id]: !pjOuvert,
                                }))
                              }
                              className="flex w-full items-center justify-between bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-texte-principal"
                            >
                              <span className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4" />
                                {t("laboratoire.saisieResultats.piecesJointes")}
                                {fichiers.length > 0 && (
                                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">
                                    {fichiers.length}
                                  </span>
                                )}
                              </span>
                              {pjOuvert ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            {pjOuvert && (
                              <div className="space-y-2 px-4 py-3">
                                <p className="text-xs text-texte-secondaire">
                                  {t("laboratoire.saisieResultats.typesFichiersAcceptes")}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => ouvrirSelecteurFichier(ex.id)}
                                  className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gris-bordure px-3 py-2 text-sm text-texte-secondaire hover:bg-gris-tres-clair"
                                >
                                  <Plus className="h-4 w-4" />
                                  {t("laboratoire.saisieResultats.ajouterFichier")}
                                </button>
                                {fichiers.length > 0 && (
                                  <ul className="space-y-1">
                                    {fichiers.map((f) => (
                                      <li
                                        key={f.id}
                                        className="flex items-center justify-between gap-2 rounded border border-gris-bordure/70 px-2 py-1.5 text-xs"
                                      >
                                        <span className="min-w-0 truncate">
                                          {f.nom}
                                          {f.parametreId && (
                                            <span className="ml-1 text-texte-secondaire">
                                              (
                                              {ex.parametres.find(
                                                (p) => p.id === f.parametreId
                                              )?.nom ?? "—"}
                                              )
                                            </span>
                                          )}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => retirerFichier(ex.id, f.id)}
                                          className="shrink-0 text-red-600 hover:underline"
                                        >
                                          {t("laboratoire.saisieResultats.supprimerFichier")}
                                        </button>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="border-t border-gris-bordure px-4 py-3">
                            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-texte-principal">
                              <Pencil className="h-3.5 w-3.5" />
                              {t("laboratoire.saisieResultats.remarque")}
                            </label>
                            <textarea
                              value={ex.remarque}
                              onChange={(e) =>
                                mettreAJourRemarque(ex.id, e.target.value)
                              }
                              rows={3}
                              className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                              placeholder={t(
                                "laboratoire.saisieResultats.remarquePlaceholder"
                              )}
                            />
                          </div>

                          <div className="flex flex-wrap justify-end gap-2 border-t border-gris-bordure px-4 py-3">
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

                        {/* Colonne droite — aperçu temps réel */}
                        <div className="min-w-0 bg-white">
                          <div className="border-b border-gris-bordure bg-[#f8fafc] px-4 py-3">
                            <p className="text-sm font-bold text-texte-principal">
                              {t("laboratoire.saisieResultats.apercuResultats")}
                            </p>
                          </div>
                          <div className="px-4 py-4">
                            <p className="border-b border-gris-bordure pb-2 text-sm font-bold uppercase tracking-wide text-texte-principal">
                              {ex.libelle}
                            </p>
                            <div className="mt-4 space-y-2">
                              {parametresAvecValeur(ex).length === 0 ? (
                                <p className="text-sm text-texte-secondaire">
                                  —
                                </p>
                              ) : (
                                parametresAvecValeur(ex).map((p) => (
                                  <div
                                    key={p.id}
                                    className="flex flex-wrap items-baseline gap-x-2 text-sm"
                                  >
                                    <span className="font-semibold uppercase text-texte-principal">
                                      {p.nom}
                                    </span>
                                    <span className="text-texte-secondaire">:</span>
                                    <span className="font-medium text-texte-principal">
                                      {p.valeur}
                                    </span>
                                    {p.unite && (
                                      <span className="text-texte-secondaire">
                                        {p.unite}
                                      </span>
                                    )}
                                    {p.rangeUsuelle && (
                                      <span className="text-xs text-texte-secondaire">
                                        ({p.rangeUsuelle})
                                      </span>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                            {ex.remarque.trim() && (
                              <div className="mt-6 border-t border-gris-bordure pt-4">
                                <p className="text-xs font-semibold uppercase text-texte-secondaire">
                                  {t("laboratoire.saisieResultats.remarque")}
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-texte-principal">
                                  {ex.remarque}
                                </p>
                              </div>
                            )}
                            {fichiers.length > 0 && (
                              <div className="mt-6 border-t border-gris-bordure pt-4">
                                <p className="text-xs font-semibold uppercase text-texte-secondaire">
                                  {t("laboratoire.saisieResultats.piecesJointes")}
                                </p>
                                <ul className="mt-2 space-y-1 text-sm text-texte-principal">
                                  {fichiers.map((f) => (
                                    <li key={f.id} className="truncate">
                                      {f.nom}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
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
