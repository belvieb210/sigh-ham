import type { Metadata } from "next";
import {
  metadataPageStatutLabo,
  PageStatutAnalyseLaboratoire,
} from "@/features/laboratoire/page-statut-analyse-laboratoire";

export const metadata: Metadata = metadataPageStatutLabo("EN_COURS");

export default function PageEnCoursLaboratoire() {
  return <PageStatutAnalyseLaboratoire statut="EN_COURS" />;
}
