"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Loader2 } from "lucide-react";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION } from "@/constants/reception";

interface SalleItem {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  ordre: number;
  actif: boolean;
  _count: { roles: number };
}

export function ContenuServicesAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const { t } = useTranslation();
  const [salles, setSalles] = useState<SalleItem[]>([]);
  const [files, setFiles] = useState<Record<string, number>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState<string | null>(null);

  const charger = () => {
    void Promise.all([
      fetch("/api/admin/salles?toutes=1").then((r) => r.json()),
      fetch("/api/admin/stats").then((r) => r.json()),
    ])
      .then(([sData, stData]) => {
        if (sData.message && !sData.salles) throw new Error(sData.message);
        setSalles((sData.salles as SalleItem[]) ?? []);
        const map: Record<string, number> = {};
        for (const s of (stData.salles as { code: string; enFile: number }[]) ?? []) {
          map[s.code] = s.enFile;
        }
        setFiles(map);
      })
      .catch((e: unknown) =>
        setErreur(e instanceof Error ? e.message : t("admin.common.erreur"))
      );
  };

  useEffect(() => {
    charger();
  }, []);

  const basculerActif = async (salle: SalleItem) => {
    setEnCours(salle.code);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/salles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: salle.code, actif: !salle.actif }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
      charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : t("admin.common.erreur"));
    } finally {
      setEnCours(null);
    }
  };

  const renommer = async (salle: SalleItem, nom: string) => {
    if (!nom.trim() || nom.trim() === salle.nom) return;
    setEnCours(salle.code);
    try {
      const res = await fetch("/api/admin/salles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: salle.code, nom: nom.trim() }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? t("admin.common.erreur"));
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
      titre={t("admin.services.titre")}
      sousTitre={t("admin.layout.sousTitre")}
    >
      <div className="mx-auto w-full max-w-[1100px]">
        <EnTetePageReception
          icone={Building2}
          titre={t("admin.services.titre")}
          description={t("admin.services.description")}
          fil={[
            { label: t("admin.common.salle"), href: "/sigh/admin" },
            { label: t("admin.services.fil") },
          ]}
        />
        {erreur ? (
          <p className="mt-4 text-sm text-red-700">{erreur}</p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {salles.map((s) => (
            <div
              key={s.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                s.actif ? "border-gris-bordure" : "border-red-200 opacity-80"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-texte-secondaire">
                  {s.code}
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    s.actif
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {s.actif
                    ? t("admin.services.actif")
                    : t("admin.services.inactif")}
                </span>
              </div>
              <input
                className={`${CLASSE_CHAMP_RECEPTION} mt-2 font-bold`}
                defaultValue={s.nom}
                onBlur={(e) => void renommer(s, e.target.value)}
              />
              <p className="mt-2 text-sm text-texte-secondaire">
                {s.description || t("admin.services.sansDescription")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-texte-secondaire">
                <span>
                  {s._count.roles} {t("admin.services.roles")}
                </span>
                <span>
                  {files[s.code] ?? 0} {t("admin.services.enFile")}
                </span>
                <span>
                  {t("admin.services.ordre")} {s.ordre}
                </span>
              </div>
              <Bouton
                type="button"
                variante="secondaire"
                taille="petit"
                className="mt-3"
                disabled={enCours === s.code || s.code === "ADMIN"}
                onClick={() => void basculerActif(s)}
              >
                {enCours === s.code ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : null}
                {s.actif
                  ? t("admin.services.desactiver")
                  : t("admin.services.activer")}
              </Bouton>
            </div>
          ))}
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
