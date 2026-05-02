"use client";

import { useActionState, useEffect, useState } from "react";
import { duplicateFlavor } from "./actions";

type Variant = "row" | "subtle";

export default function FlavorDuplicateButton({
  id,
  slug,
  variant = "subtle",
}: {
  id: string;
  slug?: string | null;
  variant?: Variant;
}) {
  const [state, formAction, isPending] = useActionState(duplicateFlavor, {});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const className =
    variant === "row"
      ? "inline-block rounded border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
      : "rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors";

  const sourceName = slug?.trim() || "this flavor";
  const proposedSlug = slug?.trim() ? `${slug.trim()}-copy` : "flavor-copy";

  useEffect(() => {
    if (!confirmOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        setConfirmOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmOpen, isPending]);

  return (
    <div className="inline-flex flex-col items-end gap-1.5">
      <button
        type="button"
        disabled={isPending}
        className={className}
        onClick={() => setConfirmOpen(true)}
      >
        {isPending ? "Duplicating..." : "Duplicate"}
      </button>
      {state.error && (
        <span className="max-w-xs rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {state.error}
        </span>
      )}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) {
              setConfirmOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-flavor-title"
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 text-left shadow-2xl dark:border-slate-800 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="duplicate-flavor-title"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  Duplicate flavor?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  This will immediately create a new saved flavor from{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {sourceName}
                  </span>{" "}
                  and copy its prompt-chain steps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close duplicate confirmation"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                >
                  <path d="M4 4l8 8M12 4L4 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300">
              New slug starts as{" "}
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {proposedSlug}
              </span>
              . If that exists, the next available suffix will be used.
            </div>

            {state.error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
                {state.error}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
                className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:text-slate-900 disabled:opacity-50 dark:text-slate-400 dark:hover:text-slate-100"
              >
                Cancel
              </button>
              <form action={formAction}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  {isPending ? "Duplicating..." : "Duplicate flavor"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
