import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { genererNumerosClientPharmacie } from "@/lib/reception/numeros";

function dateNaissanceDepuisAge(age: number): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setFullYear(d.getFullYear() - age);
  return d;
}

function normaliserSexe(v?: string) {
  const s = (v ?? "").trim().toUpperCase();
  if (s === "M" || s === "MASCULIN") return "MASCULIN" as const;
  if (s === "F" || s === "FEMININ") return "FEMININ" as const;
  if (s === "AUTRE") return "AUTRE" as const;
  return null;
}

function estErreurNumeroPatientDuplique(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002" &&
    String(error.meta?.target ?? "").includes("numero_patient")
  );
}

/** Client walk-in pharmacie → Patient + Dossier */
export async function creerClientPharmacie(data: {
  prenom: string;
  nom: string;
  telephone?: string;
  adresse?: string;
  age?: number | null;
  sexe?: string;
}) {
  const prenom = data.prenom.trim();
  const nom = data.nom.trim();
  if (!prenom || !nom) throw new Error("Prénom et nom requis.");

  const age =
    data.age != null && Number.isFinite(data.age) && data.age >= 0 && data.age <= 130
      ? Math.floor(data.age)
      : null;

  for (let tentative = 0; tentative < 5; tentative++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const { numeroPatient, numeroEnregistrement } =
          await genererNumerosClientPharmacie(tx);

        const patient = await tx.patient.create({
          data: {
            numeroPatient,
            prenom,
            nom,
            telephone: data.telephone?.trim() || null,
            adresse: data.adresse?.trim() || null,
            sexe: normaliserSexe(data.sexe) ?? "AUTRE",
            dateNaissance: age != null ? dateNaissanceDepuisAge(age) : null,
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
    } catch (error) {
      if (estErreurNumeroPatientDuplique(error) && tentative < 4) continue;
      if (estErreurNumeroPatientDuplique(error)) {
        throw new Error(
          "Impossible d'attribuer un numéro client unique. Réessayez dans quelques secondes."
        );
      }
      throw error;
    }
  }

  throw new Error("Impossible de créer le client.");
}
