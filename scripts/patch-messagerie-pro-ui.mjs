import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const proBlock = `    pro: {
      onglets: { conversations: "Conversations", groupes: "Groupes" },
      membresEnLigne: "{{total}} membres, {{enLigne}} en ligne",
      resumeGroupe: "Groupe · {{count}} membres",
      enLigne: "En ligne",
      horsLigne: "Hors ligne",
      actions: {
        appel: "Appel",
        video: "Vidéo",
        recherche: "Recherche",
        plus: "Plus",
      },
      medias: "Médias et fichiers",
      voirTout: "Voir tout",
      ajouterMembre: "Ajouter",
      ecrireMessage: "Écrire un message…",
      bientot: "Bientôt disponible",
      telecharger: "Télécharger",
      reponseA: "Réponse à {{nom}}",
      priorite: "Priorité",
      aucunMedia: "Aucun fichier partagé pour le moment.",
      detailsConversation: "Détails de la conversation",
    },`;

for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".ts") || f === "fr.ts" || f === "en.ts") continue;
  const p = path.join(dir, f);
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("pro:")) {
    console.log("skip", f);
    continue;
  }
  c = c.replace(
    /dates: \{\s*\n\s*hier: "Hier",\s*\n\s*\}/,
    `dates: {\n      hier: "Hier",\n      aujourdhui: "Aujourd'hui",\n    }`
  );
  c = c.replace(/(pieceJointe: "[^"]+",)\s*\n(\s*\},)/, `$1\n${proBlock}\n$2`);
  fs.writeFileSync(p, c);
  console.log("patched", f);
}
