"use client";

import { useEffect, useMemo, useState } from "react";
import { ThemeContext, type ThemeMode } from "@/app/theme/useTheme";

const THEME_STORAGE_KEY = "humor-project-theme";

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") return raw;
  return "system";
}

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode === "system") {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (
    listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
  ) => void;
  removeListener?: (
    listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void
  ) => void;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredTheme());

  const contextValue = useMemo(() => ({ theme, setTheme }), [theme]);

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    };

    apply();

    if (theme === "system" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = (event: MediaQueryListEvent) => {
        void event;
        apply();
      };

      if (typeof mql.addEventListener === "function") {
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
      }

      const legacyMql = mql as LegacyMediaQueryList;
      if (typeof legacyMql.addListener === "function") {
        legacyMql.addListener(onChange);
        return () =>
          typeof legacyMql.removeListener === "function" &&
          legacyMql.removeListener(onChange);
      }
    }

    return;
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

