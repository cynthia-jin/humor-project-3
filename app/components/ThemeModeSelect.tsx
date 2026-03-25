"use client";

import { useThemeMode, type ThemeMode } from "@/app/theme/useTheme";

const THEMES: Array<{ value: ThemeMode; label: string }> = [
  { value: "system", label: "System default" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function ThemeModeSelect() {
  const { theme, setTheme } = useThemeMode();

  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        Theme
      </div>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className="w-full rounded border border-gray-200 bg-white text-gray-900 px-3 py-2 text-sm dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
      >
        {THEMES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}

