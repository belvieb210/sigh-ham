"use client";

export interface ResultatOrientationPatient {
  message?: string;
  salleDestination?: string;
  transfertId?: string;
  codeSalle?: string;
  codesSalle?: string[];
  confirme?: boolean;
}

/**
 * Applique une orientation à plusieurs patients l'un après l'autre
 * (évite les courses sur numeroTransfert et synchroniserTransfertsEnAttente).
 */
export async function orienterPatientsEnSerie(
  cibles: string[],
  orienter: (cibleId: string) => Promise<ResultatOrientationPatient>
): Promise<{
  ok: number;
  echecs: number;
  resultats: ResultatOrientationPatient[];
  premierEchec?: Error;
}> {
  const resultats: ResultatOrientationPatient[] = [];
  let ok = 0;
  let premierEchec: Error | undefined;

  for (const cibleId of cibles) {
    try {
      const data = await orienter(cibleId);
      resultats.push(data);
      ok += 1;
    } catch (error) {
      if (!premierEchec) {
        premierEchec =
          error instanceof Error ? error : new Error("Orientation impossible.");
      }
    }
  }

  return {
    ok,
    echecs: cibles.length - ok,
    resultats,
    premierEchec,
  };
}

/**
 * Debounce pour regrouper les clics multi-salles en une seule requête API.
 */
export function creerDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delayMs: number
) {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, delayMs);
  };

  debounced.annuler = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  debounced.immediat = (...args: Parameters<T>) => {
    debounced.annuler();
    fn(...args);
  };

  return debounced;
}
