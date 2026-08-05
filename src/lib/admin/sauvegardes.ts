import "server-only";
import { mkdir, readdir, stat } from "fs/promises";
import { join } from "path";
import { spawn } from "child_process";
import { enregistrerAudit } from "@/lib/admin/audit";

const DIR_BACKUPS = join(process.cwd(), "storage", "backups");

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant.");
  return url;
}

export async function assurerDossierBackups() {
  await mkdir(DIR_BACKUPS, { recursive: true });
  return DIR_BACKUPS;
}

export async function listerSauvegardes() {
  await assurerDossierBackups();
  const fichiers = await readdir(DIR_BACKUPS);
  const details = await Promise.all(
    fichiers
      .filter((f) => f.endsWith(".sql") || f.endsWith(".dump"))
      .map(async (nom) => {
        const chemin = join(DIR_BACKUPS, nom);
        const info = await stat(chemin);
        return {
          nom,
          taille: info.size,
          creeLe: info.mtime.toISOString(),
        };
      })
  );
  return details.sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}

export function cheminSauvegarde(nom: string): string {
  if (!/^[\w.\-]+$/.test(nom) || nom.includes("..")) {
    throw new Error("Nom de fichier invalide.");
  }
  return join(DIR_BACKUPS, nom);
}

export async function declencherSauvegarde(acteurId: string) {
  await assurerDossierBackups();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const nom = `sigh-ham-${stamp}.sql`;
  const chemin = join(DIR_BACKUPS, nom);
  const url = databaseUrl();

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      "pg_dump",
      [url, "--no-owner", "--no-acl", "-f", chemin],
      { shell: false }
    );
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `pg_dump exit ${code}`));
    });
  });

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "EXPORT",
    entite: "Sauvegarde",
    action: `Sauvegarde créée : ${nom}`,
    details: { fichier: nom },
  });

  return { nom, chemin };
}
