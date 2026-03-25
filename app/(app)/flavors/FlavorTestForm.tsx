"use client";

import { useState } from "react";
import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  generateCaptionsForFlavor,
  generatePresignedUploadUrl,
  uploadImageFromUrl,
  uploadImageToPresignedUrl,
} from "@/app/(app)/flavors/almostCrackdPipeline";

type CaptionLike = {
  id?: string;
  content?: string | null;
  created_datetime_utc?: string;
  image_id?: string | null;
  humor_flavor_id?: string | number | null;
  caption_request_id?: string | number | null;
  llm_prompt_chain_id?: string | number | null;
  like_count?: string | number | null;
  is_public?: boolean;
  is_featured?: boolean;
};

export default function FlavorTestForm({
  flavorId,
  flavorSlug,
}: {
  flavorId: string;
  flavorSlug: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [testMode, setTestMode] = useState<"upload" | "test-set">("upload");
  const [testImages, setTestImages] = useState<
    Array<{ id: string; url: string; is_common_use: boolean }> | []
  >([]);
  const [testImagesLoading, setTestImagesLoading] = useState(false);
  const [testImagesError, setTestImagesError] = useState<string | null>(null);
  const [selectedTestImageId, setSelectedTestImageId] = useState<string>("");
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  async function getSupabaseAccessToken() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      throw new Error("No Supabase access token found. Please log in again.");
    }
    return token;
  }

  async function runTest() {
    if (testMode === "upload") {
      if (!file) {
        setError("Please select an image file to test this flavor.");
        return;
      }
      if (!file.type) {
        setError(
          "Selected file has no content type. Please use a valid image."
        );
        return;
      }
    } else {
      if (!selectedTestImageId) {
        setError("Please select an image from the test set.");
        return;
      }
    }

    setLoading(true);
    setError(null);
    setHasRun(false);
    setCaptions([]);
    setStep(
      testMode === "upload"
        ? "1/4: Generating presigned upload URL"
        : "3/4: Registering uploaded image URL"
    );

    try {
      const token = await getSupabaseAccessToken();
      if (testMode === "upload") {
        const presigned = await generatePresignedUploadUrl({
          token,
          contentType: file!.type,
        });

        setStep("2/4: Uploading image bytes");
        await uploadImageToPresignedUrl({
          presignedUrl: presigned.presignedUrl,
          file: file!,
        });

        setStep("3/4: Registering uploaded image URL");
        const uploaded = await uploadImageFromUrl({
          token,
          imageUrl: presigned.cdnUrl,
          isCommonUse: false,
        });

        setStep("4/4: Generating captions");
        const result = await generateCaptionsForFlavor({
          token,
          imageId: uploaded.imageId,
          humorFlavorId: flavorId,
        });

        const normalized = ((result ?? []) as CaptionLike[]).slice();
        normalized.sort((a, b) => {
          const at = a.created_datetime_utc
            ? new Date(a.created_datetime_utc).getTime()
            : 0;
          const bt = b.created_datetime_utc
            ? new Date(b.created_datetime_utc).getTime()
            : 0;
          return bt - at;
        });

        setCaptions(normalized);
        setStep(null);
        setHasRun(true);
      } else {
        const selected = testImages.find(
          (img) => img.id === selectedTestImageId
        );
        if (!selected) {
          throw new Error("Selected test image not found.");
        }

        setStep("3/4: Registering uploaded image URL");
        const uploaded = await uploadImageFromUrl({
          token,
          imageUrl: selected.url,
          isCommonUse: selected.is_common_use,
        });

        setStep("4/4: Generating captions");
        const result = await generateCaptionsForFlavor({
          token,
          imageId: uploaded.imageId,
          humorFlavorId: flavorId,
        });

        const normalized = ((result ?? []) as CaptionLike[]).slice();
        normalized.sort((a, b) => {
          const at = a.created_datetime_utc
            ? new Date(a.created_datetime_utc).getTime()
            : 0;
          const bt = b.created_datetime_utc
            ? new Date(b.created_datetime_utc).getTime()
            : 0;
          return bt - at;
        });

        setCaptions(normalized);
        setStep(null);
        setHasRun(true);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadImages() {
      setTestImagesLoading(true);
      setTestImagesError(null);

      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from("images")
          .select("id, url, is_common_use")
          .eq("is_common_use", true)
          .order("created_datetime_utc", { ascending: false })
          .limit(50);

        if (cancelled) return;

        if (error) {
          setTestImagesError(error.message);
          setTestImages([]);
          return;
        }

        const rows = (data ?? []).map((r) => {
          const row = r as unknown as {
            id?: unknown;
            url?: unknown;
            is_common_use?: unknown;
          };

          return {
            id: String(row.id ?? ""),
            url: String(row.url ?? ""),
            is_common_use: Boolean(row.is_common_use),
          };
        });

        setTestImages(rows);
        setSelectedTestImageId((prev) => prev || rows[0]?.id || "");
      } catch (err) {
        if (cancelled) return;
        setTestImagesError(err instanceof Error ? err.message : String(err));
        setTestImages([]);
      } finally {
        if (!cancelled) setTestImagesLoading(false);
      }
    }

    void loadImages();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Test Flavor (AI)</h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {flavorSlug ? `Flavor: ${flavorSlug}` : `Flavor ID: ${flavorId}`}
          </div>
        </div>
        {loading && step ? (
          <div className="text-xs text-gray-600 dark:text-gray-300">
            {step}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="testMode"
                checked={testMode === "upload"}
                disabled={loading}
                onChange={() => setTestMode("upload")}
              />
              Upload image
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="testMode"
                checked={testMode === "test-set"}
                disabled={loading}
                onChange={() => setTestMode("test-set")}
              />
              Use test-set image
            </label>
          </div>

          <div>
            {testMode === "upload" ? (
              <>
                <label className="block mb-1 font-medium">Image file</label>
                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  We’ll upload the bytes to the presigned URL, then generate
                  captions.
                </div>
              </>
            ) : (
              <>
                <label className="block mb-1 font-medium">
                  Test-set image
                </label>
                {testImagesLoading ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Loading test set...
                  </div>
                ) : testImagesError ? (
                  <div className="text-xs text-red-700">
                    {testImagesError}
                  </div>
                ) : testImages.length === 0 ? (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    No test-set images found.
                  </div>
                ) : (
                  <select
                    className="w-full rounded border border-gray-200 bg-white text-sm px-3 py-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                    value={selectedTestImageId}
                    disabled={loading || testImages.length === 0}
                    onChange={(e) => setSelectedTestImageId(e.target.value)}
                  >
                    {testImages.map((img) => (
                      <option key={img.id} value={img.id}>
                        {img.id}
                      </option>
                    ))}
                  </select>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void runTest()}
              disabled={
                loading ||
                (testMode === "upload" ? !file : !selectedTestImageId)
              }
              className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
            >
              {loading ? "Testing..." : "Generate Captions"}
            </button>
          </div>

          {error ? (
            <div className="rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          Results
        </div>

        {!loading && captions.length === 0 && !error && !hasRun ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-sm text-gray-600 dark:text-gray-300">
            Upload an image and generate captions to see results here.
          </div>
        ) : null}

        {!loading && captions.length === 0 && !error && hasRun ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-sm text-gray-600 dark:text-gray-300">
            No captions were returned for this run.
          </div>
        ) : null}

        {captions.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                    Caption
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-20">
                    Likes
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-24">
                    Public
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-26">
                    Featured
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-32">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {captions.map((c, idx) => (
                  <tr key={c.id ? String(c.id) : String(idx)}>
                    <td className="py-3 px-4 align-top">
                      <div className="break-words">
                        {c.content ?? "—"}
                      </div>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 break-all">
                        Caption ID: {c.id ?? "—"} · Image ID:{" "}
                        {c.image_id ?? "—"} · Flavor ID:{" "}
                        {c.humor_flavor_id ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 break-all">
                        Caption Request:{" "}
                        {c.caption_request_id ?? "—"} · Chain:{" "}
                        {c.llm_prompt_chain_id ?? "—"}
                      </div>
                    </td>
                    <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                      {c.like_count ?? "0"}
                    </td>
                    <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                      {c.is_public ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                      {c.is_featured ? "Yes" : "No"}
                    </td>
                    <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                      {c.created_datetime_utc ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

