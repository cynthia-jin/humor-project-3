"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createFlavor, type FlavorActionState } from "./actions";

const initialState: FlavorActionState = {};

export default function FlavorCreateForm() {
  const [state, formAction, isPending] = useActionState(createFlavor, initialState);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <form action={formAction} className="space-y-5">
        <div>
          <label
            htmlFor="flavor-slug"
            className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Slug
          </label>
          <input
            id="flavor-slug"
            name="slug"
            required
            autoComplete="off"
            placeholder="e.g. roast"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-100/20"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Use a short unique label. You can rename it later.
          </p>
        </div>

        <div>
          <label
            htmlFor="flavor-description"
            className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Description
          </label>
          <textarea
            id="flavor-description"
            name="description"
            rows={4}
            placeholder="What this flavor produces..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition-shadow focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-slate-100/20"
          />
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            A one-line reminder helps distinguish similar prompt chains.
          </p>
        </div>

        {state.error ? (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
          >
            {state.error}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {isPending ? "Creating..." : "Create"}
          </button>
          <Link
            href="/flavors"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-900"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
