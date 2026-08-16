"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FlaskConical,
  FolderOpen,
  Loader2,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import {
  MODES_FACTURE_CAISSE,
  MODES_PAIEMENT_UI_CAISSE,
  TYPES_FACTURE_CAISSE_UI,
} from "@/constants/caisse";
import {
  compterFiltresActifs,
  FILTRES_FACTURATION_VIDES,
  FormulaireFiltresFacturationCaisse,
  type FiltresFacturationCaisse,
} from "@/features/caisse/formulaire-filtres-facturation-caisse";
import { MiseEnPageCaisse, type UtilisateurCaisse } from "@/features/caisse/mise-en-page-caisse";
import {
  arrondirMontantCaisse,
  calculerAge,
  formaterDate,
  formaterHeure,
  formaterMontantCaisse,
  initiales,
} from "@/features/caisse/utils-format";
import { RechercheAjoutExamenCaisse } from "@/features/caisse/recherche-ajout-examen-caisse";
import { imprimerFacturePharmacieCaisse } from "@/lib/caisse/imprimer-facture-pharmacie";
import { BadgeTypePersonneCaisse } from "@/features/caisse/badge-type-personne-caisse";
import { ChampDateNaissance } from "@/features/reception/champ-date-naissance";
import { cn } from "@/lib/utils";
import type {
  DestinationApresEncaissement,
  DossierFacturationCaisse,
  FactureResumeJour,
  ModeFactureCaisse,
  PatientFileCaisse,
  TypeFactureCaisseUi,
} from "@/lib/caisse/types";
import type { TypeExamenReception } from "@/lib/reception/types";
import type { ModePaiement } from "@/generated/prisma/client";

interface PropsContenuFacturationCaisse {
  utilisateur: UtilisateurCaisse;
}

type ModeUi = (typeof MODES_PAIEMENT_UI_CAISSE)[number]["id"];

function libelleSexe(sexe: string | null) {
  if (sexe === "FEMININ") return "Féminin";
  if (sexe === "MASCULIN") return "Masculin";
  return sexe ?? "—";
}

export function ContenuFacturationCaisse({ utilisateur }: PropsContenuFacturationCaisse) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dossierInitial = searchParams.get("dossier");
  const factureInitial = searchParams.get("facture");

  const [file, setFile] = useState<PatientFileCaisse[]>([]);
  const [dossierId, setDossierId] = useState<string | null>(dossierInitial);
  const [factureId, setFactureId] = useState<string | null>(factureInitial);
  const [dossier, setDossier] = useState<DossierFacturationCaisse | null>(null);
  const [chargementFile, setChargementFile] = useState(true);
  const [chargementDossier, setChargementDossier] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ongletMobile, setOngletMobile] = useState<"examens" | "resume">("examens");

  const [modeFacture, setModeFacture] = useState<ModeFactureCaisse>("CASH");
  const [modeUi, setModeUi] = useState<ModeUi>("ESPECES");
  const [remise, setRemise] = useState(0);
  const [fraisDivers, setFraisDivers] = useState(0);
  const [montantPaiement, setMontantPaiement] = useState(0);
  const [devise, setDevise] = useState("USD");
  const [notes, setNotes] = useState("");
  const [datePaiement, setDatePaiement] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [numeroRecu, setNumeroRecu] = useState("");
  const [transfererApres, setTransfererApres] = useState(true);
  const [typeFactureUi, setTypeFactureUi] = useState<TypeFactureCaisseUi>("NORMALE");
  const [rechercheExamenOuverte, setRechercheExamenOuverte] = useState(false);
  const [ajoutExamenEnCours, setAjoutExamenEnCours] = useState(false);
  const [suppressionLigneId, setSuppressionLigneId] = useState<string | null>(null);
  const [montantAvance, setMontantAvance] = useState(0);
  const [filtresOuverts, setFiltresOuverts] = useState(false);
  const [brouillonFiltres, setBrouillonFiltres] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );
  const [filtresAppliques, setFiltresAppliques] = useState<FiltresFacturationCaisse>(
    FILTRES_FACTURATION_VIDES
  );

  const destinationApres: DestinationApresEncaissement = transfererApres
    ? (TYPES_FACTURE_CAISSE_UI.find((t) => t.id === typeFactureUi)?.destination ??
      "LABORATOIRE")
    : "AUCUNE";

  const chargerFile = useCallback(async () => {
    setChargementFile(true);
    try {
      const res = await fetch("/api/caisse/patients");
      const data = (await res.json()) as { patients?: PatientFileCaisse[] };
      if (res.ok) setFile(data.patients ?? []);
    } finally {
      setChargementFile(false);
    }
  }, []);

  const chargerDossier = useCallback(
    async (id: string) => {
      setChargementDossier(true);
      setErreur(null);
      setRechercheExamenOuverte(false);
      setMontantAvance(0);
      try {
        const url = `/api/caisse/patients/${id}${factureId ? `?facture=${encodeURIComponent(factureId)}` : ""}`;
        const res = await fetch(url);
        const data = (await res.json()) as {
          dossier?: DossierFacturationCaisse;
          erreur?: string;
        };
        if (!res.ok || !data.dossier) {
          throw new Error(data.erreur ?? t("caisse.facturation.erreurEncaissement"));
        }
        setDossier(data.dossier);
        const dual = data.dossier.facturationDual;
        const typeInitial =
          dual.typeFactureRecommande ??
          (data.dossier.facture.isPharmacie ? "PHARMACIE" : "NORMALE");
        setTypeFactureUi(typeInitial);
        if (typeInitial === "PHARMACIE") {
          setTransfererApres(true);
          setFactureId(data.dossier.pharmacie.facture?.id ?? factureId);
        } else if (!factureId) {
          setFactureId(data.dossier.examens.facture.id);
        }
        const ctx =
          typeInitial === "PHARMACIE" ? data.dossier.pharmacie : data.dossier.examens;
        const lignesCharge = ctx.facture?.lignes ?? ctx.lignes;
        setDevise(
          (ctx.facture?.devise ?? data.dossier.facture.devise) === "CDF" ? "CDF" : "USD"
        );
        setNumeroRecu(
          (ctx.facture?.numeroFacture ?? data.dossier.facture.numeroFacture)?.replace(
            /^FAC-/,
            "REC-"
          ) ?? `REC-${new Date().getFullYear()}-…`
        );
        const totalExamensCharge = lignesCharge
          .filter((l) => l.montant > 0 && l.libelle !== "Frais divers")
          .reduce((a, l) => a + l.montant, 0);
        const remiseDeja = lignesCharge
          .filter((l) => l.montant < 0)
          .reduce((a, l) => a + Math.abs(l.montant), 0);
        const fraisDeja = lignesCharge
          .filter((l) => l.libelle === "Frais divers")
          .reduce((a, l) => a + l.montant, 0);
        const dejaPayeCharge = ctx.facture?.montantPaye ?? data.dossier.facture.montantPaye;
        const remiseInitiale = Math.min(
          Math.max(0, data.dossier.remiseProposee || 0, remiseDeja),
          totalExamensCharge
        );
        const totalDu = Math.max(
          0,
          totalExamensCharge - remiseInitiale + fraisDeja
        );
        const reste = Math.max(0, totalDu - dejaPayeCharge);
        setRemise(arrondirMontantCaisse(remiseInitiale));
        setFraisDivers(arrondirMontantCaisse(fraisDeja));
        setMontantAvance(0);
        // Avance déjà encaissée → mode Solde + montant = reste (après remise)
        if (data.dossier.facture.isPharmacie ? false : data.dossier.examens.facture.aUneAvance) {
          setModeFacture("SOLDE");
        } else {
          setModeFacture("CASH");
        }
        setMontantPaiement(arrondirMontantCaisse(reste));
      } catch (e) {
        setDossier(null);
        setErreur(
          e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement")
        );
      } finally {
        setChargementDossier(false);
      }
    },
    [t, factureId]
  );

  useEffect(() => {
    void chargerFile();
  }, [chargerFile]);

  useEffect(() => {
    if (dossierId) void chargerDossier(dossierId);
  }, [dossierId, factureId, chargerDossier]);

  useEffect(() => {
    setDossierId(dossierInitial);
    setFactureId(factureInitial);
  }, [dossierInitial, factureInitial]);

  useEffect(() => {
    if (!dossierId && file.length > 0) {
      const firstDossier = file[0].dossierId;
      setDossierId(firstDossier);
      router.replace(`/sigh/caisse/facturation?dossier=${firstDossier}`);
    }
  }, [dossierId, file, router]);

  const modePharmacie = typeFactureUi === "PHARMACIE";

  const basculerTypeFacture = (type: TypeFactureCaisseUi) => {
    if (type === "PHARMACIE" && dossier && !dossier.pharmacie.aDesMedicaments) {
      setMessage(null);
      setErreur(t("caisse.facturation.aucunMedicament"));
      return;
    }
    if (type === "NORMALE" && dossier?.facturationDual.factureNormaleVerrouillee) {
      return;
    }
    if (type === "PHARMACIE" && dossier?.facturationDual.facturePharmacieVerrouillee) {
      return;
    }
    setErreur(null);
    setTypeFactureUi(type);
    if (type === "PHARMACIE") {
      const idPh = dossier?.pharmacie.facture?.id ?? null;
      setFactureId(idPh);
    } else {
      const idEx = dossier?.examens.facture.id ?? null;
      setFactureId(idEx);
    }
  };

  const lignesVisibles = useMemo(() => {
    if (!dossier) return [];
    const lignes = modePharmacie ? dossier.pharmacie.lignes : dossier.examens.lignes;
    return lignes.filter((l) => l.montant > 0 && l.libelle !== "Frais divers");
  }, [dossier, modePharmacie]);

  const factureContextuelle = useMemo(() => {
    if (!dossier) return null;
    if (modePharmacie) {
      if (dossier.pharmacie.facture) return dossier.pharmacie.facture;
      return {
        id: null,
        numeroFacture: null,
        statut: null,
        montantTotal: dossier.pharmacie.lignes.reduce((acc, l) => acc + l.montant, 0),
        montantPaye: 0,
        devise: dossier.facture.devise,
        lignes: dossier.pharmacie.lignes,
        historiquePaiements: [],
        aUneAvance: false,
        isPharmacie: true,
      };
    }
    return dossier.examens.facture;
  }, [dossier, modePharmacie]);

  const remiseDejaSurFacture = useMemo(() => {
    if (!factureContextuelle) return 0;
    return factureContextuelle.lignes
      .filter((l) => l.montant < 0)
      .reduce((acc, l) => acc + Math.abs(l.montant), 0);
  }, [factureContextuelle]);

  const idsTypesExamenPresents = useMemo(
    () => new Set(dossier?.examens.idsTypesExamen ?? dossier?.idsTypesExamen ?? []),
    [dossier]
  );

  const libellesExamensPresents = useMemo(
    () =>
      new Set(
        (dossier?.examens.lignes ?? []).map((l) => l.libelle.trim().toLowerCase())
      ),
    [dossier]
  );

  /** File caisse : patients avec facturation examens et/ou pharmacie incomplète */
  const fileSansFacture = useMemo(
    () =>
      file.filter(
        (p) => !p.facturationComplete && p.statutFacture !== "PAYEE"
      ),
    [file]
  );

  const fileFiltree = useMemo(() => {
    const f = filtresAppliques;
    return fileSansFacture.filter((p) => {
      if (f.nom.trim() && !p.nom.toLowerCase().includes(f.nom.trim().toLowerCase())) {
        return false;
      }
      if (
        f.prenom.trim() &&
        !p.prenom.toLowerCase().includes(f.prenom.trim().toLowerCase())
      ) {
        return false;
      }
      if (f.telephone.trim()) {
        const tel = (p.telephone ?? "").replace(/\s+/g, "");
        if (!tel.includes(f.telephone.trim().replace(/\s+/g, ""))) return false;
      }
      if (f.numeroEnreg.trim()) {
        const enreg = f.numeroEnreg.trim().toLowerCase();
        if (
          !p.numeroDossier.toLowerCase().includes(enreg) &&
          !p.numeroPatient.toLowerCase().includes(enreg)
        ) {
          return false;
        }
      }
      if (f.idEntite.trim()) {
        const id = f.idEntite.trim().toLowerCase();
        if (
          !p.dossierId.toLowerCase().includes(id) &&
          !p.numeroPatient.toLowerCase().includes(id) &&
          !p.numeroDossier.toLowerCase().includes(id)
        ) {
          return false;
        }
      }
      if (f.dateDu || f.dateAu) {
        const jour = p.arriveeLe.slice(0, 10);
        if (f.dateDu && jour < f.dateDu) return false;
        if (f.dateAu && jour > f.dateAu) return false;
      }
      return true;
    });
  }, [fileSansFacture, filtresAppliques]);

  const nbFiltresActifs = compterFiltresActifs(filtresAppliques);

  const appliquerFiltres = useCallback(async () => {
    setErreur(null);
    setMessage(null);
    setFiltresAppliques(brouillonFiltres);

    const numFac = brouillonFiltres.numeroFacture.trim();
    if (numFac) {
      try {
        const res = await fetch("/api/caisse/factures");
        const data = (await res.json()) as { factures?: FactureResumeJour[] };
        if (res.ok) {
          const trouvee = (data.factures ?? []).find((fac) =>
            fac.numeroFacture.toLowerCase().includes(numFac.toLowerCase())
          );
          if (trouvee) {
            setDossierId(trouvee.dossierId);
            router.replace(
              `/sigh/caisse/facturation?dossier=${trouvee.dossierId}`
            );
            setMessage(t("caisse.facturation.filtres.resultatFacture"));
            setFiltresOuverts(false);
            return;
          }
          setErreur(t("caisse.facturation.filtres.factureIntrouvable"));
        }
      } catch {
        setErreur(t("caisse.facturation.filtres.factureIntrouvable"));
      }
      return;
    }

    const matches = fileSansFacture.filter((p) => {
      const f = brouillonFiltres;
      if (f.nom.trim() && !p.nom.toLowerCase().includes(f.nom.trim().toLowerCase())) {
        return false;
      }
      if (
        f.prenom.trim() &&
        !p.prenom.toLowerCase().includes(f.prenom.trim().toLowerCase())
      ) {
        return false;
      }
      if (f.telephone.trim()) {
        const tel = (p.telephone ?? "").replace(/\s+/g, "");
        if (!tel.includes(f.telephone.trim().replace(/\s+/g, ""))) return false;
      }
      if (f.numeroEnreg.trim()) {
        const enreg = f.numeroEnreg.trim().toLowerCase();
        if (
          !p.numeroDossier.toLowerCase().includes(enreg) &&
          !p.numeroPatient.toLowerCase().includes(enreg)
        ) {
          return false;
        }
      }
      if (f.idEntite.trim()) {
        const id = f.idEntite.trim().toLowerCase();
        if (
          !p.dossierId.toLowerCase().includes(id) &&
          !p.numeroPatient.toLowerCase().includes(id) &&
          !p.numeroDossier.toLowerCase().includes(id)
        ) {
          return false;
        }
      }
      if (f.dateDu || f.dateAu) {
        const jour = p.arriveeLe.slice(0, 10);
        if (f.dateDu && jour < f.dateDu) return false;
        if (f.dateAu && jour > f.dateAu) return false;
      }
      return true;
    });

    if (compterFiltresActifs(brouillonFiltres) > 0 && matches.length === 0) {
      setErreur(t("caisse.facturation.filtres.aucunResultat"));
      return;
    }

    if (matches.length === 1) {
      setDossierId(matches[0].dossierId);
      router.replace(`/sigh/caisse/facturation?dossier=${matches[0].dossierId}`);
      setFiltresOuverts(false);
    }
  }, [brouillonFiltres, fileSansFacture, router, t]);

  const reinitialiserFiltres = () => {
    setBrouillonFiltres(FILTRES_FACTURATION_VIDES);
    setFiltresAppliques(FILTRES_FACTURATION_VIDES);
    setErreur(null);
  };

  const ajouterExamenAuDossier = useCallback(
    async (examen: TypeExamenReception) => {
      if (!dossierId) return;
      setAjoutExamenEnCours(true);
      setErreur(null);
      setMessage(null);
      try {
        const res = await fetch(`/api/caisse/dossiers/${dossierId}/examens`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typeExamenId: examen.id }),
        });
        const data = (await res.json()) as {
          dossier?: DossierFacturationCaisse;
          message?: string;
        };
        if (!res.ok || !data.dossier) {
          throw new Error(data.message ?? t("caisse.facturation.examensChargement"));
        }
        setDossier(data.dossier);
        setMessage(data.message ?? t("caisse.facturation.examenAjoute"));
        setRechercheExamenOuverte(false);
        void chargerFile();
      } catch (e) {
        setErreur(
          e instanceof Error ? e.message : t("caisse.facturation.examensChargement")
        );
      } finally {
        setAjoutExamenEnCours(false);
      }
    },
    [dossierId, t, chargerFile]
  );

  const retirerExamen = useCallback(
    async (ligne: { id: string; source: "EXAMEN" | "FACTURE" }) => {
      if (!dossierId) return;
      setSuppressionLigneId(ligne.id);
      setErreur(null);
      setMessage(null);
      try {
        const res = await fetch(`/api/caisse/dossiers/${dossierId}/examens`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ligneId: ligne.id, source: ligne.source }),
        });
        const data = (await res.json()) as {
          dossier?: DossierFacturationCaisse;
          message?: string;
        };
        if (!res.ok || !data.dossier) {
          throw new Error(data.message ?? t("caisse.facturation.examensChargement"));
        }
        setDossier(data.dossier);
        setMessage(data.message ?? t("caisse.facturation.examenRetire"));
        void chargerFile();
      } catch (e) {
        setErreur(
          e instanceof Error ? e.message : t("caisse.facturation.examensChargement")
        );
      } finally {
        setSuppressionLigneId(null);
      }
    },
    [dossierId, t, chargerFile]
  );

  const totalExamens = useMemo(
    () => lignesVisibles.reduce((acc, l) => acc + l.montant, 0),
    [lignesVisibles]
  );
  const sousTotal = Math.max(0, totalExamens - (remise || 0));
  const totalAPayer = sousTotal + (fraisDivers || 0);
  const dejaPaye = factureContextuelle?.montantPaye ?? 0;
  const resteAPayer = Math.max(0, totalAPayer - dejaPaye);
  const factureCloturee = modePharmacie
    ? Boolean(dossier?.facturationDual.facturePharmacieVerrouillee)
    : Boolean(dossier?.facturationDual.factureNormaleVerrouillee);
  const soldeObligatoire =
    Boolean(factureContextuelle?.aUneAvance) && !factureCloturee && !modePharmacie;
  /** Avance déjà couverte (reste 0) : permettre de clôturer sans nouveau paiement */
  const peutCloturerSoldeAZero =
    soldeObligatoire && modeFacture === "SOLDE" && resteAPayer <= 0.01;
  const encaissementDesactive =
    enCours ||
    factureCloturee ||
    (modeFacture === "AVANCE"
      ? montantAvance <= 0
      : peutCloturerSoldeAZero
        ? false
        : resteAPayer <= 0 || montantPaiement <= 0);
  /** Montant affiché comme « à payer » : reste si avance déjà payée, sinon total */
  const montantDuJour = soldeObligatoire || modeFacture === "SOLDE" ? resteAPayer : totalAPayer;
  const resteApresCePaiement = Math.max(
    0,
    resteAPayer - (modeFacture === "AVANCE" ? montantAvance : montantPaiement)
  );

  useEffect(() => {
    if (soldeObligatoire && modeFacture !== "SOLDE") {
      setModeFacture("SOLDE");
    }
  }, [soldeObligatoire, modeFacture]);

  useEffect(() => {
    if (modeFacture === "AVANCE") {
      setMontantPaiement(arrondirMontantCaisse(montantAvance));
    } else {
      setMontantPaiement(arrondirMontantCaisse(resteAPayer));
    }
  }, [resteAPayer, modeFacture, montantAvance]);

  const selectionnerPatientFile = (patient: PatientFileCaisse) => {
    setDossierId(patient.dossierId);
    setFactureId(null);
    setTypeFactureUi("NORMALE");
    router.replace(`/sigh/caisse/facturation?dossier=${patient.dossierId}`);
  };

  const age = calculerAge(dossier?.dateNaissance ?? null);
  const modePrisma: ModePaiement =
    MODES_PAIEMENT_UI_CAISSE.find((m) => m.id === modeUi)?.modePrisma ?? "ESPECES";

  const regenererRecu = () => {
    const stamp = Date.now().toString().slice(-6);
    setNumeroRecu(`REC-${new Date().getFullYear()}-${stamp}`);
  };

  const imprimerDocument = async () => {
    if (modePharmacie && dossier) {
      const ok = await imprimerFacturePharmacieCaisse(dossier, {
        remise,
        agentNom: `${utilisateur.prenom} ${utilisateur.nom}`.trim(),
      });
      if (!ok) window.print();
      return;
    }
    window.print();
  };

  const encaisser = async () => {
    if (!dossierId) return;
    if (lignesVisibles.length === 0) {
      setErreur(t("caisse.facturation.aucuneLigne"));
      return;
    }

    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      if (soldeObligatoire && modeFacture !== "SOLDE") {
        throw new Error(t("caisse.facturation.modeSoldeObligatoire"));
      }
      if (!soldeObligatoire && modeFacture === "SOLDE") {
        throw new Error(t("caisse.facturation.modeSoldeIndisponible"));
      }

      if (modeFacture === "AVANCE") {
        if (montantAvance <= 0) {
          throw new Error(t("caisse.facturation.avanceInvalide"));
        }
        if (montantAvance > resteAPayer + 0.01) {
          throw new Error(t("caisse.facturation.avanceTropElevee"));
        }
      }

      const montantAEncaisser =
        modeFacture === "AVANCE" ? montantAvance : montantPaiement;

      const clotureSoldeSansPaiement =
        modeFacture === "SOLDE" && resteAPayer <= 0.01;

      if (!clotureSoldeSansPaiement && montantAEncaisser <= 0) {
        throw new Error(t("caisse.facturation.erreurEncaissement"));
      }

      // 1) Enregistrer / préparer la facture
      const prep = await fetch("/api/caisse/factures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          factureId,
          devise,
          typeFacture: typeFactureUi,
        }),
      });
      const prepData = (await prep.json()) as {
        dossier?: DossierFacturationCaisse;
        erreur?: string;
      };
      if (!prep.ok || !prepData.dossier) {
        throw new Error(
          prepData.erreur ?? t("caisse.facturation.erreurEnregistrementFacture")
        );
      }
      setDossier(prepData.dossier);
      const factureEncaisseId =
        typeFactureUi === "PHARMACIE"
          ? prepData.dossier.pharmacie.facture?.id
          : prepData.dossier.examens.facture.id;
      if (factureEncaisseId) setFactureId(factureEncaisseId);

      // 2) Encaisser le paiement sur la facture enregistrée
      const res = await fetch("/api/caisse/factures/encaisser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dossierId,
          factureId: factureEncaisseId ?? factureId,
          typeFacture: typeFactureUi,
          montant: clotureSoldeSansPaiement ? 0 : montantAEncaisser,
          modePaiement: modePrisma,
          modeFacture,
          remise,
          fraisDivers,
          devise,
          reference: [
            `recu=${numeroRecu}`,
            `devise=${devise}`,
            fraisDivers > 0 ? `frais=${fraisDivers}` : null,
            modeFacture === "AVANCE" ? `avance=${montantAvance}` : null,
            notes.trim() || null,
          ]
            .filter(Boolean)
            .join("|"),
          destinationApres: transfererApres ? destinationApres : "AUCUNE",
        }),
      });
      const data = (await res.json()) as {
        dossier?: DossierFacturationCaisse;
        numeroFacture?: string;
        message?: string;
        erreur?: string;
      };
      if (!res.ok || !data.dossier) {
        throw new Error(data.erreur ?? t("caisse.facturation.erreurEncaissement"));
      }

      const numero =
        data.numeroFacture ?? data.dossier.facture.numeroFacture ?? "";
      setDossier(data.dossier);
      setMessage(
        numero
          ? t("caisse.facturation.succesFactureEnregistree", { numero })
          : data.message ?? t("caisse.facturation.succesEncaissement")
      );
      await chargerFile();
      window.scrollTo({ top: 0, behavior: "smooth" });

      const dual = data.dossier.facturationDual;

      if (dual.facturationComplete) {
        setModeFacture("CASH");
        window.setTimeout(() => {
          router.push("/sigh/caisse/factures");
        }, 800);
        return;
      }

      if (dual.typeFactureRecommande) {
        setTypeFactureUi(dual.typeFactureRecommande);
        setFactureId(null);
        if (dual.typeFactureRecommande === "PHARMACIE") {
          setTransfererApres(true);
        }
        setMessage(
          dual.factureNormaleVerrouillee
            ? t("caisse.facturation.examensPayesRestePharmacie")
            : t("caisse.facturation.pharmaciePayeeResteExamens")
        );
        if (dossierId) {
          await chargerDossier(dossierId);
        }
        return;
      }

      if (data.dossier.facture.statut === "PAYEE") {
        setModeFacture("CASH");
      }
    } catch (e) {
      setErreur(e instanceof Error ? e.message : t("caisse.facturation.erreurEncaissement"));
    } finally {
      setEnCours(false);
    }
  };

  const resumePanel = dossier && (
    <section className="space-y-4 rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
      <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
        {t("caisse.facturation.resumeFacture")}
      </h3>
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">
            {modePharmacie
              ? t("caisse.facturation.totalMedicaments")
              : t("caisse.facturation.totalExamens")}
          </span>
          <span className="font-medium">{formaterMontantCaisse(totalExamens, devise)}</span>
        </div>
        {modeFacture === "AVANCE" && (
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="montant-avance-resume"
              className="text-texte-secondaire"
            >
              {t("caisse.facturation.montantAvance")}
            </label>
            <input
              id="montant-avance-resume"
              type="number"
              min={0}
              step="0.01"
              max={resteAPayer}
              value={montantAvance}
              onChange={(e) =>
                setMontantAvance(arrondirMontantCaisse(Number(e.target.value) || 0))
              }
              className="w-24 rounded-lg border border-bleu-medical px-2 py-1.5 text-right text-sm ring-1 ring-bleu-medical/20"
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="remise-resume" className="text-texte-secondaire">
            {t("caisse.facturation.remise")}
          </label>
          <input
            id="remise-resume"
            type="number"
            min={soldeObligatoire ? remiseDejaSurFacture : 0}
            step="0.01"
            max={totalExamens}
            value={remise}
            onChange={(e) => {
              const valeur = arrondirMontantCaisse(Number(e.target.value) || 0);
              const plancher = soldeObligatoire ? remiseDejaSurFacture : 0;
              setRemise(
                arrondirMontantCaisse(
                  Math.min(totalExamens, Math.max(plancher, valeur))
                )
              );
            }}
            className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
          />
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">{t("caisse.facturation.sousTotal")}</span>
          <span className="font-medium">{formaterMontantCaisse(sousTotal, devise)}</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="frais-divers-resume" className="text-texte-secondaire">
            {t("caisse.facturation.fraisDivers")}
          </label>
          <input
            id="frais-divers-resume"
            type="number"
            min={0}
            step="0.01"
            value={fraisDivers}
            onChange={(e) =>
              setFraisDivers(arrondirMontantCaisse(Number(e.target.value) || 0))
            }
            className="w-24 rounded-lg border border-gris-bordure px-2 py-1.5 text-right text-sm"
          />
        </div>
        <div className="border-t border-gris-bordure pt-3">
          {dejaPaye > 0 && (
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span className="text-texte-secondaire">
                {t("caisse.facturation.totalFacture")}
              </span>
              <span className="font-medium tabular-nums">
                {formaterMontantCaisse(totalAPayer, devise)}
              </span>
            </div>
          )}
          <p className="text-[11px] font-bold uppercase tracking-wider text-texte-secondaire">
            {t("caisse.facturation.totalAPayer")}
          </p>
          <p className="mt-1 text-2xl font-bold text-bleu-medical">
            {formaterMontantCaisse(montantDuJour, devise)}
          </p>
        </div>
        {dejaPaye > 0 && (
          <div className="flex justify-between gap-3 pt-1">
            <span className="text-texte-secondaire">
              {t("caisse.facturation.dejaEncaisse")}
            </span>
            <span className="font-medium tabular-nums">
              {formaterMontantCaisse(dejaPaye, devise)}
            </span>
          </div>
        )}
        <div className="flex justify-between gap-3 pt-1">
          <span className="text-texte-secondaire">{t("caisse.facturation.montantPaye")}</span>
          <span className="font-medium">
            {formaterMontantCaisse(
              modeFacture === "AVANCE" ? montantAvance : montantPaiement,
              devise
            )}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-texte-secondaire">{t("caisse.facturation.resteAPayer")}</span>
          <span
            className={cn(
              "font-bold",
              resteApresCePaiement <= 0 ? "text-emerald-600" : "text-amber-700"
            )}
          >
            {formaterMontantCaisse(resteApresCePaiement, devise)}
          </span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
          {t("caisse.facturation.moyensPaiement")}
        </p>
        <div className="space-y-1.5">
          {MODES_PAIEMENT_UI_CAISSE.map((mode) => (
            <label
              key={mode.id}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                modeUi === mode.id
                  ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                  : "border-gris-bordure hover:bg-gris-tres-clair"
              )}
            >
              <input
                type="radio"
                name="modePaiement"
                checked={modeUi === mode.id}
                onChange={() => setModeUi(mode.id)}
                className="accent-emerald-600"
              />
              {t(`caisse.modesPaiement.${mode.id}`)}
            </label>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <MiseEnPageCaisse
      utilisateur={utilisateur}
      titre={t("caisse.layout.titre")}
      sousTitre={t("caisse.facturation.sousTitre")}
    >
      <div className="mx-auto w-full max-w-7xl space-y-4 pb-24 lg:pb-6">
        <Link
          href="/sigh/caisse/transferts"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("caisse.facturation.retourListe")}
        </Link>

        {/* Patients confirmés à la caisse, sans facture — visible hors dossier ouvert */}
        {!dossierId && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setFiltresOuverts((o) => !o)}
                aria-expanded={filtresOuverts}
                aria-label={
                  filtresOuverts
                    ? t("caisse.facturation.fermerFiltres")
                    : t("caisse.facturation.ouvrirFiltres")
                }
                className={cn(
                  "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
                  filtresOuverts
                    ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                    : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                )}
              >
                <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
                <span
                  className={cn(
                    "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                    nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
                  )}
                >
                  {nbFiltresActifs}
                </span>
              </button>
            </div>

            {filtresOuverts && (
              <FormulaireFiltresFacturationCaisse
                valeurs={brouillonFiltres}
                onChange={setBrouillonFiltres}
                onRechercher={() => void appliquerFiltres()}
                onReinitialiser={reinitialiserFiltres}
              />
            )}

            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gris-bordure px-2 py-1.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-principal">
                  {t("caisse.facturation.patientsAttentePaiement", {
                    count: fileFiltree.length,
                  })}
                </h3>
                <Link
                  href="/sigh/caisse/transferts"
                  className="text-xs font-semibold text-bleu-medical hover:underline"
                >
                  {t("caisse.facturation.voirTout")}
                </Link>
              </div>
              {chargementFile ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : fileFiltree.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {nbFiltresActifs > 0
                    ? t("caisse.facturation.filtres.aucunResultat")
                    : t("caisse.facturation.aucunPatientSansFacture")}
                </p>
              ) : (
                <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="px-2 py-1.5 font-semibold">N°</th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colPatient")}
                        </th>
                        <th className="hidden px-2 py-1.5 font-semibold sm:table-cell">
                          {t("caisse.facturation.colProvenance")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colPrestations")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colMontant")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colStatut")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colHeure")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colActions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileFiltree.map((p, index) => (
                        <tr
                          key={p.fileAttenteId}
                          onClick={() => selectionnerPatientFile(p)}
                          className="cursor-pointer border-t border-gris-bordure/70 transition-colors hover:bg-slate-50"
                        >
                          <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                            {index + 1}
                          </td>
                          <td className="px-2 py-1.5 font-semibold text-texte-principal">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span>
                                {p.prenom} {p.nom}
                              </span>
                              <BadgeTypePersonneCaisse estClientWalkIn={p.estClientWalkIn} />
                            </div>
                          </td>
                          <td className="hidden px-2 py-1.5 text-texte-secondaire sm:table-cell">
                            {p.provenance}
                          </td>
                          <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                            {p.estClientWalkIn
                              ? t("caisse.facturation.nbMedicaments", {
                                  count: p.nombreMedicaments,
                                })
                              : p.nombreExamens}
                          </td>
                          <td className="px-2 py-1.5 font-semibold text-texte-principal">
                            {formaterMontantCaisse(
                              p.factureOuverte ? p.resteAPayer : p.montantEstime
                            )}
                          </td>
                          <td className="px-2 py-1.5">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                !p.statutFacture && "bg-amber-50 text-amber-700",
                                p.statutFacture === "BROUILLON" && "bg-slate-100 text-slate-700",
                                p.statutFacture === "EMISE" && "bg-blue-50 text-blue-700",
                                p.statutFacture === "PARTIELLEMENT_PAYEE" &&
                                  "bg-amber-50 text-amber-800",
                                p.statutFacture === "PAYEE" && "bg-emerald-50 text-emerald-700"
                              )}
                            >
                              {p.statutFacture
                                ? t(`caisse.statutsFacture.${p.statutFacture}`)
                                : t("caisse.facturation.statutSansFacture")}
                            </span>
                          </td>
                          <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                            {formaterHeure(p.arriveeLe)}
                          </td>
                          <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => selectionnerPatientFile(p)}
                              className="rounded-lg border border-bleu-medical/30 px-3 py-1.5 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                            >
                              {t("caisse.facturation.ouvrir")}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}

        {!dossierId ? null : chargementDossier || !dossier ? (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-gris-bordure bg-white py-16 text-sm text-texte-secondaire">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            {/* Patient header — maquette */}
            <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bleu-medical text-base font-bold text-white">
                  {initiales(dossier.prenom, dossier.nom)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-texte-principal">
                      {dossier.prenom} {dossier.nom}
                    </h2>
                    <BadgeTypePersonneCaisse estClientWalkIn={dossier.estClientWalkIn} />
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      {dossier.facturationDual.facturationComplete
                        ? t("caisse.facturation.paye")
                        : dossier.facturationDual.factureNormaleVerrouillee &&
                            dossier.pharmacie.aDesMedicaments &&
                            !dossier.facturationDual.facturePharmacieVerrouillee
                          ? t("caisse.facturation.examensPayesRestePharmacie")
                          : dossier.facturationDual.facturePharmacieVerrouillee &&
                              dossier.examens.lignes.length > 0 &&
                              !dossier.facturationDual.factureNormaleVerrouillee
                            ? t("caisse.facturation.pharmaciePayeeResteExamens")
                            : dossier.statutAttente === "EN_ATTENTE_PAIEMENT"
                              ? t("caisse.facturation.enAttentePaiement")
                              : t("caisse.facturation.horsFile")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-texte-secondaire">
                    {t("caisse.facturation.idDossier")} : {dossier.numeroDossier}
                    {" | "}
                    {age != null ? t("caisse.facturation.age", { age }) : "—"}
                    {" | "}
                    {libelleSexe(dossier.sexe)}
                    {dossier.telephone ? ` | ${dossier.telephone}` : ""}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    {dossier.recuLe && (
                      <span className="rounded-full border border-bleu-medical/30 bg-bleu-medical-clair/40 px-2.5 py-0.5 text-xs font-medium text-bleu-medical">
                        {t("caisse.facturation.recuLe", {
                          date: `${formaterDate(dossier.recuLe)} à ${formaterHeure(dossier.recuLe)}`,
                        })}
                      </span>
                    )}
                    {dossier.transferePar && (
                      <span className="text-xs text-texte-secondaire">
                        {t("caisse.facturation.transferePar", {
                          nom: dossier.transferePar,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gris-bordure px-3 py-2 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                >
                  <FolderOpen className="h-4 w-4" />
                  {t("caisse.facturation.voirDossierMedical")}
                </button>
              </div>
            </section>

            {/* Mobile tabs */}
            <div className="flex gap-1 rounded-lg bg-gris-tres-clair p-1 lg:hidden">
              {(["examens", "resume"] as const).map((onglet) => (
                <button
                  key={onglet}
                  type="button"
                  onClick={() => setOngletMobile(onglet)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-2 text-sm font-semibold",
                    ongletMobile === onglet
                      ? "bg-white text-bleu-medical shadow-sm"
                      : "text-texte-secondaire"
                  )}
                >
                  {onglet === "examens"
                    ? t("caisse.facturation.ongletExamens")
                    : t("caisse.facturation.ongletResume")}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "examens" && "hidden lg:block"
                )}
              >
                {/* Lignes facturables (examens ou médicaments) */}
                <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
                  <div className="border-b border-gris-bordure px-2 py-1.5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                      {modePharmacie
                        ? t("caisse.facturation.medicamentsPrescrits")
                        : t("caisse.facturation.examensPrescrits")}
                    </h3>
                  </div>
                  {lignesVisibles.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                      {modePharmacie
                        ? t("caisse.facturation.aucunMedicament")
                        : t("caisse.facturation.aucuneLigne")}
                    </p>
                  ) : (
                    <>
                      <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                          <thead className="bg-gris-tres-clair/80 text-[11px] uppercase tracking-wider text-texte-secondaire">
                            <tr>
                              <th className="px-3 py-2.5">{t("caisse.facturation.numero")}</th>
                              <th className="px-3 py-2.5">
                                {modePharmacie
                                  ? t("caisse.facturation.medicament")
                                  : t("caisse.facturation.examen")}
                              </th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.prixUnit")}
                              </th>
                              <th className="px-3 py-2.5 text-right">
                                {t("caisse.facturation.montant")}
                              </th>
                              <th className="px-3 py-2.5" />
                            </tr>
                          </thead>
                          <tbody>
                            {lignesVisibles.map((l, i) => (
                              <tr key={l.id} className="border-t border-gris-bordure">
                                <td className="px-3 py-2.5 text-texte-secondaire">{i + 1}</td>
                                <td className="px-3 py-2.5 font-medium">{l.libelle}</td>
                                <td className="px-3 py-2.5 text-right">
                                  {formaterMontantCaisse(l.prixUnitaire, devise)}
                                </td>
                                <td className="px-3 py-2.5 text-right font-semibold">
                                  {formaterMontantCaisse(l.montant, devise)}
                                </td>
                                <td className="px-3 py-2.5 text-right">
                                  {!modePharmacie && (
                                    <button
                                      type="button"
                                      aria-label={t("caisse.facturation.supprimerLigne")}
                                      disabled={suppressionLigneId === l.id || enCours}
                                      onClick={() => void retirerExamen(l)}
                                      className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                    >
                                      {suppressionLigneId === l.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </>
                  )}
                  {!modePharmacie && (
                    <div className="relative border-t border-gris-bordure">
                      <div className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5">
                        <button
                          type="button"
                          onClick={() => setRechercheExamenOuverte((o) => !o)}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-bleu-medical hover:underline"
                          aria-expanded={rechercheExamenOuverte}
                        >
                          <Plus className="h-4 w-4" />
                          {rechercheExamenOuverte
                            ? t("caisse.facturation.fermerRechercheExamen")
                            : t("caisse.facturation.ajouterExamen")}
                        </button>
                        <p className="text-sm font-bold text-bleu-medical">
                          {t("caisse.facturation.totalExamens")}{" "}
                          {formaterMontantCaisse(totalExamens, devise)}
                        </p>
                      </div>
                      <RechercheAjoutExamenCaisse
                        ouverte={rechercheExamenOuverte}
                        onFermer={() => setRechercheExamenOuverte(false)}
                        idsDejaPresents={idsTypesExamenPresents}
                        libellesDejaPresents={libellesExamensPresents}
                        onAjouter={ajouterExamenAuDossier}
                        enCours={ajoutExamenEnCours}
                      />
                    </div>
                  )}
                  {modePharmacie && lignesVisibles.length > 0 && (
                    <div className="border-t border-gris-bordure px-2 py-1.5 text-right">
                      <p className="text-sm font-bold text-bleu-medical">
                        {t("caisse.facturation.totalMedicaments")}{" "}
                        {formaterMontantCaisse(totalExamens, devise)}
                      </p>
                    </div>
                  )}
                </section>

                {/* Mode de facture — 6 cartes */}
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.modeFacture")}
                  </h3>
                  {soldeObligatoire && (
                    <div
                      role="status"
                      className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"
                    >
                      {t("caisse.facturation.modeSoldeVerrouille")}
                    </div>
                  )}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {MODES_FACTURE_CAISSE.map((mode) => {
                      const modeRefuse =
                        (soldeObligatoire && mode.id !== "SOLDE") ||
                        (!soldeObligatoire && mode.id === "SOLDE");
                      const messageRefuse = soldeObligatoire
                        ? t("caisse.facturation.modeSoldeVerrouille")
                        : t("caisse.facturation.modeSoldeIndisponible");
                      return (
                      <button
                        key={mode.id}
                        type="button"
                        aria-disabled={modeRefuse}
                        onClick={() => {
                          if (modeRefuse) {
                            setErreur(
                              soldeObligatoire
                                ? t("caisse.facturation.modeSoldeObligatoire")
                                : t("caisse.facturation.modeSoldeIndisponible")
                            );
                            setMessage(null);
                            return;
                          }
                          setErreur(null);
                          setModeFacture(mode.id);
                          if (mode.id === "AVANCE") {
                            setMontantAvance((prev) =>
                              prev > 0 ? prev : 0
                            );
                          }
                        }}
                        className={cn(
                          "rounded-xl border px-2 py-1.5 text-left transition-colors",
                          modeFacture === mode.id
                            ? "border-bleu-medical bg-bleu-medical-clair/40 ring-1 ring-bleu-medical"
                            : modeRefuse
                              ? "cursor-not-allowed border-gris-bordure/70 bg-gris-tres-clair/60 opacity-55"
                              : "border-gris-bordure hover:bg-gris-tres-clair"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                              modeFacture === mode.id
                                ? "border-bleu-medical bg-bleu-medical text-white"
                                : "border-gris-bordure"
                            )}
                          >
                            {modeFacture === mode.id && <Check className="h-3 w-3" />}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-texte-principal">
                              {t(`caisse.modesFacture.${mode.id}`)}
                            </p>
                            <p className="mt-0.5 text-[11px] leading-snug text-texte-secondaire">
                              {modeRefuse
                                ? messageRefuse
                                : t(`caisse.modesFactureDesc.${mode.descriptionKey}`)}
                            </p>
                          </div>
                        </div>
                      </button>
                      );
                    })}
                  </div>
                </section>

                {/* Infos paiement */}
                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.infosPaiement")}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.montantAPayer")}
                      </span>
                      <input
                        readOnly
                        value={formaterMontantCaisse(montantDuJour, devise)}
                        className="w-full rounded-lg border border-gris-bordure bg-gris-tres-clair/50 px-3 py-2.5 text-sm font-semibold"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium text-texte-principal">
                        {modeFacture === "AVANCE"
                          ? `${t("caisse.facturation.montantAvance")} *`
                          : `${t("caisse.facturation.montantPaye")} *`}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        max={resteAPayer}
                        value={modeFacture === "AVANCE" ? montantAvance : montantPaiement}
                        onChange={(e) => {
                          const valeur = arrondirMontantCaisse(Number(e.target.value) || 0);
                          if (modeFacture === "AVANCE") setMontantAvance(valeur);
                          else setMontantPaiement(valeur);
                        }}
                        className={cn(
                          "w-full rounded-lg border px-3 py-2.5 text-sm font-semibold",
                          modeFacture === "AVANCE"
                            ? "border-bleu-medical ring-1 ring-bleu-medical/20"
                            : "border-gris-bordure"
                        )}
                      />
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.monnaie")}
                      </span>
                      <select
                        value={devise}
                        onChange={(e) => setDevise(e.target.value)}
                        className="w-full rounded-lg border border-gris-bordure bg-white px-3 py-2.5 text-sm"
                      >
                        <option value="USD">USD</option>
                        <option value="CDF">CDF</option>
                      </select>
                    </label>
                    <div className="text-sm sm:col-span-2 lg:col-span-3">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.datePaiement")}
                      </span>
                      <ChampDateNaissance
                        id="date-paiement-caisse"
                        value={datePaiement}
                        onChange={setDatePaiement}
                        required
                        anneeMin={new Date().getFullYear() - 2}
                      />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.4fr]">
                    <label className="text-sm">
                      <span className="mb-1 block text-xs font-medium text-texte-principal">
                        {t("caisse.facturation.numeroRecu")} *
                      </span>
                      <div className="relative">
                        <input
                          value={numeroRecu}
                          onChange={(e) => setNumeroRecu(e.target.value)}
                          className="w-full rounded-lg border border-gris-bordure py-2.5 pl-3 pr-10 text-sm font-medium"
                        />
                        <button
                          type="button"
                          onClick={regenererRecu}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-texte-secondaire hover:bg-gris-tres-clair hover:text-bleu-medical"
                          aria-label="Régénérer"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      </div>
                    </label>
                    <label className="text-sm">
                      <span className="mb-1 block text-xs text-texte-secondaire">
                        {t("caisse.facturation.notes")}
                      </span>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-gris-bordure px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div
                className={cn(
                  "space-y-4",
                  ongletMobile !== "resume" && "hidden lg:block"
                )}
              >
                {resumePanel}

                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-texte-secondaire">
                    {t("caisse.facturation.typeFacture")}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {TYPES_FACTURE_CAISSE_UI.map((type) => {
                      const selectionne = typeFactureUi === type.id;
                      const Icone = type.id === "NORMALE" ? FlaskConical : Pill;
                      const verrouille =
                        type.id === "NORMALE"
                          ? dossier?.facturationDual.factureNormaleVerrouillee
                          : dossier?.facturationDual.facturePharmacieVerrouillee;
                      const desactive =
                        verrouille ||
                        (type.id === "PHARMACIE" &&
                          dossier != null &&
                          !dossier.pharmacie.aDesMedicaments);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => basculerTypeFacture(type.id)}
                          disabled={desactive}
                          className={cn(
                            "relative flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-xs font-medium leading-tight transition-colors active:scale-[0.98]",
                            selectionne
                              ? "border-bleu-medical bg-bleu-medical-clair text-texte-principal ring-2 ring-bleu-medical/20"
                              : desactive
                                ? verrouille
                                  ? "cursor-not-allowed border-emerald-200 bg-emerald-50/80 opacity-90"
                                  : "cursor-not-allowed border-gris-bordure/70 bg-gris-tres-clair/60 opacity-55"
                                : "border-gris-bordure bg-[#f8fafc] text-texte-principal hover:border-bleu-medical hover:bg-bleu-medical-clair"
                          )}
                        >
                          {verrouille && (
                            <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                              {t("caisse.facturation.typeFactureVerrouille")}
                            </span>
                          )}
                          <Icone
                            className="h-6 w-6 shrink-0 text-bleu-medical"
                            strokeWidth={1.75}
                          />
                          <span>
                            {type.id === "NORMALE"
                              ? t("caisse.facturation.factureNormale")
                              : t("caisse.facturation.facturePharmacie")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {dossier && !dossier.pharmacie.aDesMedicaments && (
                    <p className="mt-2 text-xs text-texte-secondaire">
                      {t("caisse.facturation.aucunMedicament")}
                    </p>
                  )}
                </section>

                <section className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={transfererApres}
                      onChange={(e) => setTransfererApres(e.target.checked)}
                      className="h-4 w-4 accent-bleu-medical"
                    />
                    <span className="font-medium text-texte-principal">
                      {t("caisse.facturation.transfererApres")}
                    </span>
                  </label>
                </section>
              </div>
            </div>

            {message && (
              <p className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                {message}
              </p>
            )}
            {erreur && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erreur}</p>
            )}

            {filtresOuverts && (
              <FormulaireFiltresFacturationCaisse
                valeurs={brouillonFiltres}
                onChange={setBrouillonFiltres}
                onRechercher={() => void appliquerFiltres()}
                onReinitialiser={reinitialiserFiltres}
              />
            )}

            {/* Actions desktop */}
            <div className="hidden flex-wrap items-center gap-2 lg:flex">
              <Bouton
                type="button"
                variante="contour"
                onClick={() => router.push("/sigh/caisse/transferts")}
              >
                {t("caisse.facturation.annuler")}
              </Bouton>
              <Bouton type="button" variante="contour" onClick={() => void imprimerDocument()}>
                <Printer className="h-4 w-4" />
                {t("caisse.facturation.imprimerProforma")}
              </Bouton>
              <Bouton type="button" variante="contour" onClick={() => void imprimerDocument()}>
                <Printer className="h-4 w-4" />
                {t("caisse.facturation.imprimerFacture")}
              </Bouton>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFiltresOuverts((o) => !o)}
                  aria-expanded={filtresOuverts}
                  aria-label={
                    filtresOuverts
                      ? t("caisse.facturation.fermerFiltres")
                      : t("caisse.facturation.ouvrirFiltres")
                  }
                  className={cn(
                    "relative inline-flex h-11 w-11 items-center justify-center rounded-lg border transition-colors",
                    filtresOuverts
                      ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                      : "border-gris-bordure bg-white text-texte-principal hover:bg-gris-tres-clair"
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5" strokeWidth={2} />
                  <span
                    className={cn(
                      "absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white shadow-sm",
                      nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
                    )}
                  >
                    {nbFiltresActifs}
                  </span>
                </button>
                <Bouton
                  type="button"
                  onClick={() => void encaisser()}
                  disabled={encaissementDesactive}
                >
                  {enCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {factureCloturee
                    ? t("caisse.facturation.factureDejaCloturee")
                    : peutCloturerSoldeAZero
                      ? t("caisse.facturation.cloturerFacture")
                      : modePharmacie
                        ? t("caisse.facturation.encaisserPharmacie")
                        : t("caisse.facturation.validerEncaisser")}
                </Bouton>
              </div>
            </div>

            {/* Sticky mobile CTA */}
            <div className="fixed inset-x-0 bottom-[calc(3.75rem+env(safe-area-inset-bottom))] z-30 border-t border-gris-bordure bg-white px-3 py-2.5 shadow-lg lg:hidden">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-texte-secondaire">
                  {t("caisse.facturation.totalAPayer")}
                </span>
                <span className="font-bold text-bleu-medical">
                  {formaterMontantCaisse(montantDuJour, devise)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFiltresOuverts((o) => !o);
                    window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "smooth" });
                  }}
                  aria-label={
                    filtresOuverts
                      ? t("caisse.facturation.fermerFiltres")
                      : t("caisse.facturation.ouvrirFiltres")
                  }
                  className={cn(
                    "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border",
                    filtresOuverts
                      ? "border-bleu-medical bg-bleu-medical-clair text-bleu-medical"
                      : "border-gris-bordure bg-white text-texte-principal"
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  <span
                    className={cn(
                      "absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold text-white",
                      nbFiltresActifs > 0 ? "bg-red-500" : "bg-slate-400"
                    )}
                  >
                    {nbFiltresActifs}
                  </span>
                </button>
                <Bouton
                  type="button"
                  onClick={() => void encaisser()}
                  disabled={encaissementDesactive}
                  className="w-full justify-center"
                >
                  {enCours ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : factureCloturee ? (
                    t("caisse.facturation.factureDejaCloturee")
                  ) : peutCloturerSoldeAZero ? (
                    t("caisse.facturation.cloturerFacture")
                  ) : modePharmacie ? (
                    t("caisse.facturation.encaisserPharmacie")
                  ) : (
                    t("caisse.facturation.encaisserPaiement")
                  )}
                </Bouton>
              </div>
            </div>

            {/* Remplace l'ancien historique : file patients confirmés sans facture */}
            <section className="overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gris-bordure px-2 py-1.5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-texte-principal">
                  {t("caisse.facturation.patientsAttentePaiement", {
                    count: fileFiltree.length,
                  })}
                </h3>
                <Link
                  href="/sigh/caisse/transferts"
                  className="text-xs font-semibold text-bleu-medical hover:underline"
                >
                  {t("caisse.facturation.voirTout")}
                </Link>
              </div>
              {fileFiltree.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-texte-secondaire">
                  {nbFiltresActifs > 0
                    ? t("caisse.facturation.filtres.aucunResultat")
                    : t("caisse.facturation.aucunPatientSansFacture")}
                </p>
              ) : (
                <div className="conteneur-tableau-sigh">
        <table className="tableau-sigh">
                    <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-texte-secondaire">
                      <tr>
                        <th className="px-2 py-1.5 font-semibold">N°</th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colPatient")}
                        </th>
                        <th className="hidden px-2 py-1.5 font-semibold sm:table-cell">
                          {t("caisse.facturation.colProvenance")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colPrestations")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colMontant")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colStatut")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colHeure")}
                        </th>
                        <th className="px-2 py-1.5 font-semibold">
                          {t("caisse.facturation.colActions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {fileFiltree.map((p, index) => {
                        const actif = dossierId === p.dossierId;
                        return (
                          <tr
                            key={`bas-${p.fileAttenteId}`}
                            onClick={() => selectionnerPatientFile(p)}
                            className={cn(
                              "cursor-pointer border-t border-gris-bordure/70 transition-colors",
                              actif ? "bg-bleu-medical-clair/50" : "hover:bg-slate-50"
                            )}
                          >
                            <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1.5 font-semibold text-texte-principal">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span>
                                  {p.prenom} {p.nom}
                                </span>
                                <BadgeTypePersonneCaisse estClientWalkIn={p.estClientWalkIn} />
                              </div>
                            </td>
                            <td className="hidden px-2 py-1.5 text-texte-secondaire sm:table-cell">
                              {p.provenance}
                            </td>
                            <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                              {p.estClientWalkIn
                                ? t("caisse.facturation.nbMedicaments", {
                                    count: p.nombreMedicaments,
                                  })
                                : p.nombreExamens}
                            </td>
                            <td className="px-2 py-1.5 font-semibold text-texte-principal">
                              {formaterMontantCaisse(
                                p.factureOuverte ? p.resteAPayer : p.montantEstime
                              )}
                            </td>
                            <td className="px-2 py-1.5">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                  !p.statutFacture && "bg-amber-50 text-amber-700",
                                  p.statutFacture === "BROUILLON" && "bg-slate-100 text-slate-700",
                                  p.statutFacture === "EMISE" && "bg-blue-50 text-blue-700",
                                  p.statutFacture === "PARTIELLEMENT_PAYEE" &&
                                    "bg-amber-50 text-amber-800",
                                  p.statutFacture === "PAYEE" && "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {p.statutFacture
                                  ? t(`caisse.statutsFacture.${p.statutFacture}`)
                                  : t("caisse.facturation.statutSansFacture")}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 tabular-nums text-texte-secondaire">
                              {formaterHeure(p.arriveeLe)}
                            </td>
                            <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => selectionnerPatientFile(p)}
                                className="rounded-lg border border-bleu-medical/30 px-3 py-1.5 text-xs font-semibold text-bleu-medical hover:bg-bleu-medical-clair/40"
                              >
                                {t("caisse.facturation.ouvrir")}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </MiseEnPageCaisse>
  );
}
