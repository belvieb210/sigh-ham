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

function construireHtmlTicket(donnees: DonneesDevisEstimation): string {
  const lignes = construireLignesTicket(donnees);
  const corps = lignes.map((l) => (l === "" ? "<br />" : ligneHtml(l))).join("\n");
  const maintenant = new Date().toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
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
      background: #fff;
    }
    .ticket {
      width: 80mm;
      max-width: 80mm;
      margin: 0 auto;
      padding: 2mm 1.5mm 8mm;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, monospace;
      font-size: 11px;
      line-height: 1.35;
      white-space: pre;
      overflow-x: hidden;
    }
    .ticket div { white-space: pre; }
  </style>
</head>
<body>
  <div class="ticket">
${corps}
  </div>
</body>
</html>`;
}

/**
 * Impression dans la même fenêtre (iframe cachée) — pas de popup about:blank.
 * Évite aussi le crash React removeChild lié à window.print() sur le DOM principal.
 */
export function imprimerDevisEstimation(donnees: DonneesDevisEstimation): boolean {
  if (typeof document === "undefined") return false;

  const html = construireHtmlTicket(donnees);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", donnees.labels.titreTicket);
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const nettoyer = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 500);
  };

  const lancerImpression = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      nettoyer();
    }
  };

  // Laisser le navigateur peindre le document de l'iframe avant print()
  window.setTimeout(lancerImpression, 150);
  return true;
}
