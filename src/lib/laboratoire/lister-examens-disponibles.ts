import "server-only";
import { patientCorrespondPageStatut, trierPatientsParArriveeDesc } from "@/features/laboratoire/utils-affichage";
import { listerPatientsLaboratoire } from "@/lib/laboratoire/lister-patients-laboratoire";

/** Patients avec au moins un examen Dr approuve (résultats validés). */
export async function listerPatientsExamensDisponibles() {
  const tous = await listerPatientsLaboratoire();
  return trierPatientsParArriveeDesc(
    tous.filter((p) => patientCorrespondPageStatut(p, "DR_APPROUVE"))
  );
}
