import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const EXTRA_PAGES = `    recherche: {
      titre: "Recherche patient",
      description: "Recherche avancée de dossiers patients.",
      fil: "Recherche",
    },
    historique: {
      titre: "Historique",
      description: "Historique des enregistrements et transferts.",
      fil: "Historique",
    },
    messagerie: {
      titre: "Messagerie",
      description: "Échanges avec les équipes des services.",
      fil: "Messagerie",
    },
    notifications: {
      titre: "Notifications",
      description: "Alertes et messages système.",
      fil: "Notifications",
    },
    motifs: {
      titre: "Motifs de visite",
      description: "Gestion des motifs de visite.",
      fil: "Motifs",
    },
    examens: {
      titre: "Examens initiaux",
      description: "Catalogue d'examens à l'enregistrement.",
      fil: "Examens",
    },
    utilisateurs: {
      titre: "Utilisateurs",
      description: "Comptes du personnel de réception.",
      fil: "Utilisateurs",
    },
    parametres: {
      titre: "Paramètres",
      description: "Configuration de la réception.",
      fil: "Paramètres",
    },
    aVenir: {
      titre: "Page en préparation",
      description: "Cette fonctionnalité sera disponible prochainement.",
    },`;

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".ts") && !["fr.ts", "en.ts"].includes(f))) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  if (!/layout:[\s\S]*?communication:/.test(content)) {
    const next = content.replace(
      /(layout: \{[\s\S]*?reception: "[^"]*",)\r?\n(\s+parametres:)/,
      `$1\n    communication: "Communication",\n$2`
    );
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  if (!/nav:[\s\S]*?messagerie:/.test(content)) {
    const next = content.replace(
      /(nav: \{[\s\S]*?historique: "[^"]*",)\r?\n(\s+motifsVisite:)/,
      `$1\n    messagerie: "Messagerie",\n    notifications: "Notifications",\n$2`
    );
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  if (!content.includes("aVenir:")) {
    const next = content.replace(
      /(pages: \{[\s\S]*?transferts: \{[\s\S]*?\},)\r?\n(\s+\},)/,
      `$1\n${EXTRA_PAGES}\n  $2`
    );
    if (next !== content) {
      content = next;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log("Patched:", file);
  } else {
    console.log("Skipped (no change):", file);
  }
}

console.log("Done.");
