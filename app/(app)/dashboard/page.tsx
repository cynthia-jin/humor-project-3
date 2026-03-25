import { requireSuperadmin } from "@/lib/auth";

export default async function DashboardPage() {
  const { supabase } = await requireSuperadmin();

  const [
    { count: flavorCount },
    { count: stepCount },
    { count: captionCount },
  ] = await Promise.all([
    supabase.from("humor_flavors").select("*", { count: "exact", head: true }),
    supabase
      .from("humor_flavor_steps")
      .select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
  ]);

  const flavorsResult = await supabase
    .from("humor_flavors")
    .select("id, slug, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(5);

  const flavors = (flavorsResult.data ?? []) as Array<{
    id: number | string;
    slug: string | null;
    created_datetime_utc: string;
  }>;

  const recentIds = flavors.map((f) => f.id);

  const stepSummary: Map<
    string,
    { stepCount: number; lastStepAtUtc: string | null }
  > = new Map();

  if (recentIds.length > 0) {
    const stepsSummaryRes = await supabase
      .from("humor_flavor_steps")
      .select("humor_flavor_id, created_datetime_utc")
      .in("humor_flavor_id", recentIds as unknown as number[])
      .order("created_datetime_utc", { ascending: false });

    const rows = (stepsSummaryRes.data ?? []) as Array<{
      humor_flavor_id: number | string;
      created_datetime_utc: string;
    }>;

    for (const row of rows) {
      const fid = String(row.humor_flavor_id);
      const existing = stepSummary.get(fid);

      if (!existing) {
        stepSummary.set(fid, {
          stepCount: 1,
          lastStepAtUtc: row.created_datetime_utc,
        });
      } else {
        stepSummary.set(fid, {
          ...existing,
          stepCount: existing.stepCount + 1,
        });
      }
    }
  }

  const fCount = flavorCount ?? 0;
  const sCount = stepCount ?? 0;
  const cCount = captionCount ?? 0;
  const avgSteps =
    fCount > 0 ? (sCount / fCount).toFixed(2) : "0.00";

  return (
    <div className="p-6 max-w-6xl min-w-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">
          Overview of your prompt-chain content (flavors, steps, and generated
          captions).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total humor flavors
          </div>
          <div className="text-2xl font-semibold mt-2">
            {fCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total flavor steps
          </div>
          <div className="text-2xl font-semibold mt-2">
            {sCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total generated captions
          </div>
          <div className="text-2xl font-semibold mt-2">
            {cCount}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Avg steps per flavor
          </div>
          <div className="text-2xl font-semibold mt-2">
            {avgSteps}
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Recent flavors
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Small overview table (step counts derived from `humor_flavor_steps`).
          </div>
        </div>

        <div className="p-4">
          {flavors.length === 0 ? (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              No flavors yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                  <th className="py-2 pr-3">Flavor</th>
                  <th className="py-2 pr-3">Steps</th>
                  <th className="py-2 pr-3">Created (UTC)</th>
                  <th className="py-2">Updated (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {flavors.map((f) => {
                  const summary = stepSummary.get(String(f.id));
                  return (
                    <tr key={String(f.id)}>
                      <td className="py-3 pr-3">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {f.slug ?? "(no slug)"}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 break-all">
                          ID: {String(f.id)}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-slate-700 dark:text-slate-300">
                        {summary?.stepCount ?? 0}
                      </td>
                      <td className="py-3 pr-3 text-slate-700 dark:text-slate-300">
                        {f.created_datetime_utc}
                      </td>
                      <td className="py-3 text-slate-700 dark:text-slate-300">
                        {summary?.lastStepAtUtc ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

