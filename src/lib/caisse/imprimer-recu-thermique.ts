/**
 * Reçu de caisse thermique 80 mm — Xprinter XP-C230.
 * Aperçu dans la même fenêtre + impression via iframe cachée (pas de about:blank).
 */

import QRCode from "qrcode";
import {
  INFOS_LEGALES_TICKET,
  SEPARATEUR_ETOILES,
  SEPARATEUR_TIRETS,
  centrerLigne,
  formaterPrixTicket,
  ligneDeuxColonnes,
} from "@/constants/ticket-thermique";
import type { FactureResumeJour } from "@/lib/caisse/types";

const ID_OVERLAY_RECU = "sigh-overlay-recu-caisse";

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

export function urlRecuPublicFacture(facture: FactureResumeJour): string {
  if (!facture.tokenRecu) return "";
  if (typeof window === "undefined") return `/r/${facture.tokenRecu}`;
  return `${window.location.origin}/r/${facture.tokenRecu}`;
}

function construirePartiesRecu(facture: FactureResumeJour): {
  haut: string[];
  bas: string[];
  libelleEncaisse: string;
  total: number;
  paye: number;
  reste: number;
} {
  const L = INFOS_LEGALES_TICKET;
  const devise = facture.devise || "USD";
  const total = Math.max(0, facture.montantTotal);
  const paye = Math.max(0, facture.montantPaye);
  const reste = Math.max(0, Math.round((total - paye) * 100) / 100);
  const libelleEncaisse =
    reste > 0 || facture.modeFacture === "AVANCE" ? "Avance" : "Payé";

  const haut: string[] = [
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
    haut.push(
      ligneDeuxColonnes(ligne.libelle, formaterPrixTicket(ligne.montant, devise))
    );
  }

  haut.push(
    SEPARATEUR_ETOILES,
    ligneDeuxColonnes("Total:", formaterPrixTicket(total, devise)),
    ligneDeuxColonnes(`${libelleEncaisse}:`, formaterPrixTicket(paye, devise)),
    ligneDeuxColonnes("Reste:", formaterPrixTicket(reste, devise)),
    SEPARATEUR_TIRETS
  );

  const bas: string[] = [
    SEPARATEUR_TIRETS,
    "",
    centrerLigne(L.sloganPied),
    centrerLigne(L.adresseLigne1),
    centrerLigne(L.adresseLigne2),
    centrerLigne(L.ville),
    centrerLigne(L.telephones),
    centrerLigne(L.email),
    "",
    SEPARATEUR_TIRETS,
  ];

  return { haut, bas, libelleEncaisse, total, paye, reste };
}

export function construireHtmlRecuCaisse(
  facture: FactureResumeJour,
  options: { qrDataUrl?: string; urlRecu?: string } = {}
): string {
  const { haut, bas } = construirePartiesRecu(facture);
  const hautHtml = haut.map((l) => echapperHtml(l)).join("\n");
  const basHtml = bas.map((l) => echapperHtml(l)).join("\n");
  const titre = echapperHtml(`Reçu ${facture.numeroFacture}`);
  const ref = echapperHtml(`#${facture.numeroFacture}#`);
  const qrBlock = options.qrDataUrl
    ? `<div class="qr-block">
        <img class="qr" src="${options.qrDataUrl}" width="140" height="140" alt="QR code reçu" />
        <p class="qr-ref">${ref}</p>
        <p class="qr-hint">Scannez pour voir la facture et les examens</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${titre}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      background: #fff;
      color: #000;
      font-family: "Courier New", Courier, ui-monospace, monospace;
    }
    .sheet {
      width: 80mm;
      max-width: 100%;
      margin: 0 auto;
      padding: 2mm 2.5mm 4mm;
      background: #fff;
    }
    .ticket {
      margin: 0;
      padding: 0;
      width: 100%;
      font-size: 11px;
      line-height: 1.28;
      white-space: pre;
      overflow-x: hidden;
    }
    .qr-block {
      text-align: center;
      padding: 6px 0 4px;
    }
    .qr {
      display: block;
      margin: 0 auto;
      width: 140px;
      height: 140px;
      image-rendering: pixelated;
    }
    .qr-ref {
      margin: 6px 0 0;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .qr-hint {
      margin: 2px 0 0;
      font-size: 9px;
      font-family: system-ui, sans-serif;
      color: #334155;
    }
    @media print {
      html, body { background: #fff !important; }
      .sheet { width: 80mm; margin: 0; padding: 1.5mm 2mm; }
      .qr-hint { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <pre class="ticket">${hautHtml}</pre>
    ${qrBlock}
    <pre class="ticket">${basHtml}</pre>
  </div>
</body>
</html>`;
}

function fermerOverlayRecu() {
  document.getElementById(ID_OVERLAY_RECU)?.remove();
}

function imprimerViaIframe(html: string): boolean {
  const existant = document.getElementById("sigh-iframe-print-recu");
  if (existant) existant.remove();

  const iframe = document.createElement("iframe");
  iframe.id = "sigh-iframe-print-recu";
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Impression reçu");
  iframe.style.cssText =
    "position:fixed;inset:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    return false;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const lancer = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      iframe.remove();
    }, 2000);
  };

  // Attendre le chargement de l'image QR
  window.setTimeout(lancer, 350);
  return true;
}

function afficherApercuRecu(html: string) {
  fermerOverlayRecu();

  const overlay = document.createElement("div");
  overlay.id = ID_OVERLAY_RECU;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Aperçu du reçu");
  overlay.innerHTML = `
    <div data-backdrop style="position:fixed;inset:0;z-index:99990;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:12px;">
      <div style="width:min(420px,100%);max-height:92vh;display:flex;flex-direction:column;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,.28);">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:#0f2744;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
          <div>
            <p style="margin:0;font-size:13px;font-weight:700;">Aperçu reçu · 80 mm</p>
            <p style="margin:2px 0 0;font-size:11px;opacity:.85;">Xprinter XP-C230</p>
          </div>
          <div style="display:flex;gap:8px;">
            <button type="button" data-print style="border:0;border-radius:8px;padding:8px 14px;background:#1d6ef5;color:#fff;font-weight:600;font-size:13px;cursor:pointer;">Imprimer</button>
            <button type="button" data-close style="border:0;border-radius:8px;padding:8px 14px;background:#fff;color:#0f2744;font-weight:600;font-size:13px;cursor:pointer;">Fermer</button>
          </div>
        </div>
        <iframe title="Aperçu reçu thermique" style="flex:1;width:100%;min-height:60vh;border:0;background:#f1f5f9;"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const cadre = overlay.querySelector("iframe");
  const boutonImprimer = overlay.querySelector("[data-print]");
  const boutonFermer = overlay.querySelector("[data-close]");
  const backdrop = overlay.querySelector("[data-backdrop]");

  if (cadre?.contentDocument) {
    cadre.contentDocument.open();
    cadre.contentDocument.write(html);
    cadre.contentDocument.close();
  }

  const onClose = () => fermerOverlayRecu();
  boutonFermer?.addEventListener("click", onClose);
  backdrop?.addEventListener("click", (e) => {
    if (e.target === backdrop) onClose();
  });
  boutonImprimer?.addEventListener("click", () => {
    imprimerViaIframe(html);
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      window.removeEventListener("keydown", onKey);
    }
  };
  window.addEventListener("keydown", onKey);
}

/**
 * Affiche l'aperçu du reçu (même onglet) avec QR, puis impression via iframe.
 */
export async function imprimerRecuCaisseThermique(
  facture: FactureResumeJour
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const urlRecu = urlRecuPublicFacture(facture);
  let qrDataUrl = "";
  if (urlRecu) {
    try {
      qrDataUrl = await QRCode.toDataURL(urlRecu, {
        width: 280,
        margin: 1,
        errorCorrectionLevel: "M",
        color: { dark: "#000000", light: "#ffffff" },
      });
    } catch {
      qrDataUrl = "";
    }
  }

  const html = construireHtmlRecuCaisse(facture, { qrDataUrl, urlRecu });
  afficherApercuRecu(html);
  return true;
}
