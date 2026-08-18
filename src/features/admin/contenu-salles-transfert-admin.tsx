"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Loader2, RotateCcw, Undo2 } from "lucide-react";
import {
  CadreActionPatientAdmin,
  type PatientGouvernance,
} from "@/features/admin/cadre-action-patient-admin";
import type { UtilisateurAdmin } from "@/features/admin/mise-en-page-admin";
import type { TransfertGouvernance, VisiteTransferts } from "@/features/admin/contenu-visites-transferts-admin";
import { Bouton } from "@/components/ui/bouton";
import { CLASSE_LABEL_RECEPTION } from "@/constants/reception";

export function ContenuSallesTransfertAdmin({
  utilisateur,
  patientId,
  dossierId,
  mode,
}: {
  utilisateur: UtilisateurAdmin;
  patientId: string;
  dossierId: string;
  mode: "annuler" | "restaurer";
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientGouvernance | null>(null);
  const [visite, setVisite] = useState<VisiteTransferts | null>(null);
  const [ids, setIds] = useState<string[]>([]);
  const [chargement, setChargement] = useState(true);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setChargement(true);
      setErreur(null);
      try {
        const res = await fetch(`/api/admin/patients/${patientId}/transferts`);
        const data = (await res.json()) as {
          patient?: PatientGouvernance;
          visites?: VisiteTransferts[];
          message?: string;
        };
        if (!res.ok) throw new Error(data.message);
        if (ignore) return;
        const v = (data.visites ?? []).find((x) => x.dossierId === dossierId) ?? null;
        setPatient(data.patient ?? null);
        setVisite(v);
        const eligibles = (v?.transferts ?? []).filter((tr) =>
          mode === "annuler" ? tr.annulable : tr.restorable
        );
        setIds(eligibles.map((tr) => tr.id));
      } catch (e: unknown) {
        if (!ignore) {
          setErreur(
            e instanceof Error ? e.message : t("admin.patients.actions.erreur")
          );
        }
      } finally {
        if (!ignore) setChargement(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [patientId, dossierId, mode, t]);

  const eligibles: TransfertGouvernance[] = useMemo(
    () =>
      (visite?.transferts ?? []).filter((tr) =>
        mode === "annuler" ? tr.annulable : tr.restorable
      ),
    [visite, mode]
  );

  const basculer = (id: string) => {
    setIds((courants) =>
      courants.includes(id) ? courants.filter((x) => x !== id) : [...courants, id]
    );
  };

  const confirmer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const url =
        mode === "annuler"
          ? `/api/admin/patients/${patientId}/transferts/annuler`
          : `/api/admin/patients/${patientId}/transferts/restaurer`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dossierId, transfertIds: ids }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message);
      router.push("/sigh/admin/patients");
      router.refresh();
    } catch (e: unknown) {
      setErreur(
        e instanceof Error ? e.message : t("admin.patients.actions.erreur")
      );
    } finally {
      setEnCours(false);
    }
  };

  const Icone = mode === "annuler" ? Undo2 : RotateCcw;

  return (
    <CadreActionPatientAdmin
      utilisateur={utilisateur}
      icone={Icone}
      titre={
        mode === "annuler"
          ? t("admin.patients.actions.choisirSallesAnnuler")
          : t("admin.patients.actions.choisirSallesRestaurer")
      }
      description={
        mode === "annuler"
          ? t("admin.patients.actions.sallesAnnulerAide")
          : t("admin.patients.actions.sallesRestaurerAide")
      }
      fil={visite?.numeroDossier ?? t("admin.patients.actions.visite")}
      patient={patient}
    >
      {chargement ? (
        <p className="flex items-center gap-2 text-sm text-texte-secondaire">
          <Loader2 className="h-4 w-4 animate-spin" />
          {t("admin.common.chargement")}
        </p>
      ) : null}
      {erreur ? (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {erreur}
        </p>
      ) : null}

      {!chargement && visite ? (
        <div className="rounded-xl border border-gris-bordure bg-white p-4 shadow-sm">
          <p className="text-sm font-bold text-texte-principal">
            {t("admin.patients.actions.visite")} {visite.numeroDossier}
          </p>
          <p className={CLASSE_LABEL_RECEPTION + " mt-4"}>
            {t("admin.patients.actions.sallesConcernees")}
          </p>
          {eligibles.length === 0 ? (
            <p className="mt-2 text-sm text-texte-secondaire">
              {mode === "annuler"
                ? t("admin.patients.actions.aucunAnnulable")
                : t("admin.patients.actions.aucunRestaurable")}
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {eligibles.map((tr) => (
                <li key={tr.id}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-gris-bordure px-3 py-2.5 hover:bg-gris-tres-clair">
                    <input
                      type="checkbox"
                      className="mt-1 accent-bleu-medical"
                      checked={ids.includes(tr.id)}
                      onChange={() => basculer(tr.id)}
                    />
                    <span>
                      <span className="block text-sm font-medium text-texte-principal">
                        {tr.salleDestination.nom}
                      </span>
                      <span className="block text-xs text-texte-secondaire">
                        {tr.salleOrigine.nom} → {tr.salleDestination.nom}
                        {tr.numeroTransfert ? ` · ${tr.numeroTransfert}` : ""}
                        {" · "}
                        {t(`admin.patients.statutsTransfert.${tr.statut}`, {
                          defaultValue: tr.statut,
                        })}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <Bouton
              type="button"
              variante="contour"
              taille="moyen"
              onClick={() =>
                router.push(
                  mode === "annuler"
                    ? `/sigh/admin/patients/${patientId}/annuler-transfert`
                    : `/sigh/admin/patients/${patientId}/restaurer-transfert`
                )
              }
            >
              {t("admin.patients.annuler")}
            </Bouton>
            <Bouton
              type="button"
              taille="moyen"
              disabled={enCours || ids.length === 0}
              onClick={() => void confirmer()}
            >
              {enCours ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "annuler"
                ? t("admin.patients.actions.confirmerAnnulation")
                : t("admin.patients.actions.confirmerRestauration")}
            </Bouton>
          </div>
        </div>
      ) : null}
    </CadreActionPatientAdmin>
  );
}
