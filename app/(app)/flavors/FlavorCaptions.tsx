import { requireSuperadmin } from "@/lib/auth";

export default async function FlavorCaptions({
  flavorId,
  flavorSlug,
}: {
  flavorId: string;
  flavorSlug: string | null;
}) {
  const { supabase } = await requireSuperadmin();

  const { data: captions, error } = await supabase
    .from("captions")
    .select(
      "id, content, is_public, is_featured, like_count, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc"
    )
    .eq("humor_flavor_id", flavorId)
    .order("created_datetime_utc", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <section className="mt-10">
        <h3 className="text-lg font-semibold mb-3">Captions</h3>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
          {error.message}
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">
          Captions{flavorSlug ? ` for ${flavorSlug}` : ""}
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: {captions?.length ?? 0}
        </div>
      </div>

      {(!captions || captions.length === 0) && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No captions exist for this flavor yet.
          </div>
        </div>
      )}

      {captions && captions.length > 0 && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                  Caption
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-24">
                  Likes
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-28">
                  Public
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-28">
                  Featured
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-32">
                  Created (UTC)
                </th>
                <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                  Image / Chain
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {captions.map((c) => (
                <tr key={String(c.id)}>
                  <td className="py-3 px-4 align-top">
                    <div className="max-w-[520px] break-words">
                      {c.content ?? "—"}
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 break-all">
                      Caption ID: {c.id} · Profile ID: {c.profile_id}
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                    {c.like_count}
                  </td>
                  <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                    {c.is_public ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                    {c.is_featured ? "Yes" : "No"}
                  </td>
                  <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                    {c.created_datetime_utc}
                  </td>
                  <td className="py-3 px-4 align-top">
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      Image ID: {c.image_id ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      Prompt Chain ID: {c.llm_prompt_chain_id ?? "—"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      Caption Request ID:{" "}
                      {c.caption_request_id ?? "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

