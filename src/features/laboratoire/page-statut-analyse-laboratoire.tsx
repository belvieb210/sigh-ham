import type { Metadata } from "next";
import { Suspense } from "react";
import { ContenuExamensEnCoursLaboratoire } from "@/features/laboratoire/contenu-examens-en-cours-laboratoire";
import type { IdOrientationStatutAnalyse } from "@/constants/laboratoire-orientations";
import { verifierAccesLaboratoire } from "@/lib/auth/garde-salle";
import { propsUtilisateurLaboratoire } from "@/lib/auth/props-utilisateur-laboratoire";

const META: Record<
  IdOrientationStatutAnalyse,
  { title: string; chemin: string }
> = {
  RECUS: { title: "Reçus — Laboratoire", chemin: "/sigh/laboratoire/recus" },
  EN_COURS: {
    title: "Examens en cours — Laboratoire",
    chemin: "/sigh/laboratoire/examens-en-cours",
  },
  VERIFIES: {
    title: "Validés — Laboratoire",
    chemin: "/sigh/laboratoire/verifies",
  },
  REJETES: {
    title: "Rejetés — Laboratoire",
    chemin: "/sigh/laboratoire/rejetes",
  },
  DR_APPROUVE: {
    title: "Approuvés — Laboratoire",
    chemin: "/sigh/laboratoire/dr-approuve",
  },
};

export function metadataPageStatutLabo(
  statut: IdOrientationStatutAnalyse
): Metadata {
  return {
    title: META[statut].title,
    robots: { index: false, follow: false },
  };
}

export async function PageStatutAnalyseLaboratoire({
  statut,
}: {
  statut: IdOrientationStatutAnalyse;
}) {
  const utilisateur = await verifierAccesLaboratoire();
  return (
    <Suspense fallback={null}>
      <ContenuExamensEnCoursLaboratoire
        utilisateur={propsUtilisateurLaboratoire(utilisateur)}
        pageStatut={statut}
        cheminBase={META[statut].chemin}
      />
    </Suspense>
  );
}
