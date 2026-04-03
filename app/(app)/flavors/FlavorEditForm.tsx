"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { updateFlavor } from "./actions";

export default function FlavorEditForm({
  id,
  slug,
  description,
}: {
  id: string;
  slug: string | null;
  description: string | null;
}) {
  const router = useRouter();
  const [updateState, updateFormAction, isPending] = useActionState(updateFlavor, {});

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Flavor details
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Update the slug and description for this flavor.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
        <form action={updateFormAction} className="space-y-5">
          <input type="hidden" name="id" value={id} />

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Slug
            </label>
            <input
              name="slug"
              defaultValue={slug ?? ""}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/20 transition-shadow"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={description ?? ""}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/20 transition-shadow"
              placeholder="What does this flavor do?"
            />
          </div>

          {updateState.error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 text-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
              {updateState.error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
            >
              {isPending ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => router.refresh()}
              disabled={isPending}
              className="rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
