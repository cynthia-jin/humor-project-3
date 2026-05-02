import Link from "next/link";
import { requireSuperadmin } from "@/lib/auth";
import FlavorTable from "@/app/(app)/flavors/FlavorTable";

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
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
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
        <FlavorTable flavors={flavors} />
      )}
    </main>
  );
}
