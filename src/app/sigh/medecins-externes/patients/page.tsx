import { redirect } from "next/navigation";

/** Ancienne file ME → patients enregistrés (parité réception). */
export default function Page() {
  redirect("/sigh/medecins-externes/enregistres");
}
