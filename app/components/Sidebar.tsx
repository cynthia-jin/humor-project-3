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
    return `block rounded px-3 py-2 text-sm ${
      active
        ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
    }`;
  }

  return (
    <aside className="w-72 sticky top-0 h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
          Humor Prompt Chains
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Manage humor flavors and steps
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        <Link href="/dashboard" className={navClass("/dashboard")}>
          Dashboard
        </Link>

        <div className="h-3" />

        <Link href="/flavors" className={navClass("/flavors")}>
          Humor Flavors
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="text-xs text-gray-500 dark:text-gray-400">Signed in as</div>
        <div className="text-sm font-medium break-all mt-1 text-gray-900 dark:text-gray-100">
          {userEmail}
        </div>

        <div className="mt-4">
          <ThemeModeSelect />
        </div>
      </div>
    </aside>
  );
}

