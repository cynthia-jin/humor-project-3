"use client";

import { useFormState } from "react-dom";
import { deleteFlavor, updateFlavor } from "./actions";

export default function FlavorEditForm({
  id,
  slug,
  description,
}: {
  id: string;
  slug: string | null;
  description: string | null;
}) {
  const [updateState, updateFormAction] = useFormState(updateFlavor, {});
  const [deleteState, deleteFormAction] = useFormState(deleteFlavor, {});

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
        <h2 className="text-lg font-semibold mb-4">Edit Flavor</h2>

        <form action={updateFormAction} className="space-y-4">
          <input type="hidden" name="id" value={id} />

          <div>
            <label className="block mb-1 font-medium">Slug</label>
            <input
              name="slug"
              defaultValue={slug ?? ""}
              className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              rows={4}
              defaultValue={description ?? ""}
              className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
            />
          </div>

          {updateState.error ? (
            <div className="rounded border border-red-500 bg-red-50 p-3 text-red-700 text-sm">
              {updateState.error}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = `/flavors/${id}`;
              }}
              className="rounded border border-gray-200 dark:border-gray-800 px-4 py-2 text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20 p-6">
        <h2 className="text-lg font-semibold mb-2 text-red-900 dark:text-red-200">
          Delete Flavor
        </h2>
        <p className="text-sm text-red-800 dark:text-red-200/80 mb-4">
          This will permanently delete the flavor. If it fails due to foreign
          key constraints, the Supabase error will be shown below.
        </p>

        <form
          action={deleteFormAction}
          className="space-y-3"
          onSubmit={(e) => {
            const ok = window.confirm(
              "Are you sure you want to delete this flavor?"
            );
            if (!ok) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>

          {deleteState.error ? (
            <div className="rounded border border-red-500 bg-white p-3 text-red-700 text-sm dark:bg-gray-950">
              {deleteState.error}
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

