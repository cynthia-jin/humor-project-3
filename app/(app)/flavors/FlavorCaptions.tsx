"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type CaptionsRow = {
  id: string;
  content: string | null;
  is_public: boolean;
  is_featured: boolean;
  like_count: number;
  profile_id: string;
  image_id: string;
  humor_flavor_id: string | number | null;
  caption_request_id: string | number | null;
  llm_prompt_chain_id: string | number | null;
  created_datetime_utc: string;
  image?: { url: string | null } | Array<{ url: string | null }> | null;
};

function getCaptionImageUrl(row: CaptionsRow): string | null {
  const image = row.image;
  if (!image) return null;
  if (Array.isArray(image)) {
    return image[0]?.url ?? null;
  }
  return image.url ?? null;
}

export default function FlavorCaptions({
  flavorId,
  flavorSlug,
}: {
  flavorId: string;
  flavorSlug: string | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [captions, setCaptions] = useState<CaptionsRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const { data, error: supaError } = await supabase
        .from("captions")
        .select(
          "id, content, is_public, is_featured, like_count, profile_id, image_id, humor_flavor_id, caption_request_id, llm_prompt_chain_id, created_datetime_utc, image:images!captions_image_id_fkey(url)"
        )
        .eq("humor_flavor_id", flavorId)
        .order("created_datetime_utc", { ascending: false })
        .limit(200);

      if (cancelled) return;

      if (supaError) {
        setError(supaError.message);
        setCaptions([]);
      } else {
        setCaptions((data ?? []) as CaptionsRow[]);
      }

      setLoading(false);
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [supabase, flavorId]);

  return (
    <section className="mt-10 min-w-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">
          Generated captions / history{flavorSlug ? ` for ${flavorSlug}` : ""}
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: {captions.length}
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-sm text-gray-600 dark:text-gray-300">
          Loading captions...
        </div>
      ) : null}

      {error ? (
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      {!loading && !error && captions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            No captions exist for this flavor yet.
          </div>
        </div>
      ) : null}

      {!loading && !error && captions.length > 0 ? (
        <div className="space-y-4">
          {captions.map((c) => (
            <article
              key={String(c.id)}
              className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
                  {getCaptionImageUrl(c) ? (
                    <img
                      src={getCaptionImageUrl(c) ?? ""}
                      alt="Caption image"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-500 dark:text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                    {c.content ?? "—"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300">
                      Likes: {c.like_count ?? 0}
                    </span>
                    <span className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300">
                      Public: {c.is_public ? "Yes" : "No"}
                    </span>
                    <span className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300">
                      Featured: {c.is_featured ? "Yes" : "No"}
                    </span>
                    <span className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-gray-700 dark:text-gray-300">
                      Created: {c.created_datetime_utc ?? "—"}
                    </span>
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400">
                      Technical details
                    </summary>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1 break-all">
                      <div>Caption ID: {c.id}</div>
                      <div>Profile ID: {c.profile_id}</div>
                      <div>Image ID: {c.image_id ?? "—"}</div>
                      <div>Prompt Chain ID: {c.llm_prompt_chain_id ?? "—"}</div>
                      <div>
                        Caption Request ID: {c.caption_request_id ?? "—"}
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

