export type EtiquetteResultatsLabo = {
  dateResultat: string;
  nomComplet: string;
  ligneIdentite: string;
  numeroPermanent: string;
  medecinDemandeur: string;
  cnomMedecin: string | null;
  /** Valeur encodée dans le QR (URL publique facture / résultats). */
  codeBarre: string;
  /** URL publique scannée (reçu facture + examens). */
  urlPublique: string;
  factureId: string | null;
  numeroFacture: string | null;
};
