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

async function filtrerExamensDisponiblesParSalle(
  salleEnregistrement: "RECEPTION" | "EGLISE" | "MEDECINS_EXTERNES",
  extra?: { medecinExterneId?: string }
) {
  const tous = await listerPatientsExamensDisponibles();
  if (tous.length === 0) return [];

  const dossierIds = tous.map((p) => p.dossierId);
  const dossiersAutorises = await prisma.dossierPatient.findMany({
    where: {
      id: { in: dossierIds },
      salleEnregistrement,
      ...(extra?.medecinExterneId
        ? { patient: { medecinExterneId: extra.medecinExterneId } }
        : {}),
    },
    select: { id: true },
  });
  const idsAutorises = new Set(dossiersAutorises.map((d) => d.id));
  return tous.filter((p) => idsAutorises.has(p.dossierId));
}

/** Examens disponibles des patients enregistrés à la réception uniquement. */
export async function listerPatientsExamensDisponiblesReception() {
  return filtrerExamensDisponiblesParSalle("RECEPTION");
}

/** Examens disponibles limités aux patients enregistrés par ce médecin externe. */
export async function listerPatientsExamensDisponiblesMedecinExterne(
  medecinExterneId: string
) {
  return filtrerExamensDisponiblesParSalle("MEDECINS_EXTERNES", { medecinExterneId });
}

/** Examens disponibles limités aux patients enregistrés au service Église. */
export async function listerPatientsExamensDisponiblesEglise() {
  return filtrerExamensDisponiblesParSalle("EGLISE");
}
