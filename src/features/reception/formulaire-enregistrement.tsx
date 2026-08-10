"use client";

import { useCallback, useEffect, useState, forwardRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useEspaceApi } from "@/features/reception/contexte-espace-api";
import {
  Upload,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Save,
  User,
  ArrowRightLeft,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  CLASSE_CHAMP_RECEPTION,
  CLASSE_LABEL_RECEPTION,
  ETAPES_ENREGISTREMENT,
  GROUPES_SANGUINS,
  ORIENTATIONS_RECEPTION,
} from "@/constants/reception";
import { ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES } from "@/constants/medecins-externes";
import { useTraductionsReception } from "@/hooks/use-traductions-reception";
import { ZonePhotoPatient } from "@/features/reception/zone-photo-patient";
import { SelectionExamensInitiaux } from "@/features/reception/selection-examens-initiaux";
import { SectionEstimationExamens } from "@/features/reception/section-estimation-examens";
import { ChampDateNaissance } from "@/features/reception/champ-date-naissance";
import { useResumePatient } from "@/features/reception/contexte-resume-patient";
import { cn } from "@/lib/utils";
import type { DonneesFormulairePatient, TypeExamenReception } from "@/lib/reception/types";

type VarianteFormulaire = "apercu" | "complet";

interface EtatFormulairePatient {
  typeVisite: string;
  nom: string;
  prenom: string;
  postNom: string;
  dateNaissance: string;
  telephone: string;
  telephoneSecondaire: string;
  email: string;
  etatCivil: string;
  adresse: string;
  commune: string;
  ville: string;
  pays: string;
  contactUrgence: string;
  telephoneUrgence: string;
  profession: string;
  employeur: string;
  groupeSanguin: string;
  assurance: string;
  numeroAssurance: string;
  numeroPieceIdentite: string;
  observations: string;
}

const ETAT_INITIAL_FORMULAIRE: EtatFormulairePatient = {
  typeVisite: "nouveau",
  nom: "",
  prenom: "",
  postNom: "",
  dateNaissance: "",
  telephone: "",
  telephoneSecondaire: "",
  email: "",
  etatCivil: "",
  adresse: "",
  commune: "",
  ville: "Kinshasa",
  pays: "RDC",
  contactUrgence: "",
  telephoneUrgence: "",
  profession: "",
  employeur: "",
  groupeSanguin: "",
  assurance: "",
  numeroAssurance: "",
  numeroPieceIdentite: "",
  observations: "",
};

interface PropsFormulaireEnregistrement {
  /** apercu = accueil réception (compact) | complet = page Nouveau patient */
  variante?: VarianteFormulaire;
  /** Données injectées depuis la liste des patients récents ou mode édition */
  donneesPrefill?: DonneesFormulairePatient | null;
  /** Callback après application du préremplissage */
  onPrefillApplique?: () => void;
  /** Mode modification d'un patient existant (page nouveau?modifier=) */
  modeEdition?: boolean;
  /** Agent connecté (affiché sur le devis PDF) */
  agentNom?: string;
}

function mapperPrefillVersEtat(donnees: DonneesFormulairePatient): EtatFormulairePatient {
  return {
    typeVisite: donnees.typeVisite || "ancien",
    nom: donnees.nom,
    prenom: donnees.prenom,
    postNom: donnees.postNom,
    dateNaissance: donnees.dateNaissance,
    telephone: donnees.telephone,
    telephoneSecondaire: donnees.telephoneSecondaire,
    email: donnees.email,
    etatCivil: donnees.etatCivil,
    adresse: donnees.adresse,
    commune: donnees.commune,
    ville: donnees.ville || "Kinshasa",
    pays: donnees.pays || "RDC",
    contactUrgence: donnees.contactUrgence,
    telephoneUrgence: donnees.telephoneUrgence,
    profession: donnees.profession,
    employeur: donnees.employeur,
    groupeSanguin: donnees.groupeSanguin,
    assurance: donnees.assurance,
    numeroAssurance: donnees.numeroAssurance,
    numeroPieceIdentite: donnees.numeroPieceIdentite,
    observations: donnees.observations,
  };
}

export const FormulaireEnregistrement = forwardRef<
  HTMLElement,
  PropsFormulaireEnregistrement
>(function FormulaireEnregistrement(
  {
    variante = "apercu",
    donneesPrefill,
    onPrefillApplique,
    modeEdition = false,
    agentNom = "",
  },
  ref
) {
  const espace = useEspaceApi();
  const router = useRouter();
  const { t } = useTranslation();
  const {
    etapesDesktop,
    etapesMobile,
    typesPatient,
    etatsCivils,
    motifsPrincipaux,
    assurances,
    groupesSanguins,
  } = useTraductionsReception();
  const estComplet = variante === "complet";
  const { definirDepuisFormulaire, reinitialiserResume } = useResumePatient();

  const [etape, setEtape] = useState(0);
  const [sexe, setSexe] = useState<"MASCULIN" | "FEMININ">("FEMININ");
  const [plusInfos, setPlusInfos] = useState(estComplet);
  const [formulaire, setFormulaire] = useState<EtatFormulairePatient>(ETAT_INITIAL_FORMULAIRE);
  const [numeroEnregistrement, setNumeroEnregistrement] = useState(
    estComplet ? "—" : "20260101001"
  );
  const [numeroPatientActif, setNumeroPatientActif] = useState<string | null>(null);
  const [dossierIdActif, setDossierIdActif] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [photoPatient, setPhotoPatient] = useState<File | null>(null);
  const [photoUrlExistante, setPhotoUrlExistante] = useState<string | null>(null);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);
  const [aujourdhui, setAujourdhui] = useState("");
  const [heure, setHeure] = useState("");
  const [motifPrincipal, setMotifPrincipal] = useState("");
  const [motifAutreTexte, setMotifAutreTexte] = useState("");
  const [descriptionMotif, setDescriptionMotif] = useState("");
  const [examensSelectionnes, setExamensSelectionnes] = useState<TypeExamenReception[]>([]);
  const [medecinResponsable, setMedecinResponsable] = useState("");
  const [remise, setRemise] = useState(0);
  const [modeEstimation, setModeEstimation] = useState(false);
  const [orientation, setOrientation] = useState<string>(
    espace.orientationDefaut ?? "INFIRMIERS"
  );
  const [paroisse, setParoisse] = useState("");
  const [dateMariage, setDateMariage] = useState("");
  const [conjointNom, setConjointNom] = useState("");

  const motifEstAutre = motifPrincipal === "autre";
  const champsEglise = Boolean(espace.afficherChampsEglise);
  const estMedecinsExternes = espace.prefixeApi.includes("medecins-externes");
  const orientationsWizard = estMedecinsExternes
    ? ORIENTATIONS_RAPIDES_MEDECINS_EXTERNES.map((o) => ({
        value: o.value,
        label: o.label,
        desc: o.description,
      }))
    : ORIENTATIONS_RECEPTION;

  const majFormulaire = useCallback(
    (champ: keyof EtatFormulairePatient, valeur: string) => {
      setFormulaire((f) => ({ ...f, [champ]: valeur }));
    },
    []
  );

  const majDateHeureActuelles = useCallback(() => {
    const now = new Date();
    setAujourdhui(now.toLocaleDateString("fr-FR"));
    setHeure(
      now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }, []);

  useEffect(() => {
    majDateHeureActuelles();
  }, [majDateHeureActuelles]);

  useEffect(() => {
    if (!estComplet || modeEdition) return;

    let annule = false;

    fetch(`${espace.prefixeApi}/numeros`)
      .then(async (res) => {
        if (!res.ok) throw new Error(t("reception.erreurs.numerosIndisponibles"));
        return res.json() as Promise<{
          numeroPatient: string;
          numeroEnregistrement: string;
        }>;
      })
      .then((data) => {
        if (annule) return;
        setNumeroEnregistrement(data.numeroEnregistrement);
        setNumeroPatientActif(data.numeroPatient);
      })
      .catch(() => {
        if (!annule) setErreur(t("reception.erreurs.numerosImpossible"));
      });

    return () => {
      annule = true;
    };
  }, [estComplet, modeEdition, t]);

  useEffect(() => {
    if (!donneesPrefill) return;
    /** Prefill accueil (aperçu) ou édition complète */
    if (estComplet && !modeEdition) return;

    setFormulaire(mapperPrefillVersEtat(donneesPrefill));
    setSexe(donneesPrefill.sexe);
    setNumeroEnregistrement(donneesPrefill.numeroEnregistrement);
    setNumeroPatientActif(donneesPrefill.numeroPatient);
    setDossierIdActif(donneesPrefill.dossierId ?? null);
    setAujourdhui(donneesPrefill.dateEnregistrement);
    setHeure(donneesPrefill.heureEnregistrement);
    setPhotoUrlExistante(donneesPrefill.photoUrl);
    setPhotoPatient(null);
    setPlusInfos(true);
    setEtape(0);
    setErreur(null);
    onPrefillApplique?.();
  }, [donneesPrefill, estComplet, modeEdition, onPrefillApplique]);

  useEffect(() => {
    definirDepuisFormulaire({
      nom: formulaire.nom,
      prenom: formulaire.prenom,
      typeVisite: formulaire.typeVisite,
      dateNaissance: formulaire.dateNaissance,
      telephone: formulaire.telephone,
      adresse: formulaire.adresse,
      commune: formulaire.commune,
      ville: formulaire.ville,
      assurance: formulaire.assurance,
      numeroPatient: numeroPatientActif,
      dossierId: dossierIdActif,
      photoUrl: photoUrlExistante,
    });
  }, [formulaire, numeroPatientActif, photoUrlExistante, definirDepuisFormulaire]);

  useEffect(() => {
    if (!champsEglise || estComplet || etape !== 2) return;
    if (examensSelectionnes.length > 0) return;

    let annule = false;
    fetch(`${espace.prefixeApi}/examens?pack=prenuptial`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json() as Promise<{ examens: TypeExamenReception[] }>;
      })
      .then((data) => {
        if (annule || !data?.examens?.length) return;
        setExamensSelectionnes(data.examens);
      })
      .catch(() => {
        /* ignore */
      });

    return () => {
      annule = true;
    };
  }, [champsEglise, estComplet, etape, examensSelectionnes.length, espace.prefixeApi]);

  const reinitialiser = () => {
    setEtape(0);
    setSexe("FEMININ");
    setPlusInfos(estComplet);
    setFormulaire(ETAT_INITIAL_FORMULAIRE);
    setPhotoPatient(null);
    setPhotoUrlExistante(null);
    setErreurPhoto(null);
    setErreur(null);
    setNumeroPatientActif(null);
    setDossierIdActif(null);
    setMotifPrincipal("");
    setMotifAutreTexte("");
    setDescriptionMotif("");
    setExamensSelectionnes([]);
    setMedecinResponsable("");
    setModeEstimation(false);
    setOrientation(espace.orientationDefaut ?? "INFIRMIERS");
    setParoisse("");
    setDateMariage("");
    setConjointNom("");
    if (!estComplet) {
      setNumeroEnregistrement("20260101001");
      majDateHeureActuelles();
    }
    reinitialiserResume();
  };

  const annuler = () => {
    if (estComplet) {
      router.push(modeEdition ? `${espace.cheminBase}/enregistres` : espace.cheminBase);
    } else {
      reinitialiser();
    }
  };

  const etapeSuivante = () => {
    if (etape === 2 && !medecinResponsable.trim()) {
      setErreur(t("reception.erreurs.medecinObligatoire"));
      return;
    }
    setErreur(null);
    setEtape((e) => Math.min(e + 1, ETAPES_ENREGISTREMENT.length - 1));
  };

  const enregistrer = async () => {
    if (!estComplet || enCours) return;

    setErreur(null);
    setErreurPhoto(null);
    setEnCours(true);

    try {
      const formData = new FormData();
      Object.entries(formulaire).forEach(([cle, valeur]) => {
        formData.append(cle, valeur);
      });
      formData.append("sexe", sexe);
      if (photoPatient) formData.append("photo", photoPatient);
      if (champsEglise) {
        formData.append("paroisse", paroisse);
        formData.append("dateMariage", dateMariage);
        formData.append("conjointNom", conjointNom);
      }

      const url =
        modeEdition && numeroPatientActif
          ? `${espace.prefixeApi}/patients/${encodeURIComponent(numeroPatientActif)}`
          : `${espace.prefixeApi}/patients`;

      const res = await fetch(url, {
        method: modeEdition ? "PUT" : "POST",
        body: formData,
      });

      const data = (await res.json()) as { message?: string; numeroPatient?: string };

      if (!res.ok) {
        throw new Error(
          data.message ??
            (modeEdition
              ? t("reception.erreurs.modificationImpossible")
              : t("reception.erreurs.enregistrementImpossible"))
        );
      }

      const numero = data.numeroPatient ?? numeroPatientActif ?? "";
      router.push(
        `${espace.cheminBase}/enregistres?${modeEdition ? "modifie" : "nouveau"}=${encodeURIComponent(numero)}`
      );
      router.refresh();
    } catch (error) {
      setErreur(
        error instanceof Error
          ? error.message
          : modeEdition
            ? t("reception.erreurs.modificationErreur")
            : t("reception.erreurs.enregistrementErreur")
      );
    } finally {
      setEnCours(false);
    }
  };

  const transfererPatient = async () => {
    if (!estComplet && enCours) return;

    setErreur(null);

    if (!motifPrincipal) {
      setErreur(t("reception.erreurs.motifObligatoire"));
      setEtape(1);
      return;
    }
    if (motifEstAutre && !motifAutreTexte.trim()) {
      setErreur(t("reception.erreurs.motifPreciser"));
      setEtape(1);
      return;
    }
    if (!orientation) {
      setErreur(t("reception.erreurs.salleRequise"));
      return;
    }
    if (!medecinResponsable.trim()) {
      setErreur(t("reception.erreurs.medecinObligatoire"));
      setEtape(2);
      return;
    }

    setEnCours(true);

    try {
      const res = await fetch(`${espace.prefixeApi}/transferts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formulaire,
          transfertWizard: true,
          sexe,
          numeroPatient: numeroPatientActif ?? undefined,
          dossierId: dossierIdActif ?? undefined,
          orientation,
          motifPrincipal,
          motifAutreTexte: motifAutreTexte || undefined,
          descriptionMotif: descriptionMotif || undefined,
          examensIds: examensSelectionnes.map((e) => e.id),
          medecinResponsable: medecinResponsable.trim(),
          estEstimation: modeEstimation,
          remise: Math.max(0, Number(remise) || 0),
          ...(champsEglise
            ? { paroisse, dateMariage, conjointNom }
            : {}),
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        numeroPatient?: string;
        salleDestination?: string;
      };

      if (!res.ok) {
        throw new Error(data.message ?? t("reception.erreurs.transfertImpossible"));
      }

      router.push(
        `${espace.cheminBase}/transferts?transfere=${encodeURIComponent(data.numeroPatient ?? "")}`
      );
      router.refresh();
    } catch (error) {
      setErreur(
        error instanceof Error ? error.message : t("reception.erreurs.transfertErreur")
      );
    } finally {
      setEnCours(false);
    }
  };

  const actionPrincipale = estComplet
    ? enregistrer
    : etape >= ETAPES_ENREGISTREMENT.length - 1
      ? transfererPatient
      : etapeSuivante;

  const libelleActionPrincipale = () => {
    if (enCours) {
      if (estComplet) {
        return modeEdition
          ? t("reception.formulaire.boutons.miseAJour")
          : t("reception.formulaire.boutons.enregistrement");
      }
      return etape >= ETAPES_ENREGISTREMENT.length - 1
        ? t("reception.formulaire.boutons.transfert")
        : t("reception.formulaire.boutons.suivant");
    }
    if (estComplet) {
      return modeEdition
        ? t("reception.formulaire.boutons.mettreAJour")
        : t("reception.formulaire.boutons.enregistrer");
    }
    if (etape >= ETAPES_ENREGISTREMENT.length - 1)
      return t("reception.formulaire.boutons.transferer");
    return t("reception.formulaire.boutons.suivant");
  };

  const clsCacheDesktop = estComplet ? "" : "hidden lg:block";

  const propsChamp = (champ: keyof EtatFormulairePatient) => ({
    value: formulaire[champ],
    onChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => majFormulaire(champ, e.target.value),
  });

  const propsSelect = (champ: keyof EtatFormulairePatient) => propsChamp(champ);

  return (
    <section
      ref={ref}
      className="rounded-xl border border-gris-bordure bg-white shadow-sm"
    >
      {numeroPatientActif && !estComplet && (
        <div className="mx-4 mt-4 rounded-lg border border-bleu-medical/30 bg-bleu-medical-clair/40 px-4 py-3 text-sm text-bleu-medical lg:mx-6">
          {t("reception.formulaire.patientSelectionne")}{" "}
          <span className="font-semibold">{numeroPatientActif}</span>
          {" — "}
          {formulaire.prenom} {formulaire.nom}
        </div>
      )}
      {erreur && (
        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 lg:mx-6">
          {erreur}
        </div>
      )}
      {erreurPhoto && !erreur && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 lg:mx-6">
          {erreurPhoto}
        </div>
      )}
      <div className="border-b border-gris-bordure px-4 py-4 lg:px-6 lg:py-5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {modeEdition
            ? t("reception.formulaire.titreModification")
            : t("reception.formulaire.titre")}
        </h2>
        {modeEdition && numeroPatientActif && (
          <p className="mt-2 text-sm text-texte-secondaire">
            {t("reception.formulaire.patientSelectionne")}{" "}
            <span className="font-semibold text-texte-principal">{numeroPatientActif}</span>
          </p>
        )}

        {/* Stepper mobile — accueil uniquement (4 étapes) */}
        {!estComplet && (
        <div className="mt-4 overflow-x-auto lg:hidden">
          <div className="flex min-w-max items-center gap-1 px-0.5">
            {etapesMobile.map((label, index) => (
              <div key={label} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setEtape(index)}
                  className="flex flex-col items-center gap-1"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                      index <= etape
                        ? "bg-bleu-medical text-white"
                        : "bg-gris-tres-clair text-texte-secondaire"
                    )}
                  >
                    {index + 1}
                  </span>
                  <span
                    className={cn(
                      "max-w-[64px] text-center text-[10px] font-medium leading-tight",
                      index === etape ? "text-bleu-medical" : "text-texte-secondaire"
                    )}
                  >
                    {label}
                  </span>
                </button>
                {index < etapesMobile.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 mb-4 h-0.5 w-6 shrink-0",
                      index < etape ? "bg-bleu-medical" : "bg-gris-bordure"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Stepper desktop — accueil uniquement (4 étapes) */}
        {!estComplet && (
        <div className="mt-4 hidden flex-wrap items-center gap-2 lg:flex">
          {etapesDesktop.map((label, index) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEtape(index)}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                    index <= etape
                      ? "bg-bleu-medical text-white"
                      : "bg-gris-tres-clair text-texte-secondaire"
                  )}
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    index === etape ? "text-bleu-medical" : "text-texte-secondaire"
                  )}
                >
                  {label}
                </span>
              </button>
              {index < ETAPES_ENREGISTREMENT.length - 1 && (
                <ChevronRight className="h-4 w-4 text-gris-bordure" aria-hidden />
              )}
            </div>
          ))}
        </div>
        )}
      </div>

      <div className="space-y-5 p-4 lg:space-y-8 lg:p-6">
        {/* ── Étape 1 : Informations patient ── */}
        {etape === 0 && (
          <>
            <div>
              <h3 className="mb-3 text-sm font-bold text-texte-principal lg:mb-4 lg:text-base">
                {t("reception.formulaire.sections.infosPersonnelles")}
              </h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.numeroEnregistrement")}
                  </label>
                  <input
                    readOnly
                    value={estComplet ? numeroEnregistrement : numeroEnregistrement || "20260101001"}
                    className={cn(CLASSE_CHAMP_RECEPTION, "bg-gris-tres-clair")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.date")}
                    {!estComplet && <span className="text-red-500 lg:hidden">*</span>}
                  </label>
                  <input
                    readOnly
                    value={aujourdhui || "—"}
                    suppressHydrationWarning
                    className={CLASSE_CHAMP_RECEPTION}
                  />
                </div>
                <div className={clsCacheDesktop}>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.heure")}
                  </label>
                  <input
                    readOnly
                    value={heure || "—"}
                    suppressHydrationWarning
                    className={CLASSE_CHAMP_RECEPTION}
                  />
                </div>
                <div className={clsCacheDesktop}>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.typePatient")}
                  </label>
                  <select className={CLASSE_CHAMP_RECEPTION} {...propsSelect("typeVisite")}>
                    {typesPatient.map((tp) => (
                      <option key={tp.value} value={tp.value}>
                        {tp.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.nom")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.nom")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("nom")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.prenom")}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.prenom")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("prenom")}
                  />
                </div>
                <div className={clsCacheDesktop}>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.postNom")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.postNom")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("postNom")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.sexe")}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    {(["MASCULIN", "FEMININ"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSexe(s)}
                        className={cn(
                          "flex-1 rounded-lg border py-2.5 text-xs font-medium transition-colors sm:text-sm",
                          sexe === s
                            ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                            : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                        )}
                      >
                        {t(`reception.formulaire.sexe.${s}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION} htmlFor="date-naissance-jour">
                    {t("reception.formulaire.champs.dateNaissance")}
                    <span className="text-red-500">*</span>
                  </label>
                  <ChampDateNaissance
                    id="date-naissance"
                    value={formulaire.dateNaissance}
                    onChange={(valeur) => majFormulaire("dateNaissance", valeur)}
                    required
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.telephone")}
                    {!estComplet && <span className="text-red-500 lg:hidden">*</span>}
                    {estComplet && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.telephone")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("telephone")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.telephoneSecondaire")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.telephoneSecondaire")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("telephoneSecondaire")}
                  />
                </div>
                <div className={clsCacheDesktop}>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.email")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("reception.formulaire.placeholders.email")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("email")}
                  />
                </div>
                <div className={estComplet ? "" : clsCacheDesktop}>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.etatCivil")}
                  </label>
                  <select className={CLASSE_CHAMP_RECEPTION} {...propsSelect("etatCivil")}>
                    {estComplet && (
                      <option value="">{t("reception.formulaire.nonRenseigne")}</option>
                    )}
                    {etatsCivils.map((e) => (
                      <option key={e.value} value={e.value}>
                        {e.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.adresse")}
                    {!estComplet && <span className="text-red-500 lg:hidden">*</span>}
                    {estComplet && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.adresse")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("adresse")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.commune")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.commune")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("commune")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.ville")}
                  </label>
                  <input className={CLASSE_CHAMP_RECEPTION} {...propsChamp("ville")} />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.pays")}
                  </label>
                  <select className={CLASSE_CHAMP_RECEPTION} {...propsSelect("pays")}>
                    <option value="RDC">RDC</option>
                    <option value="RD Congo">RD Congo</option>
                  </select>
                </div>
              </div>

              {!estComplet && (
                <button
                  type="button"
                  onClick={() => setPlusInfos((v) => !v)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gris-bordure py-2.5 text-sm font-medium text-bleu-medical lg:hidden"
                >
                  <User className="h-4 w-4" />
                  {t("reception.formulaire.voirPlus")}
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", plusInfos && "rotate-180")}
                  />
                </button>
              )}
            </div>

            <div className={cn(!plusInfos && !estComplet && "hidden lg:block")}>
              <h3 className="mb-1 text-sm font-bold text-texte-principal lg:mb-2 lg:text-base">
                {t("reception.formulaire.sections.infosComplementaires")}
              </h3>
              <p className="mb-3 text-xs text-texte-secondaire lg:mb-4">
                {t("reception.formulaire.sections.infosComplementairesHint")}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.contactUrgence")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.contactUrgence")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("contactUrgence")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.telUrgence")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.telephoneSecondaire")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("telephoneUrgence")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.profession")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.profession")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("profession")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.employeur")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.employeur")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("employeur")}
                  />
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.groupeSanguin")}
                  </label>
                  <select className={CLASSE_CHAMP_RECEPTION} {...propsSelect("groupeSanguin")}>
                    {estComplet && (
                      <option value="">{t("reception.formulaire.nonRenseigne")}</option>
                    )}
                    {groupesSanguins.map((g, index) => (
                      <option key={GROUPES_SANGUINS[index]} value={GROUPES_SANGUINS[index] === "Inconnu" ? "" : GROUPES_SANGUINS[index]}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.assurance")}
                  </label>
                  <select className={CLASSE_CHAMP_RECEPTION} {...propsSelect("assurance")}>
                    {estComplet && (
                      <option value="">{t("reception.formulaire.nonRenseigne")}</option>
                    )}
                    {assurances
                      .filter((a) => a.value !== "Aucune")
                      .map((a) => (
                        <option key={a.value} value={a.value}>
                          {a.label}
                        </option>
                      ))}
                    {!estComplet && (
                      <option value="Aucune">
                        {t("reception.formulaire.options.assurances.Aucune")}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.numeroAssurance")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.numeroAssurance")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("numeroAssurance")}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className={CLASSE_LABEL_RECEPTION}>
                    {t("reception.formulaire.champs.numeroPiece")}
                  </label>
                  <input
                    placeholder={t("reception.formulaire.placeholders.numeroPiece")}
                    className={CLASSE_CHAMP_RECEPTION}
                    {...propsChamp("numeroPieceIdentite")}
                  />
                </div>
              </div>
            </div>

            <div className={cn("gap-4", estComplet ? "grid grid-cols-1 lg:grid-cols-2" : "hidden lg:grid lg:grid-cols-2")}>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("reception.formulaire.champs.photo")}
                </label>
                {estComplet ? (
                  <ZonePhotoPatient
                    value={photoPatient}
                    onChange={setPhotoPatient}
                    onErreur={setErreurPhoto}
                    urlExistante={photoUrlExistante}
                  />
                ) : photoUrlExistante ? (
                  <div className="flex h-36 items-center justify-center overflow-hidden rounded-xl border border-gris-bordure bg-gris-tres-clair/60 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoUrlExistante}
                      alt={t("reception.formulaire.photoAlt", {
                        prenom: formulaire.prenom,
                        nom: formulaire.nom,
                      })}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex h-36 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gris-bordure bg-gris-tres-clair/40 p-4 text-center transition-colors hover:border-bleu-medical hover:bg-bleu-medical-clair/30"
                  >
                    <Upload className="mb-2 h-8 w-8 text-bleu-medical" strokeWidth={1.5} />
                    <span className="block text-sm font-semibold text-texte-principal">
                      {t("reception.formulaire.photoDepot")}
                    </span>
                    <span className="mt-1 block text-xs text-texte-secondaire">
                      {t("reception.formulaire.photoFormat")}
                    </span>
                  </button>
                )}
              </div>
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("reception.formulaire.champs.observations")}
                </label>
                <textarea
                  rows={estComplet ? 6 : 5}
                  placeholder={t("reception.formulaire.placeholders.observations")}
                  className={cn(CLASSE_CHAMP_RECEPTION, "h-36 min-h-0 resize-none")}
                  {...propsChamp("observations")}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Étape 2 : Motif de visite (accueil uniquement) ── */}
        {!estComplet && etape === 1 && (
          <div className="py-4">
            <h3 className="mb-4 text-sm font-bold text-texte-principal lg:text-base">
              {t("reception.formulaire.sections.motifVisite")}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("reception.formulaire.champs.motifPrincipal")}
                  <span className="text-red-500">*</span>
                </label>
                {motifEstAutre ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={motifAutreTexte}
                      onChange={(e) => setMotifAutreTexte(e.target.value)}
                      placeholder={t("reception.formulaire.placeholders.motifAutre")}
                      className={CLASSE_CHAMP_RECEPTION}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMotifPrincipal("");
                        setMotifAutreTexte("");
                      }}
                      className="text-xs font-medium text-bleu-medical hover:underline"
                    >
                      {t("reception.formulaire.choisirListe")}
                    </button>
                  </div>
                ) : (
                  <select
                    className={CLASSE_CHAMP_RECEPTION}
                    value={motifPrincipal}
                    onChange={(e) => setMotifPrincipal(e.target.value)}
                  >
                    <option value="" disabled>
                      {t("reception.formulaire.selectionnerMotif")}
                    </option>
                    {motifsPrincipaux.map((motif) => (
                      <option key={motif.value} value={motif.value}>
                        {motif.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className={CLASSE_LABEL_RECEPTION}>
                  {t("reception.formulaire.champs.descriptionMotif")}
                </label>
                <textarea
                  rows={4}
                  value={descriptionMotif}
                  onChange={(e) => setDescriptionMotif(e.target.value)}
                  placeholder={t("reception.formulaire.placeholders.descriptionMotif")}
                  className={cn(CLASSE_CHAMP_RECEPTION, "resize-none")}
                />
              </div>
              {champsEglise && (
                <>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>Paroisse</label>
                    <input
                      type="text"
                      value={paroisse}
                      onChange={(e) => setParoisse(e.target.value)}
                      placeholder="Nom de la paroisse"
                      className={CLASSE_CHAMP_RECEPTION}
                    />
                  </div>
                  <div>
                    <label className={CLASSE_LABEL_RECEPTION}>Date du mariage</label>
                    <input
                      type="date"
                      value={dateMariage}
                      onChange={(e) => setDateMariage(e.target.value)}
                      className={CLASSE_CHAMP_RECEPTION}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={CLASSE_LABEL_RECEPTION}>Nom du conjoint</label>
                    <input
                      type="text"
                      value={conjointNom}
                      onChange={(e) => setConjointNom(e.target.value)}
                      placeholder="Nom complet du conjoint"
                      className={CLASSE_CHAMP_RECEPTION}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ── Étape 3 : Examens initiaux (accueil uniquement) ── */}
        {!estComplet && etape === 2 && (
          <div className="py-4">
            <h3 className="mb-1 text-sm font-bold text-texte-principal lg:text-base">
              {t("reception.formulaire.sections.examensInitiaux")}
            </h3>
            <p className="mb-5 text-sm text-texte-secondaire">
              {t("reception.formulaire.sections.examensIntro")}
            </p>
            <SelectionExamensInitiaux
              selection={examensSelectionnes}
              onChange={setExamensSelectionnes}
            />
            <SectionEstimationExamens
              medecinResponsable={medecinResponsable}
              onMedecinChange={setMedecinResponsable}
              modeEstimation={modeEstimation}
              onModeEstimationChange={setModeEstimation}
              examens={examensSelectionnes}
              nomPatient={formulaire.nom}
              prenomPatient={formulaire.prenom}
              telephonePatient={formulaire.telephone}
              numeroEnregistrement={numeroEnregistrement}
              dateEnregistrement={aujourdhui}
              agentNom={agentNom}
              remise={remise}
              onRemiseChange={setRemise}
              onErreur={(message) => setErreur(message || null)}
            />
          </div>
        )}

        {/* ── Étape 4 : Orientation (accueil uniquement) ── */}
        {!estComplet && etape === 3 && (
          <div className="py-4">
            <h3 className="mb-4 text-sm font-bold text-texte-principal lg:text-base">
              {t("reception.formulaire.sections.orientation")}
            </h3>
            <p className="mb-4 text-sm text-texte-secondaire">
              {t("reception.formulaire.sections.orientationHint")}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {orientationsWizard.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors hover:border-bleu-medical",
                    orientation === opt.value
                      ? "border-bleu-medical bg-bleu-medical-clair/30"
                      : "border-gris-bordure"
                  )}
                >
                  <input
                    type="radio"
                    name="orientation"
                    value={opt.value}
                    checked={orientation === opt.value}
                    onChange={() => setOrientation(opt.value)}
                    className="mt-1 h-4 w-4 accent-bleu-medical"
                  />
                  <div>
                    <span className="block text-sm font-semibold text-texte-principal">
                      {t(`reception.orientations.${opt.value}.label`, {
                        defaultValue: opt.label,
                      })}
                    </span>
                    <span className="text-xs text-texte-secondaire">
                      {t(`reception.orientations.${opt.value}.description`, {
                        defaultValue: opt.desc,
                      })}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pied mobile — au-dessus de la navigation basse */}
      <div
        className={cn(
          "sticky z-20 flex items-center gap-2 border-t border-gris-bordure bg-white/95 p-3 backdrop-blur-sm lg:hidden",
          "bottom-[calc(3.75rem+env(safe-area-inset-bottom))]"
        )}
      >
        <Bouton
          type="button"
          variante="contour"
          taille="moyen"
          className="flex-1 rounded-xl"
          onClick={annuler}
        >
          <RotateCcw className="h-4 w-4" />
          {estComplet ? t("reception.formulaire.boutons.annuler") : t("reception.common.reset")}
        </Bouton>
        {!estComplet && etape > 0 && (
          <Bouton
            type="button"
            variante="contour"
            taille="moyen"
            className="rounded-xl"
            onClick={() => setEtape((e) => Math.max(e - 1, 0))}
          >
            {t("reception.formulaire.boutons.retour")}
          </Bouton>
        )}
        <Bouton
          type="button"
          variante="primaire"
          taille="moyen"
          className="flex-[1.5] rounded-xl"
          onClick={actionPrincipale}
          disabled={enCours}
        >
          {!estComplet && etape >= ETAPES_ENREGISTREMENT.length - 1 ? (
            <ArrowRightLeft className="h-4 w-4" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {libelleActionPrincipale()}
        </Bouton>
      </div>

      {/* Pied desktop */}
      <div className="hidden items-center justify-end gap-3 border-t border-gris-bordure px-6 py-4 lg:flex">
        {!estComplet && etape > 0 && (
          <Bouton
            type="button"
            variante="contour"
            onClick={() => setEtape((e) => Math.max(e - 1, 0))}
          >
            {t("reception.formulaire.boutons.retour")}
          </Bouton>
        )}
        <Bouton type="button" variante="contour" onClick={annuler}>
          {t("reception.formulaire.boutons.annuler")}
        </Bouton>
        <Bouton type="button" variante="primaire" onClick={actionPrincipale} disabled={enCours}>
          {libelleActionPrincipale()}
          {!estComplet && etape >= ETAPES_ENREGISTREMENT.length - 1 ? (
            <ArrowRightLeft className="h-4 w-4" />
          ) : (
            !estComplet &&
            etape < ETAPES_ENREGISTREMENT.length - 1 && <ChevronRight className="h-4 w-4" />
          )}
        </Bouton>
      </div>
    </section>
  );
});
