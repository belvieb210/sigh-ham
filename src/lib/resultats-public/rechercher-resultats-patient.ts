import "server-only";

import { prisma } from "@/lib/prisma";
import { lireOrientationAnalyseDepuisNotes } from "@/constants/laboratoire-orientations";
import { calculerAge } from "@/features/caisse/utils-format";
import { nomFichierResultatPdf } from "@/lib/laboratoire/pdf-resultats/nom-fichier-resultat-pdf";
import {
  normaliserIdentite,
  normaliserLibelleFacture,
  telephonesCorrespondent,
} from "@/lib/resultats-public/normaliser-identite";
import { creerTokenResultatPublic } from "@/lib/resultats-public/token-resultat-public";
import type { ReponseRechercheResultatsPublic } from "@/lib/resultats-public/types";

export type {
  ReponseRechercheResultatsPublic,
  ResultatPatientPublic,
  ResultatEnAttentePublic,
} from "@/lib/resultats-public/types";

function libellesFactureCorrespondent(
  libelleExamen: string,
  libellesFacture: Set<string>
): boolean {
  if (libellesFacture.size === 0) return true;
  const ex = normaliserLibelleFacture(libelleExamen);
  for (const lf of libellesFacture) {
    if (ex === lf || ex.includes(lf) || lf.includes(ex)) return true;
  }
  return false;
}

function estExamenApprouve(ex: {
  statut: string;
  notes: string | null;
  aResultats: boolean;
}): boolean {
  return (
    ex.statut === "TERMINE" &&
    lireOrientationAnalyseDepuisNotes(ex.notes) === "DR_APPROUVE" &&
    ex.aResultats
  );
}

function formaterNomPrescripteur(prenom: string, nom: string): string | null {
  const complet = `${prenom} ${nom}`.trim();
  if (!complet) return null;
  return /^dr\.?\s/i.test(complet) ? complet : `Dr ${complet}`;
}

/** Examens rattachés à cette facture (lignes facture ↔ dossier). */
function classerExamensFacture(
  lignesFacture: { libelle: string }[],
  examensDossier: {
    id: string;
    statut: string;
    libelle: string;
    notes: string | null;
    resultatLe: Date | null;
    prescripteur: {
      prenom: string;
      nom: string;
    } | null;
    aResultats: boolean;
  }[]
) {
  const libellesFacture = new Set(
    lignesFacture.map((l) => normaliserLibelleFacture(l.libelle))
  );

  const surFacture = examensDossier.filter((ex) =>
    libellesFactureCorrespondent(ex.libelle, libellesFacture)
  );

  const approuves = surFacture.filter(estExamenApprouve);
  const exclus = surFacture.filter((ex) => !estExamenApprouve(ex));

  // Lignes facture sans examen laboratoire correspondant → en attente
  const libellesCouvert = new Set(
    surFacture.map((ex) => normaliserLibelleFacture(ex.libelle))
  );
  for (const ligne of lignesFacture) {
    const cle = normaliserLibelleFacture(ligne.libelle);
    const dejaCouvert = [...libellesCouvert].some(
      (l) => l === cle || l.includes(cle) || cle.includes(l)
    );
    if (!dejaCouvert) {
      exclus.push({
        id: `ligne-${cle}`,
        statut: "PRESCRIT",
        libelle: ligne.libelle,
        notes: null,
        resultatLe: null,
        prescripteur: null,
        aResultats: false,
      });
    }
  }

  return { approuves, exclus, libellesFacture };
}

export async function rechercherResultatsPatientPublic(input: {
  nom: string;
  prenom: string;
  numeroPatient: string;
  numeroFacture: string;
  telephone: string;
}): Promise<ReponseRechercheResultatsPublic> {
  const nom = input.nom.trim();
  const prenom = input.prenom.trim();
  const numeroPatient = input.numeroPatient.trim();
  const numeroFacture = input.numeroFacture.trim();
  const telephone = input.telephone.trim();

  if (!nom || !prenom || !numeroPatient || !numeroFacture || !telephone) {
    return { type: "introuvable" };
  }

  const facture = await prisma.facture.findUnique({
    where: { numeroFacture },
    include: {
      lignes: true,
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: {
            include: {
              typeExamen: { select: { libelle: true } },
              resultats: { select: { id: true }, take: 1 },
              prescripteur: true,
            },
          },
        },
      },
    },
  });

  if (!facture) return { type: "introuvable" };
  if (["BROUILLON", "ANNULEE"].includes(facture.statut)) {
    return { type: "introuvable" };
  }

  const patient = facture.dossier.patient;
  if (patient.numeroPatient.trim() !== numeroPatient) {
    return { type: "introuvable" };
  }
  if (normaliserIdentite(patient.nom) !== normaliserIdentite(nom)) {
    return { type: "introuvable" };
  }
  if (normaliserIdentite(patient.prenom) !== normaliserIdentite(prenom)) {
    return { type: "introuvable" };
  }
  if (!telephonesCorrespondent(telephone, patient.telephone)) {
    return { type: "introuvable" };
  }

  const examensBruts = facture.dossier.examensLaboratoire.map((ex) => ({
    id: ex.id,
    statut: ex.statut,
    libelle: ex.typeExamen.libelle,
    notes: ex.notes,
    resultatLe: ex.resultatLe,
    prescripteur: ex.prescripteur,
    aResultats: ex.resultats.length > 0,
  }));

  const { approuves, exclus } = classerExamensFacture(
    facture.lignes,
    examensBruts
  );

  const examensEnAttente = exclus.map((ex) => ({ libelle: ex.libelle }));

  if (approuves.length === 0) {
    if (examensEnAttente.length > 0) {
      return {
        type: "en_attente",
        attente: {
          patient: {
            nom: patient.nom,
            prenom: patient.prenom,
            numeroPatient: patient.numeroPatient,
          },
          facture: { numeroFacture: facture.numeroFacture },
          examensEnAttente,
        },
      };
    }
    return { type: "introuvable" };
  }

  const examIds = approuves.map((ex) => ex.id);
  const token = creerTokenResultatPublic({
    factureId: facture.id,
    dossierId: facture.dossierId,
    examIds,
  });

  const premierPrescripteur = approuves.find((ex) => ex.prescripteur)?.prescripteur;
  const prescripteur = premierPrescripteur
    ? formaterNomPrescripteur(
        premierPrescripteur.prenom,
        premierPrescripteur.nom
      )
    : null;

  const datesResultat = approuves
    .map((ex) => ex.resultatLe)
    .filter((d): d is Date => d instanceof Date);
  const dateAnalyse =
    datesResultat.length > 0
      ? new Date(
          Math.max(...datesResultat.map((d) => d.getTime()))
        ).toISOString()
      : null;

  const adresseParts = [
    patient.adresse,
    patient.ville,
    patient.province,
    patient.pays,
  ].filter(Boolean);

  return {
    type: "succes",
    resultat: {
      token,
      nomFichier: nomFichierResultatPdf({
        numeroPatient: patient.numeroPatient,
        nbExamens: examIds.length,
        nom: patient.nom,
        prenom: patient.prenom,
      }),
      patient: {
        nom: patient.nom,
        prenom: patient.prenom,
        numeroPatient: patient.numeroPatient,
        sexe: patient.sexe,
        age: patient.dateNaissance
          ? calculerAge(patient.dateNaissance.toISOString())
          : null,
        telephone: patient.telephone,
        adresse: adresseParts.length > 0 ? adresseParts.join(", ") : null,
      },
      facture: {
        numeroFacture: facture.numeroFacture,
        statut: facture.statut,
        montantTotal: Number(facture.montantTotal),
        devise: facture.devise,
        emiseLe: facture.emiseLe?.toISOString() ?? null,
      },
      examens: approuves.map((ex) => ({
        id: ex.id,
        libelle: ex.libelle,
        resultatLe: ex.resultatLe?.toISOString() ?? null,
      })),
      examensExclus: examensEnAttente,
      prescripteur,
      dateAnalyse,
    },
  };
}
