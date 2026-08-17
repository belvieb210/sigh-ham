"use client";

import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Archive,
  ArchiveRestore,
  DatabaseBackup,
  Download,
  Loader2,
  RotateCcw,
  Trash2,
  Upload,
} from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { ModaleConfirmation } from "@/components/ui/modale-confirmation";
import { cn } from "@/lib/utils";

interface SauvegardeItem {
  nom: string;
  taille: number;
  creeLe: string;
  archivee: boolean;
  nomBase: string | null;
}

type Onglet = "actives" | "archives";

function formaterTaille(octets: number) {
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${(octets / 1024).toFixed(1)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1)} Mo`;
}

const CLASSE_ACTION =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gris-bordure text-slate-500 transition-colors hover:bg-gris-tres-clair hover:text-bleu-medical disabled:cursor-not-allowed disabled:opacity-40";

export function ContenuSauvegardesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t, i18n } = useTranslation();
  const [liste, setListe] = useState<SauvegardeItem[]>([]);
  const [onglet, setOnglet] = useState<Onglet>("actives");
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [cible, setCible] = useState<{ nom: string; action: "restaurer" | "supprimer" } | null>(
    null
  );
  const importRef = useRef<HTMLInputElement>(null);

  const charger = useCallback(() => {
    fetch("/api/admin/sauvegardes")
      .then(async (res) => {
        const data = (await res.json()) as {
          sauvegardes?: SauvegardeItem[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        setListe(data.sauvegardes ?? []);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  }, [t]);

  useEffect(() => {
    charger();
  }, [charger]);

  const visibles = useMemo(
    () => liste.filter((s) => (onglet === "archives" ? s.archivee : !s.archivee)),
    [liste, onglet]
  );

  const actives = liste.filter((s) => !s.archivee);
  const archives = liste.filter((s) => s.archivee);
  const volume = liste.reduce((acc, s) => acc + s.taille, 0);
  const derniere = actives[0] ?? liste[0] ?? null;

  const annoncer = (texte: string) => {
    setMessage(texte);
    setErreur(null);
  };

  const lancer = async () => {
    setEnCours("creer");
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sauvegardes", { method: "POST" });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      annoncer(data.message ?? t("admin.sauvegardes.succes"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  const importer = async (fichier: File) => {
    setEnCours("importer");
    setErreur(null);
    setMessage(null);
    try {
      const fd = new FormData();
      fd.append("fichier", fichier);
      const res = await fetch("/api/admin/sauvegardes/importer", {
        method: "POST",
        body: fd,
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      annoncer(data.message ?? t("admin.sauvegardes.succesImport"));
      setOnglet("actives");
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
      if (importRef.current) importRef.current.value = "";
    }
  };

  const basculerArchive = async (s: SauvegardeItem) => {
    setEnCours(s.nom);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/sauvegardes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fichier: s.nom, archivee: !s.archivee }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      annoncer(
        data.message ??
          (s.archivee
            ? t("admin.sauvegardes.succesDesarchiver")
            : t("admin.sauvegardes.succesArchiver"))
      );
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  const confirmerAction = async () => {
    if (!cible) return;
    setEnCours(cible.nom);
    setErreur(null);
    try {
      if (cible.action === "restaurer") {
        const res = await fetch("/api/admin/sauvegardes/restaurer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fichier: cible.nom }),
        });
        const data = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        annoncer(data.message ?? t("admin.sauvegardes.succesRestaurer"));
      } else {
        const res = await fetch(
          `/api/admin/sauvegardes?fichier=${encodeURIComponent(cible.nom)}`,
          { method: "DELETE" }
        );
        const data = (await res.json()) as { message?: string };
        if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
        annoncer(data.message ?? t("admin.sauvegardes.succesSupprimer"));
      }
      setCible(null);
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre={t("admin.sauvegardes.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <EnTetePageReception
          icone={DatabaseBackup}
          titre={t("admin.sauvegardes.titre")}
          description={t("admin.sauvegardes.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.sauvegardes.fil") },
          ]}
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.sauvegardes.derniere")}
            </p>
            <p className="mt-1 text-sm font-semibold text-texte-principal">
              {derniere
                ? new Date(derniere.creeLe).toLocaleString(i18n.language)
                : t("admin.sauvegardes.jamais")}
            </p>
          </div>
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.sauvegardes.actives")}
            </p>
            <p className="mt-1 text-2xl font-bold text-texte-principal">{actives.length}</p>
          </div>
          <div className="rounded-xl border border-gris-bordure bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-texte-secondaire">
              {t("admin.sauvegardes.volume")}
            </p>
            <p className="mt-1 text-2xl font-bold text-texte-principal">
              {formaterTaille(volume)}
            </p>
          </div>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-xl text-sm text-texte-secondaire">
            {t("admin.sauvegardes.intro")}
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              ref={importRef}
              type="file"
              accept=".sql,.gz,.dump,application/sql,application/gzip"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void importer(f);
              }}
            />
            <Bouton
              type="button"
              variante="contour"
              taille="petit"
              disabled={Boolean(enCours)}
              onClick={() => importRef.current?.click()}
            >
              {enCours === "importer" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {t("admin.sauvegardes.importer")}
            </Bouton>
            <Bouton
              type="button"
              taille="petit"
              disabled={Boolean(enCours)}
              onClick={() => void lancer()}
            >
              {enCours === "creer" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DatabaseBackup className="h-4 w-4" />
              )}
              {t("admin.sauvegardes.lancer")}
            </Bouton>
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gris-bordure bg-white shadow-sm">
          <div className="flex gap-1 border-b border-gris-bordure px-3 pt-3">
            {(["actives", "archives"] as const).map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOnglet(o)}
                className={cn(
                  "rounded-t-lg px-3 py-2 text-sm font-semibold",
                  onglet === o
                    ? "bg-white text-bleu-medical shadow-[inset_0_-2px_0_0_currentColor]"
                    : "text-texte-secondaire hover:text-texte-principal"
                )}
              >
                {o === "actives"
                  ? `${t("admin.sauvegardes.actives")} (${actives.length})`
                  : `${t("admin.sauvegardes.archives")} (${archives.length})`}
              </button>
            ))}
          </div>

          <div className="conteneur-tableau-sigh">
            <table className="tableau-sigh min-w-[640px]">
              <thead className="bg-gris-tres-clair text-xs uppercase text-texte-secondaire">
                <tr>
                  <th className="px-4 py-2">{t("admin.sauvegardes.fichier")}</th>
                  <th className="px-3 py-2">{t("admin.sauvegardes.base")}</th>
                  <th className="px-3 py-2">{t("admin.sauvegardes.taille")}</th>
                  <th className="px-3 py-2">{t("admin.sauvegardes.date")}</th>
                  <th className="px-4 py-2 text-right">
                    {t("admin.utilisateurs.colonnes.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((s) => (
                  <tr key={s.nom} className="border-t border-gris-bordure">
                    <td className="px-4 py-2.5 font-mono text-xs">{s.nom}</td>
                    <td className="px-3 py-2.5 text-sm">{s.nomBase ?? "—"}</td>
                    <td className="px-3 py-2.5 text-sm">{formaterTaille(s.taille)}</td>
                    <td className="px-3 py-2.5 text-xs text-texte-secondaire">
                      {new Date(s.creeLe).toLocaleString(i18n.language)}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/api/admin/sauvegardes?fichier=${encodeURIComponent(s.nom)}`}
                          className={CLASSE_ACTION}
                          title={t("admin.sauvegardes.telecharger")}
                          aria-label={t("admin.sauvegardes.telecharger")}
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          className={CLASSE_ACTION}
                          title={t("admin.sauvegardes.restaurer")}
                          aria-label={t("admin.sauvegardes.restaurer")}
                          disabled={Boolean(enCours)}
                          onClick={() => setCible({ nom: s.nom, action: "restaurer" })}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className={CLASSE_ACTION}
                          title={
                            s.archivee
                              ? t("admin.sauvegardes.desarchiver")
                              : t("admin.sauvegardes.archiver")
                          }
                          disabled={Boolean(enCours)}
                          onClick={() => void basculerArchive(s)}
                        >
                          {s.archivee ? (
                            <ArchiveRestore className="h-4 w-4" />
                          ) : (
                            <Archive className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          className={cn(CLASSE_ACTION, "hover:bg-red-50 hover:text-red-700")}
                          title={t("admin.sauvegardes.supprimer")}
                          aria-label={t("admin.sauvegardes.supprimer")}
                          disabled={Boolean(enCours)}
                          onClick={() => setCible({ nom: s.nom, action: "supprimer" })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-texte-secondaire">
                      {onglet === "archives"
                        ? t("admin.sauvegardes.videArchives")
                        : t("admin.sauvegardes.vide")}
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="border-t border-gris-bordure px-4 py-2 text-[11px] text-texte-secondaire">
            {t("admin.sauvegardes.formats")}
          </p>
        </div>
      </div>

      <ModaleConfirmation
        ouverte={Boolean(cible)}
        onFermer={() => {
          if (!enCours) setCible(null);
        }}
        onConfirmer={() => void confirmerAction()}
        titre={
          cible?.action === "restaurer"
            ? t("admin.sauvegardes.restaurerTitre")
            : t("admin.sauvegardes.supprimerTitre")
        }
        description={
          cible?.action === "restaurer"
            ? t("admin.sauvegardes.restaurerDesc", { fichier: cible.nom })
            : t("admin.sauvegardes.supprimerDesc", { fichier: cible?.nom ?? "" })
        }
        libelleConfirmer={
          cible?.action === "restaurer"
            ? t("admin.sauvegardes.restaurerConfirmer")
            : t("admin.sauvegardes.supprimer")
        }
        enCours={Boolean(enCours && cible)}
        erreur={erreur}
        variante={cible?.action === "restaurer" ? "avertissement" : "danger"}
      />
    </MiseEnPageAdmin>
  );
}
