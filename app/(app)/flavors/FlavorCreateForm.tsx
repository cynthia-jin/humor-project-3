"use client";

import { useFormState } from "react-dom";
import { createFlavor, type FlavorActionState } from "./actions";

const initialState: FlavorActionState = {};

export default function FlavorCreateForm() {
  const [state, formAction] = useFormState(createFlavor, initialState);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
      <form action={formAction} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Slug</label>
          <input
            name="slug"
            placeholder="e.g. roast"
            className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="What this flavor produces..."
            className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          />
        </div>

        {state.error ? (
          <div className="rounded border border-red-500 bg-red-50 p-3 text-red-700 text-sm">
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}

