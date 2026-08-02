"use client";

import { useEffect, useState } from "react";

/** Évite les portals avant hydratation (removeChild / mismatch React 19). */
export function useMonteClient() {
  const [monte, setMonte] = useState(false);

  useEffect(() => {
    setMonte(true);
  }, []);

  return monte;
}
