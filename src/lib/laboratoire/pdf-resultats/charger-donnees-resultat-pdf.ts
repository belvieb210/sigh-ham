import "server-only";

import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import {
  extraireRemarqueSansOrientation,
} from "@/constants/laboratoire-orientations";
import {
  lirePiecesJointesDepuisNotes,
  retirerPiecesJointesDesNotes,
} from "@/constants/laboratoire-notes-examen";
import { detecterTypeExamenPdf } from "@/lib/laboratoire/pdf-resultats/detecter-type-examen";
import { detecterTypeParStructureResultats } from "@/lib/laboratoire/pdf-resultats/detecter-type-par-structure";
import { trierParametresParFormulaire } from "@/lib/laboratoire/ordre-parametres-formulaire";
import { resoudreFactureIdPourQrPdfLabo } from "@/lib/caisse/recu-public";
import {
  genererQrCodeDataUrl,
  urlRecuFactureAbsolue,
} from "@/lib/laboratoire/pdf-resultats/generer-qrcode-pdf";
import {
  estImageAffichablePdf,
  resoudreCheminFichierPdf,
} from "@/lib/laboratoire/pdf-resultats/resoudre-chemin-fichier-pdf";
import type {
  DonneesResultatExamenPdf,
  PieceJointeResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/types";
import { mapperResultatsPrismaVersPdf } from "@/lib/laboratoire/pdf-resultats/utilitaires-parametres";

function formaterNomPrescripteur(
  prenom: string,
  nom: string
): string {
  const complet = `${prenom} ${nom}`.trim();
  if (!complet) return "—";
  return /^dr\.?\s/i.test(complet) ? complet : `Dr ${complet}`;
}

async function resoudrePiecesJointesPdf(
  notes: string | null | undefined
): Promise<PieceJointeResultatPdf[]> {
  const brutes = lirePiecesJointesDepuisNotes(notes);
  return brutes.map((pj) => {
    const chemin = resoudreCheminFichierPdf(pj.url);
    const cheminAffichable =
      estImageAffichablePdf(pj.mimeType) && chemin ? chemin : null;
    return {
      nom: pj.nom,
      url: pj.url,
      mimeType: pj.mimeType,
      cheminAffichable,
    };
  });
}

async function resoudreQrFactureDossier(
  dossierId: string,
  request?: Request
): Promise<string | null> {
  const factureId = await resoudreFactureIdPourQrPdfLabo(dossierId);
  if (!factureId) return null;
  const url = urlRecuFactureAbsolue(factureId, request);
  return genererQrCodeDataUrl(url);
}

export async function chargerDonneesResultatExamenPdf(
  dossierId: string,
  examenId: string,
  request?: Request
): Promise<DonneesResultatExamenPdf | null> {
  const examen = await prisma.examenLaboratoire.findFirst({
    where: { id: examenId, dossierId },
    include: {
      dossier: { include: { patient: true } },
      typeExamen: {
        include: {
          parametres: {
            select: { id: true, nom: true, ordre: true },
            orderBy: { ordre: "asc" },
          },
        },
      },
      prescripteur: { include: { medecinExterne: true } },
      resultats: {
        include: {
          parametreTypeExamen: { select: { ordre: true } },
        },
      },
    },
  });

  if (!examen) return null;

  const patient = examen.dossier.patient;
  const notesSansPj = retirerPiecesJointesDesNotes(examen.notes);
  const remarque = extraireRemarqueSansOrientation(notesSansPj);

  const prescripteur = examen.prescripteur;
  const medecinExterne = prescripteur.medecinExterne;
  const medecinDemandeur = formaterNomPrescripteur(
    prescripteur.prenom,
    prescripteur.nom
  );
  const cnomMedecin = medecinExterne?.numeroOrdre?.trim() || null;

  const ordreParId = new Map(
    examen.typeExamen.parametres.map((p) => [p.id, p.ordre])
  );
  const ordreParNom = new Map(
    examen.typeExamen.parametres.map((p) => [p.nom.trim().toUpperCase(), p.ordre])
  );

  const resultatsTries = trierParametresParFormulaire(
    examen.typeExamen.formulaire,
    examen.resultats.map((r) => ({
      ...r,
      nom: r.parametre,
      ordre:
        r.parametreTypeExamen?.ordre ??
        (r.parametreTypeExamenId
          ? ordreParId.get(r.parametreTypeExamenId)
          : undefined) ??
        ordreParNom.get(r.parametre.trim().toUpperCase()) ??
        9999,
    }))
  );

  const examenPdf = {
    examenId: examen.id,
    typeCode: examen.typeExamen.code,
    typeFormulaire: examen.typeExamen.formulaire,
    libelle: examen.typeExamen.libelle,
    specimen: examen.typeExamen.specimen,
    description: examen.typeExamen.description,
    commentaireGlobal: remarque || null,
    dateAnalyse: examen.resultatLe?.toISOString() ?? examen.updatedAt.toISOString(),
    resultats: mapperResultatsPrismaVersPdf(
      resultatsTries.map((r) => ({
        parametre: r.parametre,
        valeur: r.valeur,
        unite: r.unite,
        normeMin: r.normeMin,
        normeMax: r.normeMax,
        nonRequis: r.nonRequis,
        anormal: r.anormal,
        flag: r.flag,
        valeurSecondaire: r.valeurSecondaire,
        commentaire: r.commentaire,
      }))
    ),
    piecesJointes: await resoudrePiecesJointesPdf(examen.notes),
  };

  let typeRender = detecterTypeExamenPdf(examenPdf);
  if (typeRender === "generic") {
    const depuisStructure = detecterTypeParStructureResultats(examenPdf.resultats);
    if (depuisStructure) typeRender = depuisStructure;
  }

  const qrCodeDataUrl = await resoudreQrFactureDossier(dossierId, request);

  return {
    patient: {
      dossierId,
      numeroEnregistrement: patient.numeroPatient,
      numeroPatient: patient.numeroPatient,
      nom: patient.nom,
      prenom: patient.prenom,
      sexe: patient.sexe,
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      telephone: patient.telephone,
      medecinDemandeur,
      cnomMedecin,
      qrCodeDataUrl,
    },
    examen: examenPdf,
    typeRender,
  };
}

export async function chargerDonneesResultatsMultiExamensPdf(
  dossierId: string,
  examenIds: string[],
  request?: Request
): Promise<DonneesResultatExamenPdf[]> {
  const qrCodeDataUrl = await resoudreQrFactureDossier(dossierId, request);
  const pages: DonneesResultatExamenPdf[] = [];

  for (const id of examenIds) {
    const data = await chargerDonneesResultatExamenPdf(dossierId, id, request);
    if (data) {
      pages.push({
        ...data,
        patient: { ...data.patient, qrCodeDataUrl },
      });
    }
  }
  return pages;
}
