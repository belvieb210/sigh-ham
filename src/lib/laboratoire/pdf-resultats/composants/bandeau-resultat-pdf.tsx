import { Image, Text, View } from "@react-pdf/renderer";
import type {
  DonneesExamenResultatPdf,
  DonneesPatientResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/types";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";

function formaterDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LigneBandeau({
  labelG,
  valG,
  labelD,
  valD,
}: {
  labelG: string;
  valG: string;
  labelD: string;
  valD: string;
}) {
  return (
    <View style={stylesResultatPdf.bandeauLigne}>
      <View style={stylesResultatPdf.bandeauCol}>
        <Text style={stylesResultatPdf.bandeauLabel}>{labelG}</Text>
        <Text style={stylesResultatPdf.bandeauValeur}>{valG}</Text>
      </View>
      <View style={stylesResultatPdf.bandeauCol}>
        <Text style={stylesResultatPdf.bandeauLabel}>{labelD}</Text>
        <Text style={stylesResultatPdf.bandeauValeur}>{valD}</Text>
      </View>
    </View>
  );
}

/** Bandeau patient (port renderPatientInfo PHP) + QR facture à droite. */
export function BandeauPatientResultatPdf({
  patient,
  examen,
}: {
  patient: DonneesPatientResultatPdf;
  examen: DonneesExamenResultatPdf;
}) {
  const nomComplet = `${patient.nom} ${patient.prenom}`.trim();
  const age = patient.age != null ? `${patient.age} ans` : "—";
  const medecin = patient.medecinDemandeur ?? "—";

  return (
    <View style={stylesResultatPdf.bandeauPatient}>
      <View style={stylesResultatPdf.bandeauContenu}>
        <LigneBandeau
          labelG="NOM"
          valG={nomComplet}
          labelD="TEL"
          valD={patient.telephone ?? "—"}
        />
        <LigneBandeau
          labelG="ID PATIENT"
          valG={patient.numeroEnregistrement}
          labelD="SEXE"
          valD={patient.sexe ?? "—"}
        />
        <LigneBandeau
          labelG="DATE D'ANALYSE"
          valG={formaterDate(examen.dateAnalyse)}
          labelD="AGE"
          valD={age}
        />
        <LigneBandeau
          labelG="MEDECIN"
          valG={medecin}
          labelD="CNOM"
          valD={patient.cnomMedecin ?? "—"}
        />
      </View>
      {patient.qrCodeDataUrl ? (
        <Image src={patient.qrCodeDataUrl} style={stylesResultatPdf.bandeauQr} />
      ) : null}
    </View>
  );
}

export function TitreExamenResultatPdf({
  libelle,
  specimen,
}: {
  libelle: string;
  specimen?: string | null;
}) {
  let titre = (libelle || "EXAMEN").toUpperCase();
  if (specimen?.trim()) {
    titre += ` (${specimen.toLowerCase()})`;
  }
  return (
    <View style={stylesResultatPdf.bandeauTitreExamen}>
      <Text style={stylesResultatPdf.bandeauTitreTexte}>{titre}</Text>
    </View>
  );
}
