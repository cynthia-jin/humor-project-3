import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";

export default async function FlavorStepsIndexPage() {
  const { supabase } = await requireSuperadmin();

  const { data: flavors, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  return (
    <main className="p-6 max-w-4xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flavor Steps</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Reordering and step management live on each flavor detail page.
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
          {error.message}
        </div>
      ) : null}

      {(!flavors || flavors.length === 0) && !error ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No humor flavors exist yet.
          </div>
          <div className="mt-4">
            <Link
              href="/flavors/new"
              className="underline text-sm text-gray-900 dark:text-gray-100"
            >
              Create a flavor first
            </Link>
          </div>
        </div>
      ) : null}

      {flavors && flavors.length > 0 && !error ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                  Flavor
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                  Created (UTC)
                </th>
                <th className="text-right font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                  Steps
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {flavors.map((f) => (
                <tr key={String(f.id)}>
                  <td className="py-3 px-4">
                    <div className="font-medium underline">
                      <Link href={`/flavors/${String(f.id)}`}>{f.slug}</Link>
                    </div>
                    {f.description ? (
                      <div className="text-xs text-gray-500 mt-1 break-all">
                        {f.description}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">
                    {f.created_datetime_utc}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/flavors/${String(f.id)}`}
                      className="inline-block rounded border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Manage steps
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}

