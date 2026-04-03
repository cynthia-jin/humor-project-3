"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/formatDate";
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
    Array<{ id: string; url: string; is_common_use: boolean }>
  >([]);
  const [testImagesLoading, setTestImagesLoading] = useState(false);
  const [testImagesError, setTestImagesError] = useState<string | null>(null);
  const [selectedTestImageId, setSelectedTestImageId] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionLike[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const selectedTestImage =
    testImages.find((img) => img.id === selectedTestImageId) ?? null;
  const normalizedSearch = pickerSearch.trim().toLowerCase();
  const filteredTestImages = testImages.filter((img) =>
    img.id.toLowerCase().includes(normalizedSearch)
  );

  function shortImageLabel(id: string) {
    return id.length <= 12 ? id : `${id.slice(0, 8)}...${id.slice(-4)}`;
  }

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
        setError("Selected file has no content type. Please use a valid image.");
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
        ? "Generating presigned upload URL..."
        : "Registering image..."
    );

    try {
      const token = await getSupabaseAccessToken();
      if (testMode === "upload") {
        const presigned = await generatePresignedUploadUrl({
          token,
          contentType: file!.type,
        });

        setStep("Uploading image...");
        await uploadImageToPresignedUrl({
          presignedUrl: presigned.presignedUrl,
          file: file!,
        });

        setStep("Registering image...");
        const uploaded = await uploadImageFromUrl({
          token,
          imageUrl: presigned.cdnUrl,
          isCommonUse: false,
        });

        setStep("Generating captions...");
        const result = await generateCaptionsForFlavor({
          token,
          imageId: uploaded.imageId,
          humorFlavorId: flavorId,
        });

        const normalized = ((result ?? []) as CaptionLike[]).slice();
        normalized.sort((a, b) => {
          const at = a.created_datetime_utc ? new Date(a.created_datetime_utc).getTime() : 0;
          const bt = b.created_datetime_utc ? new Date(b.created_datetime_utc).getTime() : 0;
          return bt - at;
        });

        setCaptions(normalized);
        setStep(null);
        setHasRun(true);
      } else {
        const selected = testImages.find((img) => img.id === selectedTestImageId);
        if (!selected) throw new Error("Selected test image not found.");

        setStep("Registering image...");
        const uploaded = await uploadImageFromUrl({
          token,
          imageUrl: selected.url,
          isCommonUse: selected.is_common_use,
        });

        setStep("Generating captions...");
        const result = await generateCaptionsForFlavor({
          token,
          imageId: uploaded.imageId,
          humorFlavorId: flavorId,
        });

        const normalized = ((result ?? []) as CaptionLike[]).slice();
        normalized.sort((a, b) => {
          const at = a.created_datetime_utc ? new Date(a.created_datetime_utc).getTime() : 0;
          const bt = b.created_datetime_utc ? new Date(b.created_datetime_utc).getTime() : 0;
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
          const row = r as unknown as { id?: unknown; url?: unknown; is_common_use?: unknown };
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
    return () => { cancelled = true; };
  }, []);

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
      active
        ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
    }`;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Test flavor
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Generate captions using{" "}
          {flavorSlug ? (
            <span className="font-medium text-slate-700 dark:text-slate-300">{flavorSlug}</span>
          ) : (
            "this flavor"
          )}{" "}
          to test the prompt chain.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 space-y-5">
        {/* Mode toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => setTestMode("upload")}
            className={tabClass(testMode === "upload")}
          >
            Upload image
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => setTestMode("test-set")}
            className={tabClass(testMode === "test-set")}
          >
            Test-set image
          </button>
        </div>

        {/* Image selection */}
        <div>
          {testMode === "upload" ? (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                Image file
              </label>
              <input
                type="file"
                accept="image/*"
                disabled={loading}
                className="block w-full text-sm text-slate-900 dark:text-slate-100 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 dark:file:bg-slate-800 dark:file:text-slate-300 file:cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          ) : (
            <div>
              <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                Test-set image
              </label>
              {testImagesLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading test set...</p>
              ) : testImagesError ? (
                <p className="text-sm text-red-600 dark:text-red-400">{testImagesError}</p>
              ) : testImages.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No test-set images found.</p>
              ) : (
                <div className="space-y-3">
                  {selectedTestImage ? (
                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
                      <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
                        <img
                          src={selectedTestImage.url}
                          alt="Selected test image"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 text-sm text-slate-700 dark:text-slate-300">
                        Selected: {shortImageLabel(selectedTestImage.id)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No test image selected yet.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    disabled={loading}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    Choose image
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Generate button + status */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => void runTest()}
            disabled={loading || (testMode === "upload" ? !file : !selectedTestImageId)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition-colors"
          >
            {loading ? "Generating..." : "Generate captions"}
          </button>
          {loading && step && (
            <span className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">
              {step}
            </span>
          )}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}
      </div>

      {/* Image picker modal */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPickerOpen(false);
          }}
        >
          <div className="w-full max-w-3xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 py-3.5">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Choose test image
              </h4>
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M4 4l8 8M12 4L4 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <input
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search by image ID..."
                className="mb-4 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/20"
              />
              <div className="max-h-[60vh] overflow-y-auto">
                {filteredTestImages.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
                    No images match your search.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {filteredTestImages.map((img) => {
                      const isSelected = img.id === selectedTestImageId;
                      return (
                        <button
                          key={img.id}
                          type="button"
                          onClick={() => {
                            setSelectedTestImageId(img.id);
                            setPickerOpen(false);
                          }}
                          className={`rounded-lg border-2 p-1.5 text-left transition-colors ${
                            isSelected
                              ? "border-slate-900 dark:border-slate-100"
                              : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                          }`}
                        >
                          <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                            <img
                              src={img.url}
                              alt={`Test image ${shortImageLabel(img.id)}`}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                            {shortImageLabel(img.id)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {(hasRun || captions.length > 0) && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
            Results
          </h3>

          {!loading && captions.length === 0 && !error && hasRun && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 text-sm text-slate-500 dark:text-slate-400 text-center">
              No captions were returned for this run.
            </div>
          )}

          {captions.length > 0 && (
            <div className="space-y-3">
              {captions.map((c, idx) => (
                <div
                  key={c.id ? String(c.id) : String(idx)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4"
                >
                  <p className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
                    {c.content ?? "—"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDate(c.created_datetime_utc)}</span>
                    {c.like_count != null && Number(c.like_count) > 0 && (
                      <span>{c.like_count} likes</span>
                    )}
                    <details className="inline">
                      <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                        IDs
                      </summary>
                      <div className="mt-1 space-y-0.5 break-all">
                        <div>Caption: {c.id ?? "—"}</div>
                        <div>Image: {c.image_id ?? "—"}</div>
                        <div>Request: {c.caption_request_id ?? "—"}</div>
                        <div>Chain: {c.llm_prompt_chain_id ?? "—"}</div>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
