import "server-only";
import * as Minio from "minio";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

const BUCKET_DEFAUT = process.env.MINIO_BUCKET ?? "sigh-fichiers";

let clientMinio: Minio.Client | null = null;

function obtenirClientMinio(): Minio.Client | null {
  const endpoint = process.env.MINIO_ENDPOINT;
  if (!endpoint) return null;

  if (!clientMinio) {
    clientMinio = new Minio.Client({
      endPoint: endpoint,
      port: parseInt(process.env.MINIO_PORT ?? "9000", 10),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
    });
  }

  return clientMinio;
}

async function assurerBucket(client: Minio.Client) {
  const existe = await client.bucketExists(BUCKET_DEFAUT);
  if (!existe) {
    await client.makeBucket(BUCKET_DEFAUT, "us-east-1");
  }
}

export interface ResultatUpload {
  url: string;
  bucket: string | null;
  cleStockage: string;
  nom: string;
  mimeType: string;
  taille: number;
}

export async function uploaderFichier(
  buffer: Buffer,
  nomOriginal: string,
  mimeType: string
): Promise<ResultatUpload> {
  const cle = `${Date.now()}-${randomBytes(8).toString("hex")}-${nomOriginal.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const client = obtenirClientMinio();

  if (client) {
    try {
      await assurerBucket(client);
      await client.putObject(BUCKET_DEFAUT, cle, buffer, buffer.length, {
        "Content-Type": mimeType,
      });
      const base =
        process.env.MINIO_PUBLIC_URL ??
        `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT ?? "9000"}`;
      return {
        url: `${base}/${BUCKET_DEFAUT}/${cle}`,
        bucket: BUCKET_DEFAUT,
        cleStockage: cle,
        nom: nomOriginal,
        mimeType,
        taille: buffer.length,
      };
    } catch (err) {
      console.error("[stockage] MinIO indisponible, repli sur disque local:", err);
    }
  }

  const dir = join(process.cwd(), "public", "uploads", "messagerie");
  await mkdir(dir, { recursive: true });
  const chemin = join(dir, cle);
  await writeFile(chemin, buffer);

  return {
    url: `/uploads/messagerie/${cle}`,
    bucket: null,
    cleStockage: cle,
    nom: nomOriginal,
    mimeType,
    taille: buffer.length,
  };
}

export function typePieceJointeDepuisMime(mime: string): "PDF" | "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT" | "AUTRE" {
  if (mime.startsWith("image/")) return "IMAGE";
  if (mime.startsWith("audio/")) return "AUDIO";
  if (mime.startsWith("video/")) return "VIDEO";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("document") || mime.includes("sheet") || mime.includes("text")) return "DOCUMENT";
  return "AUTRE";
}

const EXTENSIONS_IMAGE: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
};

function mimeDepuisNom(nom: string): string | null {
  const ext = nom.split(".").pop()?.toLowerCase();
  return ext ? EXTENSIONS_IMAGE[ext] ?? null : null;
}

function estBlobFichier(v: FormDataEntryValue | null): boolean {
  return (
    v !== null &&
    typeof v === "object" &&
    "arrayBuffer" in v &&
    typeof (v as Blob).size === "number"
  );
}

/** Extrait une image depuis un FormData (File ou Blob côté serveur Node). */
export async function extraireImageForm(
  form: FormData,
  cle: string
): Promise<{ buffer: Buffer; nom: string; mimeType: string; taille: number } | null> {
  const entree = form.get(cle);
  if (!estBlobFichier(entree)) return null;
  const blob = entree as File | Blob;
  if (blob.size === 0) return null;

  const nom = blob instanceof File && blob.name.trim() ? blob.name : "photo.jpg";
  let mimeType = blob.type ?? "";

  if (!mimeType.startsWith("image/")) {
    mimeType = mimeDepuisNom(nom) ?? mimeType;
  }
  if (!mimeType.startsWith("image/")) return null;

  const buffer = Buffer.from(await blob.arrayBuffer());
  return { buffer, nom, mimeType, taille: buffer.length };
}

export function estRequeteMultipart(contentType: string | null): boolean {
  return (contentType ?? "").toLowerCase().includes("multipart/form-data");
}
