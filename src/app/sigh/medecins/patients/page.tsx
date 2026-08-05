import { redirect } from "next/navigation";

export default function PagePatientsMedecinsRedirect() {
  redirect("/sigh/medecins/file-attente");
}
