import "server-only";
import { pdf } from "@react-pdf/renderer";
import {
  DocumentDevisEstimation,
  type DonneesDevisEstimation,
} from "@/features/reception/devis-estimation-pdf";
import {
  cheminsAssetsPdfServeur,
  enregistrerPolicesPdfServeur,
} from "@/lib/pdf/assets-pdf-serveur";
import { estClientWalkInPharmacie } from "@/lib/pharmacie/client-walk-in";
import { prisma } from "@/lib/prisma";

function decimal(n: { toNumber?: () => number } | number | null | undefined) {
  if (n == null) return 0;
  if (typeof n === "number") return n;
  if (typeof n.toNumber === "function") return n.toNumber();
  return Number(n);
}

export async function genererPdfFacturePharmacieVente(
  venteId: string
): Promise<{ buffer: Buffer; nomFichier: string } | null> {
  const vente = await prisma.ventePharmacie.findUnique({
    where: { id: venteId },
    include: {
      lignes: { include: { medicament: true } },
      dossier: { include: { patient: true } },
      facture: { include: { lignes: true } },
      ordonnance: {
        include: {
          medecin: { select: { prenom: true, nom: true } },
        },
      },
      pharmacien: { select: { prenom: true, nom: true } },
    },
  });

  if (!vente) return null;
  if (!["PAYEE", "DELIVREE"].includes(vente.statut)) return null;
  if (!vente.lignes.length) return null;

  const patient = vente.dossier.patient;
  const estClient = estClientWalkInPharmacie(vente.dossier.numeroDossier);
  const numeroFacture =
    vente.facture?.numeroFacture ?? vente.numero ?? vente.dossier.numeroDossier;
  const dateEmission =
    vente.payeeLe?.toISOString() ??
    vente.facture?.emiseLe?.toISOString() ??
    vente.creeLe.toISOString();

  const medecinOrdonnance = vente.ordonnance?.medecin
    ? `${vente.ordonnance.medecin.prenom} ${vente.ordonnance.medecin.nom}`.trim()
    : null;
  const pharmacienNom = `${vente.pharmacien.prenom} ${vente.pharmacien.nom}`.trim();

  const medicaments =
    vente.facture?.lignes.length &&
    vente.facture.lignes.every((l) => decimal(l.montant) >= 0)
      ? vente.facture.lignes
          .filter((l) => decimal(l.montant) > 0)
          .map((l) => ({
            nom: l.libelle,
            quantite: l.quantite,
            prixUnitaire:
              l.quantite > 0
                ? decimal(l.montant) / l.quantite
                : decimal(l.montant),
          }))
      : vente.lignes.map((l) => {
          const qte = Math.max(1, l.quantite);
          const montant = Math.max(
            0,
            decimal(l.prixUnitaire) * l.quantite - decimal(l.remise)
          );
          return {
            nom: `${l.medicament.nom}${l.medicament.dosage ? ` ${l.medicament.dosage}` : ""}`,
            quantite: l.quantite,
            prixUnitaire: montant / qte,
          };
        });

  const remiseFacture =
    vente.facture?.lignes
      .filter((l) => decimal(l.montant) < 0)
      .reduce((s, l) => s + Math.abs(decimal(l.montant)), 0) ?? 0;

  const donnees: DonneesDevisEstimation = {
    examens: [],
    medicaments,
    medecinResponsable: medecinOrdonnance ?? "Pharmacie",
    nomPatient: patient.nom,
    prenomPatient: patient.prenom,
    telephonePatient: patient.telephone ?? undefined,
    numeroEnregistrement: estClient
      ? vente.dossier.numeroDossier
      : numeroFacture,
    dateEnregistrement: new Date(dateEmission).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    agentNom: pharmacienNom,
    remise: remiseFacture,
    labels: {
      titreTicket: estClient ? "FACTURE CLIENT PHARMACIE" : "FACTURE PHARMACIE",
      numero: "N°",
      date: "Date",
      patient: estClient ? "Client" : "Patient",
      telephone: "Téléphone",
      medecin: estClient ? "Pharmacien" : "Prescripteur",
      description: "Médicament",
      prix: "Montant (Fc)",
      total: "Total médicaments",
      genereLe: "Émis le",
      agent: estClient ? "Caissier" : "Pharmacien",
    },
  };

  enregistrerPolicesPdfServeur();
  const assets = cheminsAssetsPdfServeur();

  const instance = pdf(
    <DocumentDevisEstimation donnees={donnees} urlsAssets={assets} />
  );
  const result = await instance.toBuffer();
  let buffer: Buffer;
  if (Buffer.isBuffer(result)) {
    buffer = result;
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of result as AsyncIterable<Uint8Array>) {
      chunks.push(Buffer.from(chunk));
    }
    buffer = Buffer.concat(chunks);
  }

  const numeroSafe = numeroFacture.replace(/[^a-zA-Z0-9-]+/g, "-");
  return {
    buffer,
    nomFichier: `facture-pharmacie-${numeroSafe}.pdf`,
  };
}
