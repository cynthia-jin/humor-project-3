"use client";

import { useState } from "react";
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
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<CaptionLike[]>([]);
  const [loading, setLoading] = useState(false);

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
    if (!file) {
      setError("Please select an image file to test this flavor.");
      return;
    }
    if (!file.type) {
      setError("Selected file has no content type. Please use a valid image.");
      return;
    }

    setLoading(true);
    setError(null);
    setCaptions([]);
    setStep("1/4: Generating presigned upload URL");

    try {
      const token = await getSupabaseAccessToken();

      const presigned = await generatePresignedUploadUrl({
        token,
        contentType: file.type,
      });

      setStep("2/4: Uploading image bytes");
      await uploadImageToPresignedUrl({
        presignedUrl: presigned.presignedUrl,
        file,
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

      setCaptions((result ?? []) as CaptionLike[]);
      setStep(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStep(null);
    } finally {
      setLoading(false);
    }
  }

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
          <div>
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
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void runTest()}
              disabled={loading || !file}
              className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
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

        {!loading && captions.length === 0 && !error ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 text-sm text-gray-600 dark:text-gray-300">
            Upload an image and generate captions to see results here.
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

