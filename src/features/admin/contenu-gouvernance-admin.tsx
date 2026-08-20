"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Save, Shield, ShieldCheck } from "lucide-react";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_CHAMP_RECEPTION, CLASSE_LABEL_RECEPTION } from "@/constants/reception";
import {
  MiseEnPageAdmin,
  type UtilisateurAdmin,
} from "@/features/admin/mise-en-page-admin";
import { EnTetePageReception } from "@/features/reception/en-tete-page-reception";
import { ZonePhotoPatient } from "@/features/reception/zone-photo-patient";
import { nomAffichageGouvernance } from "@/lib/admin/nom-affichage-gouvernance";
import { cn } from "@/lib/utils";

type SalleOption = {
  id: string;
  code: string;
  nom: string;
  ordre: number;
  actif: boolean;
};

type ResponsableOption = {
  id: string;
  prenom: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  photoUrl: string | null;
  role: {
    code: string;
    nom: string;
    salle: { code: string; nom: string } | null;
  };
};

type ServiceConfig = {
  salleCode: string;
  visible: boolean;
  ordre: number;
};

type FormGouvernance = {
  responsableUtilisateurId: string;
  titreResponsable: string;
  bioResponsable: string;
  badgeDirection1Valeur: string;
  badgeDirection1Libelle: string;
  badgeDirection2Valeur: string;
  badgeDirection2Libelle: string;
  badgeDirection3Valeur: string;
  badgeDirection3Libelle: string;
  services: ServiceConfig[];
};

const BADGES = [
  { valeur: "badgeDirection1Valeur", libelle: "badgeDirection1Libelle", index: 1 },
  { valeur: "badgeDirection2Valeur", libelle: "badgeDirection2Libelle", index: 2 },
  { valeur: "badgeDirection3Valeur", libelle: "badgeDirection3Libelle", index: 3 },
] as const;

function formVide(): FormGouvernance {
  return {
    responsableUtilisateurId: "",
    titreResponsable: "Directeur général",
    bioResponsable:
      "Le responsable du centre pilote la qualité, l'integrite et l'accessibilite des soins au quotidien.",
    badgeDirection1Valeur: "HAM",
    badgeDirection1Libelle: "Direction",
    badgeDirection2Valeur: "ISO",
    badgeDirection2Libelle: "Qualite",
    badgeDirection3Valeur: "RDC",
    badgeDirection3Libelle: "Kinshasa",
    services: [],
  };
}

function versFormulaire(config: {
  responsableUtilisateurId: string | null;
  titreResponsable: string;
  bioResponsable: string;
  badgeDirection1: { valeur: string; libelle: string };
  badgeDirection2: { valeur: string; libelle: string };
  badgeDirection3: { valeur: string; libelle: string };
  services: ServiceConfig[];
}): FormGouvernance {
  return {
    responsableUtilisateurId: config.responsableUtilisateurId ?? "",
    titreResponsable: config.titreResponsable,
    bioResponsable: config.bioResponsable,
    badgeDirection1Valeur: config.badgeDirection1.valeur,
    badgeDirection1Libelle: config.badgeDirection1.libelle,
    badgeDirection2Valeur: config.badgeDirection2.valeur,
    badgeDirection2Libelle: config.badgeDirection2.libelle,
    badgeDirection3Valeur: config.badgeDirection3.valeur,
    badgeDirection3Libelle: config.badgeDirection3.libelle,
    services: config.services,
  };
}

export function ContenuGouvernanceAdmin({
  utilisateur,
}: {
  utilisateur: UtilisateurAdmin;
}) {
  const [salles, setSalles] = useState<SalleOption[]>([]);
  const [responsables, setResponsables] = useState<ResponsableOption[]>([]);
  const [form, setForm] = useState<FormGouvernance>(formVide());
  const [erreur, setErreur] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [photoResponsable, setPhotoResponsable] = useState<File | null>(null);
  const [erreurPhoto, setErreurPhoto] = useState<string | null>(null);
  const [uploadPhotoEnCours, setUploadPhotoEnCours] = useState(false);

  const charger = useCallback(async () => {
    setChargement(true);
    setErreur(null);
    try {
      const res = await fetch("/api/admin/gouvernance");
      const data = (await res.json()) as {
        config?: {
          responsableUtilisateurId: string | null;
          titreResponsable: string;
          bioResponsable: string;
          badgeDirection1: { valeur: string; libelle: string };
          badgeDirection2: { valeur: string; libelle: string };
          badgeDirection3: { valeur: string; libelle: string };
          services: ServiceConfig[];
        };
        salles?: SalleOption[];
        responsables?: ResponsableOption[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message ?? "Chargement impossible.");
      const sallesRecues = data.salles ?? [];
      const services = data.config?.services?.length
        ? data.config.services
        : sallesRecues.map((salle, index) => ({
            salleCode: salle.code,
            visible: salle.code !== "ADMIN" && salle.code !== "CLIENT" && salle.code !== "MESSAGERIE",
            ordre: salle.ordre ?? index,
          }));
      setSalles(sallesRecues);
      setResponsables(data.responsables ?? []);
      setForm(
        versFormulaire(
          data.config ?? {
            ...formVide(),
            badgeDirection1: { valeur: "HAM", libelle: "Direction" },
            badgeDirection2: { valeur: "ISO", libelle: "Qualite" },
            badgeDirection3: { valeur: "RDC", libelle: "Kinshasa" },
            services,
          }
        )
      );
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Chargement impossible.");
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => {
    void charger();
  }, [charger]);

  const maj = <K extends keyof FormGouvernance>(cle: K, valeur: FormGouvernance[K]) =>
    setForm((prev) => ({ ...prev, [cle]: valeur }));

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    setMessage(null);
    try {
      const res = await fetch(
        "/api/admin/gouvernance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Enregistrement impossible.");
      setMessage(data.message ?? "Gouvernance publique mise a jour.");
      await charger();
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  };

  const responsableActif = useMemo(
    () => responsables.find((item) => item.id === form.responsableUtilisateurId) ?? null,
    [responsables, form.responsableUtilisateurId]
  );

  const televerserPhotoResponsable = async (fichier: File) => {
    if (!responsableActif) return;
    setUploadPhotoEnCours(true);
    setErreurPhoto(null);
    try {
      const fd = new FormData();
      fd.append("photo", fichier);
      const res = await fetch(
        `/api/admin/utilisateurs/${encodeURIComponent(responsableActif.id)}/photo`,
        { method: "POST", body: fd }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Televersement impossible.");
      setPhotoResponsable(null);
      await charger();
    } catch (e: unknown) {
      setErreurPhoto(e instanceof Error ? e.message : "Televersement impossible.");
    } finally {
      setUploadPhotoEnCours(false);
    }
  };

  const supprimerPhotoResponsable = async () => {
    if (!responsableActif) return;
    setUploadPhotoEnCours(true);
    setErreurPhoto(null);
    try {
      const res = await fetch(
        `/api/admin/utilisateurs/${encodeURIComponent(responsableActif.id)}/photo`,
        { method: "DELETE" }
      );
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Suppression impossible.");
      setPhotoResponsable(null);
      await charger();
    } catch (e: unknown) {
      setErreurPhoto(e instanceof Error ? e.message : "Suppression impossible.");
    } finally {
      setUploadPhotoEnCours(false);
    }
  };

  const servicesTries = useMemo(
    () =>
      [...form.services].sort((a, b) => a.ordre - b.ordre).map((service) => ({
        ...service,
        salle: salles.find((salle) => salle.code === service.salleCode) ?? null,
      })),
    [form.services, salles]
  );

  return (
    <MiseEnPageAdmin
      utilisateur={utilisateur}
      titre="Gouvernance"
      sousTitre="Pilotez le responsable et les agents visibles sur la page À propos."
    >
      <div className="mx-auto w-full max-w-[1240px]">
        <EnTetePageReception
          icone={Shield}
          titre="Gouvernance"
          description="Gérez le responsable du centre et les agents affichés publiquement par salle ou service."
          fil={[
            { label: "Admin", href: "/sigh/admin" },
            { label: "Gouvernance" },
          ]}
        />

        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Les cartes publiques de l&apos;equipe interne suivent automatiquement les comptes crees
          dans leurs salles. Cette page sert a choisir le <strong>SUPER_ADMIN</strong>{" "}
          responsable et a decider quels services apparaissent sur la page{" "}
          <strong>A propos</strong>.
        </div>

        {message ? (
          <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-800">
            {message}
          </p>
        ) : null}
        {erreur ? (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {erreur}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gris-bordure px-4 py-3">
              <div>
                <h2 className="text-sm font-bold text-[#2d2a6e]">
                  Apercu public
                </h2>
                <p className="text-xs text-texte-secondaire">
                  Responsable unique et services affiches dans la page A propos.
                </p>
              </div>
              <span className="rounded-full bg-bleu-medical/10 px-2.5 py-1 text-xs font-semibold text-bleu-medical">
                {servicesTries.filter((service) => service.visible).length} service(s) visible(s)
              </span>
            </div>

            <div className="space-y-4 p-4">
              {chargement ? (
                <p className="flex items-center gap-2 text-sm text-texte-secondaire">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement...
                </p>
              ) : (
                <>
                  <div className="rounded-2xl border border-gris-bordure bg-gris-tres-clair/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-bleu-medical">
                      Notre direction
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="shrink-0">
                        {responsableActif ? (
                          <ZonePhotoPatient
                            compact
                            value={photoResponsable}
                            urlExistante={responsableActif.photoUrl}
                            onErreur={setErreurPhoto}
                            onRetirer={() => void supprimerPhotoResponsable()}
                            onChange={(fichier) => {
                              setPhotoResponsable(fichier);
                              if (fichier) void televerserPhotoResponsable(fichier);
                            }}
                          />
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-gris-bordure bg-white">
                            <ShieldCheck className="h-8 w-8 text-bleu-medical" />
                          </div>
                        )}
                        {uploadPhotoEnCours ? (
                          <p className="mt-1 flex items-center gap-1 text-[10px] text-texte-secondaire">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Envoi...
                          </p>
                        ) : null}
                        {erreurPhoto ? (
                          <p className="mt-1 max-w-[6rem] text-[10px] text-red-600">{erreurPhoto}</p>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-texte-principal">
                          {responsableActif
                            ? nomAffichageGouvernance(
                                responsableActif.prenom,
                                responsableActif.nom
                              )
                            : "Aucun responsable selectionne"}
                        </p>
                        <p className="text-sm text-bleu-medical">
                          {form.titreResponsable || "Directeur general"}
                        </p>
                        <p className="mt-2 line-clamp-4 text-xs text-texte-secondaire">
                          {form.bioResponsable}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {[
                            [form.badgeDirection1Valeur, form.badgeDirection1Libelle],
                            [form.badgeDirection2Valeur, form.badgeDirection2Libelle],
                            [form.badgeDirection3Valeur, form.badgeDirection3Libelle],
                          ].map(([valeur, libelle]) => (
                            <span
                              key={`${valeur}-${libelle}`}
                              className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-bleu-medical shadow-sm"
                            >
                              {valeur} · {libelle}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-gris-bordure p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-[#2d2a6e]">Notre equipe</h3>
                        <p className="text-xs text-texte-secondaire">
                          Les agents internes proviennent automatiquement des comptes utilises dans chaque salle.
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {servicesTries.map((service) => (
                        <div
                          key={service.salleCode}
                          className="flex items-center justify-between rounded-xl border border-gris-bordure px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="font-medium text-texte-principal">
                              {service.salle?.nom ?? service.salleCode}
                            </p>
                            <p className="text-xs text-texte-secondaire">
                              Code {service.salleCode} · ordre {service.ordre}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                              service.visible
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {service.visible ? (
                              <Eye className="h-3.5 w-3.5" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5" />
                            )}
                            {service.visible ? "Visible" : "Masque"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gris-bordure bg-white shadow-sm">
            <div className="border-b border-gris-bordure px-4 py-3">
              <h2 className="text-sm font-bold text-[#2d2a6e]">
                Parametres de gouvernance
              </h2>
              <p className="text-xs text-texte-secondaire">
                Selection du responsable public et des services affiches.
              </p>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Responsable principal</label>
                <select
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.responsableUtilisateurId}
                  onChange={(e) => maj("responsableUtilisateurId", e.target.value)}
                >
                  <option value="">Choisir un responsable (Super admin)</option>
                  {responsables.map((responsable) => (
                    <option key={responsable.id} value={responsable.id}>
                      {nomAffichageGouvernance(responsable.prenom, responsable.nom)}
                    </option>
                  ))}
                </select>
              </div>

              {responsableActif ? (
                <div className="rounded-xl border border-gris-bordure bg-gris-tres-clair/70 p-3 text-sm text-texte-secondaire">
                  <p className="font-semibold text-texte-principal">
                    {nomAffichageGouvernance(
                      responsableActif.prenom,
                      responsableActif.nom
                    )}
                  </p>
                  <p>{responsableActif.email ?? "Aucun e-mail"}</p>
                  <p>{responsableActif.telephone ?? "Aucun telephone"}</p>
                </div>
              ) : null}

              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Titre public du responsable</label>
                <input
                  className={CLASSE_CHAMP_RECEPTION}
                  value={form.titreResponsable}
                  onChange={(e) => maj("titreResponsable", e.target.value)}
                />
              </div>

              <div>
                <label className={CLASSE_LABEL_RECEPTION}>Biographie publique</label>
                <textarea
                  className={CLASSE_CHAMP_RECEPTION}
                  rows={4}
                  value={form.bioResponsable}
                  onChange={(e) => maj("bioResponsable", e.target.value)}
                />
              </div>

              <div className="space-y-3 rounded-xl border border-gris-bordure bg-gris-tres-clair/70 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2d2a6e]">
                      Badges de la carte direction
                    </h3>
                    <p className="text-xs text-texte-secondaire">
                      Utilises dans la carte &quot;Notre direction&quot;.
                    </p>
                  </div>
                </div>

                {BADGES.map((badge) => (
                  <div key={badge.index} className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Valeur {badge.index}</label>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={form[badge.valeur]}
                        onChange={(e) => maj(badge.valeur, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Libellé {badge.index}</label>
                      <input
                        className={CLASSE_CHAMP_RECEPTION}
                        value={form[badge.libelle]}
                        onChange={(e) => maj(badge.libelle, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-xl border border-gris-bordure bg-white p-3">
                <div>
                  <h3 className="text-sm font-bold text-[#2d2a6e]">
                    Services visibles dans &quot;Notre equipe&quot;
                  </h3>
                  <p className="text-xs text-texte-secondaire">
                    Le service ADMIN n&apos;est pas expose publiquement. Les comptes externes et Eglise
                    restent limites a prenom, nom et specialite.
                  </p>
                </div>
                {servicesTries.map((service) => (
                  <div
                    key={service.salleCode}
                    className="grid gap-3 rounded-xl border border-gris-bordure p-3 sm:grid-cols-[1fr_100px]"
                  >
                    <label className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={service.visible}
                        onChange={(e) =>
                          maj(
                            "services",
                            form.services.map((item) =>
                              item.salleCode === service.salleCode
                                ? { ...item, visible: e.target.checked }
                                : item
                            )
                          )
                        }
                      />
                      <span>
                        <span className="block font-medium text-texte-principal">
                          {service.salle?.nom ?? service.salleCode}
                        </span>
                        <span className="block text-xs text-texte-secondaire">
                          {service.salleCode}
                        </span>
                      </span>
                    </label>
                    <div>
                      <label className={CLASSE_LABEL_RECEPTION}>Ordre</label>
                      <input
                        type="number"
                        className={CLASSE_CHAMP_RECEPTION}
                        value={service.ordre}
                        onChange={(e) =>
                          maj(
                            "services",
                            form.services.map((item) =>
                              item.salleCode === service.salleCode
                                ? { ...item, ordre: Number(e.target.value) || 0 }
                                : item
                            )
                          )
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap justify-end gap-2 border-t border-gris-bordure pt-3">
                <Bouton
                  type="button"
                  variante="contour"
                  onClick={() => setForm(formVide())}
                  disabled={enCours}
                >
                  Reinitialiser
                </Bouton>
                <Bouton type="button" onClick={() => void enregistrer()} disabled={enCours}>
                  {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Bouton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MiseEnPageAdmin>
  );
}
