/**
 * Impression étiquettes tubes (Code128) — une fenêtre navigateur.
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
      width: 1.6,
      height: 48,
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
        ? `<img class="bc" src="${src}" alt="Code-barres" />`
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
    @page { size: auto; margin: 6mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 12px;
      font-family: Arial, Helvetica, sans-serif;
      background: #eef2f7;
      color: #000;
    }
    .toolbar {
      position: sticky; top: 0; z-index: 2;
      display: flex; justify-content: space-between; align-items: center; gap: 8px;
      padding: 10px 12px; margin: -12px -12px 14px;
      background: #0f2744; color: #fff; font-size: 13px;
    }
    .toolbar button {
      border: 0; border-radius: 8px; padding: 8px 14px;
      background: #1d6ef5; color: #fff; font-weight: 700; cursor: pointer;
    }
    .sheet {
      max-width: 360px; margin: 0 auto;
      display: flex; flex-direction: column; gap: 18px;
    }
    .label {
      background: #fff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 12px 12px;
      page-break-inside: avoid;
    }
    .bc { display: block; width: 100%; max-width: 280px; height: 52px; object-fit: contain; }
    .bc-fallback { font-family: monospace; font-size: 12px; padding: 8px 0; }
    .l1, .l2, .l3, .l4 {
      margin: 4px 0 0;
      font-size: 12px;
      line-height: 1.25;
      font-weight: 600;
      letter-spacing: 0.01em;
    }
    .l2 { font-size: 13px; font-weight: 800; text-transform: uppercase; }
    @media print {
      body { background: #fff; padding: 0; }
      .toolbar { display: none !important; }
      .label { border: 0; border-radius: 0; padding: 4mm 2mm 8mm; }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Étiquettes tubes · ${echapper(numeroFacture)}</span>
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
