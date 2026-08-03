/**
 * Reçu de caisse thermique 80 mm — Xprinter XP-C230 (ESC/POS via pilote Windows).
 * Fenêtre isolée + HTML monospace : n'altère pas le DOM React de l'app.
 */

import {
  INFOS_LEGALES_TICKET,
  LARGEUR_TICKET_THERMIQUE,
  SEPARATEUR_ETOILES,
  SEPARATEUR_TIRETS,
  centrerLigne,
  formaterPrixTicket,
  ligneDeuxColonnes,
} from "@/constants/ticket-thermique";
import type { FactureResumeJour } from "@/lib/caisse/types";

function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formaterDateHeureTicket(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  const date = d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const heure = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${heure}`;
}

function nomPatientTicket(facture: FactureResumeJour): string {
  const nom = `${facture.prenom} ${facture.nom}`.trim() || facture.patient;
  return nom.replace(/\s+/g, " ").toUpperCase();
}

/** Construit le corps texte du ticket (aligné ~42 car. monospace). */
export function construireLignesRecuCaisse(facture: FactureResumeJour): string[] {
  const L = INFOS_LEGALES_TICKET;
  const devise = facture.devise || "USD";
  const total = Math.max(0, facture.montantTotal);
  const paye = Math.max(0, facture.montantPaye);
  const reste = Math.max(0, Math.round((total - paye) * 100) / 100);
  const libelleEncaisse =
    reste > 0 || facture.modeFacture === "AVANCE" ? "Avance" : "Payé";

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
    centrerLigne("RECU DE CAISSE"),
    SEPARATEUR_ETOILES,
    "",
    `Receipt #: ${facture.numeroFacture}`,
    `Date: ${formaterDateHeureTicket(facture.emiseLe)}`,
    `Patient: ${nomPatientTicket(facture)}`,
    `Tel: ${facture.telephone?.trim() || "—"}`,
    "",
    ligneDeuxColonnes("Description", "Prix"),
  ];

  for (const ligne of facture.lignes) {
    lignes.push(
      ligneDeuxColonnes(ligne.libelle, formaterPrixTicket(ligne.montant, devise))
    );
  }

  lignes.push(
    SEPARATEUR_ETOILES,
    ligneDeuxColonnes("Total:", formaterPrixTicket(total, devise)),
    ligneDeuxColonnes(`${libelleEncaisse}:`, formaterPrixTicket(paye, devise)),
    ligneDeuxColonnes("Reste:", formaterPrixTicket(reste, devise)),
    SEPARATEUR_TIRETS,
    "",
    centrerLigne(L.sloganPied),
    centrerLigne(L.adresseLigne1),
    centrerLigne(L.adresseLigne2),
    centrerLigne(L.ville),
    centrerLigne(L.telephones),
    centrerLigne(L.email),
    "",
    SEPARATEUR_TIRETS
  );

  return lignes;
}

export function construireHtmlRecuCaisse(facture: FactureResumeJour): string {
  const corps = construireLignesRecuCaisse(facture)
    .map((l) => echapperHtml(l))
    .join("\n");
  const titre = echapperHtml(`Reçu ${facture.numeroFacture}`);
  const gen = echapperHtml(
    `Généré le ${formaterDateHeureTicket(null).replace(" ", " à ")}`
  );

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titre}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #e8edf2;
      color: #000;
      font-family: "Courier New", Courier, ui-monospace, monospace;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      background: #0f2744;
      color: #fff;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 13px;
    }
    .toolbar p { margin: 0; opacity: 0.9; }
    .toolbar .actions { display: flex; gap: 8px; }
    .toolbar button {
      border: 0;
      border-radius: 6px;
      padding: 8px 14px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .toolbar .btn-print {
      background: #1d6ef5;
      color: #fff;
    }
    .toolbar .btn-close {
      background: #fff;
      color: #0f2744;
    }
    .sheet {
      width: 80mm;
      max-width: 100%;
      margin: 16px auto 24px;
      padding: 8px 6px 12px;
      background: #fff;
      box-shadow: 0 8px 24px rgba(15, 39, 68, 0.12);
    }
    .ticket {
      margin: 0;
      padding: 0;
      width: 100%;
      font-size: 11.5px;
      line-height: 1.35;
      white-space: pre;
      overflow-x: hidden;
      letter-spacing: 0;
    }
    .meta {
      width: 80mm;
      max-width: 100%;
      margin: 0 auto 28px;
      padding: 8px 10px;
      text-align: center;
      font-family: system-ui, -apple-system, Segoe UI, sans-serif;
      font-size: 11px;
      color: #64748b;
      background: #f1f5f9;
      border-radius: 6px;
    }
    @media print {
      html, body {
        background: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .toolbar, .meta, .no-print { display: none !important; }
      .sheet {
        width: 80mm;
        margin: 0;
        padding: 2mm 2.5mm;
        box-shadow: none;
      }
      .ticket {
        font-size: 11px;
        line-height: 1.28;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print">
    <p>Aperçu reçu · Xprinter XP-C230 (80 mm)</p>
    <div class="actions">
      <button type="button" class="btn-print" onclick="window.print()">Imprimer</button>
      <button type="button" class="btn-close" onclick="window.close()">Fermer</button>
    </div>
  </div>
  <div class="sheet">
    <pre class="ticket">${corps}</pre>
  </div>
  <p class="meta no-print">${gen}</p>
  <script>
    window.addEventListener("load", function () {
      setTimeout(function () {
        try { window.focus(); window.print(); } catch (e) {}
      }, 280);
    });
    window.addEventListener("afterprint", function () {
      /* laisse la fenêtre ouverte pour réimpression éventuelle */
    });
  </script>
</body>
</html>`;
}

/**
 * Ouvre un aperçu isolé et lance le dialogue d'impression.
 * À appeler depuis un gestionnaire de clic (synchrone) pour éviter le bloqueur de popups.
 */
export function imprimerRecuCaisseThermique(facture: FactureResumeJour): boolean {
  if (typeof window === "undefined") return false;

  const html = construireHtmlRecuCaisse(facture);
  const fenetre = window.open(
    "",
    "_blank",
    "noopener,noreferrer,width=420,height=780"
  );

  if (!fenetre) {
    // Fallback : iframe cachée si popup bloquée
    const iframe = document.createElement("iframe");
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return false;
    }
    doc.open();
    doc.write(html);
    doc.close();
    iframe.contentWindow?.focus();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
      }, 1500);
    }, 300);
    return true;
  }

  fenetre.document.open();
  fenetre.document.write(html);
  fenetre.document.close();
  return true;
}
