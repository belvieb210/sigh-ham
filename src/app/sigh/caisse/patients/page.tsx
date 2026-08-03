import { redirect } from "next/navigation";

/** Ancienne route « patients en attente » → page transferts (layout réception) */
export default function PagePatientsCaisse() {
  redirect("/sigh/caisse/transferts");
}
