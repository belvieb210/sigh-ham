/**
 * Corrige pages.messagerie / pages.notifications (petits blocs uniquement).
 * Usage: node scripts/corriger-pages-messagerie.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const receptionDir = path.join(__dirname, "..", "src", "locales", "reception");

const PETITS_BLOCS = {
  fr: {
    messagerie: `{
      titre: "Messagerie",
      description: "Échangez avec les équipes des différents services.",
      fil: "Messagerie",
    }`,
    notifications: `{
      titre: "Notifications",
      description: "Alertes, rappels et messages système pour la réception.",
      fil: "Notifications",
    }`,
  },
  en: {
    messagerie: `{
      titre: "Messaging",
      description: "Communicate with teams across hospital services.",
      fil: "Messaging",
    }`,
    notifications: `{
      titre: "Notifications",
      description: "Alerts, reminders and system messages for reception.",
      fil: "Notifications",
    }`,
  },
  zh: {
    messagerie: `{
      titre: "消息",
      description: "与各科室团队安全沟通。",
      fil: "消息",
    }`,
    notifications: `{
      titre: "通知",
      description: "接待处的提醒、警报和系统消息。",
      fil: "通知",
    }`,
  },
};

const DEFAUT = PETITS_BLOCS.en;

function remplacerPetitBloc(contenu, cle, nouveauBloc) {
  const motif = new RegExp(`\\n    ${cle}: \\{`);
  const match = motif.exec(contenu);
  if (!match) return contenu;
  const debut = match.index + 1;
  let i = contenu.indexOf("{", debut);
  let depth = 0;
  for (; i < contenu.length; i++) {
    if (contenu[i] === "{") depth++;
    else if (contenu[i] === "}") {
      depth--;
      if (depth === 0) {
        return contenu.slice(0, debut) + `    ${cle}: ${nouveauBloc}` + contenu.slice(i + 1);
      }
    }
  }
  return contenu;
}

const fichiers = fs.readdirSync(receptionDir).filter((f) => f.endsWith(".ts") && f !== "fr.ts" || true);

for (const fichier of fs.readdirSync(receptionDir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" && false) continue;
  const lang = fichier.replace(".ts", "");
  const blocs = PETITS_BLOCS[lang] ?? DEFAUT;
  const filePath = path.join(receptionDir, fichier);
  let contenu = fs.readFileSync(filePath, "utf8");
  contenu = remplacerPetitBloc(contenu, "messagerie", blocs.messagerie);
  contenu = remplacerPetitBloc(contenu, "notifications", blocs.notifications);
  fs.writeFileSync(filePath, contenu, "utf8");
  console.log(`✓ ${fichier}`);
}

// fr séparément avec blocs FR
{
  const contenu0 = fs.readFileSync(path.join(receptionDir, "fr.ts"), "utf8");
  let contenu = remplacerPetitBloc(contenu0, "messagerie", PETITS_BLOCS.fr.messagerie);
  contenu = remplacerPetitBloc(contenu, "notifications", PETITS_BLOCS.fr.notifications);
  fs.writeFileSync(path.join(receptionDir, "fr.ts"), contenu, "utf8");
  console.log("✓ fr.ts");
}

console.log("pages.messagerie / pages.notifications corrigés.");
