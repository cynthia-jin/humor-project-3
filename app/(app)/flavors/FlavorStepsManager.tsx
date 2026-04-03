"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import {
  createFlavorStep,
  deleteFlavorStep,
  reorderFlavorStep,
  updateFlavorStep,
  type StepActionState,
} from "@/app/(app)/flavors/steps-actions";
import { useRouter } from "next/navigation";

export type FlavorStepRow = {
  id: string;
  humor_flavor_id: string;
  order_by: number;
  llm_input_type_id: string | null;
  llm_output_type_id: string | null;
  llm_model_id: string | null;
  humor_flavor_step_type_id: string | null;
  llm_temperature: number | null;
  description: string | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  created_datetime_utc: string | null;
};

const inputClass =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-100/20 transition-shadow";

function StepFormFields({ step }: { step?: FlavorStepRow | null }) {
  return (
    <>
      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Description
        </label>
        <textarea
          name="description"
          rows={2}
          defaultValue={step?.description ?? ""}
          className={inputClass}
          placeholder="What this step does"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Input type
          </label>
          <input
            name="llm_input_type_id"
            defaultValue={step?.llm_input_type_id ?? ""}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Output type
          </label>
          <input
            name="llm_output_type_id"
            defaultValue={step?.llm_output_type_id ?? ""}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Model
          </label>
          <input
            name="llm_model_id"
            defaultValue={step?.llm_model_id ?? ""}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </div>
        <div>
          <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
            Step type
          </label>
          <input
            name="humor_flavor_step_type_id"
            defaultValue={step?.humor_flavor_step_type_id ?? ""}
            className={inputClass}
            placeholder="e.g. 1"
          />
        </div>
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          Temperature
        </label>
        <input
          type="number"
          step="0.01"
          name="llm_temperature"
          defaultValue={step?.llm_temperature ?? ""}
          className={inputClass}
          placeholder="e.g. 0.7"
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          System prompt
        </label>
        <textarea
          name="llm_system_prompt"
          rows={3}
          defaultValue={step?.llm_system_prompt ?? ""}
          className={inputClass}
          placeholder="Instructions for the LLM"
        />
      </div>

      <div>
        <label className="block mb-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
          User prompt
        </label>
        <textarea
          name="llm_user_prompt"
          rows={3}
          defaultValue={step?.llm_user_prompt ?? ""}
          className={inputClass}
          placeholder="The prompt sent to the LLM"
        />
      </div>
    </>
  );
}

export default function FlavorStepsManager({
  flavorId,
  steps,
}: {
  flavorId: string;
  steps: FlavorStepRow[];
}) {
  const router = useRouter();
  const [editorMode, setEditorMode] = useState<"closed" | "create" | "edit">(
    "closed"
  );
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedStepId) ?? null,
    [selectedStepId, steps]
  );

  const [createState, createAction, createPending] = useActionState(
    createFlavorStep,
    {} as StepActionState
  );
  const [updateState, updateAction, updatePending] = useActionState(
    updateFlavorStep,
    {} as StepActionState
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteFlavorStep,
    {} as StepActionState
  );
  const [reorderState, reorderAction, reorderPending] = useActionState(
    reorderFlavorStep,
    {} as StepActionState
  );

  const anyPending =
    createPending || updatePending || deletePending || reorderPending;

  const localError =
    createState.error ||
    updateState.error ||
    deleteState.error ||
    reorderState.error ||
    null;

  useEffect(() => {
    const ok =
      createState.ok || updateState.ok || deleteState.ok || reorderState.ok;
    if (ok) {
      setEditorMode("closed");
      setSelectedStepId(null);
      router.refresh();
    }
  }, [createState.ok, updateState.ok, deleteState.ok, reorderState.ok, router]);

  const firstStepId = steps[0]?.id ?? null;
  const lastStepId = steps[steps.length - 1]?.id ?? null;
  const modalOpen = editorMode !== "closed";

  function closeModal() {
    if (anyPending) return;
    setEditorMode("closed");
    setSelectedStepId(null);
  }

  const actionBtnClass =
    "rounded-md px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors";

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Prompt chain steps
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Steps run in order to transform an image into captions.
        </p>
      </div>

      {localError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {localError}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden">
        {/* Steps list */}
        {steps.length > 0 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {steps.map((s, idx) => {
              const isFirst = s.id === firstStepId;
              const isLast = s.id === lastStepId;
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-4 px-5 py-3.5 group"
                >
                  {/* Step number */}
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0">
                    {idx + 1}
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-300">
                    {s.description || (
                      <span className="text-slate-400 dark:text-slate-500 italic">
                        No description
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                    <form action={reorderAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={isFirst || anyPending}
                        className={actionBtnClass}
                        title="Move up"
                      >
                        &uarr;
                      </button>
                    </form>
                    <form action={reorderAction}>
                      <input type="hidden" name="id" value={s.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={isLast || anyPending}
                        className={actionBtnClass}
                        title="Move down"
                      >
                        &darr;
                      </button>
                    </form>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStepId(s.id);
                        setEditorMode("edit");
                      }}
                      className={actionBtnClass}
                    >
                      Edit
                    </button>
                    <form
                      action={deleteAction}
                      onSubmit={(e) => {
                        if (!window.confirm("Delete this step?"))
                          e.preventDefault();
                      }}
                    >
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="rounded-md px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 transition-colors"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state + Add button */}
        <div
          className={`px-5 ${steps.length === 0 ? "py-8" : "py-3 border-t border-slate-100 dark:border-slate-800"}`}
        >
          {steps.length === 0 && (
            <p className="text-center text-sm text-slate-400 dark:text-slate-500 mb-4">
              No steps yet. Add one to start building the prompt chain.
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedStepId(null);
              setEditorMode("create");
            }}
            className="w-full rounded-lg border border-dashed border-slate-300 dark:border-slate-700 py-2.5 text-sm text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            + Add step
          </button>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-[2px] p-4 pt-[10vh] overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {editorMode === "create"
                  ? `Add step ${steps.length + 1}`
                  : `Edit step ${steps.findIndex((s) => s.id === selectedStepId) + 1}`}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                disabled={anyPending}
                className="rounded-md p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l8 8M12 4L4 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {editorMode === "create" ? (
                <form action={createAction} className="space-y-5">
                  <input
                    type="hidden"
                    name="humor_flavor_id"
                    value={flavorId}
                  />
                  <StepFormFields />
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={anyPending}
                      className="rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={anyPending}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
                    >
                      {createPending ? "Adding..." : "Add step"}
                    </button>
                  </div>
                </form>
              ) : selectedStep ? (
                <form
                  key={selectedStep.id}
                  action={updateAction}
                  className="space-y-5"
                >
                  <input type="hidden" name="id" value={selectedStep.id} />
                  <StepFormFields step={selectedStep} />
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={anyPending}
                      className="rounded-lg px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 disabled:opacity-50 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={anyPending}
                      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 disabled:opacity-50 transition-colors"
                    >
                      {updatePending ? "Saving..." : "Save changes"}
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
