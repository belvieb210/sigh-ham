import "server-only";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { uploaderFichier } from "@/lib/stockage/fichiers";
import { genererPdfCertificatPrenuptial } from "@/lib/eglise/generer-certificat-pdf";

function formaterDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR");
}

/** Émet le certificat PDF à partir d'un ExamenPrenuptial ayant déjà un rapport. */
export async function emettreCertificatPrenuptial(examenPrenuptialId: string) {
  const prenuptial = await prisma.examenPrenuptial.findUnique({
    where: { id: examenPrenuptialId },
    include: {
      dossier: { include: { patient: true } },
    },
  });
  if (!prenuptial) throw new Error("Dossier prénuptial introuvable.");
  if (!prenuptial.rapportPdfUrl) {
    throw new Error("Le rapport laboratoire doit être disponible avant le certificat.");
  }
  if (prenuptial.certificatUrl) {
    return { id: prenuptial.id, url: prenuptial.certificatUrl, dejaExistant: true };
  }

  const patient = prenuptial.dossier.patient;
  const patientNom = [patient.prenom, patient.nom].filter(Boolean).join(" ");

  const buffer = await genererPdfCertificatPrenuptial({
    hopital: INFORMATIONS_HOPITAL.nomComplet ?? INFORMATIONS_HOPITAL.nomCourt,
    patient: patientNom,
    sexe: patient.sexe ?? "—",
    paroisse: prenuptial.paroisse,
    conjointNom: prenuptial.conjointNom,
    dateMariage: formaterDate(prenuptial.dateMariage),
    dateEmission: new Date().toLocaleDateString("fr-FR"),
    numeroDossier: prenuptial.dossier.numeroDossier,
  });

  const upload = await uploaderFichier(
    buffer,
    `certificat-prenuptial-${prenuptial.dossier.numeroDossier}.pdf`,
    "application/pdf"
  );

  await prisma.examenPrenuptial.update({
    where: { id: prenuptial.id },
    data: { certificatUrl: upload.url },
  });

  return { id: prenuptial.id, url: upload.url, dejaExistant: false };
}
