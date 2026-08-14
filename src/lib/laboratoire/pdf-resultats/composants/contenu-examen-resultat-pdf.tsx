import { View } from "@react-pdf/renderer";
import {
  BandeauPatientResultatPdf,
  TitreExamenResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/bandeau-resultat-pdf";
import {
  CommentairesIndividuelsPdf,
  TableauParametresResultatPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/tableau-parametres-resultat-pdf";
import {
  CommentaireGlobalPdf,
  DescriptionExamenPdf,
  SignatureValidationPdf,
} from "@/lib/laboratoire/pdf-resultats/composants/sections-fin-resultat-pdf";
import { BilansTorchResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/bilans-torch-resultat-pdf";
import { BioCliaHormResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/bio-clia-horm-resultat-pdf";
import { DeuxColonnesResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/deux-colonnes-resultat-pdf";
import { ElectrophoreseResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/electrophorese-resultat-pdf";
import { GoutteFraicheResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/goutte-fraiche-resultat-pdf";
import { GroupageSanguinResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/groupage-sanguin-resultat-pdf";
import { MalariaResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/malaria-resultat-pdf";
import { MalariaTDRResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/malaria-tdr-resultat-pdf";
import { MicrofilaireResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/microfilaire-resultat-pdf";
import { SerologieResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/serologie-resultat-pdf";
import { ZiehlNelsenResultatPdf } from "@/lib/laboratoire/pdf-resultats/composants/renders-speciaux/ziehl-nelsen-resultat-pdf";
import { resoudreModeRenderExamen } from "@/lib/laboratoire/pdf-resultats/config-renders-examen";
import type { DonneesResultatExamenPdf } from "@/lib/laboratoire/pdf-resultats/types";
import { preparerLignesPourRender } from "@/lib/laboratoire/pdf-resultats/utilitaires-preparation-resultats";

function CorpsResultatExamen({ donnees }: { donnees: DonneesResultatExamenPdf }) {
  const mode = resoudreModeRenderExamen(donnees.typeRender);
  const { examen } = donnees;
  const lignes = preparerLignesPourRender(
    donnees.typeRender,
    examen.resultats,
    examen.libelle
  );

  switch (mode.kind) {
    case "serologie":
      return (
        <SerologieResultatPdf
          lignes={lignes}
          titreSerologie={examen.libelle}
          normaliserPrefixe={donnees.typeRender === "widal"}
        />
      );
    case "groupageSanguin":
      return <GroupageSanguinResultatPdf lignes={lignes} />;
    case "microfilaire":
      return <MicrofilaireResultatPdf lignes={lignes} />;
    case "goutteFraiche":
      return <GoutteFraicheResultatPdf lignes={lignes} />;
    case "electrophorese":
      return <ElectrophoreseResultatPdf lignes={lignes} />;
    case "malaria":
      return <MalariaResultatPdf lignes={lignes} />;
    case "malariaTDR":
      return <MalariaTDRResultatPdf lignes={lignes} />;
    case "ziehlNelsen":
      return <ZiehlNelsenResultatPdf lignes={lignes} />;
    case "bilansTorch":
      return <BilansTorchResultatPdf lignes={lignes} />;
    case "deuxColonnes":
      return (
        <DeuxColonnesResultatPdf
          lignes={lignes}
          col2Label={mode.options.col2Label}
          paramProportion={mode.options.paramProportion}
          majusculesValeur={mode.options.majusculesValeur}
          alignLeftCol2={mode.options.alignLeftCol2}
        />
      );
    case "bioCliaHorm":
      return <BioCliaHormResultatPdf lignes={lignes} />;
    case "parametres":
    case "generic":
      return (
        <TableauParametresResultatPdf
          lignes={lignes}
          options={mode.options ?? {}}
        />
      );
    default:
      return (
        <TableauParametresResultatPdf
          lignes={lignes}
          options={{ showFlag: true, showRange: true, showUnit: true }}
        />
      );
  }
}

/** Corps d'une page résultat (équivalent generate*PDF PHP). */
export function ContenuExamenResultatPdf({
  donnees,
  signaturePath,
  afficherSignature = true,
  afficherBandeau = true,
  avatarHomme,
  avatarFemme,
}: {
  donnees: DonneesResultatExamenPdf;
  signaturePath?: string;
  afficherSignature?: boolean;
  afficherBandeau?: boolean;
  avatarHomme?: string;
  avatarFemme?: string;
}) {
  const { examen, patient } = donnees;

  return (
    <View>
      {afficherBandeau && avatarHomme && avatarFemme ? (
        <BandeauPatientResultatPdf
          patient={patient}
          examen={examen}
          avatarHomme={avatarHomme}
          avatarFemme={avatarFemme}
        />
      ) : null}
      <TitreExamenResultatPdf libelle={examen.libelle} specimen={examen.specimen} />

      <CorpsResultatExamen donnees={donnees} />

      <CommentairesIndividuelsPdf lignes={examen.resultats} />
      <CommentaireGlobalPdf texte={examen.commentaireGlobal} />
      <DescriptionExamenPdf texte={examen.description} />
      {afficherSignature ? (
        <SignatureValidationPdf signaturePath={signaturePath} afficherLegende />
      ) : null}
    </View>
  );
}

