"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, FlaskConical, Loader2 } from "lucide-react";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { CHEMINS_STATUT_ANALYSE_LABO } from "@/constants/laboratoire-orientations";
import {
  FormulaireSaisieExamenLaboratoire,
  genererIdFichier,
  type EtatExamenForm,
  type ParametreEtat,
} from "@/features/laboratoire/formulaire-saisie-examen-laboratoire";
import {
  MiseEnPageLaboratoire,
  type UtilisateurLaboratoire,
} from "@/features/laboratoire/mise-en-page-laboratoire";
import { filtrerExamensSaisieParStatut } from "@/features/laboratoire/utils-affichage";
import type {
  ActionEnregistrementResultat,
  ExamenSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";
import { cn } from "@/lib/utils";

interface PropsContenuSaisieResultatsLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  dossierId: string;
}

type FichierJoint = {
  id: string;
  nom: string;
  file: File;
};

function clonerEtat(saisie: SaisieResultatsDto): EtatExamenForm[] {
  return saisie.examens.map((ex) => ({
    id: ex.id,
    code: ex.code,
    libelle: ex.libelle,
    categorie: ex.categorie,
    prix: ex.prix,
    statut: ex.statut,
    orientationAnalyse: ex.orientationAnalyse,
    remarque: ex.remarque ?? "",
    parametres: ex.parametres.map((p) => ({
      ...p,
      valeur: p.valeur,
      nonRequis: p.nonRequis,
      commentaire: p.commentaire ?? "",
    })),
  }));
}

function genererIdParametrePerso() {
  return `perso-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ContenuSaisieResultatsLaboratoire({
  utilisateur,
  dossierId,
}: PropsContenuSaisieResultatsLaboratoire) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const statutFiltre = searchParams.get("statut") as IdOrientationStatutAnalyse | null;
  const examenIdFiltre = searchParams.get("examen");

  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [patient, setPatient] = useState<Omit<SaisieResultatsDto, "examens"> | null>(
    null
  );
  const [examens, setExamens] = useState<EtatExamenForm[]>([]);
  const [examenOuvertId, setExamenOuvertId] = useState<string | null>(null);
  const [sauvegardeEnCours, setSauvegardeEnCours] = useState(false);
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

  const examensAffichables = useMemo(() => {
    let list = examens;
    if (statutFiltre) {
      list = filtrerExamensSaisieParStatut(list, statutFiltre);
    }
    if (examenIdFiltre) {
      list = list.filter((e) => e.id === examenIdFiltre);
    }
    return list;
  }, [examens, statutFiltre, examenIdFiltre]);

  useEffect(() => {
    if (examensAffichables.length === 0) return;
    setExamenOuvertId((courant) => {
      if (courant && examensAffichables.some((e) => e.id === courant)) {
        return courant;
      }
      if (
        examenIdFiltre &&
        examensAffichables.some((e) => e.id === examenIdFiltre)
      ) {
        return examenIdFiltre;
      }
      return examensAffichables[0]!.id;
    });
  }, [examensAffichables, examenIdFiltre]);

  const examenOuvert = useMemo(
    () => examensAffichables.find((e) => e.id === examenOuvertId) ?? null,
    [examensAffichables, examenOuvertId]
  );

  const mettreAJourExamen = (examenId: string, patch: Partial<EtatExamenForm>) => {
    setExamens((prev) =>
      prev.map((ex) => (ex.id !== examenId ? ex : { ...ex, ...patch }))
    );
  };

  const mettreAJourParametre = (
    examenId: string,
    parametreId: string,
    patch: Partial<Pick<ParametreEtat, "valeur" | "nonRequis" | "nom" | "commentaire">>
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

  const ajouterParametrePerso = (examenId: string, nom: string) => {
    const nomTrim = nom.trim();
    if (!nomTrim) return;
    const nouveau: ParametreEtat = {
      id: genererIdParametrePerso(),
      nom: nomTrim,
      unite: null,
      rangeUsuelle: null,
      obligatoire: false,
      ordre: 9999,
      valeur: "",
      nonRequis: false,
      commentaire: "",
      personnalise: true,
    };
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id !== examenId
          ? ex
          : { ...ex, parametres: [...ex.parametres, nouveau] }
      )
    );
  };

  const supprimerParametrePerso = (examenId: string, parametreId: string) => {
    setExamens((prev) =>
      prev.map((ex) =>
        ex.id !== examenId
          ? ex
          : {
              ...ex,
              parametres: ex.parametres.filter((p) => p.id !== parametreId),
            }
      )
    );
  };

  const envoyer = async (options: {
    action: ActionEnregistrementResultat;
    passerSuivant?: boolean;
  }) => {
    if (!examenOuvert) return;
    setSauvegardeEnCours(true);
    setMessage(null);
    setErreur(null);

    const lignesCatalogue = examenOuvert.parametres.filter((p) => !p.personnalise);

    try {
      const res = await fetch(
        `/api/laboratoire/examens/${encodeURIComponent(examenOuvert.id)}/resultats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lignes: lignesCatalogue.map((p) => ({
              parametreTypeExamenId: p.id,
              valeur: p.valeur,
              nonRequis: p.nonRequis,
              commentaire: p.commentaire?.trim() || null,
            })),
            remarque: examenOuvert.remarque,
            action: options.action,
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
        const idx = examensAffichables.findIndex((e) => e.id === examenOuvert.id);
        const suivant = examensAffichables[idx + 1];
        if (suivant) {
          setExamenOuvertId(suivant.id);
          await charger();
          return;
        }
      }

      const cheminParAction: Record<ActionEnregistrementResultat, string> = {
        brouillon: CHEMINS_STATUT_ANALYSE_LABO.EN_COURS,
        verifier: CHEMINS_STATUT_ANALYSE_LABO.VERIFIES,
        rejeter: CHEMINS_STATUT_ANALYSE_LABO.REJETES,
        approuver: CHEMINS_STATUT_ANALYSE_LABO.DR_APPROUVE,
      };
      router.push(
        `${cheminParAction[options.action]}?dossier=${encodeURIComponent(dossierId)}`
      );
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
      <div className="w-full space-y-4">
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

        {!chargement && !erreur && examensAffichables.length === 0 && (
          <div className="rounded-xl border border-dashed border-gris-bordure bg-white px-6 py-12 text-center text-sm text-texte-secondaire">
            {t("laboratoire.saisieResultats.aucunExamen")}
          </div>
        )}

        {!chargement && examensAffichables.length > 0 && (
          <div className="space-y-3">
            {examensAffichables.map((ex) => {
              const ouvert = examenOuvertId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExamenOuvertId((c) => (c === ex.id ? null : ex.id))
                    }
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      ouvert ? "border-b border-slate-200 bg-violet-50/50" : "hover:bg-slate-50"
                    )}
                  >
                    <FlaskConical className="h-4 w-4 shrink-0 text-violet-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold uppercase text-slate-900">
                        {ex.libelle}
                      </span>
                      <span className="text-xs text-slate-500">
                        {ex.code} · {ex.categorie}
                      </span>
                    </span>
                    {ouvert ? (
                      <ChevronUp className="h-4 w-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500" />
                    )}
                  </button>

                  {ouvert && patient && (
                    <FormulaireSaisieExamenLaboratoire
                      examen={ex}
                      patient={patient}
                      fichiers={fichiersParExamen[ex.id] ?? []}
                      sauvegardeEnCours={sauvegardeEnCours}
                      onParametreChange={(parametreId, patch) =>
                        mettreAJourParametre(ex.id, parametreId, patch)
                      }
                      onRemarqueChange={(remarque) =>
                        mettreAJourExamen(ex.id, { remarque })
                      }
                      onAjouterParametre={(nom) => ajouterParametrePerso(ex.id, nom)}
                      onSupprimerParametre={(parametreId) =>
                        supprimerParametrePerso(ex.id, parametreId)
                      }
                      onFichiersAjoutes={(files) => {
                        const nouveaux = files.map((file) => ({
                          id: genererIdFichier(),
                          nom: file.name,
                          file,
                        }));
                        setFichiersParExamen((prev) => ({
                          ...prev,
                          [ex.id]: [...(prev[ex.id] ?? []), ...nouveaux],
                        }));
                      }}
                      onFichierRetire={(fichierId) => {
                        setFichiersParExamen((prev) => ({
                          ...prev,
                          [ex.id]: (prev[ex.id] ?? []).filter((f) => f.id !== fichierId),
                        }));
                      }}
                      onAnnuler={() => setExamenOuvertId(null)}
                      onBrouillon={() => void envoyer({ action: "brouillon" })}
                      onValider={() =>
                        void envoyer({ action: "verifier", passerSuivant: true })
                      }
                      onRejeter={() => void envoyer({ action: "rejeter" })}
                      onApprouver={() => void envoyer({ action: "approuver" })}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MiseEnPageLaboratoire>
  );
}
