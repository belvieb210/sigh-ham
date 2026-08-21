/**
 * Impression étiquette code-barres résultats (navigateur).
 */

import JsBarcode from "jsbarcode";
import type { EtiquetteResultatsLabo } from "@/lib/laboratoire/types-etiquette-resultats";

function echapper(texte: string): string {
  return texte
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function genererCodeBarreDataUrl(valeur: string): string {
  const canvas = document.createElement("canvas");
  try {
    JsBarcode(canvas, valeur, {
      format: "CODE128",
      width: 2,
      height: 64,
      displayValue: false,
      margin: 0,
      background: "#ffffff",
      lineColor: "#000000",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

export function construireHtmlEtiquetteResultats(
  e: EtiquetteResultatsLabo
): string {
  const src = genererCodeBarreDataUrl(e.codeBarre);
  const img = src
    ? `<img class="bc" src="${src}" alt="Code-barres ${echapper(e.numeroPermanent)}" />`
    : `<div class="bc-fallback">${echapper(e.codeBarre)}</div>`;
  const medecin = e.cnomMedecin
    ? `${e.medecinDemandeur} — CNOM: ${e.cnomMedecin}`
    : e.medecinDemandeur;

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
    .toolbar button {
      border: 0; border-radius: 6px; padding: 7px 12px;
      background: #1d6ef5; color: #fff; font-weight: 700; cursor: pointer;
    }
    .sheet { width: min(70mm, 100%); margin: 0 auto; }
    .label {
      text-align: center;
      padding: 6px 4px 10px;
      border-bottom: 1px dashed #ccc;
    }
    .bc {
      display: block;
      width: 100%;
      height: 64px;
      object-fit: contain;
      object-position: center;
      margin: 0 auto 4px;
    }
    .bc-fallback {
      font-family: monospace;
      font-size: 11px;
      padding: 4px 0;
    }
    .l1, .l2, .l3, .l4, .l5 {
      margin: 2px 0 0;
      font-size: 11px;
      line-height: 1.25;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .l2 { font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .l4 { font-family: monospace; font-weight: 700; }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .sheet { width: 50mm; margin: 8mm auto 0; }
      .label { border-bottom: 0; padding-bottom: 4mm; }
      .bc { height: 60px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Étiquette résultats · ${echapper(e.numeroPermanent)}</span>
    <button type="button" onclick="window.print()">Imprimer</button>
  </div>
  <div class="sheet">
    <article class="label">
      ${img}
      <p class="l1">${echapper(e.dateResultat)}</p>
      <p class="l2">${echapper(e.nomComplet)}</p>
      <p class="l3">${echapper(e.ligneIdentite)}</p>
      <p class="l4">${echapper(e.numeroPermanent)}</p>
      <p class="l5">${echapper(medecin)}</p>
    </article>
  </div>
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

    const html = construireHtmlEtiquetteResultats(data.etiquette);
    const fenetre = window.open("", "_blank");
    if (!fenetre) {
      return { ok: false, erreur: "Autorisez les popups pour imprimer." };
    }
    fenetre.document.open();
    fenetre.document.write(html);
    fenetre.document.close();
    try {
      fenetre.opener = null;
    } catch {
      /* ignore */
    }
    return { ok: true };
  } catch {
    return { ok: false, erreur: "Erreur lors de la préparation du code-barres." };
  }
}
