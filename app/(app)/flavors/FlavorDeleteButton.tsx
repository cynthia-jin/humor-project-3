"use client";

import { useActionState } from "react";
import { deleteFlavor } from "./actions";

export default function FlavorDeleteButton({ id }: { id: string }) {
  const [deleteState, deleteFormAction, isPending] = useActionState(deleteFlavor, {});

  return (
    <div className="inline-flex flex-col items-end gap-2 shrink-0">
      <form
        action={deleteFormAction}
        onSubmit={(e) => {
          const ok = window.confirm(
            "Are you sure you want to delete this flavor? This cannot be undone."
          );
          if (!ok) e.preventDefault();
        }}
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Deleting..." : "Delete flavor"}
        </button>
      </form>
      {deleteState.error && (
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {deleteState.error}
        </div>
      )}
    </div>
  );
}
