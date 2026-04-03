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

  const anyPending = createPending || updatePending || deletePending || reorderPending;

  const localError =
    createState.error ||
    updateState.error ||
    deleteState.error ||
    reorderState.error ||
    null;

  useEffect(() => {
    const ok =
      createState.ok ||
      updateState.ok ||
      deleteState.ok ||
      reorderState.ok;
    if (ok) {
      setEditorMode("closed");
      setSelectedStepId(null);
      router.refresh();
    }
  }, [createState.ok, updateState.ok, deleteState.ok, reorderState.ok, router]);

  const firstStepId = steps[0]?.id ?? null;
  const lastStepId = steps[steps.length - 1]?.id ?? null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Flavor steps</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Reorder and manage the prompt-chain steps for this flavor.
          </p>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          <div>Total: {steps.length}</div>
          <button
            type="button"
            onClick={() => {
              setSelectedStepId(null);
              setEditorMode("create");
            }}
            className="mt-2 rounded border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            Add step
          </button>
        </div>
      </div>

      {localError ? (
        <div className="mb-4 rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {localError}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-16">
                    Step
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                    Description
                  </th>
                  <th className="text-right font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {steps.map((s, idx) => {
                  const isFirst = s.id === firstStepId;
                  const isLast = s.id === lastStepId;
                  return (
                    <tr key={s.id}>
                      <td className="py-3 px-4 align-top text-gray-900 dark:text-gray-100 font-medium">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                        {s.description ? s.description : <span className="text-gray-400 dark:text-gray-500 italic">No description</span>}
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={reorderAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={isFirst || anyPending}
                              className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 disabled:opacity-50"
                            >
                              Up
                            </button>
                          </form>
                          <form action={reorderAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <input
                              type="hidden"
                              name="direction"
                              value="down"
                            />
                            <button
                              type="submit"
                              disabled={isLast || anyPending}
                              className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 disabled:opacity-50"
                            >
                              Down
                            </button>
                          </form>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStepId(s.id);
                              setEditorMode("edit");
                            }}
                            className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200"
                          >
                            Edit
                          </button>
                          <form
                            action={deleteAction}
                            onSubmit={(e) => {
                              const ok = window.confirm(
                                "Delete this step?"
                              );
                              if (!ok) e.preventDefault();
                            }}
                          >
                            <input type="hidden" name="id" value={s.id} />
                            <button
                              type="submit"
                              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {steps.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No steps yet for this flavor.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="mb-2">
            <h3 className="text-lg font-semibold">Step editor</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Only shown while adding or editing a step.
            </p>
          </div>

          {editorMode === "closed" ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 text-sm text-gray-600 dark:text-gray-300">
              Click <span className="font-medium">Add step</span> or use{" "}
              <span className="font-medium">Edit</span> on a row to open the
              editor.
            </div>
          ) : editorMode === "create" ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-semibold">Add step</h4>
                <button
                  type="button"
                  onClick={() => setEditorMode("closed")}
                  className="rounded border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs text-gray-800 dark:text-gray-200"
                >
                  Close editor
                </button>
              </div>

              <form action={createAction} className="space-y-4">
                <input type="hidden" name="humor_flavor_id" value={flavorId} />

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="What this step does"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Input type</label>
                    <input
                      name="llm_input_type_id"
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Output type</label>
                    <input
                      name="llm_output_type_id"
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Model</label>
                    <input
                      name="llm_model_id"
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 1"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Step type</label>
                    <input
                      name="humor_flavor_step_type_id"
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Temperature</label>
                  <input
                    type="number"
                    step="0.01"
                    name="llm_temperature"
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="e.g. 0.7"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">System prompt</label>
                  <textarea
                    name="llm_system_prompt"
                    rows={3}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="Instructions for the LLM"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">User prompt</label>
                  <textarea
                    name="llm_user_prompt"
                    rows={3}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="The prompt sent to the LLM"
                  />
                </div>

                <button
                  type="submit"
                  disabled={anyPending}
                  className="rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50"
                >
                  {createPending ? "Adding..." : "Add step"}
                </button>
              </form>
            </div>
          ) : !selectedStep ? (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 text-sm text-gray-600 dark:text-gray-300">
              Select a step to edit.
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-base font-semibold">Edit step</h4>
                <button
                  type="button"
                  onClick={() => {
                    setEditorMode("closed");
                    setSelectedStepId(null);
                  }}
                  className="rounded border border-gray-200 dark:border-gray-800 px-3 py-1 text-xs text-gray-800 dark:text-gray-200"
                >
                  Close editor
                </button>
              </div>

              <form
                key={selectedStep.id}
                action={updateAction}
                className="space-y-4"
              >
                <input type="hidden" name="id" value={selectedStep.id} />

                <div className="rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-xs text-gray-500 dark:text-gray-400">
                  Editing step #{steps.findIndex((s) => s.id === selectedStep.id) + 1}
                </div>

                <div>
                  <label className="block mb-1 font-medium">Description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={selectedStep.description ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="What this step does"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Input type</label>
                    <input
                      name="llm_input_type_id"
                      defaultValue={selectedStep.llm_input_type_id ?? ""}
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Output type</label>
                    <input
                      name="llm_output_type_id"
                      defaultValue={selectedStep.llm_output_type_id ?? ""}
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Model</label>
                    <input
                      name="llm_model_id"
                      defaultValue={selectedStep.llm_model_id ?? ""}
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Step type</label>
                    <input
                      name="humor_flavor_step_type_id"
                      defaultValue={selectedStep.humor_flavor_step_type_id ?? ""}
                      className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Temperature</label>
                  <input
                    type="number"
                    step="0.01"
                    name="llm_temperature"
                    defaultValue={selectedStep.llm_temperature ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">System prompt</label>
                  <textarea
                    name="llm_system_prompt"
                    rows={3}
                    defaultValue={selectedStep.llm_system_prompt ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="Instructions for the LLM"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">User prompt</label>
                  <textarea
                    name="llm_user_prompt"
                    rows={3}
                    defaultValue={selectedStep.llm_user_prompt ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
                    placeholder="The prompt sent to the LLM"
                  />
                </div>

                <button
                  type="submit"
                  disabled={anyPending}
                  className="rounded bg-slate-900 px-4 py-2 text-white dark:bg-slate-100 dark:text-slate-900 disabled:opacity-50"
                >
                  {updatePending ? "Saving..." : "Save changes"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

