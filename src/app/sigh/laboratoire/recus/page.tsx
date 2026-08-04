import type { Metadata } from "next";
import {
  metadataPageStatutLabo,
  PageStatutAnalyseLaboratoire,
} from "@/features/laboratoire/page-statut-analyse-laboratoire";

export const metadata: Metadata = metadataPageStatutLabo("RECUS");

export default function PageRecusLaboratoire() {
  return <PageStatutAnalyseLaboratoire statut="RECUS" />;
}
