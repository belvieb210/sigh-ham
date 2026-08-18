import "server-only";
import { prisma } from "@/lib/prisma";
import { classerExamensFacture } from "@/lib/laboratoire/classer-examens-facture";
import { estClientWalkInPharmacie } from "@/lib/pharmacie/client-walk-in";
import { enregistrerOperationGouvernance } from "@/lib/admin/operations-gouvernance";

function estFacturePharmacie(numeroFacture: string, aVente: boolean) {
  return aVente || numeroFacture.startsWith("FAC-PH-");
}

export async function chargerResultatsPatientAdmin(
  patientId: string,
  acteurId: string
) {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: {
      id: true,
      numeroPatient: true,
      prenom: true,
      nom: true,
      photoUrl: true,
      telephone: true,
      dossiers: {
        orderBy: { ouvertLe: "desc" },
        select: {
          id: true,
          numeroDossier: true,
          statut: true,
          ouvertLe: true,
          salleEnregistrement: true,
          factures: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              numeroFacture: true,
              statut: true,
              montantTotal: true,
              emiseLe: true,
              ventePharmacie: { select: { id: true } },
              lignes: {
                select: { libelle: true, montant: true },
              },
            },
          },
          examensLaboratoire: {
            where: { statut: { not: "ANNULE" } },
            orderBy: { createdAt: "asc" },
            select: {
              id: true,
              statut: true,
              resultatLe: true,
              notes: true,
              paquetBilanId: true,
              typeExamen: { select: { libelle: true } },
              paquetBilan: { select: { libelle: true } },
              resultats: {
                orderBy: { parametre: "asc" },
                select: {
                  parametre: true,
                  valeur: true,
                  unite: true,
                  normeMin: true,
                  normeMax: true,
                  anormal: true,
                  flag: true,
                  commentaire: true,
                  nonRequis: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!patient) return null;

  const visites = patient.dossiers.map((dossier) => {
    const examensBruts = dossier.examensLaboratoire.map((ex) => ({
      id: ex.id,
      statut: ex.statut,
      libelle: ex.typeExamen.libelle,
      notes: ex.notes,
      resultatLe: ex.resultatLe,
      aResultats: ex.resultats.length > 0,
      paquetBilanId: ex.paquetBilanId,
      paquetLibelle: ex.paquetBilan?.libelle ?? null,
    }));
    const parId = new Map(dossier.examensLaboratoire.map((ex) => [ex.id, ex]));
    const idsAssignes = new Set<string>();

    const factures = dossier.factures
      .filter((f) => !estFacturePharmacie(f.numeroFacture, Boolean(f.ventePharmacie)))
      .map((f) => {
        const { approuves, enAttente } = classerExamensFacture(
          f.lignes.map((l) => ({
            libelle: l.libelle,
            montant: Number(l.montant),
          })),
          examensBruts
        );
        const classes = [...approuves, ...enAttente];
        const examens = classes
          .map((c) => {
            const ex = parId.get(c.id);
            if (!ex) return null;
            idsAssignes.add(ex.id);
            return {
              id: ex.id,
              libelle: ex.typeExamen.libelle,
              statut: ex.statut,
              resultatLe: ex.resultatLe?.toISOString() ?? null,
              resultats: ex.resultats.map((r) => ({
                parametre: r.parametre,
                valeur: r.valeur,
                unite: r.unite,
                normeMin: r.normeMin,
                normeMax: r.normeMax,
                anormal: r.anormal,
                flag: r.flag,
                commentaire: r.commentaire,
                nonRequis: r.nonRequis,
              })),
            };
          })
          .filter((e): e is NonNullable<typeof e> => e !== null);

        return {
          id: f.id,
          numeroFacture: f.numeroFacture,
          statut: f.statut,
          montantTotal: Number(f.montantTotal),
          emiseLe: f.emiseLe?.toISOString() ?? null,
          examens,
        };
      });

    const horsFacture = dossier.examensLaboratoire
      .filter((ex) => !idsAssignes.has(ex.id))
      .map((ex) => ({
        id: ex.id,
        libelle: ex.typeExamen.libelle,
        statut: ex.statut,
        resultatLe: ex.resultatLe?.toISOString() ?? null,
        resultats: ex.resultats.map((r) => ({
          parametre: r.parametre,
          valeur: r.valeur,
          unite: r.unite,
          normeMin: r.normeMin,
          normeMax: r.normeMax,
          anormal: r.anormal,
          flag: r.flag,
          commentaire: r.commentaire,
          nonRequis: r.nonRequis,
        })),
      }));

    return {
      dossierId: dossier.id,
      numeroDossier: dossier.numeroDossier,
      statut: dossier.statut,
      ouvertLe: dossier.ouvertLe.toISOString(),
      salleEnregistrement: dossier.salleEnregistrement,
      estClient: estClientWalkInPharmacie(dossier.numeroDossier),
      factures,
      horsFacture,
    };
  });

  await enregistrerOperationGouvernance({
    acteurId,
    type: "CONSULTATION_RESULTATS",
    typeAudit: "CONSULTATION",
    patientId: patient.id,
    numeroPatient: patient.numeroPatient,
    action: `Consultation des résultats — ${patient.prenom} ${patient.nom} (${patient.numeroPatient})`,
    snapshot: {
      visites: visites.length,
      examens: visites.reduce(
        (n, v) =>
          n +
          v.factures.reduce((m, f) => m + f.examens.length, 0) +
          v.horsFacture.length,
        0
      ),
    },
  });

  return {
    patient: {
      id: patient.id,
      numeroPatient: patient.numeroPatient,
      prenom: patient.prenom,
      nom: patient.nom,
      photoUrl: patient.photoUrl,
      telephone: patient.telephone,
    },
    visites,
  };
}
