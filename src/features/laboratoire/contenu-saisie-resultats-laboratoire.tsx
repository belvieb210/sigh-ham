"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, FlaskConical, Loader2 } from "lucide-react";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
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
import {
  determinerNavigationApresSauvegardeResultat,
  filtrerExamensSaisieParStatut,
} from "@/features/laboratoire/utils-affichage";
import { EVENT_RAFRAICHIR_NOTIFICATIONS } from "@/features/notifications/utilitaires-notifications";
import type {
  ActionEnregistrementResultat,
  ExamenSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";
import { televerserPieceJointeLaboratoire } from "@/features/laboratoire/televerser-piece-jointe-laboratoire";
import { cn } from "@/lib/utils";
import { afficherNumeroVisite } from "@/lib/numeros/affichage";
import {
  appliquerCalculsAutomatiques,
  validerCalculsPourVerification,
} from "@/lib/laboratoire/calculs-automatiques";

interface PropsContenuSaisieResultatsLaboratoire {
  utilisateur: UtilisateurLaboratoire;
  dossierId: string;
}

type FichierJoint = {
  id: string;
  nom: string;
  file?: File;
  url?: string;
  mimeType?: string;
};

function appliquerCalculsSurExamen(ex: EtatExamenForm): EtatExamenForm {
  const resultat = appliquerCalculsAutomatiques(ex.formulaire, ex.parametres);
  return {
    ...ex,
    parametres: resultat.parametres,
    calculsMeta: resultat.meta,
  };
}

function clonerEtat(saisie: SaisieResultatsDto): EtatExamenForm[] {
  return saisie.examens.map((ex) =>
    appliquerCalculsSurExamen({
      id: ex.id,
      code: ex.code,
      libelle: ex.libelle,
      categorie: ex.categorie,
      prix: ex.prix,
      statut: ex.statut,
      orientationAnalyse: ex.orientationAnalyse,
      formulaire: ex.formulaire,
      remarque: ex.remarque ?? "",
      parametres: ex.parametres.map((p) => ({
        ...p,
        valeur: p.valeur,
        flag: p.flag,
        valeurSecondaire: p.valeurSecondaire,
        nonRequis: p.nonRequis,
        commentaire: p.commentaire ?? "",
        personnalise: p.personnalise === true,
      })),
    })
  );
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
  const statutFiltreUrl = searchParams.get("statut") as IdOrientationStatutAnalyse | null;
  const examenIdFiltre = searchParams.get("examen");
  const [statutAffichage, setStatutAffichage] =
    useState<IdOrientationStatutAnalyse | null>(statutFiltreUrl);
  const statutFiltre = statutAffichage;

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

  const rechargerDonnees = useCallback(
    async (options?: {
      silencieux?: boolean;
      appliquerEtat?: boolean;
    }): Promise<{
      clones: EtatExamenForm[];
      infosPatient: Omit<SaisieResultatsDto, "examens">;
      fichiers: Record<string, FichierJoint[]>;
    } | null> => {
      if (!options?.silencieux) {
        setChargement(true);
      }
      setErreur(null);
      try {
        const inclureRejetes = statutFiltreUrl === "REJETES" ? "1" : "0";
        const res = await fetch(
          `/api/laboratoire/dossiers/${encodeURIComponent(dossierId)}/saisie-resultats?inclureRejetes=${inclureRejetes}`
        );
        const data = (await res.json()) as {
          saisie?: SaisieResultatsDto;
          erreur?: string;
        };
        if (!res.ok) {
          setErreur(data.erreur ?? t("laboratoire.saisieResultats.erreurChargement"));
          return null;
        }
        if (!data.saisie) {
          setErreur(t("laboratoire.saisieResultats.dossierIntrouvable"));
          return null;
        }
        const { examens: liste, ...infosPatient } = data.saisie;
        const clones = clonerEtat(data.saisie);
        const fichiers = Object.fromEntries(
          liste.map((ex) => [
            ex.id,
            ex.piecesJointes.map((pj, idx) => ({
              id: `persist-${idx}-${pj.url}`,
              nom: pj.nom,
              url: pj.url,
              mimeType: pj.mimeType,
            })),
          ])
        );
        if (options?.appliquerEtat !== false) {
          setPatient(infosPatient);
          setExamens(clones);
          setFichiersParExamen(fichiers);
          if (!options?.silencieux) {
            setExamenOuvertId((courant) => courant ?? liste[0]?.id ?? null);
          }
        }
        return { clones, infosPatient, fichiers };
      } catch {
        setErreur(t("laboratoire.saisieResultats.erreurChargement"));
        return null;
      } finally {
        if (!options?.silencieux) {
          setChargement(false);
        }
      }
    },
    [dossierId, t, statutFiltreUrl]
  );

  const charger = useCallback(async () => {
    await rechargerDonnees();
  }, [rechargerDonnees]);

  useEffect(() => {
    void charger();
  }, [charger]);

  useEffect(() => {
    setStatutAffichage(statutFiltreUrl);
  }, [statutFiltreUrl]);

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

  const construireUrlRetourSaisie = useCallback(
    (examenId: string) => {
      const params = new URLSearchParams();
      if (statutFiltre) params.set("statut", statutFiltre);
      params.set("examen", examenId);
      return `/sigh/laboratoire/saisie-resultats/${encodeURIComponent(dossierId)}?${params.toString()}`;
    },
    [dossierId, statutFiltre]
  );

  const construireLienHistorique = useCallback(
    (examenId: string) => {
      const retour = construireUrlRetourSaisie(examenId);
      return `/sigh/laboratoire/saisie-resultats/${encodeURIComponent(dossierId)}/historique/${encodeURIComponent(examenId)}?retour=${encodeURIComponent(retour)}`;
    },
    [construireUrlRetourSaisie, dossierId]
  );

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
    patch: Partial<
      Pick<
        ParametreEtat,
        "valeur" | "flag" | "valeurSecondaire" | "nonRequis" | "nom" | "commentaire"
      >
    >
  ) => {
    setExamens((prev) =>
      prev.map((ex) => {
        if (ex.id !== examenId) return ex;
        const parametres = ex.parametres.map((p) =>
          p.id !== parametreId ? p : { ...p, ...patch }
        );
        return appliquerCalculsSurExamen({ ...ex, parametres });
      })
    );
  };

  const ajouterParametrePerso = (examenId: string, nom: string) => {
    const nomTrim = nom.trim();
    if (!nomTrim) return;
    const dejaPresent = examens
      .find((ex) => ex.id === examenId)
      ?.parametres.some(
        (p) => p.nom.trim().toUpperCase() === nomTrim.toUpperCase()
      );
    if (dejaPresent) {
      setErreur(`Le paramètre « ${nomTrim} » existe déjà.`);
      return;
    }
    const nouveau: ParametreEtat = {
      id: genererIdParametrePerso(),
      nom: nomTrim,
      unite: null,
      rangeUsuelle: null,
      obligatoire: false,
      ordre: 9999,
      valeur: "",
      flag: null,
      valeurSecondaire: null,
      nonRequis: false,
      commentaire: "",
      personnalise: true,
      configSaisie: { typeSaisie: "texte" },
    };
    setErreur(null);
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

    if (options.action === "verifier") {
      const erreurCalcul = validerCalculsPourVerification(
        examenOuvert.formulaire,
        examenOuvert.parametres
      );
      if (erreurCalcul) {
        setErreur(erreurCalcul);
        return;
      }
    }

    setSauvegardeEnCours(true);
    setMessage(null);
    setErreur(null);

    try {
      const fichiers = fichiersParExamen[examenOuvert.id] ?? [];
      const piecesJointes: {
        nom: string;
        url: string;
        mimeType: string;
        taille?: number;
      }[] = [];

      for (const f of fichiers) {
        if (f.file) {
          const upload = await televerserPieceJointeLaboratoire(
            examenOuvert.id,
            f.file
          );
          piecesJointes.push(upload);
        } else if (f.url) {
          piecesJointes.push({
            nom: f.nom,
            url: f.url,
            mimeType: f.mimeType ?? "application/octet-stream",
          });
        }
      }

      const lignes = examenOuvert.parametres;
      const res = await fetch(
        `/api/laboratoire/examens/${encodeURIComponent(examenOuvert.id)}/resultats`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lignes: lignes.map((p) =>
              p.personnalise
                ? {
                    personnalise: true,
                    nom: p.nom,
                    resultatId: p.id,
                    valeur: p.valeur,
                    valeurSecondaire: p.valeurSecondaire,
                    nonRequis: p.nonRequis,
                    commentaire: p.commentaire?.trim() || null,
                  }
                : {
                    parametreTypeExamenId: p.id,
                    valeur: p.valeur,
                    valeurSecondaire: p.valeurSecondaire,
                    nonRequis: p.nonRequis,
                    commentaire: p.commentaire?.trim() || null,
                  }
            ),
            remarque: examenOuvert.remarque,
            piecesJointes,
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

      window.dispatchEvent(new CustomEvent(EVENT_RAFRAICHIR_NOTIFICATIONS));

      const charge = await rechargerDonnees({
        silencieux: true,
        appliquerEtat: false,
      });
      if (!charge) return;

      const navigation = determinerNavigationApresSauvegardeResultat({
        statutOrigine: statutFiltre,
        action: options.action,
        dossierId,
        examens: charge.clones,
        passerSuivant: options.passerSuivant,
        examenCourantId: examenOuvert.id,
      });

      if (navigation.type === "rester-saisie") {
        if (navigation.statutSaisie) {
          setStatutAffichage(navigation.statutSaisie);
        }
        setPatient(charge.infosPatient);
        setExamens(charge.clones);
        setFichiersParExamen(charge.fichiers);
        setExamenOuvertId(navigation.examenId);
        const statutUrl = navigation.statutSaisie ?? statutFiltre;
        if (statutUrl) {
          router.replace(
            `/sigh/laboratoire/saisie-resultats/${dossierId}?statut=${statutUrl}`,
            { scroll: false }
          );
        }
        return;
      }

      setPatient(charge.infosPatient);
      setExamens(charge.clones);
      setFichiersParExamen(charge.fichiers);
      router.push(navigation.chemin);
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
              numero: afficherNumeroVisite(patient.numeroDossier),
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
                      onRejeter={() =>
                        void envoyer({ action: "rejeter", passerSuivant: true })
                      }
                      onApprouver={() =>
                        void envoyer({ action: "approuver", passerSuivant: true })
                      }
                      onRestaurer={() =>
                        void envoyer({ action: "restaurer", passerSuivant: true })
                      }
                      onSupprimer={() => {
                        if (
                          !window.confirm(
                            t("laboratoire.saisieResultats.confirmerSuppressionExamen")
                          )
                        ) {
                          return;
                        }
                        void envoyer({ action: "supprimer", passerSuivant: true });
                      }}
                      lienHistorique={construireLienHistorique(ex.id)}
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
