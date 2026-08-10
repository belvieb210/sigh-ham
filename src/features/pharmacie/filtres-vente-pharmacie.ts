import type { FiltresFacturationCaisse } from "@/features/caisse/formulaire-filtres-facturation-caisse";
import type { ClientVentePharmacie } from "@/lib/pharmacie/lister-clients-vente-pharmacie";

export type FiltreSourceVentePharmacie = "TOUS" | "FILE" | "CLIENT" | "ORDONNANCE";

export function clientVenteCorrespondFiltres(
  c: ClientVentePharmacie,
  f: FiltresFacturationCaisse,
  source: FiltreSourceVentePharmacie = "TOUS"
): boolean {
  if (source !== "TOUS" && c.source !== source) return false;

  const nom = f.nom.trim().toLowerCase();
  const prenom = f.prenom.trim().toLowerCase();
  const tel = f.telephone.trim().replace(/\s+/g, "");
  const enreg = f.numeroEnreg.trim().toLowerCase();
  const idEntite = f.idEntite.trim().toLowerCase();

  if (nom && !`${c.nom} ${c.nomComplet}`.toLowerCase().includes(nom)) return false;
  if (prenom && !`${c.prenom} ${c.nomComplet}`.toLowerCase().includes(prenom))
    return false;
  if (tel && !(c.telephone || "").replace(/\s+/g, "").includes(tel)) return false;
  if (
    enreg &&
    !(c.numeroDossier || "").toLowerCase().includes(enreg) &&
    !(c.numeroPatient || "").toLowerCase().includes(enreg)
  ) {
    return false;
  }
  if (
    idEntite &&
    !(c.numeroPatient || "").toLowerCase().includes(idEntite) &&
    !(c.dossierId || "").toLowerCase().includes(idEntite)
  ) {
    return false;
  }
  if (f.dateDu || f.dateAu) {
    const jour = c.arriveeLe.slice(0, 10);
    if (f.dateDu && jour < f.dateDu) return false;
    if (f.dateAu && jour > f.dateAu) return false;
  }
  return true;
}
