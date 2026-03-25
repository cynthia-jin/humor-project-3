"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
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

  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    steps?.[0]?.id ?? null
  );

  const selectedStep = useMemo(
    () => steps.find((s) => s.id === selectedStepId) ?? null,
    [selectedStepId, steps]
  );

  const [createState, createAction] = useFormState(
    createFlavorStep,
    {} as StepActionState
  );
  const [updateState, updateAction] = useFormState(
    updateFlavorStep,
    {} as StepActionState
  );
  const [deleteState, deleteAction] = useFormState(
    deleteFlavorStep,
    {} as StepActionState
  );
  const [reorderState, reorderAction] = useFormState(
    reorderFlavorStep,
    {} as StepActionState
  );

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
    if (ok) router.refresh();
  }, [createState.ok, updateState.ok, deleteState.ok, reorderState.ok, router]);

  const firstStepId = steps[0]?.id ?? null;
  const lastStepId = steps[steps.length - 1]?.id ?? null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-xl font-semibold">Flavor Steps</h2>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: {steps.length}
        </div>
      </div>

      {localError ? (
        <div className="mb-4 rounded border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {localError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200 w-16">
                    #
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                    order_by
                  </th>
                  <th className="text-left font-medium py-3 px-4 text-gray-700 dark:text-gray-200">
                    description
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
                      <td className="py-3 px-4 align-top text-gray-900 dark:text-gray-100">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                        <span className="font-mono">{s.order_by}</span>
                      </td>
                      <td className="py-3 px-4 align-top text-gray-700 dark:text-gray-300">
                        {s.description ? s.description : <span>-</span>}
                      </td>
                      <td className="py-3 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-2">
                          <form action={reorderAction}>
                            <input type="hidden" name="id" value={s.id} />
                            <input type="hidden" name="direction" value="up" />
                            <button
                              type="submit"
                              disabled={isFirst}
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
                              disabled={isLast}
                              className="rounded border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs text-gray-800 dark:text-gray-200 disabled:opacity-50"
                            >
                              Down
                            </button>
                          </form>
                          <button
                            type="button"
                            onClick={() => setSelectedStepId(s.id)}
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
                    <td colSpan={4} className="py-8 px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No steps yet for this flavor.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Step</h3>

            <form action={createAction} className="space-y-4">
              <input type="hidden" name="humor_flavor_id" value={flavorId} />

              <div>
                <label className="block mb-1 font-medium">description</label>
                <textarea
                  name="description"
                  rows={2}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="Optional description"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  llm_input_type_id
                </label>
                <input
                  name="llm_input_type_id"
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  llm_output_type_id
                </label>
                <input
                  name="llm_output_type_id"
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">llm_model_id</label>
                <input
                  name="llm_model_id"
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  humor_flavor_step_type_id
                </label>
                <input
                  name="humor_flavor_step_type_id"
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="e.g. 1"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  llm_temperature
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="llm_temperature"
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  placeholder="e.g. 0.7"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  llm_system_prompt
                </label>
                <textarea
                  name="llm_system_prompt"
                  rows={3}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  llm_user_prompt
                </label>
                <textarea
                  name="llm_user_prompt"
                  rows={3}
                  className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                />
              </div>

              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
              >
                Add Step
              </button>
            </form>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Step</h3>

            {!selectedStep ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Select a step to edit.
              </div>
            ) : (
              <form action={updateAction} className="space-y-4">
                <input type="hidden" name="id" value={selectedStep.id} />

                <div className="rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-600 dark:text-gray-300">
                  Editing step: <span className="font-mono">{selectedStep.id}</span>
                  <div>
                    order_by:{" "}
                    <span className="font-mono">{selectedStep.order_by}</span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">description</label>
                  <textarea
                    name="description"
                    rows={2}
                    defaultValue={selectedStep.description ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    llm_input_type_id
                  </label>
                  <input
                    name="llm_input_type_id"
                    defaultValue={selectedStep.llm_input_type_id ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    llm_output_type_id
                  </label>
                  <input
                    name="llm_output_type_id"
                    defaultValue={selectedStep.llm_output_type_id ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">llm_model_id</label>
                  <input
                    name="llm_model_id"
                    defaultValue={selectedStep.llm_model_id ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    humor_flavor_step_type_id
                  </label>
                  <input
                    name="humor_flavor_step_type_id"
                    defaultValue={selectedStep.humor_flavor_step_type_id ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    llm_temperature
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="llm_temperature"
                    defaultValue={
                      selectedStep.llm_temperature ?? undefined
                    }
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    llm_system_prompt
                  </label>
                  <textarea
                    name="llm_system_prompt"
                    rows={3}
                    defaultValue={selectedStep.llm_system_prompt ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">
                    llm_user_prompt
                  </label>
                  <textarea
                    name="llm_user_prompt"
                    rows={3}
                    defaultValue={selectedStep.llm_user_prompt ?? ""}
                    className="w-full rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
                >
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

