import "server-only";
import {
  creerDemandeRdvManuelle,
  listerDemandesRdv,
  mapperDemandeRdv,
  mettreAJourDemandeRdv,
  type DemandeRdvDto,
} from "@/lib/rdv/gestion-demandes";

export type RendezVousMedecins = DemandeRdvDto;

export const SERVICE_RDV_MEDECINS = "Consultation médicale";

export async function listerRendezVousMedecins(): Promise<RendezVousMedecins[]> {
  return listerDemandesRdv({ take: 200 });
}

export async function creerRendezVousMedecins(input: {
  prenom: string;
  nom: string;
  telephone: string;
  email?: string | null;
  motif?: string | null;
  dateSouhaitee: string;
  notes?: string | null;
}): Promise<RendezVousMedecins> {
  return creerDemandeRdvManuelle({
    ...input,
    typePrestation: "consultation",
    service: SERVICE_RDV_MEDECINS,
  });
}

export async function changerStatutRendezVousMedecins(
  id: string,
  statut: string
): Promise<RendezVousMedecins> {
  return mettreAJourDemandeRdv(id, { statut });
}

export { mapperDemandeRdv };
