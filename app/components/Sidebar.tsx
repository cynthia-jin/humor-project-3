"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeModeSelect from "@/app/components/ThemeModeSelect";

export default function Sidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();

  function navClass(href: string) {
    const active =
      href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(href);
    return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
      active
        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-medium"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
    }`;
  }

  return (
    <aside className="w-64 sticky top-0 h-screen flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      {/* Logo / Brand */}
      <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800">
        <Link href="/dashboard" className="block">
          <div className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Humor Chains
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Prompt chain manager
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <Link href="/dashboard" className={navClass("/dashboard")}>
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
            <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
            <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
            <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
          </svg>
          Dashboard
        </Link>
        <Link href="/flavors" className={navClass("/flavors")}>
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4h12M2 8h12M2 12h8" />
          </svg>
          Humor Flavors
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <ThemeModeSelect />
        <div className="px-1">
          <div className="text-[11px] text-slate-400 dark:text-slate-500">Signed in as</div>
          <div className="text-xs font-medium text-slate-700 dark:text-slate-300 break-all mt-0.5">
            {userEmail}
          </div>
        </div>
      </div>
    </aside>
  );
}
