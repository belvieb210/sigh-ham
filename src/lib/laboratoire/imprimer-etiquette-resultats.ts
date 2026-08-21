/**
 * Impression étiquette résultats (QR code) — format imprimante étiquettes tubes.
 */

import QRCode from "qrcode";
import { INFOS_LEGALES_TICKET } from "@/constants/ticket-thermique";
import type { EtiquetteResultatsLabo } from "@/lib/laboratoire/types-etiquette-resultats";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Retire un éventuel préfixe « Dr » / « Dr. » pour l'affichage. */
export function sansPrefixeDr(nom: string): string {
  return nom.replace(/^dr\.?\s+/i, "").trim();
}

async function genererQrDataUrl(contenu: string): Promise<string> {
  try {
    return await QRCode.toDataURL(contenu, {
      type: "image/png",
      width: 280,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return "";
  }
}

export async function construireHtmlEtiquetteResultats(
  e: EtiquetteResultatsLabo
): Promise<string> {
  const urlQr = e.urlPublique || e.codeBarre || INFOS_LEGALES_TICKET.siteWeb;
  const urlSite = INFOS_LEGALES_TICKET.siteWeb;
  const src = await genererQrDataUrl(urlQr);
  const img = src
    ? `<img class="qr" src="${src}" alt="QR code ${echapper(e.numeroPermanent)}" />`
    : `<div class="qr-fallback">${echapper(e.numeroPermanent)}</div>`;
  const docteur = sansPrefixeDr(e.medecinDemandeur);
  const refToolbar = e.numeroFacture || e.numeroPermanent;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Étiquette résultats ${echapper(e.numeroPermanent)}</title>
  <style>
    @page { size: auto; margin: 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      margin: 0;
      padding: 0 8px 24px;
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      color: #000;
    }
    .toolbar {
      position: sticky; top: 0; z-index: 2;
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      padding: 8px 10px; margin: 0 0 16px;
      background: #0f2744; color: #fff; font-size: 12px;
      font-family: system-ui, sans-serif;
    }
    .toolbar-actions { display: flex; gap: 8px; align-items: center; }
    .toolbar button {
      border: 0; border-radius: 6px; padding: 7px 12px;
      font-weight: 700; cursor: pointer;
    }
    .toolbar .btn-print { background: #1d6ef5; color: #fff; }
    .toolbar .btn-close { background: #e2e8f0; color: #0f2744; }
    /* Même format que les étiquettes tubes (~58 mm) */
    .sheet {
      width: 58mm;
      max-width: 100%;
      margin: 24px auto 0;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .label {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      gap: 4px;
      background: #fff;
      padding: 2px 0 8px;
      page-break-inside: avoid;
      border-bottom: 1px dashed #ccc;
    }
    .infos {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: left;
      padding-right: 2px;
    }
    .qr-wrap {
      flex: 0 0 24mm;
      width: 24mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr {
      display: block;
      width: 24mm;
      height: 24mm;
      object-fit: contain;
    }
    .qr-fallback {
      font-family: monospace;
      font-size: 9px;
      text-align: center;
      word-break: break-all;
    }
    .ligne {
      margin: 0;
      font-size: 8px;
      line-height: 1.28;
      font-weight: 600;
      white-space: normal;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    .ligne .v { font-weight: 800; }
    .noms .v { text-transform: uppercase; }
    .sep {
      margin: 3px 0 2px;
      border: 0;
      border-top: 1px solid #1a4d7c;
      width: 100%;
    }
    .site {
      margin: 0;
      font-size: 7px;
      font-weight: 600;
      color: #111;
      word-break: break-all;
      white-space: normal;
      line-height: 1.2;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .sheet { width: 50mm; margin: 8mm auto 0; }
      .label { border-bottom: 0; padding-bottom: 4mm; }
      .qr-wrap { flex-basis: 18mm; width: 18mm; }
      .qr { width: 18mm; height: 18mm; }
      .ligne { font-size: 7.5px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Étiquettes · 1 specimen(s) · ${echapper(refToolbar)}</span>
    <div class="toolbar-actions">
      <button type="button" class="btn-print" onclick="window.print()">Imprimer</button>
      <button type="button" class="btn-close" onclick="fermerEtiquette()">Fermer</button>
    </div>
  </div>
  <div class="sheet">
    <article class="label">
      <div class="infos">
        <p class="ligne">Délivrée : <span class="v">${echapper(e.dateResultat)}</span></p>
        <p class="ligne noms">Noms : <span class="v">${echapper(e.nomComplet)}</span></p>
        <p class="ligne">Age : <span class="v">${echapper(e.ligneIdentite)}</span></p>
        <p class="ligne">N° Permanent : <span class="v">${echapper(e.numeroPermanent)}</span></p>
        <p class="ligne">Docteur : <span class="v">${echapper(docteur)}</span></p>
        <hr class="sep" />
        <p class="site">${echapper(urlSite)}</p>
      </div>
      <div class="qr-wrap">${img}</div>
    </article>
  </div>
  <script>
    function fermerEtiquette() {
      try { window.close(); } catch (e) {}
      setTimeout(function () {
        if (!window.closed) {
          window.location.href = ${JSON.stringify(urlSite)};
        }
      }, 150);
    }
  </script>
</body>
</html>`;
}

export async function imprimerEtiquetteResultatsDossier(
  dossierId: string,
  examenIds?: string[]
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  if (typeof window === "undefined") {
    return { ok: false, erreur: "Disponible uniquement dans le navigateur." };
  }

  try {
    const params = new URLSearchParams();
    if (examenIds?.length) {
      for (const id of examenIds) params.append("examenId", id);
    }
    const qs = params.toString();
    const url = `/api/laboratoire/dossiers/${encodeURIComponent(dossierId)}/etiquette-resultats${qs ? `?${qs}` : ""}`;
    const res = await fetch(url);
    const data = (await res.json()) as {
      erreur?: string;
      etiquette?: EtiquetteResultatsLabo;
    };
    if (!res.ok || !data.etiquette) {
      return { ok: false, erreur: data.erreur || "Étiquette indisponible." };
    }

    const html = await construireHtmlEtiquetteResultats(data.etiquette);
    const fenetre = window.open("", "_blank");
    if (!fenetre) {
      return { ok: false, erreur: "Autorisez les popups pour imprimer." };
    }
    fenetre.document.open();
    fenetre.document.write(html);
    fenetre.document.close();
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur lors de la préparation de l'étiquette." };
  }
}
