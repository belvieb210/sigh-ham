import "server-only";
import { prisma } from "@/lib/prisma";
import { calculerAge } from "@/features/caisse/utils-format";
import { deriverStatutAnalyse } from "@/lib/laboratoire/orienter-statut-analyse";
import type { PatientFileLaboratoire } from "@/lib/laboratoire/types";

function raccourcirOrientation(nom: string): string {
  if (nom.startsWith("Médecin")) {
    return nom.includes("externe") ? "Médecin externe" : "Médecin";
  }
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Caisse")) return "Caisse";
  if (nom.startsWith("Réception") || nom.startsWith("Reception")) return "Réception";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  return nom;
}

function libelleStatutSortant(opts: {
  statut: string;
  enRecuperation: boolean;
}): { statutAnalyse: string; orientation: string } {
  if (opts.enRecuperation && opts.statut === "REFUSE") {
    return { statutAnalyse: "REJETES", orientation: "Rejeté" };
  }
  if (opts.statut === "EN_ATTENTE") {
    return { statutAnalyse: "RECUS", orientation: "À confirmer" };
  }
  if (opts.statut === "ACCEPTE" || opts.statut === "EN_TRAITEMENT") {
    return { statutAnalyse: "EN_COURS", orientation: "Confirmé" };
  }
  if (opts.statut === "TERMINE") {
    return { statutAnalyse: "VERIFIES", orientation: "Terminé" };
  }
  return { statutAnalyse: "RECUS", orientation: opts.statut };
}

/**
 * Patients que le laboratoire a orientés / transférés vers d'autres salles.
 */
export async function listerTransfertsSortantsLaboratoire(): Promise<
  PatientFileLaboratoire[]
> {
  const limiteAnciens = new Date();
  limiteAnciens.setDate(limiteAnciens.getDate() - 14);

  const transferts = await prisma.transfert.findMany({
    where: {
      salleOrigine: { code: "LABORATOIRE" },
      OR: [
        { statut: "EN_ATTENTE" },
        {
          statut: "REFUSE",
          recuperation: { statut: "EN_RECUPERATION" },
        },
        {
          statut: { in: ["ACCEPTE", "EN_TRAITEMENT", "TERMINE"] },
          emisLe: { gte: limiteAnciens },
        },
      ],
    },
    include: {
      salleDestination: { select: { code: true, nom: true } },
      recuperation: { select: { statut: true } },
      emetteur: { select: { prenom: true, nom: true } },
      dossier: {
        include: {
          patient: true,
          examensLaboratoire: { include: { typeExamen: true } },
          enregistrementsReception: {
            orderBy: { enregistreLe: "desc" },
            take: 1,
            include: { agent: { select: { prenom: true, nom: true } } },
          },
        },
      },
      passage: {
        include: {
          fileAttente: true,
        },
      },
    },
    orderBy: { emisLe: "desc" },
  });

  /** Regrouper par dossier : une ligne, destinations multiples */
  const parDossier = new Map<string, typeof transferts>();
  for (const t of transferts) {
    const liste = parDossier.get(t.dossierId) ?? [];
    liste.push(t);
    parDossier.set(t.dossierId, liste);
  }

  const resultats: PatientFileLaboratoire[] = [];

  for (const [, groupe] of parDossier) {
    const principal = groupe[0]!;
    const dossier = principal.dossier;
    const patient = dossier.patient;
    const enRecuperation = groupe.some(
      (t) => t.recuperation?.statut === "EN_RECUPERATION"
    );
    const sortantActif =
      groupe.find((t) => t.statut === "EN_ATTENTE") ??
      groupe.find((t) => t.statut === "REFUSE") ??
      principal;

    const { statutAnalyse } = libelleStatutSortant({
      statut: sortantActif.statut,
      enRecuperation,
    });

    const examens = dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      libelle: ex.typeExamen.libelle,
      categorie: ex.typeExamen.categorie,
      statut: ex.statut,
      code: ex.typeExamen.code,
      notes: ex.notes ?? null,
    }));

    const enreg = dossier.enregistrementsReception[0] ?? null;
    const formaterNom = (prenom?: string | null, nom?: string | null) => {
      const n = `${prenom ?? ""} ${nom ?? ""}`.trim();
      return n || null;
    };

    const destinations = [
      ...new Set(groupe.map((t) => raccourcirOrientation(t.salleDestination.nom))),
    ];
    const codes = [...new Set(groupe.map((t) => t.salleDestination.code))];

    resultats.push({
      fileAttenteId: principal.passage?.fileAttente?.id ?? principal.id,
      passageId: principal.passageId ?? "",
      transfertId: sortantActif.id,
      dossierId: dossier.id,
      numeroPatient: patient.numeroPatient,
      numeroDossier: dossier.numeroDossier,
      prenom: patient.prenom,
      nom: patient.nom,
      telephone: patient.telephone,
      sexe: patient.sexe ?? null,
      dateNaissance: patient.dateNaissance?.toISOString() ?? null,
      age: calculerAge(patient.dateNaissance?.toISOString() ?? null),
      arriveeLe: principal.emisLe.toISOString(),
      numeroOrdre: 0,
      provenance: "Laboratoire",
      medecinResponsable: enreg?.medecinResponsable?.trim() || null,
      numeroTransfert: patient.numeroPatient,
      numeroEnregistrement: dossier.numeroDossier,
      heureTransfert: principal.emisLe.toISOString(),
      heureEnregistrement: enreg?.enregistreLe?.toISOString() ?? null,
      enregistrePar: formaterNom(enreg?.agent?.prenom, enreg?.agent?.nom),
      transferePar: formaterNom(
        principal.emetteur?.prenom,
        principal.emetteur?.nom
      ),
      examens,
      nombreExamens: examens.length,
      statutAnalyse: deriverStatutAnalyse(examens) || statutAnalyse,
      numeroFacture: null,
      modePaiement: null,
      statutFacture: null,
      transfertSortantId: sortantActif.id,
      statutTransfertSortant: sortantActif.statut,
      codeSalleDestination: sortantActif.salleDestination.code,
      codesSalleDestination: codes,
      enRecuperation,
      orientation: destinations.join(", "),
    });
  }

  return resultats.sort(
    (a, b) => new Date(b.arriveeLe).getTime() - new Date(a.arriveeLe).getTime()
  );
}

export async function compterTransfertsSortantsNonConfirmes(): Promise<number> {
  return prisma.transfert.count({
    where: {
      salleOrigine: { code: "LABORATOIRE" },
      statut: "EN_ATTENTE",
    },
  });
}
