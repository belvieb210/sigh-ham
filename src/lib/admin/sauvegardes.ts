import "server-only";
import {
  mkdir,
  readdir,
  rename,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import { createReadStream } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { createGunzip } from "zlib";
import { enregistrerAudit } from "@/lib/admin/audit";

const DIR_BACKUPS = join(process.cwd(), "storage", "backups");
const DIR_ARCHIVES = join(DIR_BACKUPS, "archives");

const PARAMS_PRISMA = new Set([
  "schema",
  "connection_limit",
  "pool_timeout",
  "pgbouncer",
  "socket_timeout",
]);

const EXT_AUTORISEES = [".sql.gz", ".sql", ".dump"];

export interface SauvegardeFichier {
  nom: string;
  taille: number;
  creeLe: string;
  archivee: boolean;
  nomBase: string | null;
}

export function urlPourOutilsPostgres(urlBrute: string): string {
  let cleaned = urlBrute.trim().replace(/^["']|["']$/g, "");
  cleaned = cleaned.replace(
    /[?&](schema|connection_limit|pool_timeout|pgbouncer|socket_timeout)=[^&]*/gi,
    ""
  );
  cleaned = cleaned.replace(/\?&+/g, "?").replace(/&&+/g, "&").replace(/[?&]$/, "");
  try {
    const u = new URL(cleaned);
    for (const cle of [...u.searchParams.keys()]) {
      if (PARAMS_PRISMA.has(cle.toLowerCase())) u.searchParams.delete(cle);
    }
    let sortie = u.toString();
    if (sortie.endsWith("?")) sortie = sortie.slice(0, -1);
    return sortie;
  } catch {
    const idx = cleaned.indexOf("?");
    return idx === -1 ? cleaned : cleaned.slice(0, idx);
  }
}

/** Connexion pg_dump/psql/pg_restore sans URI (évite le paramètre Prisma `schema`). */
function connexionOutilsPostgres() {
  const u = new URL(urlPg());
  const database =
    decodeURIComponent(u.pathname.replace(/^\//, "").split("/")[0] ?? "") || "postgres";
  const env: NodeJS.ProcessEnv = { ...process.env };
  if (u.password) env.PGPASSWORD = u.password;
  const sslmode = u.searchParams.get("sslmode");
  if (sslmode) env.PGSSLMODE = sslmode;
  return {
    env,
    args: [
      "-h",
      u.hostname || "127.0.0.1",
      "-p",
      u.port || "5432",
      "-U",
      u.username || "postgres",
      "-d",
      database,
    ],
  };
}

export function nomBaseDepuisUrl(urlBrute: string): string {
  try {
    const u = new URL(urlPourOutilsPostgres(urlBrute));
    const nom = decodeURIComponent(u.pathname.replace(/^\//, "").split("/")[0] ?? "");
    return nom || "sigh";
  } catch {
    return "sigh";
  }
}

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant.");
  return url;
}

function urlPg(): string {
  return urlPourOutilsPostgres(databaseUrl());
}

export function validerNomFichier(nom: string): string {
  if (!nom || nom.includes("..") || nom.includes("/") || nom.includes("\\")) {
    throw new Error("Nom de fichier invalide.");
  }
  if (!/^[\w.\-]+$/.test(nom)) {
    throw new Error("Nom de fichier invalide.");
  }
  if (!EXT_AUTORISEES.some((ext) => nom.endsWith(ext))) {
    throw new Error("Extension non autorisée (.sql, .sql.gz ou .dump).");
  }
  return nom;
}

function extraireNomBaseDuFichier(nom: string): string | null {
  const m = nom.match(/^sigh-ham_([^_]+)_/);
  return m?.[1] ?? null;
}

function tamponHorodatage() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

export async function assurerDossierBackups() {
  await mkdir(DIR_BACKUPS, { recursive: true });
  await mkdir(DIR_ARCHIVES, { recursive: true });
  return DIR_BACKUPS;
}

async function listerDossier(dossier: string, archivee: boolean): Promise<SauvegardeFichier[]> {
  let fichiers: string[] = [];
  try {
    fichiers = await readdir(dossier);
  } catch {
    return [];
  }
  const details = await Promise.all(
    fichiers
      .filter((f) => EXT_AUTORISEES.some((ext) => f.endsWith(ext)))
      .map(async (nom) => {
        const info = await stat(join(dossier, nom));
        if (!info.isFile()) return null;
        return {
          nom,
          taille: info.size,
          creeLe: info.mtime.toISOString(),
          archivee,
          nomBase: extraireNomBaseDuFichier(nom),
        } satisfies SauvegardeFichier;
      })
  );
  return details.filter((x): x is SauvegardeFichier => x != null);
}

export async function listerSauvegardes(): Promise<SauvegardeFichier[]> {
  await assurerDossierBackups();
  const [actives, archives] = await Promise.all([
    listerDossier(DIR_BACKUPS, false),
    listerDossier(DIR_ARCHIVES, true),
  ]);
  return [...actives, ...archives].sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}

export async function resoudreSauvegarde(nom: string): Promise<{
  chemin: string;
  archivee: boolean;
}> {
  const valide = validerNomFichier(nom);
  await assurerDossierBackups();
  const actif = join(DIR_BACKUPS, valide);
  const archive = join(DIR_ARCHIVES, valide);
  try {
    const info = await stat(actif);
    if (info.isFile()) return { chemin: actif, archivee: false };
  } catch {
    /* absent */
  }
  try {
    const info = await stat(archive);
    if (info.isFile()) return { chemin: archive, archivee: true };
  } catch {
    /* absent */
  }
  throw new Error("Sauvegarde introuvable.");
}

export function cheminSauvegarde(nom: string): string {
  validerNomFichier(nom);
  return join(DIR_BACKUPS, nom);
}

function executer(
  commande: string,
  args: string[],
  options?: { stdin?: NodeJS.ReadableStream; env?: NodeJS.ProcessEnv }
) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(commande, args, {
      shell: false,
      stdio: ["pipe", "pipe", "pipe"],
      env: options?.env ?? process.env,
    });
    let stderr = "";
    child.stderr.on("data", (d) => {
      stderr += String(d);
    });
    child.on("error", (err) => {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        reject(
          new Error(
            `${commande} introuvable. Installez les outils client PostgreSQL (postgresql-client).`
          )
        );
        return;
      }
      reject(err);
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `${commande} exit ${code}`));
    });
    const stdin = options?.stdin;
    if (stdin) {
      stdin.pipe(child.stdin);
      stdin.on("error", (err) => reject(err));
    } else {
      child.stdin.end();
    }
  });
}

export async function declencherSauvegarde(acteurId: string) {
  await assurerDossierBackups();
  const { args, env } = connexionOutilsPostgres();
  const nomBase = nomBaseDepuisUrl(urlPg()).replace(/[^\w.-]/g, "-").replace(/_/g, "-") || "sigh";
  const nom = `sigh-ham_${nomBase}_${tamponHorodatage()}.sql`;
  const chemin = join(DIR_BACKUPS, nom);

  await executer(
    "pg_dump",
    [
      ...args,
      "--no-owner",
      "--no-acl",
      "--clean",
      "--if-exists",
      "--encoding=UTF8",
      "--format=plain",
      "-f",
      chemin,
    ],
    { env }
  );

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "EXPORT",
    entite: "Sauvegarde",
    action: `Sauvegarde créée : ${nom}`,
    details: { fichier: nom, base: nomBase },
  });

  return { nom, chemin, nomBase };
}

export async function restaurerSauvegarde(acteurId: string, nom: string) {
  const { chemin } = await resoudreSauvegarde(nom);
  const { args, env } = connexionOutilsPostgres();

  if (nom.endsWith(".dump")) {
    await executer(
      "pg_restore",
      ["--clean", "--if-exists", "--no-owner", "--no-acl", ...args, chemin],
      { env }
    );
  } else {
    const source = nom.endsWith(".gz")
      ? createReadStream(chemin).pipe(createGunzip())
      : createReadStream(chemin);
    await executer("psql", [...args, "-v", "ON_ERROR_STOP=1", "--quiet"], {
      stdin: source as NodeJS.ReadableStream,
      env,
    });
  }

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "IMPORT",
    entite: "Sauvegarde",
    action: `Restauration de ${nom} dans la base`,
    details: { fichier: nom, base: nomBaseDepuisUrl(urlPg()) },
  });

  return { nom };
}

export async function importerSauvegarde(
  acteurId: string,
  fichier: File
) {
  await assurerDossierBackups();
  const brut = fichier.name.split(/[/\\]/).pop() ?? "import.sql";
  const ext = EXT_AUTORISEES.find((e) => brut.toLowerCase().endsWith(e)) ?? ".sql";
  const nomBase = nomBaseDepuisUrl(urlPg()).replace(/[^\w.-]/g, "-").replace(/_/g, "-") || "sigh";
  const nom = `sigh-ham_${nomBase}_import_${tamponHorodatage()}${ext === ".sql.gz" ? ".sql.gz" : ext}`;
  validerNomFichier(nom);

  const buffer = Buffer.from(await fichier.arrayBuffer());
  if (buffer.length === 0) throw new Error("Fichier vide.");
  const max = 250 * 1024 * 1024;
  if (buffer.length > max) throw new Error("Fichier trop volumineux (max. 250 Mo).");

  const chemin = join(DIR_BACKUPS, nom);
  await writeFile(chemin, buffer);

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "IMPORT",
    entite: "Sauvegarde",
    action: `Sauvegarde importée : ${nom}`,
    details: { fichier: nom, origine: brut },
  });

  return { nom, chemin };
}

export async function archiverSauvegarde(
  acteurId: string,
  nom: string,
  archivee: boolean
) {
  const { chemin, archivee: deja } = await resoudreSauvegarde(nom);
  if (deja === archivee) return { nom, archivee };

  await assurerDossierBackups();
  const cible = join(archivee ? DIR_ARCHIVES : DIR_BACKUPS, nom);
  await rename(chemin, cible);

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "MODIFICATION",
    entite: "Sauvegarde",
    action: archivee ? `Sauvegarde archivée : ${nom}` : `Sauvegarde désarchivée : ${nom}`,
    details: { fichier: nom, archivee },
  });

  return { nom, archivee };
}

export async function supprimerSauvegarde(acteurId: string, nom: string) {
  const { chemin } = await resoudreSauvegarde(nom);
  await unlink(chemin);

  await enregistrerAudit({
    utilisateurId: acteurId,
    type: "SUPPRESSION",
    entite: "Sauvegarde",
    action: `Sauvegarde supprimée : ${nom}`,
    details: { fichier: nom },
  });

  return { nom };
}

export async function lireFichierSauvegarde(nom: string) {
  const { chemin } = await resoudreSauvegarde(nom);
  return { chemin, nom };
}
