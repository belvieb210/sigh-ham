import type { Metadata } from "next";
import {
  metadataPageStatutLabo,
  PageStatutAnalyseLaboratoire,
} from "@/features/laboratoire/page-statut-analyse-laboratoire";

export const metadata: Metadata = metadataPageStatutLabo("VERIFIES");

export default function PageVerifiesLaboratoire() {
  return <PageStatutAnalyseLaboratoire statut="VERIFIES" />;
}
