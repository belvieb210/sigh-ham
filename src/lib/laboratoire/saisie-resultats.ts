import "server-only";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import {
  ecrireOrientationAnalyseDansNotes,
  extraireRemarqueSansOrientation,
  lireOrientationAnalyseDepuisNotes,
  type IdOrientationStatutAnalyse,
} from "@/constants/laboratoire-orientations";
import {
  ecrirePiecesJointesDansNotes,
  lirePiecesJointesDepuisNotes,
  type PieceJointeExamenPersistee,
} from "@/constants/laboratoire-notes-examen";
import { trierParametresParFormulaire } from "@/lib/laboratoire/ordre-parametres-formulaire";
import { calculerFlagDepuisParametre } from "@/lib/laboratoire/indicateur-resultat";
import { estValeurAutres } from "@/lib/laboratoire/config-saisie-parametre";
import { resoudreConfigSaisieParametre } from "@/lib/laboratoire/resoudre-config-saisie-parametre";
import type {
  ActionEnregistrementResultat,
  LigneResultatSaisie,
  ParametreSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";

export type {
  ExamenSaisieDto,
  LigneResultatSaisie,
  ParametreSaisieDto,
  SaisieResultatsDto,
} from "@/lib/laboratoire/saisie-resultats-types";

function mapperParametres(
  parametresCatalogue: {
    id: string;
    nom: string;
    unite: string | null;
    rangeUsuelle: string | null;
    obligatoire: boolean;
    ordre: number;
    configSaisie?: unknown;
  }[],
  resultatsExistants: {
    parametreTypeExamenId: string | null;
    valeur: string;
    flag: string | null;
    valeurSecondaire: string | null;
    nonRequis: boolean;
    commentaire: string | null;
  }[],
  formulaire: string | null
): ParametreSaisieDto[] {
  const parId = new Map(
    resultatsExistants
      .filter((r) => r.parametreTypeExamenId)
      .map((r) => [r.parametreTypeExamenId!, r])
  );

  const mappees = parametresCatalogue.map((p) => {
      const existant = parId.get(p.id);
      return {
        id: p.id,
        nom: p.nom,
        unite: p.unite,
        rangeUsuelle: p.rangeUsuelle,
        obligatoire: p.obligatoire,
        ordre: p.ordre,
        valeur: existant?.valeur ?? "",
        flag: existant?.flag ?? null,
        valeurSecondaire: existant?.valeurSecondaire ?? null,
        nonRequis: existant?.nonRequis ?? false,
        commentaire: existant?.commentaire ?? "",
        configSaisie: resoudreConfigSaisieParametre({
          configSaisie: p.configSaisie,
          nom: p.nom,
          typeExamen: { formulaire },
        }),
      };
    });

  return trierParametresParFormulaire(formulaire, mappees);
}

export async function chargerSaisieResultats(
  dossierId: string
): Promise<SaisieResultatsDto | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        where: { statut: { not: "ANNULE" } },
        orderBy: { createdAt: "asc" },
        include: {
          typeExamen: {
            include: {
              parametres: { orderBy: { ordre: "asc" } },
            },
          },
          resultats: true,
        },
      },
    },
  });

  if (!dossier) return null;

  const patient = dossier.patient;

  return {
    dossierId: dossier.id,
    numeroEnregistrement: dossier.numeroDossier,
    numeroTransfert: patient.numeroPatient,
    prenom: patient.prenom,
    nom: patient.nom,
    sexe: patient.sexe,
    age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
    telephone: patient.telephone,
    examens: dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      code: ex.typeExamen.code,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      prix: Number(ex.typeExamen.prix),
      statut: ex.statut,
      orientationAnalyse: lireOrientationAnalyseDepuisNotes(ex.notes),
      formulaire: ex.typeExamen.formulaire,
      remarque: extraireRemarqueSansOrientation(ex.notes) || null,
      parametres: mapperParametres(
        ex.typeExamen.parametres,
        ex.resultats,
        ex.typeExamen.formulaire
      ),
      piecesJointes: lirePiecesJointesDepuisNotes(ex.notes),
    })),
  };
}

export async function enregistrerResultatsExamen(
  examenId: string,
  technicienId: string,
  input: {
    lignes: LigneResultatSaisie[];
    remarque?: string | null;
    piecesJointes?: PieceJointeExamenPersistee[];
    action?: ActionEnregistrementResultat;
    /** @deprecated utiliser action */
    verifier?: boolean;
  }
) {
  const action: ActionEnregistrementResultat =
    input.action ?? (input.verifier === true ? "verifier" : "brouillon");

  const examen = await prisma.examenLaboratoire.findUnique({
    where: { id: examenId },
    include: {
      typeExamen: {
        include: { parametres: true },
      },
    },
  });

  if (!examen) throw new Error("Examen introuvable.");

  const idsValides = new Set(examen.typeExamen.parametres.map((p) => p.id));
  const catalogue = new Map(examen.typeExamen.parametres.map((p) => [p.id, p]));

  const exigerParametres = action === "verifier";

  for (const ligne of input.lignes) {
    if (!idsValides.has(ligne.parametreTypeExamenId)) {
      throw new Error("Paramètre invalide pour cet examen.");
    }
    const cat = catalogue.get(ligne.parametreTypeExamenId)!;
    const nonRequis = ligne.nonRequis === true;
    const config = resoudreConfigSaisieParametre({
      configSaisie: cat.configSaisie,
      nom: cat.nom,
      typeExamen: { formulaire: examen.typeExamen.formulaire },
    });

    if (exigerParametres && !nonRequis && cat.obligatoire) {
      const valeurVide = !ligne.valeur.trim();
      const autresSansPreciser =
        config.typeSaisie === "select_autres" &&
        (estValeurAutres(ligne.valeur) || ligne.valeur === "Autres") &&
        !ligne.valeurSecondaire?.trim();
      if (valeurVide || autresSansPreciser) {
        throw new Error(`Le paramètre « ${cat.nom} » est requis.`);
      }
    }
  }

  const { statut, orientation } = statutEtOrientationPourAction(action, examen.statut);

  await prisma.$transaction(async (tx) => {
    if (action !== "rejeter") {
      for (const ligne of input.lignes) {
        const cat = catalogue.get(ligne.parametreTypeExamenId)!;
        const configSaisie = resoudreConfigSaisieParametre({
          configSaisie: cat.configSaisie,
          nom: cat.nom,
          typeExamen: { formulaire: examen.typeExamen.formulaire },
        });
        const flag = calculerFlagDepuisParametre({
          valeur: ligne.valeur.trim(),
          valeurSecondaire: ligne.valeurSecondaire,
          rangeUsuelle: cat.rangeUsuelle,
          nonRequis: ligne.nonRequis === true,
          typeSaisie: configSaisie.typeSaisie,
        });
        const anormal = flag === "B" || flag === "E";
        await tx.resultatExamen.upsert({
          where: {
            examenId_parametreTypeExamenId: {
              examenId,
              parametreTypeExamenId: ligne.parametreTypeExamenId,
            },
          },
          create: {
            examenId,
            parametreTypeExamenId: ligne.parametreTypeExamenId,
            parametre: cat.nom,
            valeur: ligne.valeur.trim(),
            unite: cat.unite,
            normeMin: null,
            normeMax: cat.rangeUsuelle,
            nonRequis: ligne.nonRequis === true,
            anormal,
            flag,
            valeurSecondaire: ligne.valeurSecondaire?.trim() || null,
            commentaire: ligne.commentaire?.trim() || null,
          },
          update: {
            parametre: cat.nom,
            valeur: ligne.valeur.trim(),
            unite: cat.unite,
            normeMax: cat.rangeUsuelle,
            nonRequis: ligne.nonRequis === true,
            anormal,
            flag,
            valeurSecondaire: ligne.valeurSecondaire?.trim() || null,
            commentaire: ligne.commentaire?.trim() || null,
          },
        });
      }
    }

    const maintenant = new Date();
    const remarqueBase =
      input.remarque?.trim() ||
      extraireRemarqueSansOrientation(examen.notes) ||
      null;
    const pieces =
      input.piecesJointes ??
      lirePiecesJointesDepuisNotes(examen.notes);
    const notesAvecPj = ecrirePiecesJointesDansNotes(remarqueBase, pieces);
    const notes = ecrireOrientationAnalyseDansNotes(notesAvecPj, orientation);

    await tx.examenLaboratoire.update({
      where: { id: examenId },
      data: {
        notes,
        technicienId,
        statut,
        resultatLe:
          action === "verifier" || action === "approuver"
            ? maintenant
            : examen.resultatLe,
      },
    });
  });
}

function statutEtOrientationPourAction(
  action: ActionEnregistrementResultat,
  statutActuel: string
): { statut: "PRESCRIT" | "PRELEVE" | "EN_ANALYSE" | "TERMINE" | "ANNULE"; orientation: IdOrientationStatutAnalyse } {
  switch (action) {
    case "verifier":
      return { statut: "TERMINE", orientation: "VERIFIES" };
    case "rejeter":
      return { statut: "ANNULE", orientation: "REJETES" };
    case "approuver":
      return { statut: "TERMINE", orientation: "DR_APPROUVE" };
    case "brouillon":
    default:
      return {
        statut: statutActuel === "TERMINE" ? "TERMINE" : "EN_ANALYSE",
        orientation: "EN_COURS",
      };
  }
}
