/**
 * Extrait options / types de saisie depuis modaux.php → options-saisie-modaux.ts
 * Usage: node scripts/extraire-options-modaux.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "modaux.php"), "utf8");

/** Modal id → clé formulaire (alignée sur liste_examens / Prisma) */
const MODAL_VERS_FORMULAIRE = {
  examFormModal: "examForm",
  bilansAnalysesModal: "bilansAnalyses",
  ionogrammeModal: "ionogramme",
  spotUrinesModal: "spot_urines",
  pttModal: "ptt",
  bilansAzotesModal: "bilans_azotes",
  profilLipidiqueModal: "profilLipidique",
  bilirubiModal: "bilirubi",
  serologyFormModal: "serology",
  salmonellaModal: "salmonella",
  widalModal: "widal",
  sedimentUrinaireModal: "sedimentUrinaire",
  urinesRoutinesModal: "urinesRoutines",
  sellesRoutineModal: "sellesRoutine",
  rivaltaModal: "rivalta",
  proteineBincesJonesModal: "proteineBincesJones",
  trypanosomiaseModal: "trypanosomiase",
  sangOcculteModal: "sangOcculte",
  malariaModal: "malaria",
  malariaGEModal: "malaria_ge",
  histopathologieModal: "histopathologie",
  chargeViralModal: "chargeViral",
  frottisBloodModal: "frottis_sang",
  frottisSecretionModal: "frottis_secretion",
  fluideModal: "fluide",
  nfsModal: "nfs",
  nflModal: "nfl",
  hematologieFormModal: "hematologie",
  coagulationFormModal: "coagulation",
  microbiologieModal: "microbiologie",
  ziehlNelsenModal: "ziehl_nelsen",
  coprocultureFormModal: "coproculture",
  hemocultureFormModal: "hemoculture",
  goutteFraicheModal: "goutte_fraiche",
  microfilaireModal: "microfilaire",
  groupageSanguinModal: "groupage_sanguin",
  spermogrammeModal: "spermogramme",
  electrophoreseModal: "electrophorese",
  microAlbuminuriesModal: "micro_albuminurie",
  glycemieGestationnelleModal: "glycemie_gestationnelle",
  bilansTorchModal: "bilans_torch",
  surveillanceProstatiqueModal: "surveillance_prostatique",
  tempsSaignementModal: "temps_saignement",
  tpInrModal: "tp_inr",
  reticulocyteModal: "reticulocyte",
  hbHctModal: "hb_hct",
  valeurAbsoluEosinophilesModal: "valeur_absolu_eosinophiles",
};

function normaliserNom(n) {
  return n.trim().toUpperCase().replace(/\s+/g, " ");
}

function decodeHtml(v) {
  return v
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"');
}

function extraireOptionsSelect(html) {
  const opts = [];
  const re = /<option[^>]*value="([^"]*)"[^>]*>/gi;
  let m;
  while ((m = re.exec(html))) {
    let v = decodeHtml(m[1].trim());
    if (!v || v === "---" || v === "-- Sélectionner --" || v === "-- Résultats --")
      continue;
    if (v.toLowerCase().includes("préciser") || v === "À préciser") continue;
    opts.push(v === "AUTRES" ? "Autres" : v);
  }
  return [...new Set(opts)];
}

function estDate(html) {
  return /type="date"/i.test(html);
}

function estTexteSeul(html) {
  if (estDate(html)) return false;
  if (/<select/i.test(html)) return false;
  if (/param-flag|FlagSelect|exam-flag/i.test(html)) return false;
  return /type="text"/i.test(html) && !/data-other-field/i.test(html);
}

function estFlagValeur(html) {
  return /param-flag|FlagSelect|exam-flag|coagulationFlagSelect/i.test(html);
}

function estResultatValeur(html) {
  const hasResult =
    /param-result|ResultSelect|RESULTAT\s*:/i.test(html) ||
    (/<select/i.test(html) && /RESULTAT/i.test(html));
  const hasValeur =
    /param-valeur|ResultInput|VALEURS\s*:/i.test(html) ||
    (/type="text"/i.test(html) && /Titre\/Valeur|placeholder="Titre/i.test(html));
  return hasResult && hasValeur;
}

function extraireNomParametre(block) {
  let m = block.match(/data-[a-z0-9-]+-param="([^"]+)"/i);
  if (m) return normaliserNom(m[1]);
  m = block.match(/data-param="([^"]+)"/i);
  if (m) return normaliserNom(m[1]);
  m = block.match(
    /<div[^>]*font-weight:600[^>]*>([^<]+)<\/div>/i
  );
  if (m) return normaliserNom(m[1]);
  m = block.match(/data-zn-param="([^"]+)"/i);
  if (m) return normaliserNom(m[1]);
  return null;
}

function extraireModal(id) {
  const start = src.indexOf(`id="${id}"`);
  if (start < 0) return null;
  const bodyStart = src.indexOf('class="modal-body"', start);
  if (bodyStart < 0) return null;
  const nextModal = src.indexOf('<div class="modal"', bodyStart + 50);
  return src.slice(bodyStart, nextModal > 0 ? nextModal : undefined);
}

/** Découpe en blocs paramètre (ligne grise) */
function decouperBlocs(modalHtml) {
  const blocs = [];
  const re =
    /<div[^>]*(?:data-[a-z-]+-param=|data-zn-param=|padding:12px;background:#f9f9f9)[^>]*>[\s\S]*?(?=<div[^>]*(?:data-[a-z-]+-param=|data-zn-param=|padding:12px;background:#f9f9f9)|<!-- Section Commentaires|<\/div>\s*<\/div>\s*<!-- Section Commentaires)/gi;
  let m;
  while ((m = re.exec(modalHtml))) {
    blocs.push(m[0]);
  }
  if (blocs.length === 0) {
    // urines / selles : blocs sans data-param sur div parent
    const re2 =
      /<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9[\s\S]*?(?=<div style="display:flex;align-items:center;gap:10px;padding:12px;background:#f9f9f9|<\/div>\s*<\/div>\s*\n\s*<!-- Section Commentaires)/gi;
    while ((m = re2.exec(modalHtml))) blocs.push(m[0]);
  }
  return blocs;
}

const catalog = {};

for (const [modalId, formulaire] of Object.entries(MODAL_VERS_FORMULAIRE)) {
  const modal = extraireModal(modalId);
  if (!modal) continue;
  const blocs = decouperBlocs(modal);
  if (!catalog[formulaire]) catalog[formulaire] = {};

  for (const block of blocs) {
    const nom = extraireNomParametre(block);
    if (!nom) continue;

    if (estDate(block)) {
      catalog[formulaire][nom] = { typeSaisie: "date" };
      continue;
    }

    if (estFlagValeur(block)) {
      catalog[formulaire][nom] = { typeSaisie: "texte" };
      continue;
    }

    if (estResultatValeur(block)) {
      const selects = [...block.matchAll(/<select[\s\S]*?<\/select>/gi)].map(
        (x) => x[0]
      );
      const selectResult =
        selects.find((s) => /param-result|ResultSelect/i.test(s)) ??
        selects[0];
      const options = selectResult ? extraireOptionsSelect(selectResult) : [];
      catalog[formulaire][nom] = {
        typeSaisie: "resultat_valeur",
        options,
        libelleSecondaire: "Valeurs",
        placeholderSecondaire: "Titre/Valeur",
      };
      continue;
    }

    const selectMatch = block.match(/<select[\s\S]*?<\/select>/i);
    if (selectMatch) {
      const options = extraireOptionsSelect(selectMatch[0]);
      const avecAutres = options.some((o) => o === "Autres");
      catalog[formulaire][nom] = {
        typeSaisie: avecAutres ? "select_autres" : "select",
        options,
      };
      continue;
    }

    if (/<textarea/i.test(block)) {
      catalog[formulaire][nom] = { typeSaisie: "description" };
      continue;
    }

    if (estTexteSeul(block)) {
      catalog[formulaire][nom] = { typeSaisie: "texte" };
    }
  }
}

// Sérologie : modèle unique (nom paramètre dynamique)
{
  const serologyModal = extraireModal("serologyFormModal");
  if (serologyModal) {
    const sel = serologyModal.match(
      /id="serologyResultSelect"[\s\S]*?<\/select>/i
    )?.[0];
    const options = sel ? extraireOptionsSelect(sel) : ["Négatif", "Positif", "Autres"];
    if (!catalog.serology) catalog.serology = {};
    catalog.serology.__defaut__ = {
      typeSaisie: "resultat_valeur",
      options,
      libelleSecondaire: "Valeurs",
      placeholderSecondaire: "Titre/Valeur",
    };
  }
}

// Malaria test rapide : paramètre unique avec résultat + titre
if (catalog.malaria) {
  const tpl = {
    typeSaisie: "resultat_valeur",
    options: ["Négatif", "Positif", "Autres"],
    libelleSecondaire: "Valeurs",
    placeholderSecondaire: "Titre/Valeur",
  };
  catalog.malaria.__defaut__ = tpl;
  catalog.malaria["MALARIA TESTE RAPIDE"] = tpl;
}

// Ziehl : chaque RESULTAT_N a date + echantillon + aspect + select — paramètres catalogue séparés
if (catalog.ziehl_nelsen) {
  const znOpts = extraireOptionsSelect(
    src.match(/ziehlNelsenModal[\s\S]*?<select required class="zn-param-valeur"[\s\S]*?<\/select>/i)?.[0] ?? ""
  );
  for (const k of Object.keys(catalog.ziehl_nelsen)) {
    if (k.startsWith("RESULTAT")) {
      catalog.ziehl_nelsen[k] = {
        typeSaisie: "select_autres",
        options: znOpts.length ? znOpts : ["NEGATIF", "POSITIF +", "POSITIF ++", "POSITIF +++", "POSITIF ++++", "Autres"],
      };
    }
  }
  // Paramètres date/echantillon/aspect typiques ziehl
  for (const suffix of ["DATE", "ECHANTILLON", "ASPECT"]) {
    for (let i = 1; i <= 3; i++) {
      const cle = `${suffix} ${i}`;
      if (!catalog.ziehl_nelsen[cle]) {
        catalog.ziehl_nelsen[cle] = {
          typeSaisie: suffix === "DATE" ? "date" : "texte",
        };
      }
    }
  }
}

function fmt(obj, indent = 2) {
  return JSON.stringify(obj, null, 2)
    .replace(/"typeSaisie": "([^"]+)"/g, 'typeSaisie: "$1"')
    .replace(/"options": \[/g, "options: [")
    .replace(/"([^"]+)":/g, '"$1":')
    .replace(/^(\s+)"([^"]+)":/gm, (_, sp, k) => `${sp}${k.includes(" ") ? JSON.stringify(k) : `"${k}"`}:`)
    .replace(/"(\w+)":/g, '"$1":');
}

const out = `/** Généré depuis modaux.php — node scripts/extraire-options-modaux.mjs */
import type { ConfigSaisieParametre } from "@/lib/laboratoire/config-saisie-parametre";
import { avecOptionAutres } from "@/lib/laboratoire/config-saisie-parametre";

export type EntreeOptionsSaisie = ConfigSaisieParametre;

export const OPTIONS_SAISIE_PAR_FORMULAIRE: Record<
  string,
  Record<string, EntreeOptionsSaisie>
> = ${JSON.stringify(catalog, null, 2)};

/** Alias noms paramètres catalogue ↔ modaux */
const CLES_EQUIVALENTES: Record<string, string[]> = {
  APPARANCE: ["APPARANCE", "APPARENCES"],
  APPARENCES: ["APPARANCE", "APPARENCES"],
  KETONE: ["KETONE", "ACETONE"],
  ACETONE: ["KETONE", "ACETONE"],
  NITRATE: ["NITRATE", "NITRITES"],
  NITRITES: ["NITRATE", "NITRITES"],
  "GLOBULE ROUGE": ["GLOBULE ROUGE", "GLOBULES ROUGES"],
  "GLOBULES ROUGES": ["GLOBULE ROUGE", "GLOBULES ROUGES"],
  "GRAVITE SPECIFIQUE": ["GRAVITE SPECIFIQUE", "DENSITE", "DENSITEPARASITAIRE"],
  DENSITE: ["GRAVITE SPECIFIQUE", "DENSITE"],
  "GOUTTE EPAISSE": ["GOUTTE EPAISSE", "GOUTTE ÉPAISSE"],
  "GOUTTE ÉPAISSE": ["GOUTTE EPAISSE", "GOUTTE ÉPAISSE"],
  GAMETOCYTE: ["GAMETOCYTE", "GAMÉTOCYTE"],
  "GAMÉTOCYTE": ["GAMETOCYTE", "GAMÉTOCYTE"],
};

const OPTIONS_RESULTAT_ZIEHL = avecOptionAutres([
  "NEGATIF",
  "POSITIF +",
  "POSITIF ++",
  "POSITIF +++",
  "POSITIF ++++",
]);

function clesRecherche(nom: string): string[] {
  const n = nom.trim().toUpperCase().replace(/\\s+/g, " ");
  const eq = CLES_EQUIVALENTES[n] ?? [n];
  return [...new Set(eq)];
}

export function optionsSaisieDepuisModaux(
  formulaire: string | null | undefined,
  nomParametre: string
): EntreeOptionsSaisie | null {
  if (!formulaire) return null;

  const f = formulaire.trim();
  const upper = nomParametre.trim().toUpperCase();

  if (f === "ziehl_nelsen") {
    if (upper === "DATE" || upper.startsWith("DATE ")) {
      return { typeSaisie: "date" };
    }
    if (upper === "ECHANTILLON" || upper === "ASPECT") {
      return { typeSaisie: "texte" };
    }
    if (upper === "RESULTAT" || upper.startsWith("RESULTAT")) {
      return { typeSaisie: "select_autres", options: OPTIONS_RESULTAT_ZIEHL };
    }
  }

  if (/^DATE(\\s|$| DE| D')/.test(upper)) {
    return { typeSaisie: "date" };
  }

  const table = OPTIONS_SAISIE_PAR_FORMULAIRE[f];
  if (!table) return null;

  for (const cle of clesRecherche(nomParametre)) {
    if (table[cle]) return normaliserEntree(table[cle]);
  }

  const upperSans = sansAccent(upper);
  for (const [k, v] of Object.entries(table)) {
    if (k.startsWith("__")) continue;
    if (sansAccent(k) === upperSans) return normaliserEntree(v);
  }

  for (const [k, v] of Object.entries(table)) {
    if (k.startsWith("__")) continue;
    if (k === upper || upper.includes(k) || k.includes(upper)) {
      return normaliserEntree(v);
    }
  }

  if (table.__defaut__) return normaliserEntree(table.__defaut__);

  return null;
}

function sansAccent(s: string): string {
  return s.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "");
}

function normaliserEntree(entree: EntreeOptionsSaisie): EntreeOptionsSaisie {
  const copie = { ...entree };
  if (
    (copie.typeSaisie === "select" ||
      copie.typeSaisie === "select_autres" ||
      copie.typeSaisie === "resultat_valeur") &&
    copie.options
  ) {
    copie.options =
      copie.typeSaisie === "select_autres" || copie.typeSaisie === "resultat_valeur"
        ? avecOptionAutres(copie.options)
        : [...copie.options];
  }
  if (copie.typeSaisie === "resultat_valeur" && (!copie.options || copie.options.length === 0)) {
    copie.options = avecOptionAutres(["Négatif", "Positif"]);
  }
  return copie;
}
`;

fs.writeFileSync(
  path.join(root, "src/lib/laboratoire/options-saisie-modaux.ts"),
  out,
  "utf8"
);

const stats = Object.entries(catalog).map(
  ([f, p]) => `${f}: ${Object.keys(p).length} param(s)`
);
console.log("Généré options-saisie-modaux.ts\n" + stats.join("\n"));
