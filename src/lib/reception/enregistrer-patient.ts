import "server-only";
import { Sexe, type CodeSalle } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { parserAgeDeclare } from "@/features/caisse/utils-format";
import { genererNumerosPatient } from "@/lib/reception/numeros";
import type {
  DonneesEnregistrementPatient,
  ResultatEnregistrementPatient,
} from "@/lib/reception/types";

function normaliserPays(pays?: string): string {
  if (!pays || pays === "RDC") return "RD Congo";
  return pays;
}

export function construireObservations(donnees: DonneesEnregistrementPatient): string | null {
  const lignes: string[] = [];

  if (donnees.postNom?.trim()) lignes.push(`Post-nom : ${donnees.postNom.trim()}`);
  if (donnees.etatCivil?.trim()) lignes.push(`État civil : ${donnees.etatCivil.trim()}`);
  if (donnees.telephoneSecondaire?.trim()) {
    lignes.push(`Téléphone secondaire : ${donnees.telephoneSecondaire.trim()}`);
  }
  if (donnees.profession?.trim()) lignes.push(`Profession : ${donnees.profession.trim()}`);
  if (donnees.employeur?.trim()) lignes.push(`Employeur : ${donnees.employeur.trim()}`);
  if (donnees.numeroPieceIdentite?.trim()) {
    lignes.push(`N° pièce d'identité : ${donnees.numeroPieceIdentite.trim()}`);
  }
  if (donnees.observations?.trim()) lignes.push(donnees.observations.trim());

  return lignes.length > 0 ? lignes.join("\n") : null;
}

export function validerDonneesEnregistrement(
  donnees: Partial<DonneesEnregistrementPatient>
): string | null {
  if (!donnees.nom?.trim()) return "Le nom est obligatoire.";
  if (!donnees.prenom?.trim()) return "Le prénom est obligatoire.";
  if (!donnees.sexe) return "Le sexe est obligatoire.";

  const dateStr = donnees.dateNaissance?.trim() ?? "";
  if (dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return "Date de naissance invalide.";
    if (date > new Date()) return "La date de naissance ne peut pas être dans le futur.";
  }

  if (donnees.age !== undefined && donnees.age !== null) {
    if (
      typeof donnees.age !== "number" ||
      !Number.isInteger(donnees.age) ||
      donnees.age < 0 ||
      donnees.age > 150
    ) {
      return "L'âge doit être un nombre entier entre 0 et 150.";
    }
  }

  if (!donnees.telephone?.trim()) return "Le téléphone est obligatoire.";
  if (!donnees.adresse?.trim()) return "L'adresse est obligatoire.";

  return null;
}

/** Champs identité patient pour create/update Prisma. */
export function champsIdentitePatientPrisma(donnees: DonneesEnregistrementPatient) {
  const dateStr = donnees.dateNaissance?.trim() ?? "";
  return {
    nom: donnees.nom.trim().toUpperCase(),
    prenom: donnees.prenom.trim(),
    sexe: donnees.sexe as Sexe,
    dateNaissance: dateStr ? new Date(dateStr) : null,
    age: typeof donnees.age === "number" && donnees.age >= 0 ? donnees.age : null,
    telephone: donnees.telephone?.trim(),
    email: donnees.email?.trim() || null,
    adresse: donnees.adresse?.trim(),
    ville: donnees.ville?.trim() || null,
    province: donnees.commune?.trim() || null,
    pays: normaliserPays(donnees.pays),
    groupeSanguin:
      donnees.groupeSanguin?.trim() &&
      donnees.groupeSanguin !== "Inconnu" &&
      donnees.groupeSanguin !== ""
        ? donnees.groupeSanguin
        : null,
    contactUrgence: donnees.contactUrgence?.trim() || null,
    telephoneUrgence: donnees.telephoneUrgence?.trim() || null,
  };
}

export function parserDonneesEnregistrement(
  body: unknown
): Partial<DonneesEnregistrementPatient> {
  if (!body || typeof body !== "object") return {};

  const b = body as Record<string, unknown>;

  return extraireChampsEnregistrement(b);
}

function extraireChampsEnregistrement(
  b: Record<string, unknown>
): Partial<DonneesEnregistrementPatient> {
  const ageBrut = b.age;
  const ageTexte =
    ageBrut === undefined || ageBrut === null ? "" : String(ageBrut).trim();
  let age: number | null = null;
  if (ageTexte) {
    const parse = parserAgeDeclare(ageTexte);
    age = parse === null ? -1 : parse;
  }

  return {
    typeVisite: String(b.typeVisite ?? "nouveau").trim(),
    nom: String(b.nom ?? "").trim(),
    prenom: String(b.prenom ?? "").trim(),
    postNom: String(b.postNom ?? "").trim() || undefined,
    sexe: b.sexe === "MASCULIN" || b.sexe === "FEMININ" ? b.sexe : undefined,
    dateNaissance: String(b.dateNaissance ?? "").trim() || undefined,
    age,
    telephone: String(b.telephone ?? "").trim() || undefined,
    telephoneSecondaire: String(b.telephoneSecondaire ?? "").trim() || undefined,
    email: String(b.email ?? "").trim() || undefined,
    etatCivil: String(b.etatCivil ?? "").trim() || undefined,
    adresse: String(b.adresse ?? "").trim() || undefined,
    commune: String(b.commune ?? "").trim() || undefined,
    ville: String(b.ville ?? "").trim() || undefined,
    pays: String(b.pays ?? "RDC").trim() || undefined,
    contactUrgence: String(b.contactUrgence ?? "").trim() || undefined,
    telephoneUrgence: String(b.telephoneUrgence ?? "").trim() || undefined,
    profession: String(b.profession ?? "").trim() || undefined,
    employeur: String(b.employeur ?? "").trim() || undefined,
    groupeSanguin: String(b.groupeSanguin ?? "").trim() || undefined,
    assurance: String(b.assurance ?? "").trim() || undefined,
    numeroAssurance: String(b.numeroAssurance ?? "").trim() || undefined,
    numeroPieceIdentite: String(b.numeroPieceIdentite ?? "").trim() || undefined,
    observations: String(b.observations ?? "").trim() || undefined,
  };
}

export function parserFormDataEnregistrement(formData: FormData): {
  donnees: Partial<DonneesEnregistrementPatient>;
  photo: File | null;
} {
  const champs: Record<string, unknown> = {};
  formData.forEach((valeur, cle) => {
    if (cle !== "photo" && typeof valeur === "string") {
      champs[cle] = valeur;
    }
  });

  const photoEntree = formData.get("photo");
  const photo =
    photoEntree instanceof File && photoEntree.size > 0 ? photoEntree : null;

  return {
    donnees: extraireChampsEnregistrement(champs),
    photo,
  };
}

export async function enregistrerNouveauPatient(
  agentId: string,
  donnees: DonneesEnregistrementPatient,
  photo?: File | null,
  options?: { salleEnregistrement?: CodeSalle }
): Promise<ResultatEnregistrementPatient> {
  const erreur = validerDonneesEnregistrement(donnees);
  if (erreur) throw new Error(erreur);

  const resultat = await prisma.$transaction(async (tx) => {
    const { numeroPatient, numeroEnregistrement } = await genererNumerosPatient(tx);

    const patient = await tx.patient.create({
      data: {
        numeroPatient,
        ...champsIdentitePatientPrisma(donnees),
      },
    });

    const dossier = await tx.dossierPatient.create({
      data: {
        numeroDossier: numeroEnregistrement,
        patientId: patient.id,
        statut: "OUVERT",
        motifOuverture: "Nouvel enregistrement à la réception",
        salleEnregistrement: options?.salleEnregistrement ?? "RECEPTION",
      },
    });

    await tx.passage.create({
      data: {
        dossierId: dossier.id,
        statut: "EN_ATTENTE",
        motif: "Enregistrement réception — en attente d'orientation",
      },
    });

    await tx.enregistrementReception.create({
      data: {
        dossierId: dossier.id,
        agentId,
        typeVisite: donnees.typeVisite || "nouveau",
        assurance:
          donnees.assurance?.trim() &&
          donnees.assurance !== "Aucune" &&
          donnees.assurance !== ""
            ? donnees.assurance
            : null,
        numeroAssurance: donnees.numeroAssurance?.trim() || null,
        observations: construireObservations(donnees),
      },
    });

    return {
      patientId: patient.id,
      dossierId: dossier.id,
      numeroPatient,
      numeroEnregistrement,
    };
  });

  if (photo) {
    const { sauvegarderPhotoPatient } = await import("@/lib/reception/photo-patient");
    const photoUrl = await sauvegarderPhotoPatient(resultat.numeroPatient, photo);
    await prisma.patient.update({
      where: { id: resultat.patientId },
      data: { photoUrl },
    });
  }

  void notifierApresEnregistrement({
    patientId: resultat.patientId,
    dossierId: resultat.dossierId,
    numeroPatient: resultat.numeroPatient,
    prenom: donnees.prenom.trim(),
    nom: donnees.nom.trim(),
  });

  return resultat;
}

/** Déclenche les notifications après enregistrement (hors transaction). */
export async function notifierApresEnregistrement(resultat: {
  patientId: string;
  dossierId: string;
  numeroPatient: string;
  prenom: string;
  nom: string;
}) {
  const { evenementNouveauPatient } = await import("@/lib/notifications/evenements-metier");
  await evenementNouveauPatient({
    patientId: resultat.patientId,
    dossierId: resultat.dossierId,
    numeroPatient: resultat.numeroPatient,
    prenom: resultat.prenom,
    nom: resultat.nom,
  });
}
