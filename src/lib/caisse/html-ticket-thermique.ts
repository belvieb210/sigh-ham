/**
 * Ticket thermique HTML 80 mm (impression navigateur → Xprinter XP-C230).
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
import type { DetailRecuPublic } from "@/lib/caisse/recu-public";

function echapperHtml(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formaterDateHeure(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return "—";
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

export interface OptionsTicketThermique {
  /** Ticket pharmacie : pas de QR code. */
  sansQrCode?: boolean;
  /** Titre centré sous les étoiles (défaut : RECU DE CAISSE). */
  titreRecu?: string;
}

export async function construireHtmlTicketThermique(
  detail: DetailRecuPublic,
  urlRecu: string,
  options?: OptionsTicketThermique
): Promise<string> {
  const L = INFOS_LEGALES_TICKET;
  const devise = detail.devise || "USD";
  const total = Math.max(0, detail.montantTotal);
  const paye = Math.max(0, detail.montantPaye);
  const reste = Math.max(0, Math.round((total - paye) * 100) / 100);
  const libelleEncaisse =
    reste > 0 || detail.modeFacture === "AVANCE" ? "Avance" : "Payé";
  const nom = `${detail.patient.prenom} ${detail.patient.nom}`
    .trim()
    .toUpperCase();

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
    centrerLigne(options?.titreRecu ?? "RECU DE CAISSE"),
    SEPARATEUR_ETOILES,
    "",
    `Receipt #: ${detail.numeroFacture}`,
    `Date: ${formaterDateHeure(detail.emiseLe)}`,
    `Patient: ${nom}`,
    `Tel: ${detail.patient.telephone?.trim() || "—"}`,
    "",
    ligneDeuxColonnes("Description", "Prix"),
  ];

  for (const ligne of detail.lignes) {
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

  let qrDataUrl = "";
  if (!options?.sansQrCode) {
    try {
      qrDataUrl = await QRCode.toDataURL(urlRecu, {
        type: "image/png",
        width: 220,
        margin: 3,
        errorCorrectionLevel: "L",
        color: { dark: "#000000", light: "#ffffff" },
      });
    } catch {
      qrDataUrl = "";
    }
  }

  const hautHtml = haut.map(echapperHtml).join("\n");
  const basHtml = bas.map(echapperHtml).join("\n");
  const ref = echapperHtml(`#${detail.numeroFacture}#`);
  const qrBlock = qrDataUrl
    ? `<div class="qr-block">
        <img class="qr" src="${qrDataUrl}" width="168" height="168" alt="QR code reçu" />
        <p class="qr-ref">${ref}</p>
      </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ticket ${echapperHtml(detail.numeroFacture)}</title>
  <style>
    @page { size: 80mm auto; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #000;
      font-family: "Courier New", Courier, monospace; }
    .sheet { width: 80mm; max-width: 100%; margin: 0 auto; padding: 2mm 2.5mm 4mm; }
    .ticket { margin: 0; padding: 0; font-size: 11px; line-height: 1.28; white-space: pre; }
    .qr-block { text-align: center; padding: 8px 0 6px; }
    .qr {
      display: block;
      margin: 0 auto;
      width: 168px;
      height: 168px;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
    .qr-ref {
      margin: 8px 0 0;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
      font-family: "Courier New", Courier, monospace;
    }
    .toolbar {
      position: sticky; top: 0; display: flex; justify-content: space-between; gap: 8px;
      align-items: center; padding: 10px 12px; background: #0f2744; color: #fff;
      font-family: system-ui, sans-serif; font-size: 13px;
    }
    .toolbar button {
      border: 0; border-radius: 8px; padding: 8px 14px; font-weight: 700; cursor: pointer;
      background: #1d6ef5; color: #fff;
    }
    @media print {
      .toolbar { display: none !important; }
      .sheet { margin: 0; padding: 1.5mm 2mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Ticket 80 mm · XP-C230</span>
    <button type="button" onclick="window.print()">Imprimer</button>
  </div>
  <div class="sheet">
    <pre class="ticket">${hautHtml}</pre>
    ${qrBlock}
    <pre class="ticket">${basHtml}</pre>
  </div>
</body>
</html>`;
}
