import "server-only";
import { prisma } from "@/lib/prisma";
import { resoudreAgePatient } from "@/features/caisse/utils-format";
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
import { resoudreFormulaireExamen } from "@/lib/laboratoire/formulaire-depuis-categorie";
import { nomsParametresDepuisFormulaire } from "@/lib/laboratoire/parametres-modele-formulaire";
import { validerCalculsPourVerification } from "@/lib/laboratoire/calculs-automatiques";
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
    id: string;
    parametreTypeExamenId: string | null;
    parametre: string;
    valeur: string;
    flag: string | null;
    valeurSecondaire: string | null;
    nonRequis: boolean;
    commentaire: string | null;
    unite: string | null;
    normeMax: string | null;
  }[],
  formulaire: string | null
): ParametreSaisieDto[] {
  const idsCatalogue = new Set(parametresCatalogue.map((p) => p.id));
  const parId = new Map(
    resultatsExistants
      .filter((r) => r.parametreTypeExamenId && idsCatalogue.has(r.parametreTypeExamenId))
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

  const personnalises: ParametreSaisieDto[] = resultatsExistants
    .filter(
      (r) =>
        !r.parametreTypeExamenId || !idsCatalogue.has(r.parametreTypeExamenId)
    )
    .map((r, index) => ({
      id: r.id,
      nom: r.parametre,
      unite: r.unite,
      rangeUsuelle: r.normeMax,
      obligatoire: false,
      ordre: 10_000 + index,
      valeur: r.valeur ?? "",
      flag: r.flag,
      valeurSecondaire: r.valeurSecondaire,
      nonRequis: r.nonRequis,
      commentaire: r.commentaire ?? "",
      configSaisie: { typeSaisie: "texte" as const },
      personnalise: true,
    }));

  return [
    ...trierParametresParFormulaire(formulaire, mappees),
    ...personnalises,
  ];
}

async function assurerParametresTypeExamen(type: {
  id: string;
  code: string;
  libelle: string;
  categorie: string;
  prix: unknown;
  formulaire: string | null;
  parametres: {
    id: string;
    nom: string;
    unite: string | null;
    rangeUsuelle: string | null;
    obligatoire: boolean;
    ordre: number;
    configSaisie?: unknown;
  }[];
}) {
  const formulaire = resoudreFormulaireExamen(type.formulaire, type.categorie);
  if (type.parametres.length > 0) {
    return { ...type, formulaire: formulaire ?? type.formulaire };
  }
  const noms = nomsParametresDepuisFormulaire(formulaire);
  if (!noms.length) {
    return { ...type, formulaire: formulaire ?? type.formulaire };
  }
  await prisma.$transaction(async (tx) => {
    if (!type.formulaire && formulaire) {
      await tx.typeExamen.update({
        where: { id: type.id },
        data: { formulaire },
      });
    }
    await tx.parametreTypeExamen.createMany({
      data: noms.map((nom, i) => ({
        typeExamenId: type.id,
        nom,
        obligatoire: true,
        ordre: i,
      })),
    });
  });
  const rafraichi = await prisma.typeExamen.findUniqueOrThrow({
    where: { id: type.id },
    include: { parametres: { orderBy: { ordre: "asc" } } },
  });
  return {
    ...rafraichi,
    formulaire: resoudreFormulaireExamen(
      rafraichi.formulaire,
      rafraichi.categorie
    ),
  };
}
export async function chargerSaisieResultats(
  dossierId: string,
  options?: { inclureRejetes?: boolean }
): Promise<SaisieResultatsDto | null> {
  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        where: options?.inclureRejetes ? undefined : { statut: { not: "ANNULE" } },
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

  const transfertCourant = await prisma.transfert.findFirst({
    where: { dossierId, numeroTransfert: { not: null } },
    orderBy: { createdAt: "asc" },
    select: { numeroTransfert: true },
  });

  const examensAssures = await Promise.all(
    dossier.examensLaboratoire.map(async (ex) => {
      const type = await assurerParametresTypeExamen(ex.typeExamen);
      const formulaire = resoudreFormulaireExamen(
        type.formulaire,
        type.categorie
      );
      return {
        id: ex.id,
        code: type.code,
        libelle: type.libelle,
        categorie: type.categorie,
        prix: Number(type.prix),
        statut: ex.statut,
        orientationAnalyse: lireOrientationAnalyseDepuisNotes(ex.notes),
        formulaire,
        remarque: extraireRemarqueSansOrientation(ex.notes) || null,
        parametres: mapperParametres(
          type.parametres,
          ex.resultats,
          formulaire
        ),
        piecesJointes: lirePiecesJointesDepuisNotes(ex.notes),
      };
    })
  );

  return {
    dossierId: dossier.id,
    numeroDossier: dossier.numeroDossier,
    numeroEnregistrement: patient.numeroPatient,
    numeroTransfert: transfertCourant?.numeroTransfert ?? null,
    prenom: patient.prenom,
    nom: patient.nom,
    sexe: patient.sexe,
    age: resoudreAgePatient({
      dateNaissance: patient.dateNaissance,
      age: patient.age,
    }),
    telephone: patient.telephone,
    examens: examensAssures,
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

  if (action === "restaurer") {
    if (examen.statut !== "ANNULE") {
      throw new Error("Seul un examen rejeté peut être restauré.");
    }
    await restaurerExamenRejete(examenId, technicienId, examen.notes);
    await evaluerClotureApresAction(examen.dossierId);
    return;
  }

  if (action === "supprimer") {
    if (examen.statut !== "ANNULE") {
      throw new Error("Seul un examen rejeté peut être supprimé.");
    }
    await supprimerExamenRejete(examenId);
    await evaluerClotureApresAction(examen.dossierId);
    return;
  }

  const idsValides = new Set(examen.typeExamen.parametres.map((p) => p.id));
  const catalogue = new Map(examen.typeExamen.parametres.map((p) => [p.id, p]));
  const nomsCatalogue = new Set(
    examen.typeExamen.parametres.map((p) => p.nom.trim().toUpperCase())
  );

  const lignesCatalogue = input.lignes.filter(
    (l) => !l.personnalise && Boolean(l.parametreTypeExamenId)
  );
  const lignesPerso = input.lignes.filter(
    (l) => l.personnalise === true || (!l.parametreTypeExamenId && Boolean(l.nom?.trim()))
  );

  const exigerParametres = action === "verifier";

  for (const ligne of lignesCatalogue) {
    const idCat = ligne.parametreTypeExamenId!;
    if (!idsValides.has(idCat)) {
      throw new Error("Paramètre invalide pour cet examen.");
    }
    const cat = catalogue.get(idCat)!;
    const nonRequis = ligne.nonRequis === true;
    const config = resoudreConfigSaisieParametre({
      configSaisie: cat.configSaisie,
      nom: cat.nom,
      typeExamen: { formulaire: resoudreFormulaireExamen(examen.typeExamen.formulaire, examen.typeExamen.categorie) },
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

  for (const ligne of lignesPerso) {
    const nom = ligne.nom?.trim() ?? "";
    if (!nom) {
      throw new Error("Un paramètre personnalisé doit avoir un nom.");
    }
    if (nomsCatalogue.has(nom.toUpperCase())) {
      throw new Error(
        `Le paramètre « ${nom} » existe déjà dans le catalogue de cet examen.`
      );
    }
  }

  const nomsPersoVus = new Set<string>();
  for (const ligne of lignesPerso) {
    const cle = ligne.nom!.trim().toUpperCase();
    if (nomsPersoVus.has(cle)) {
      throw new Error(`Paramètre personnalisé en double : « ${ligne.nom!.trim()} ».`);
    }
    nomsPersoVus.add(cle);
  }

  if (exigerParametres) {
    const parametresPourCalcul = [
      ...lignesCatalogue.map((ligne) => {
        const cat = catalogue.get(ligne.parametreTypeExamenId!)!;
        return { nom: cat.nom, valeur: ligne.valeur };
      }),
      ...lignesPerso.map((ligne) => ({
        nom: ligne.nom!.trim(),
        valeur: ligne.valeur,
      })),
    ];
    const erreurCalcul = validerCalculsPourVerification(
      resoudreFormulaireExamen(examen.typeExamen.formulaire, examen.typeExamen.categorie),
      parametresPourCalcul
    );
    if (erreurCalcul) {
      throw new Error(erreurCalcul);
    }
  }

  const { statut, orientation } = statutEtOrientationPourAction(action, examen.statut);

  await prisma.$transaction(async (tx) => {
    if (action !== "rejeter") {
      for (const ligne of lignesCatalogue) {
        const cat = catalogue.get(ligne.parametreTypeExamenId!)!;
        const configSaisie = resoudreConfigSaisieParametre({
          configSaisie: cat.configSaisie,
          nom: cat.nom,
          typeExamen: { formulaire: resoudreFormulaireExamen(examen.typeExamen.formulaire, examen.typeExamen.categorie) },
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
              parametreTypeExamenId: ligne.parametreTypeExamenId!,
            },
          },
          create: {
            examenId,
            parametreTypeExamenId: ligne.parametreTypeExamenId!,
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

      const customsExistants = await tx.resultatExamen.findMany({
        where: { examenId, parametreTypeExamenId: null },
        select: { id: true },
      });
      const idsPersoGardes = new Set(
        lignesPerso
          .map((l) => l.resultatId?.trim())
          .filter(
            (id): id is string =>
              typeof id === "string" && id.length > 0 && !id.startsWith("perso-")
          )
      );

      const idsASupprimer = customsExistants
        .map((r) => r.id)
        .filter((id) => !idsPersoGardes.has(id));
      if (idsASupprimer.length > 0) {
        await tx.resultatExamen.deleteMany({
          where: { id: { in: idsASupprimer } },
        });
      }

      for (const ligne of lignesPerso) {
        const nom = ligne.nom!.trim();
        const flag = calculerFlagDepuisParametre({
          valeur: ligne.valeur.trim(),
          valeurSecondaire: ligne.valeurSecondaire,
          rangeUsuelle: null,
          nonRequis: ligne.nonRequis === true,
          typeSaisie: "texte",
        });
        const anormal = flag === "B" || flag === "E";
        const dataCommun = {
          parametre: nom,
          valeur: ligne.valeur.trim(),
          unite: null as string | null,
          normeMin: null as string | null,
          normeMax: null as string | null,
          nonRequis: ligne.nonRequis === true,
          anormal,
          flag,
          valeurSecondaire: ligne.valeurSecondaire?.trim() || null,
          commentaire: ligne.commentaire?.trim() || null,
          parametreTypeExamenId: null as string | null,
        };
        const resultatId = ligne.resultatId?.trim();
        if (resultatId && !resultatId.startsWith("perso-") && idsPersoGardes.has(resultatId)) {
          const maj = await tx.resultatExamen.updateMany({
            where: {
              id: resultatId,
              examenId,
              parametreTypeExamenId: null,
            },
            data: dataCommun,
          });
          if (maj.count === 0) {
            await tx.resultatExamen.create({
              data: {
                examenId,
                ...dataCommun,
              },
            });
          }
        } else {
          await tx.resultatExamen.create({
            data: {
              examenId,
              ...dataCommun,
            },
          });
        }
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

  if (action === "verifier" || action === "approuver" || action === "rejeter") {
    await evaluerClotureApresAction(examen.dossierId);
  }
}

async function evaluerClotureApresAction(dossierId: string) {
  const { evaluerEtCloturerVisite } = await import(
    "@/lib/visites/evaluer-cloture-visite"
  );
  await evaluerEtCloturerVisite(dossierId);
}

async function restaurerExamenRejete(
  examenId: string,
  technicienId: string,
  notesActuelles: string | null
) {
  const remarqueBase = extraireRemarqueSansOrientation(notesActuelles) || null;
  const pieces = lirePiecesJointesDepuisNotes(notesActuelles);
  const notesAvecPj = ecrirePiecesJointesDansNotes(remarqueBase, pieces);
  const notes = ecrireOrientationAnalyseDansNotes(notesAvecPj, "VERIFIES");

  await prisma.examenLaboratoire.update({
    where: { id: examenId },
    data: {
      statut: "TERMINE",
      notes,
      technicienId,
    },
  });
}

async function supprimerExamenRejete(examenId: string) {
  await prisma.examenLaboratoire.delete({ where: { id: examenId } });
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
