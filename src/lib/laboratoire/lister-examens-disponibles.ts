import "server-only";
import { patientCorrespondPageStatut, trierPatientsParArriveeDesc } from "@/features/laboratoire/utils-affichage";
import { listerPatientsLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";
import { prisma } from "@/lib/prisma";

/** Patients avec au moins un examen Dr approuve (résultats validés). */
export async function listerPatientsExamensDisponibles() {
  const tous = await listerPatientsLaboratoire();
  return trierPatientsParArriveeDesc(
    tous.filter((p) => patientCorrespondPageStatut(p, "DR_APPROUVE"))
  );
}

/** Examens disponibles limités aux patients enregistrés par ce médecin externe. */
export async function listerPatientsExamensDisponiblesMedecinExterne(
  medecinExterneId: string
) {
  const tous = await listerPatientsExamensDisponibles();
  if (tous.length === 0) return [];

  const dossierIds = tous.map((p) => p.dossierId);
  const dossiersAutorises = await prisma.dossierPatient.findMany({
    where: {
      id: { in: dossierIds },
      patient: { medecinExterneId },
    },
    select: { id: true },
  });
  const idsAutorises = new Set(dossiersAutorises.map((d) => d.id));
  return tous.filter((p) => idsAutorises.has(p.dossierId));
}
