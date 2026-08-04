import type { Metadata } from "next";
import {
  metadataPageStatutLabo,
  PageStatutAnalyseLaboratoire,
} from "@/features/laboratoire/page-statut-analyse-laboratoire";

export const metadata: Metadata = metadataPageStatutLabo("DR_APPROUVE");

export default function PageDrApprouveLaboratoire() {
  return <PageStatutAnalyseLaboratoire statut="DR_APPROUVE" />;
}
