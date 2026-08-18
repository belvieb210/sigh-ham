"use client";

import { useCallback, useEffect, useState } from "react";

const CLE = "ham-admin-theme";

export function useThemeAdmin() {
  const [sombre, setSombre] = useState(false);

  useEffect(() => {
    try {
      setSombre(window.localStorage.getItem(CLE) === "dark");
    } catch {
      setSombre(false);
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLE, sombre ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [sombre]);

  const basculer = useCallback(() => {
    setSombre((actuel) => !actuel);
  }, []);

  return { sombre, basculer };
}
