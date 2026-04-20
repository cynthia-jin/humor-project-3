"use client";

import { useActionState } from "react";
import { duplicateFlavor } from "./actions";

type Variant = "row" | "subtle";

export default function FlavorDuplicateButton({
  id,
  variant = "subtle",
}: {
  id: string;
  variant?: Variant;
}) {
  const [state, formAction, isPending] = useActionState(duplicateFlavor, {});

  const className =
    variant === "row"
      ? "inline-block rounded border border-slate-200 dark:border-slate-800 px-3 py-1 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-50"
      : "rounded-lg px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors";

  return (
    <span className="inline-flex flex-col items-end gap-1.5">
      <form action={formAction}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" disabled={isPending} className={className}>
          {isPending ? "Duplicating..." : "Duplicate"}
        </button>
      </form>
      {state.error && (
        <span className="max-w-xs rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {state.error}
        </span>
      )}
    </span>
  );
}
