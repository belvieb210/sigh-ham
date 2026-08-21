/**
 * Impression étiquette résultats (QR code) — navigateur.
 */

import QRCode from "qrcode";
import type { EtiquetteResultatsLabo } from "@/lib/laboratoire/types-etiquette-resultats";

const URL_SITE = "https://hamlab5.duckdns.org/";

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
      width: 112,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  } catch {
    return "";
  }
}

export async function construireHtmlEtiquetteResultats(
  e: EtiquetteResultatsLabo,
  urlSite: string = URL_SITE
): Promise<string> {
  const url = urlSite.replace(/\/?$/, "/");
  const src = await genererQrDataUrl(url);
  const img = src
    ? `<img class="qr" src="${src}" alt="QR code ${echapper(e.numeroPermanent)}" />`
    : `<div class="qr-fallback">${echapper(e.numeroPermanent)}</div>`;
  const docteur = sansPrefixeDr(e.medecinDemandeur);

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
    .sheet { width: min(70mm, 100%); margin: 0 auto; }
    .label {
      text-align: left;
      padding: 6px 4px 10px;
      border-bottom: 1px dashed #ccc;
    }
    .qr-wrap { text-align: center; margin-bottom: 6px; }
    .qr {
      display: inline-block;
      width: 56px;
      height: 56px;
      object-fit: contain;
    }
    .qr-fallback {
      font-family: monospace;
      font-size: 11px;
      padding: 4px 0;
      text-align: center;
    }
    .ligne {
      margin: 3px 0 0;
      font-size: 11px;
      line-height: 1.3;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ligne .v { font-weight: 800; }
    .noms .v { text-transform: uppercase; }
    .site {
      margin-top: 6px;
      font-size: 9px;
      font-weight: 600;
      color: #1a4d7c;
      word-break: break-all;
      text-align: center;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .sheet { width: 50mm; margin: 8mm auto 0; }
      .label { border-bottom: 0; padding-bottom: 4mm; }
      .qr { width: 48px; height: 48px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Étiquette résultats · ${echapper(e.numeroPermanent)}</span>
    <div class="toolbar-actions">
      <button type="button" class="btn-print" onclick="window.print()">Imprimer</button>
      <button type="button" class="btn-close" onclick="fermerEtiquette()">Fermer</button>
    </div>
  </div>
  <div class="sheet">
    <article class="label">
      <div class="qr-wrap">${img}</div>
      <p class="ligne">Délivrée : <span class="v">${echapper(e.dateResultat)}</span></p>
      <p class="ligne noms">Noms : <span class="v">${echapper(e.nomComplet)}</span></p>
      <p class="ligne">Age : <span class="v">${echapper(e.ligneIdentite)}</span></p>
      <p class="ligne">N° Permanent : <span class="v">${echapper(e.numeroPermanent)}</span></p>
      <p class="ligne">Docteur : <span class="v">${echapper(docteur)}</span></p>
      <p class="site">${echapper(url)}</p>
    </article>
  </div>
  <script>
    function fermerEtiquette() {
      try { window.close(); } catch (e) {}
      // Si la fenêtre ne peut pas se fermer, retour au site public.
      setTimeout(function () {
        if (!window.closed) {
          window.location.href = ${JSON.stringify(url)};
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

    const origin =
      typeof window !== "undefined" && window.location?.origin
        ? `${window.location.origin}/`
        : URL_SITE;
    const html = await construireHtmlEtiquetteResultats(
      data.etiquette,
      origin.includes("localhost") ? URL_SITE : origin
    );
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
