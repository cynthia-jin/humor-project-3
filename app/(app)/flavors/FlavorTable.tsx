"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import FlavorDuplicateButton from "@/app/(app)/flavors/FlavorDuplicateButton";
import { formatDate } from "@/lib/formatDate";

type FlavorListRow = {
  id: number | string;
  slug: string | null;
  description: string | null;
  created_datetime_utc: string | null;
};

export default function FlavorTable({
  flavors,
}: {
  flavors: FlavorListRow[];
}) {
  const router = useRouter();

  function flavorHref(id: number | string) {
    return `/flavors/${String(id)}`;
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              <th className="text-left font-medium py-3 px-4 text-slate-700 dark:text-slate-200">
                Slug
              </th>
              <th className="text-left font-medium py-3 px-4 text-slate-700 dark:text-slate-200">
                Description
              </th>
              <th className="text-left font-medium py-3 px-4 text-slate-700 dark:text-slate-200">
                Created (UTC)
              </th>
              <th className="text-right font-medium py-3 px-4 text-slate-700 dark:text-slate-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {flavors.map((f) => {
              const href = flavorHref(f.id);
              const label = f.slug || "Untitled flavor";

              return (
                <tr
                  key={String(f.id)}
                  role="link"
                  tabIndex={0}
                  aria-label={`Open ${label}`}
                  onClick={() => router.push(href)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(href);
                    }
                  }}
                  className="cursor-pointer transition-colors hover:bg-sky-50/70 focus-visible:bg-sky-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500/30 dark:hover:bg-sky-950/30 dark:focus-visible:bg-sky-950/30 dark:focus-visible:ring-sky-400/30"
                >
                  <td className="py-3 px-4 align-top text-slate-900 dark:text-slate-100">
                    <Link
                      href={href}
                      className="font-medium underline decoration-slate-300 underline-offset-4 hover:decoration-slate-900 dark:decoration-slate-600 dark:hover:decoration-slate-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {label}
                    </Link>
                  </td>
                  <td className="py-3 px-4 align-top text-slate-700 dark:text-slate-300">
                    {f.description ? (
                      <div className="max-w-xl">{f.description}</div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-slate-700 dark:text-slate-300">
                    {formatDate(f.created_datetime_utc)}
                  </td>
                  <td
                    className="py-3 px-4 align-top text-right cursor-default"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="inline-flex items-center gap-2">
                      <FlavorDuplicateButton
                        id={String(f.id)}
                        slug={f.slug}
                        variant="row"
                      />
                      <Link
                        href={href}
                        className="inline-block rounded border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                      >
                        Edit
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
