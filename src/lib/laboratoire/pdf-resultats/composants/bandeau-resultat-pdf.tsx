import { Image, Text, View } from "@react-pdf/renderer";
import type {
  DonneesExamenResultatPdf,
  DonneesPatientResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/types";
import { stylesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/styles-resultat-pdf";
import {
  idPatientAffichePdf,
  resoudreAvatarPatientPdf,
} from "@/lib/laboratoire/pdf-resultats/utilitaires-patient-pdf";

function formaterDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

/** Bandeau patient (avatar, infos, QR) — aligné maquettes Picture2/3. */
export function BandeauPatientResultatPdf({
  patient,
  examen,
  avatarHomme,
  avatarFemme,
}: {
  patient: DonneesPatientResultatPdf;
  examen: DonneesExamenResultatPdf;
  avatarHomme: string;
  avatarFemme: string;
}) {
  const nomComplet = `${patient.nom} ${patient.prenom}`.trim().toUpperCase();
  const age =
    patient.age != null ? `${patient.age} ANS` : "—";
  const medecin = (patient.medecinDemandeur ?? "—").toUpperCase();
  const cnom = (patient.cnomMedecin?.trim() || "NON SPÉCIFIÉ").toUpperCase();
  const sexe = (patient.sexe ?? "—").toUpperCase();
  const avatarPath = resoudreAvatarPatientPdf(
    patient.sexe,
    avatarHomme,
    avatarFemme
  );

  return (
    <View style={stylesResultatPdf.bandeauPatient}>
      <View style={stylesResultatPdf.bandeauAvatarWrap}>
        {avatarPath ? (
          <Image src={avatarPath} style={stylesResultatPdf.bandeauAvatar} />
        ) : null}
      </View>
      <View style={stylesResultatPdf.bandeauContenu}>
        <LigneBandeau
          labelG="NOM"
          valG={nomComplet}
          labelD="TEL"
          valD={patient.telephone ?? "—"}
        />
        <LigneBandeau
          labelG="N° PATIENT"
          valG={idPatientAffichePdf(patient)}
          labelD="SEXE"
          valD={sexe}
        />
        <LigneBandeau
          labelG="DATE D'ANALYSE"
          valG={formaterDate(examen.dateAnalyse)}
          labelD="AGE"
          valD={age}
        />
        <LigneBandeau
          labelG="DOCTEUR"
          valG={medecin}
          labelD="CNOM"
          valD={cnom}
        />
        <View style={stylesResultatPdf.bandeauAdresseLigne}>
          <Text style={stylesResultatPdf.bandeauLabel}>ADRESSE</Text>
          <Text style={stylesResultatPdf.bandeauAdresseValeur}>
            {patient.adresse?.trim() || "—"}
          </Text>
        </View>
      </View>
      {patient.qrCodeDataUrl ? (
        <View style={stylesResultatPdf.bandeauQrWrap}>
          <Image src={patient.qrCodeDataUrl} style={stylesResultatPdf.bandeauQr} />
        </View>
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
