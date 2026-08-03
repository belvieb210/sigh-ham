import "server-only";
import type { StatutTransfert } from "@/generated/prisma/client";
import type { PatientEnregistre } from "@/constants/reception";
import { prisma } from "@/lib/prisma";

export const STATUTS_TRANSFERT_INACTIFS: StatutTransfert[] = ["ANNULE", "REFUSE"];

const LIBELLES_TYPE_VISITE: Record<string, string> = {
  nouveau: "Nouveau patient",
  ancien: "Ancien patient",
  urgence: "Urgence",
  rdv: "Rendez-vous",
};

const COULEURS_ORIENTATION: Record<string, string> = {
  Infirmiers: "bg-violet-100 text-violet-700",
  Médecin: "bg-blue-100 text-blue-700",
  Médecins: "bg-blue-100 text-blue-700",
  Caisse: "bg-rose-100 text-rose-700",
  Laboratoire: "bg-cyan-100 text-cyan-800",
  Église: "bg-emerald-100 text-emerald-700",
  Pharmacie: "bg-indigo-100 text-indigo-700",
  Hospitalisation: "bg-orange-100 text-orange-800",
  Réception: "bg-slate-100 text-slate-600",
  "Non orienté": "bg-slate-100 text-slate-600",
};

const COULEURS_STATUT: Record<string, string> = {
  "En attente": "bg-amber-100 text-amber-800",
  "En cours": "bg-blue-100 text-blue-700",
  Transféré: "bg-emerald-100 text-emerald-700",
  Rejeté: "bg-red-100 text-red-700",
  "À confirmer": "bg-orange-100 text-orange-800",
};

export function raccourcirNomSalle(nom: string): string {
  if (nom.startsWith("Médecin")) return "Médecin";
  if (nom.startsWith("Église")) return "Église";
  if (nom.startsWith("Infirmier")) return "Infirmiers";
  if (nom.startsWith("Laboratoire")) return "Laboratoire";
  if (nom.startsWith("Pharmacie")) return "Pharmacie";
  if (nom.startsWith("Hospitalisation")) return "Hospitalisation";
  if (nom.startsWith("Réception")) return "Réception";
  return nom;
}

function formaterHeure(date: Date): string {
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function mapperStatutTransfert(statut: StatutTransfert): {
  statut: string;
  statutCouleur: string;
} {
  switch (statut) {
    case "ACCEPTE":
    case "TERMINE":
      return { statut: "Transféré", statutCouleur: COULEURS_STATUT.Transféré };
    case "EN_TRAITEMENT":
      return { statut: "En cours", statutCouleur: COULEURS_STATUT["En cours"] };
    case "REFUSE":
      return { statut: "Rejeté", statutCouleur: COULEURS_STATUT.Rejeté };
    case "EN_ATTENTE":
    default:
      return { statut: "À confirmer", statutCouleur: COULEURS_STATUT["À confirmer"] };
  }
}

function determinerStatutVisite(
  statutPassage: string | undefined,
  statutTransfert: StatutTransfert | undefined,
  enRecuperation: boolean
): { statut: string; statutCouleur: string } {
  if (statutTransfert === "REFUSE" && enRecuperation) {
    return { statut: "Rejeté", statutCouleur: COULEURS_STATUT.Rejeté };
  }
  if (statutTransfert) {
    return mapperStatutTransfert(statutTransfert);
  }
  if (statutPassage === "EN_COURS") {
    return { statut: "En cours", statutCouleur: COULEURS_STATUT["En cours"] };
  }
  return { statut: "En attente", statutCouleur: COULEURS_STATUT["En attente"] };
}

const includeDernierTransfertReception = {
  where: {
    salleOrigine: { code: "RECEPTION" as const },
    statut: { not: "ANNULE" as const },
  },
  orderBy: { emisLe: "desc" as const },
  take: 1,
  include: {
    salleDestination: true,
    salleOrigine: true,
    recuperation: true,
  },
} as const;

const includeVisiteAccueil = {
  patient: true,
  enregistrementsReception: { orderBy: { enregistreLe: "desc" as const }, take: 1 },
  passages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      fileAttente: { include: { salle: true } },
    },
  },
  transferts: includeDernierTransfertReception,
} as const;

const includeVisiteTransfertReception = {
  patient: true,
  enregistrementsReception: { orderBy: { enregistreLe: "desc" as const }, take: 1 },
  passages: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    include: {
      fileAttente: { include: { salle: true } },
    },
  },
  transferts: includeDernierTransfertReception,
} as const;

export type DossierVisite = Awaited<ReturnType<typeof chargerDossiersAccueil>>[number];

export async function chargerDossiersVisiteReception(options?: {
  limite?: number;
  uniquementTransfertDepuisReception?: boolean;
}) {
  return prisma.dossierPatient.findMany({
    take: options?.limite,
    where: {
      enregistrementsReception: { some: {} },
      ...(options?.uniquementTransfertDepuisReception
        ? {
            OR: [
              {
                transferts: {
                  some: {
                    salleOrigine: { code: "RECEPTION" },
                    statut: { notIn: ["ANNULE", "REFUSE"] },
                  },
                },
              },
              {
                transferts: {
                  some: {
                    salleOrigine: { code: "RECEPTION" },
                    statut: "REFUSE",
                    recuperation: { statut: "EN_RECUPERATION" },
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: includeVisiteTransfertReception,
    orderBy: { ouvertLe: "desc" },
  });
}

export async function chargerDossiersAccueil(limite?: number) {
  return prisma.dossierPatient.findMany({
    take: limite,
    where: { enregistrementsReception: { some: {} } },
    include: includeVisiteAccueil,
    orderBy: { ouvertLe: "desc" },
  });
}

export function dateActiviteVisite(dossier: DossierVisite): Date {
  const transfert = dossier.transferts[0];
  const enregistrement = dossier.enregistrementsReception[0];
  const dates = [dossier.ouvertLe, enregistrement?.enregistreLe, transfert?.emisLe].filter(
    Boolean
  ) as Date[];
  return dates.reduce((max, date) => (date > max ? date : max), dates[0] ?? dossier.ouvertLe);
}

function estEnRecuperation(
  transfert: DossierVisite["transferts"][number] | undefined
): boolean {
  if (!transfert) return false;
  const rec = (transfert as { recuperation?: { statut: string } }).recuperation;
  return rec?.statut === "EN_RECUPERATION";
}

export function mapperDossierVisite(dossier: DossierVisite): PatientEnregistre {
  const { patient } = dossier;
  const enregistrement = dossier.enregistrementsReception[0];
  const passage = dossier.passages[0];
  const transfertActuel = dossier.transferts[0];
  const fileAttente = passage?.fileAttente;
  const enRecuperation = estEnRecuperation(transfertActuel);

  let orientation = "Non orienté";
  if (transfertActuel && transfertActuel.statut !== "REFUSE") {
    orientation = raccourcirNomSalle(transfertActuel.salleDestination.nom);
  } else if (transfertActuel?.statut === "REFUSE" && enRecuperation) {
    orientation = raccourcirNomSalle(transfertActuel.salleDestination.nom);
  } else if (fileAttente && !fileAttente.serviLe) {
    orientation = raccourcirNomSalle(fileAttente.salle.nom);
  }

  const { statut, statutCouleur } = determinerStatutVisite(
    passage?.statut,
    transfertActuel?.statut,
    enRecuperation
  );

  const motif =
    transfertActuel?.motif ??
    dossier.motifOuverture ??
    (enregistrement
      ? LIBELLES_TYPE_VISITE[enregistrement.typeVisite] ?? enregistrement.typeVisite
      : "Visite");

  return {
    cleListe: dossier.id,
    dossierId: dossier.id,
    id: patient.numeroPatient,
    nom: `${patient.nom} ${patient.prenom}`,
    telephone: patient.telephone ?? "—",
    motif,
    orientation,
    orientationCouleur: COULEURS_ORIENTATION[orientation] ?? COULEURS_ORIENTATION["Non orienté"],
    statut,
    statutCouleur,
    heure: formaterHeure(dateActiviteVisite(dossier)),
    transfertId: transfertActuel?.id,
    statutTransfert: transfertActuel?.statut,
    enRecuperation,
    codeSalleDestination: transfertActuel?.salleDestination?.code,
  };
}

function heureEnMinutes(heure: string): number {
  const [h, m] = heure.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function scoreLignePatient(patient: PatientEnregistre): number {
  let score = heureEnMinutes(patient.heure);
  if (patient.transfertId) score += 24 * 60;
  return score;
}

function choisirMeilleureLignePatient(
  a: PatientEnregistre,
  b: PatientEnregistre
): PatientEnregistre {
  return scoreLignePatient(a) >= scoreLignePatient(b) ? a : b;
}

/** Une seule ligne par patient : garde la visite la plus pertinente (transfert prioritaire). */
export function dedupliquerParPatient(patients: PatientEnregistre[]): PatientEnregistre[] {
  const parPatient = new Map<string, PatientEnregistre>();
  for (const patient of patients) {
    const existant = parPatient.get(patient.id);
    parPatient.set(
      patient.id,
      existant ? choisirMeilleureLignePatient(existant, patient) : patient
    );
  }
  return Array.from(parPatient.values()).sort(
    (a, b) => heureEnMinutes(b.heure) - heureEnMinutes(a.heure)
  );
}

export function trierDossiersParActivite(dossiers: DossierVisite[]): DossierVisite[] {
  return [...dossiers].sort(
    (a, b) => dateActiviteVisite(b).getTime() - dateActiviteVisite(a).getTime()
  );
}

export function dossiersVersPatients(dossiers: DossierVisite[]): PatientEnregistre[] {
  return trierDossiersParActivite(dossiers).map(mapperDossierVisite);
}
