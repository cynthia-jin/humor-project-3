"use client";

import { useActionState } from "react";
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
  const [updateState, updateFormAction, isPending] = useActionState(updateFlavor, {});

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Flavor</h2>

      <form action={updateFormAction} className="space-y-4">
        <input type="hidden" name="id" value={id} />

        <div>
          <label className="block mb-1 font-medium">Slug</label>
          <input
            name="slug"
            defaultValue={slug ?? ""}
            className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={description ?? ""}
            className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {updateState.error ? (
          <div className="rounded border border-red-500 bg-red-50 p-3 text-red-700 text-sm dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {updateState.error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = `/flavors/${id}`;
            }}
            className="rounded border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

