import "server-only";
import { prisma } from "@/lib/prisma";
import { genererNumerosPatient } from "@/lib/reception/numeros";

/** Client walk-in pharmacie → Patient + Dossier */
export async function creerClientPharmacie(data: {
  prenom: string;
  nom: string;
  telephone?: string;
  adresse?: string;
}) {
  const prenom = data.prenom.trim();
  const nom = data.nom.trim();
  if (!prenom || !nom) throw new Error("Prénom et nom requis.");

  return prisma.$transaction(async (tx) => {
    const { numeroPatient, numeroEnregistrement } =
      await genererNumerosPatient(tx);

    const patient = await tx.patient.create({
      data: {
        numeroPatient,
        prenom,
        nom,
        telephone: data.telephone?.trim() || null,
        adresse: data.adresse?.trim() || null,
        sexe: "AUTRE",
      },
    });

    const dossier = await tx.dossierPatient.create({
      data: {
        numeroDossier: `PH-${numeroEnregistrement}`,
        patientId: patient.id,
        motifOuverture: "Vente pharmacie",
      },
    });

    return { patient, dossier };
  });
}
