/**
 * Impression étiquettes tubes (Code128) — format compact, 1 barcode / specimen.
 */

import JsBarcode from "jsbarcode";
import type { EtiquetteTubeLabo } from "@/lib/caisse/types";

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
      width: 2.2,
      height: 40,
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

export function construireHtmlEtiquettesTubes(
  etiquettes: EtiquetteTubeLabo[],
  numeroFacture: string
): string {
  const blocs = etiquettes
    .map((e) => {
      const src = genererCodeBarreDataUrl(e.codeBarre);
      const img = src
        ? `<img class="bc" src="${src}" alt="Code-barres ${echapper(e.typeTube)}" />`
        : `<div class="bc-fallback">${echapper(e.codeBarre)}</div>`;
      return `<article class="label">
        ${img}
        <p class="l1">${echapper(e.ligneDateTube)}</p>
        <p class="l2">${echapper(e.nomPatient)}</p>
        <p class="l3">${echapper(e.ligneIdentite)}</p>
        <p class="l4">${echapper(e.ligneDepartement)}</p>
      </article>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Codes-barres ${echapper(numeroFacture)}</title>
  <style>
    @page { size: auto; margin: 4mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      margin: 0;
      padding: 8px;
      font-family: Arial, Helvetica, sans-serif;
      background: #fff;
      color: #000;
    }
    .toolbar {
      position: sticky; top: 0; z-index: 2;
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      padding: 8px 10px; margin: 0 0 10px;
      background: #0f2744; color: #fff; font-size: 12px;
      font-family: system-ui, sans-serif;
    }
    .toolbar button {
      border: 0; border-radius: 6px; padding: 7px 12px;
      background: #1d6ef5; color: #fff; font-weight: 700; cursor: pointer;
    }
    /* Largeur étiquette tube ~ 55–58 mm, sans marges latérales inutiles */
    .sheet {
      width: 58mm;
      max-width: 100%;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
    .label {
      width: 100%;
      background: #fff;
      padding: 2px 0 8px;
      page-break-inside: avoid;
      text-align: left;
    }
    .bc {
      display: block;
      width: 100%;
      height: auto;
      max-height: 46px;
      object-fit: contain;
      object-position: left center;
    }
    .bc-fallback {
      font-family: monospace;
      font-size: 11px;
      padding: 4px 0;
    }
    .l1, .l2, .l3, .l4 {
      margin: 2px 0 0;
      font-size: 11px;
      line-height: 1.2;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .l2 { font-size: 12px; font-weight: 800; text-transform: uppercase; }
    .l4 { font-weight: 700; }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .sheet { width: 50mm; }
      .label { padding-bottom: 6mm; }
      .bc { height: 40px; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Étiquettes · ${etiquettes.length} specimen(s) · ${echapper(numeroFacture)}</span>
    <button type="button" onclick="window.print()">Imprimer</button>
  </div>
  <div class="sheet">${blocs}</div>
</body>
</html>`;
}

export async function imprimerEtiquettesTubesFacture(
  factureId: string
): Promise<{ ok: true } | { ok: false; erreur: string }> {
  if (typeof window === "undefined") {
    return { ok: false, erreur: "Disponible uniquement dans le navigateur." };
  }

  try {
    const res = await fetch(`/api/caisse/factures/${factureId}/etiquettes`);
    const data = (await res.json()) as {
      erreur?: string;
      facture?: { numeroFacture: string };
      etiquettes?: EtiquetteTubeLabo[];
    };
    if (!res.ok || !data.etiquettes?.length || !data.facture) {
      return { ok: false, erreur: data.erreur || "Étiquettes indisponibles." };
    }

    const html = construireHtmlEtiquettesTubes(
      data.etiquettes,
      data.facture.numeroFacture
    );
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
    return { ok: false, erreur: "Erreur lors de la préparation des codes-barres." };
  }
}
