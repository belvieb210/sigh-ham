import "server-only";
import { calculerAge } from "@/features/caisse/utils-format";
import { prisma } from "@/lib/prisma";

export interface PatientFileMedecinsExternes {
  id: string;
  cleListe: string;
  fileAttenteId: string;
  passageId: string;
  dossierId: string;
  patientId: string;
  ordre: number;
  numeroOrdre: number;
  nomComplet: string;
  prenom: string;
  nom: string;
  numeroPatient: string;
  numeroDossier: string;
  age: number | null;
  sexe: string | null;
  telephone: string;
  motif: string;
  provenance: string;
  orientation: string;
  orientationCouleur: string;
  codeSalleDestination: string | null;
  codesSalleDestination: string[];
  statut: string;
  statutCouleur: string;
  transfertSortantId: string | null;
  statutTransfertSortant: string | null;
  enRecuperation: boolean;
  heure: string;
}

export interface StatsMedecinsExternesJour {
  patientsEnFile: number;
  consultationsAujourdhui: number;
  examensPrescritsAujourdhui: number;
  ordonnancesAujourdhui: number;
}

const COULEURS: Record<string, string> = {
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Pharmacie: "bg-emerald-100 text-emerald-800",
  Infirmiers: "bg-violet-100 text-violet-700",
  Médecin: "bg-blue-100 text-blue-700",
  Réception: "bg-slate-100 text-slate-700",
};

function formaterHeure(d: Date) {
  try {
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

function debutJour(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/** File isolée : uniquement les patients de ce médecin externe. */
export async function listerPatientsMedecinsExternes(
  medecinExterneId: string
): Promise<PatientFileMedecinsExternes[]> {
  const files = await prisma.fileAttente.findMany({
    where: {
      serviLe: null,
      salle: { code: "MEDECINS_EXTERNES" },
      passage: {
        dossier: { patient: { medecinExterneId } },
      },
    },
    include: {
      passage: {
        include: {
          dossier: { include: { patient: true } },
        },
      },
      salle: true,
    },
    orderBy: { numeroOrdre: "asc" },
  });

  const dossierIds = files.map((f) => f.passage.dossier.id);
  const transfertsSortants =
    dossierIds.length === 0
      ? []
      : await prisma.transfert.findMany({
          where: {
            dossierId: { in: dossierIds },
            salleOrigine: { code: "MEDECINS_EXTERNES" },
            OR: [
              { statut: "EN_ATTENTE" },
              {
                statut: "REFUSE",
                recuperation: { statut: "EN_RECUPERATION" },
              },
            ],
          },
          include: {
            salleDestination: true,
            recuperation: true,
          },
          orderBy: { emisLe: "asc" },
        });

  const byDossier = new Map<string, typeof transfertsSortants>();
  for (const t of transfertsSortants) {
    const list = byDossier.get(t.dossierId) ?? [];
    list.push(t);
    byDossier.set(t.dossierId, list);
  }

  return files.map((f, idx) => {
    const p = f.passage.dossier.patient;
    const sortants = byDossier.get(f.passage.dossier.id) ?? [];
    // ignorer auto-transfert local (origine = destination)
    const sortantsReels = sortants.filter(
      (t) => t.salleDestination.code !== "MEDECINS_EXTERNES"
    );
    const premier = sortantsReels[0];
    const noms = sortantsReels.map((t) => t.salleDestination.nom);
    const orientation =
      noms.length > 0 ? noms.map((n) => n.split(" ")[0] ?? n).join(", ") : "—";
    const enRecup =
      premier?.statut === "REFUSE" &&
      premier.recuperation?.statut === "EN_RECUPERATION";

    let statut = "En attente";
    let statutCouleur = "bg-amber-100 text-amber-800";
    if (enRecup) {
      statut = "Rejeté";
      statutCouleur = "bg-red-100 text-red-700";
    } else if (premier?.statut === "EN_ATTENTE") {
      statut = "À confirmer";
      statutCouleur = "bg-orange-100 text-orange-800";
    }

    return {
      id: f.passage.dossier.id,
      cleListe: f.passage.dossier.id,
      fileAttenteId: f.id,
      passageId: f.passageId,
      dossierId: f.passage.dossier.id,
      patientId: p.id,
      ordre: f.numeroOrdre ?? idx + 1,
      numeroOrdre: f.numeroOrdre ?? idx + 1,
      nomComplet: `${p.prenom} ${p.nom}`.trim(),
      prenom: p.prenom,
      nom: p.nom,
      numeroPatient: p.numeroPatient,
      numeroDossier: f.passage.dossier.numeroDossier,
      age: calculerAge(
        p.dateNaissance ? p.dateNaissance.toISOString() : null
      ),
      sexe: p.sexe,
      telephone: p.telephone ?? "",
      motif: f.passage.motif ?? f.passage.dossier.motifOuverture ?? "",
      provenance: "Médecin externe",
      orientation,
      orientationCouleur: COULEURS[orientation.split(",")[0]?.trim() ?? ""] ??
        "bg-slate-100 text-slate-700",
      codeSalleDestination: premier?.salleDestination.code ?? null,
      codesSalleDestination: sortantsReels.map((t) => t.salleDestination.code),
      statut,
      statutCouleur,
      transfertSortantId: premier?.id ?? null,
      statutTransfertSortant: premier?.statut ?? null,
      enRecuperation: Boolean(enRecup),
      heure: formaterHeure(f.arriveLe),
    };
  });
}

export async function statsMedecinsExternesJour(
  medecinExterneId: string,
  utilisateurId: string
): Promise<StatsMedecinsExternesJour> {
  const debut = debutJour();
  const [patientsEnFile, consultationsAujourdhui, examensPrescritsAujourdhui, ordonnancesAujourdhui] =
    await Promise.all([
      prisma.fileAttente.count({
        where: {
          serviLe: null,
          salle: { code: "MEDECINS_EXTERNES" },
          passage: { dossier: { patient: { medecinExterneId } } },
        },
      }),
      prisma.consultation.count({
        where: {
          medecinId: utilisateurId,
          debutLe: { gte: debut },
          dossier: { patient: { medecinExterneId } },
        },
      }),
      prisma.examenLaboratoire.count({
        where: {
          prescripteurId: utilisateurId,
          createdAt: { gte: debut },
          dossier: { patient: { medecinExterneId } },
        },
      }),
      prisma.ordonnance.count({
        where: {
          medecinId: utilisateurId,
          prescritLe: { gte: debut },
          dossier: { patient: { medecinExterneId } },
        },
      }),
    ]);

  return {
    patientsEnFile,
    consultationsAujourdhui,
    examensPrescritsAujourdhui,
    ordonnancesAujourdhui,
  };
}
