"use client";

import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/formatDate";

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
  if (Array.isArray(image)) return image[0]?.url ?? null;
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
    return () => { cancelled = true; };
  }, [supabase, flavorId]);

  return (
    <section className="min-w-0">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Caption history
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Previously generated captions
            {flavorSlug && (
              <> for <span className="font-medium text-slate-700 dark:text-slate-300">{flavorSlug}</span></>
            )}
          </p>
        </div>
        {captions.length > 0 && (
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {captions.length} caption{captions.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
            Loading captions...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 text-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && captions.length === 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No captions yet. Use the test section above to generate some.
          </p>
        </div>
      )}

      {!loading && !error && captions.length > 0 && (
        <div className="space-y-3">
          {captions.map((c) => {
            const imageUrl = getCaptionImageUrl(c);
            return (
              <article
                key={String(c.id)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4"
              >
                <div className="flex items-start gap-4 min-w-0">
                  {imageUrl && (
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={imageUrl}
                        alt="Caption image"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                      {c.content ?? "—"}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span>{formatDate(c.created_datetime_utc)}</span>
                      {(c.like_count ?? 0) > 0 && (
                        <span>{c.like_count} likes</span>
                      )}
                      {c.is_public && (
                        <span className="rounded-full bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-2 py-0.5">
                          Public
                        </span>
                      )}
                      {c.is_featured && (
                        <span className="rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-0.5">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
