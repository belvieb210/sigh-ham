import "server-only";
import { INFORMATIONS_HOPITAL } from "@/constants/navigation";
import { prisma } from "@/lib/prisma";
import { uploaderFichier } from "@/lib/stockage/fichiers";
import { genererPdfRapportPrenuptial } from "@/lib/eglise/generer-rapport-pdf";

function formaterDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toLocaleDateString("fr-FR");
}

/**
 * Génère et stocke le PDF de rapport prénuptial pour un dossier,
 * si un ExamenPrenuptial existe et qu'aucun rapport n'est encore présent
 * (ou si `forcer` est vrai).
 */
export async function genererEtStockerRapportPrenuptial(
  dossierId: string,
  options: { forcer?: boolean } = {}
) {
  const prenuptial = await prisma.examenPrenuptial.findFirst({
    where: { dossierId },
    orderBy: { planifieLe: "desc" },
  });
  if (!prenuptial) return null;
  if (prenuptial.rapportPdfUrl && !options.forcer) {
    return { id: prenuptial.id, url: prenuptial.rapportPdfUrl, dejaExistant: true };
  }

  const dossier = await prisma.dossierPatient.findUnique({
    where: { id: dossierId },
    include: {
      patient: true,
      examensLaboratoire: {
        include: {
          typeExamen: true,
          resultats: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!dossier) return null;

  const patientNom = [dossier.patient.prenom, dossier.patient.nom]
    .filter(Boolean)
    .join(" ");

  const buffer = await genererPdfRapportPrenuptial({
    hopital: INFORMATIONS_HOPITAL.nomComplet ?? INFORMATIONS_HOPITAL.nomCourt,
    numeroDossier: dossier.numeroDossier,
    patient: patientNom,
    sexe: dossier.patient.sexe ?? "—",
    dateNaissance: formaterDate(dossier.patient.dateNaissance),
    paroisse: prenuptial.paroisse,
    conjointNom: prenuptial.conjointNom,
    dateMariage: formaterDate(prenuptial.dateMariage),
    dateRapport: new Date().toLocaleString("fr-FR"),
    examens: dossier.examensLaboratoire.map((ex) => ({
      code: ex.typeExamen.code,
      libelle: ex.typeExamen.libelle,
      statut: ex.statut,
      resultats: ex.resultats.map((r) => ({
        parametre: r.parametre,
        valeur: r.valeur,
        unite: r.unite,
      })),
    })),
  });

  const upload = await uploaderFichier(
    buffer,
    `rapport-prenuptial-${dossier.numeroDossier}.pdf`,
    "application/pdf"
  );

  await prisma.examenPrenuptial.update({
    where: { id: prenuptial.id },
    data: {
      rapportPdfUrl: upload.url,
      statut: "TERMINE",
      termineLe: new Date(),
      resultat: "Rapport laboratoire généré",
    },
  });

  return { id: prenuptial.id, url: upload.url, dejaExistant: false };
}
