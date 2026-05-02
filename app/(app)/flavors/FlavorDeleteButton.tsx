"use client";

import { useActionState, useEffect, useState } from "react";
import { deleteFlavor } from "./actions";

export default function FlavorDeleteButton({
  id,
  slug,
}: {
  id: string;
  slug?: string | null;
}) {
  const [deleteState, deleteFormAction, isPending] = useActionState(deleteFlavor, {});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const flavorName = slug?.trim() || "this flavor";

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
    <div className="inline-flex flex-col items-end gap-2 shrink-0">
      <button
        type="button"
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
      >
        {isPending ? "Deleting..." : "Delete flavor"}
      </button>
      {deleteState.error && (
        <div
          role="alert"
          className="max-w-md rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
        >
          {deleteState.error}
        </div>
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
            aria-labelledby="delete-flavor-title"
            className="w-full max-w-md rounded-xl border border-red-200 bg-white p-5 text-left shadow-2xl dark:border-red-900/70 dark:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="delete-flavor-title"
                  className="text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  Delete flavor?
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  This will permanently delete{" "}
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {flavorName}
                  </span>
                  . This cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={isPending}
                className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close delete confirmation"
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

            {deleteState.error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200"
              >
                {deleteState.error}
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
              <form action={deleteFormAction}>
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-400"
                >
                  {isPending ? "Deleting..." : "Delete flavor"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
