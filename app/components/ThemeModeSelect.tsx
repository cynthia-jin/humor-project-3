"use client";

import { useThemeMode, type ThemeMode } from "@/app/theme/useTheme";

const THEMES: Array<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeModeSelect() {
  const { theme, setTheme } = useThemeMode();

  return (
    <select
      value={theme}
      onChange={(e) => setTheme(e.target.value as ThemeMode)}
      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/20 transition-shadow"
    >
      {THEMES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
