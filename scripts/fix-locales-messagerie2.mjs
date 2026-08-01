import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, "..", "src", "locales", "reception");

const BLOC = `    salles: {
      RECEPTION: "Réception",
      INFIRMIERS: "Infirmiers",
      MEDECINS: "Médecins",
      CAISSE: "Caisse",
      LABORATOIRE: "Laboratoire",
      PHARMACIE: "Pharmacie",
      EGLISE: "Église",
      MEDECINS_EXTERNES: "Médecins externes",
      HOSPITALISATION: "Hospitalisation",
      ADMIN: "Administration",
      MESSAGERIE: "Messagerie",
    },
    canal: {
      hashtag: "#{{nom}}",
      officiel: "Canal officiel — {{salle}}",
    },
    groupe: {
      defaut: "Groupe de travail",
      interServices: "Groupe inter-services",
      bouton: "Groupe",
      modal: {
        titre: "Nouveau groupe inter-services",
        placeholder: "Nom du groupe (ex. Urgences, Coordination…)",
        creer: "Créer le groupe",
      },
    },
    conversation: {
      defaut: "Conversation",
      direct: "Message direct",
    },
    dates: {
      hier: "Hier",
    },
    epingle: "Épingler la conversation",
    desepingle: "Désépingler",
    pieceJointe: "Pièce jointe",
`;

for (const fichier of fs.readdirSync(dir)) {
  if (!fichier.endsWith(".ts") || fichier === "fr.ts" || fichier === "en.ts") continue;
  const chemin = path.join(dir, fichier);
  let c = fs.readFileSync(chemin, "utf8");

  // Retirer bloc erroné dans actions (salles → pieceJointe)
  c = c.replace(/\n    salles: \{[\s\S]*?\n    pieceJointe: "[^"]+",\n(?=  pages:)/, "\n");

  // Insérer dans messagerie si absent
  const idxMessagerie = c.indexOf("  messagerie: {");
  const idxSallesMessagerie = c.indexOf("    salles:", idxMessagerie);
  const idxNotif = c.indexOf("  notificationsCentre:", idxMessagerie);
  const sallesDansMessagerie =
    idxSallesMessagerie > idxMessagerie &&
    (idxNotif < 0 || idxSallesMessagerie < idxNotif);

  if (!sallesDansMessagerie) {
    c = c.replace(
      /(    patient: \{\r?\n      ouvrirDiscussion:[\s\S]*?selectionRequise: "[^"]+",\r?\n    \},)/,
      `$1\n${BLOC}`
    );
  }

  fs.writeFileSync(chemin, c);
  console.log("OK", fichier);
}
