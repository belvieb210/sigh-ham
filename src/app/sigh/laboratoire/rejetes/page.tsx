import type { Metadata } from "next";
import {
  metadataPageStatutLabo,
  PageStatutAnalyseLaboratoire,
} from "@/features/laboratoire/page-statut-analyse-laboratoire";

export const metadata: Metadata = metadataPageStatutLabo("REJETES");

export default function PageRejetesLaboratoire() {
  return <PageStatutAnalyseLaboratoire statut="REJETES" />;
}
