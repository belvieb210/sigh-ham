import type { TypeExamenReception } from "@/lib/reception/types";
import {
  INFOS_LEGALES_TICKET,
  SEPARATEUR_ETOILES,
  SEPARATEUR_TIRETS,
  centrerLigne,
  formaterPrixTicket,
  ligneDeuxColonnes,
} from "@/constants/ticket-thermique";

function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ligneHtml(texte: string, classe = ""): string {
  const cls = classe ? ` class="${classe}"` : "";
  return `<div${cls}>${echapperHtml(texte)}</div>`;
}

export interface DonneesDevisEstimation {
  examens: TypeExamenReception[];
  medecinResponsable: string;
  nomPatient: string;
  prenomPatient: string;
  telephonePatient?: string;
  numeroEnregistrement: string;
  dateEnregistrement: string;
  labels: {
    titreTicket: string;
    numero: string;
    date: string;
    patient: string;
    telephone: string;
    medecin: string;
    description: string;
    prix: string;
    total: string;
    genereLe: string;
  };
}

function construireLignesTicket(donnees: DonneesDevisEstimation): string[] {
  const L = INFOS_LEGALES_TICKET;
  const montantTotal = donnees.examens.reduce((total, e) => total + e.prix, 0);
  const patient = `${donnees.prenomPatient} ${donnees.nomPatient}`.trim();
  const tel = donnees.telephonePatient?.trim() || "—";

  const lignes: string[] = [
    centrerLigne(L.ligne1),
    centrerLigne(L.ligne2),
    centrerLigne(L.rccm),
    centrerLigne(L.idNat),
    centrerLigne(L.nImpot),
    centrerLigne(L.minSante),
    centrerLigne(L.sloganLigne1),
    centrerLigne(L.sloganLigne2),
    "",
    SEPARATEUR_ETOILES,
    centrerLigne(donnees.labels.titreTicket),
    SEPARATEUR_ETOILES,
    "",
    centrerLigne(`${donnees.labels.numero}: ${donnees.numeroEnregistrement}`),
    centrerLigne(`${donnees.labels.date}: ${donnees.dateEnregistrement}`),
    centrerLigne(`${donnees.labels.patient}: ${patient}`),
    centrerLigne(`${donnees.labels.telephone}: ${tel}`),
    centrerLigne(`${donnees.labels.medecin}: ${donnees.medecinResponsable}`),
    "",
    ligneDeuxColonnes(donnees.labels.description, donnees.labels.prix),
  ];

  for (const examen of donnees.examens) {
    const libelle = examen.libelle || examen.code;
    lignes.push(ligneDeuxColonnes(libelle, formaterPrixTicket(examen.prix)));
  }

  lignes.push(
    SEPARATEUR_ETOILES,
    ligneDeuxColonnes(donnees.labels.total, formaterPrixTicket(montantTotal)),
    "",
    SEPARATEUR_TIRETS,
    centrerLigne(L.sloganPied),
    centrerLigne(L.adresseLigne1),
    centrerLigne(L.adresseLigne2),
    centrerLigne(L.ville),
    centrerLigne(L.telephones),
    centrerLigne(L.email)
  );

  return lignes;
}

/** Impression ticket thermique 80 mm via fenêtre dédiée (évite crash React removeChild). */
export function imprimerDevisEstimation(donnees: DonneesDevisEstimation): boolean {
  const fenetre = window.open("", "_blank", "noopener,noreferrer,width=420,height=720");
  if (!fenetre) return false;

  const lignes = construireLignesTicket(donnees);
  const corps = lignes.map((l) => (l === "" ? "<br />" : ligneHtml(l))).join("\n");
  const maintenant = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${echapperHtml(donnees.labels.titreTicket)}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #e2e8f0;
    }
    .ticket {
      width: 80mm;
      max-width: 80mm;
      margin: 12px auto;
      padding: 8px 6px 16px;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      white-space: pre;
      overflow-x: hidden;
    }
    .ticket div { white-space: pre; }
    .genere {
      margin-top: 10px;
      text-align: center;
      font-size: 9px;
      color: #64748b;
      white-space: normal;
      font-family: system-ui, sans-serif;
    }
    @media print {
      html, body { background: #fff; }
      .ticket {
        margin: 0;
        padding: 2mm 1.5mm 8mm;
        width: 80mm;
        box-shadow: none;
      }
      .genere { display: none; }
    }
  </style>
</head>
<body>
  <div class="ticket">
${corps}
  </div>
  <p class="genere">${echapperHtml(donnees.labels.genereLe)} ${echapperHtml(maintenant)}</p>
  <script>
    window.onload = function () {
      window.focus();
      setTimeout(function () {
        window.print();
      }, 120);
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`;

  fenetre.document.open();
  fenetre.document.write(html);
  fenetre.document.close();
  return true;
}
