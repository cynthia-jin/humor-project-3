"use client";

import { useFormState } from "react-dom";
import { deleteFlavor } from "./actions";

export default function FlavorDeleteButton({ id }: { id: string }) {
  const [deleteState, deleteFormAction] = useFormState(deleteFlavor, {});

  return (
    <div className="inline-flex flex-col items-start gap-2">
      <form
        action={deleteFormAction}
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
          className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </form>
      {deleteState.error ? (
        <div className="max-w-md rounded border border-red-500 bg-red-50 p-2 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {deleteState.error}
        </div>
      ) : null}
    </div>
  );
}
