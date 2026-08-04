"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Eye, FlaskConical, Loader2, Search } from "lucide-react";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import {
  PanneauDroitLaboratoire,
  SectionsMobileLaboratoire,
} from "@/features/laboratoire/panneau-droit-laboratoire";
import type { IdActionRapideLabo } from "@/features/laboratoire/actions-rapides-laboratoire";
import {
  codeTransfertLaboratoire,
  libellesExamensDemandes,
} from "@/features/laboratoire/utils-affichage";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";
import { cn } from "@/lib/utils";

function patientCorrespondStatut(
  p: PatientFileLaboratoire,
  statut: IdOrientationStatutAnalyse,
  orientationAttribuee?: string
) {
  if (orientationAttribuee) return orientationAttribuee === statut;

  switch (statut) {
    case "RECUS":
      return (
        p.examens.some((e) => e.statut === "PRESCRIT") &&
        !p.examens.some((e) => e.statut === "EN_ANALYSE")
      );
    case "EN_COURS":
      return p.examens.some((e) => e.statut === "EN_ANALYSE");
    case "VERIFIES":
      return p.examens.some((e) => e.statut === "TERMINE");
    case "REJETES":
      return p.examens.some((e) => e.statut === "ANNULE");
    case "DR_APPROUVE":
      return false;
    default:
      return false;
  }
}

interface PropsContenuExamensEnCoursLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  /** Page dédiée (Reçus, En cours, …) — sinon vue générale examens en cours */
  pageStatut?: IdOrientationStatutAnalyse;
  cheminBase?: string;
}

export function ContenuExamensEnCoursLaboratoire({
  utilisateur,
  pageStatut,
  cheminBase = "/sigh/laboratoire/examens-en-cours",
}: PropsContenuExamensEnCoursLaboratoire) {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierUrl = searchParams.get("dossier");
  const refRecherche = useRef<HTMLInputElement>(null);

  const [patients, setPatients] = useState<PatientFileLaboratoire[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [selectionId, setSelectionId] = useState<string | null>(dossierUrl);
  /** Orientation statut locale — persistance métier à brancher ensuite */
  const [orientationsParDossier, setOrientationsParDossier] = useState<
    Record<string, string>
  >({});
  const [messageAction, setMessageAction] = useState<string | null>(null);

  const titrePage = pageStatut
    ? t(`laboratoire.orientationsStatut.${pageStatut}.label`)
    : t("laboratoire.examensEnCours.titre");
  const sousTitrePage = pageStatut
    ? t(`laboratoire.orientationsStatut.${pageStatut}.description`)
    : t("laboratoire.examensEnCours.sousTitre");

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/laboratoire/patients");
      const data = (await res.json()) as {
        patients?: PatientFileLaboratoire[];
        erreur?: string;
      };
      if (!res.ok) {
        setErreur(data.erreur ?? t("laboratoire.examensEnCours.erreur"));
        setPatients([]);
        return;
      }
      setPatients(data.patients ?? []);
    } catch {
      setErreur(t("laboratoire.examensEnCours.erreur"));
    } finally {
      setChargement(false);
    }
  }, [t]);

  useEffect(() => {
    void charger();
  }, [charger]);

  const enCours = useMemo(() => {
    if (pageStatut) {
      return patients.filter((p) =>
        patientCorrespondStatut(p, pageStatut, orientationsParDossier[p.dossierId])
      );
    }
    return patients.filter((p) =>
      p.examens.some((e) => e.statut === "EN_ANALYSE")
    );
  }, [patients, pageStatut, orientationsParDossier]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return enCours;
    return enCours.filter((p) => {
      const blob = [
        p.nom,
        p.prenom,
        p.numeroDossier,
        p.numeroPatient,
        p.telephone ?? "",
        p.provenance,
        ...p.examens.map((e) => e.libelle),
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [enCours, recherche]);

  const patientSelectionne = useMemo(
    () => filtres.find((p) => p.dossierId === selectionId) ?? null,
    [filtres, selectionId]
  );

  const orientationCourante =
    (selectionId && orientationsParDossier[selectionId]) ||
    pageStatut ||
    "EN_COURS";

  useEffect(() => {
    if (dossierUrl) setSelectionId(dossierUrl);
  }, [dossierUrl]);

  const selectionner = (dossierId: string) => {
    setSelectionId(dossierId);
    setMessageAction(null);
    if (pageStatut && !orientationsParDossier[dossierId]) {
      setOrientationsParDossier((prev) => ({
        ...prev,
        [dossierId]: pageStatut,
      }));
    }
    router.replace(`${cheminBase}?dossier=${dossierId}`, {
      scroll: false,
    });
  };

  const changerOrientation = (id: string) => {
    if (!selectionId) {
      setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      return;
    }
    setOrientationsParDossier((prev) => ({ ...prev, [selectionId]: id }));
    setMessageAction(
      t("laboratoire.panneau.statutAttribue", {
        statut: t(`laboratoire.orientationsStatut.${id}.label`),
      })
    );
  };

  const onAction = (id: IdActionRapideLabo) => {
    setMessageAction(null);
    if (id === "rechercher") {
      refRecherche.current?.focus();
      refRecherche.current?.select();
      return;
    }
    if (!selectionId) {
      setMessageAction(t("laboratoire.panneau.selectionnerPatient"));
      return;
    }
    if (id === "saisie") {
      router.push("/sigh/laboratoire/saisie-resultats");
      return;
    }
    if (id === "valider") {
      router.push("/sigh/laboratoire/resultats-a-valider");
      return;
    }
    if (id === "imprimer") {
      setMessageAction(t("laboratoire.actions.aVenir"));
    }
  };

  const formatHeure = (iso: string) =>
    new Date(iso).toLocaleString(i18n.language || "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const libelleStatutOrientation = (dossierId: string) => {
    const id = orientationsParDossier[dossierId] ?? "EN_COURS";
    return t(`laboratoire.orientationsStatut.${id}.label`);
  };

  const propsPanneau = {
    variante: "examens" as const,
    patient: patientSelectionne,
    orientation: selectionId ? orientationCourante : null,
    onOrientationChange: changerOrientation,
    onAction,
  };

  return (
    <MiseEnPageLaboratoire
      utilisateur={utilisateur}
      titre={titrePage}
      sousTitre={sousTitrePage}
    >
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-texte-secondaire" />
            <input
              ref={refRecherche}
              type="search"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder={t("laboratoire.examensEnCours.recherche")}
              className="w-full rounded-xl border border-gris-bordure bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-bleu-medical focus:ring-2 focus:ring-bleu-medical/20"
            />
          </div>

          {erreur && (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {erreur}
            </p>
          )}
          {messageAction && (
            <p className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800">
              {messageAction}
            </p>
          )}

          {chargement ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-bleu-medical" />
            </div>
          ) : !filtres.length ? (
            <p className="rounded-xl border border-gris-bordure bg-white px-4 py-12 text-center text-sm text-texte-secondaire">
              {t("laboratoire.examensEnCours.vide")}
            </p>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm lg:block">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.transfert")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.patient")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.service")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.examensDemandes")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.heureTransfert")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.statut")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.analyste")}
                        </th>
                        <th className="px-3 py-3 font-semibold">
                          {t("laboratoire.patients.colonnes.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gris-bordure">
                      {filtres.map((p) => {
                        const selectionne = selectionId === p.dossierId;
                        const examensAnalyse = p.examens.filter(
                          (e) => e.statut === "EN_ANALYSE"
                        );
                        return (
                          <tr
                            key={p.dossierId}
                            id={`analyse-${p.dossierId}`}
                            onClick={() => selectionner(p.dossierId)}
                            className={cn(
                              "cursor-pointer transition-colors",
                              selectionne
                                ? "bg-bleu-medical-clair/40"
                                : "hover:bg-slate-50/80"
                            )}
                          >
                            <td className="px-3 py-3 font-mono text-xs font-semibold text-bleu-medical">
                              {codeTransfertLaboratoire(p)}
                            </td>
                            <td className="px-3 py-3">
                              <p className="font-semibold">
                                {p.nom} {p.prenom}
                              </p>
                              <p className="text-[11px] text-texte-secondaire">
                                {p.age != null ? `${p.age} ans` : "—"}
                                {p.sexe ? ` / ${p.sexe}` : ""}
                              </p>
                            </td>
                            <td className="px-3 py-3 text-xs text-texte-secondaire">
                              {p.provenance || "—"}
                            </td>
                            <td className="max-w-[200px] px-3 py-3 text-xs font-medium">
                              {examensAnalyse.length
                                ? examensAnalyse.map((e) => e.libelle).join(", ")
                                : libellesExamensDemandes(p)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-xs text-texte-secondaire">
                              {formatHeure(p.arriveeLe)}
                            </td>
                            <td className="px-3 py-3">
                              <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                {libelleStatutOrientation(p.dossierId)}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-xs text-texte-secondaire">
                              {utilisateur.prenom} {utilisateur.nom}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/sigh/laboratoire/patients?dossier=${p.dossierId}`
                                    );
                                  }}
                                  className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-texte-secondaire hover:text-bleu-medical"
                                  title={t("laboratoire.patients.ouvrirDossier")}
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectionner(p.dossierId);
                                    router.push(
                                      "/sigh/laboratoire/saisie-resultats"
                                    );
                                  }}
                                  className="inline-flex rounded-lg border border-gris-bordure p-1.5 text-amber-700 hover:bg-amber-50"
                                  title={t("laboratoire.actions.saisirResultat")}
                                >
                                  <FlaskConical className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <ul className="space-y-3 lg:hidden">
                {filtres.map((p) => (
                  <li key={p.dossierId}>
                    <button
                      type="button"
                      onClick={() => selectionner(p.dossierId)}
                      className={cn(
                        "w-full rounded-xl border bg-white p-4 text-left shadow-sm",
                        selectionId === p.dossierId
                          ? "border-bleu-medical ring-1 ring-bleu-medical/30"
                          : "border-gris-bordure"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold">
                            {p.nom} {p.prenom}
                          </p>
                          <p className="font-mono text-xs text-bleu-medical">
                            {codeTransfertLaboratoire(p)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {libelleStatutOrientation(p.dossierId)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-texte-secondaire">
                        {libellesExamensDemandes(p, 3)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <SectionsMobileLaboratoire {...propsPanneau} />
        </div>

        <div className="hidden xl:block">
          <PanneauDroitLaboratoire {...propsPanneau} />
        </div>
      </div>
    </MiseEnPageLaboratoire>
  );
}
