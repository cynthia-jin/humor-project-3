import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";

export default async function FlavorsPage() {
  const { supabase } = await requireSuperadmin();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main className="p-6 max-w-5xl">
        <h1 className="text-2xl font-bold mb-4">Humor Flavors</h1>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
          {error.message}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl min-w-0">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Humor Flavors</h1>
        <Link
          href="/flavors/new"
          className="rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900"
        >
          New Flavor
        </Link>
      </div>

      {(!flavors || flavors.length === 0) && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
          <div className="text-sm text-slate-600 dark:text-slate-300">
            No humor flavors yet.
          </div>
          <div className="mt-4">
            <Link
              href="/flavors/new"
              className="underline text-sm text-slate-900 dark:text-slate-100"
            >
              Create your first flavor
            </Link>
          </div>
        </div>
      )}

      {flavors && flavors.length > 0 && (
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
              {flavors.map((f) => (
                <tr key={String(f.id)}>
                  <td className="py-3 px-4 align-top text-slate-900 dark:text-slate-100">
                    <Link
                      href={`/flavors/${String(f.id)}`}
                      className="font-medium underline"
                    >
                      {f.slug}
                    </Link>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-all">
                      ID: {f.id}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top text-slate-700 dark:text-slate-300">
                    {f.description ? (
                      <div className="max-w-xl">{f.description}</div>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 align-top text-slate-700 dark:text-slate-300">
                    {f.created_datetime_utc}
                  </td>
                  <td className="py-3 px-4 align-top text-right">
                    <Link
                      href={`/flavors/${String(f.id)}`}
                      className="inline-block rounded border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </main>
  );
}

