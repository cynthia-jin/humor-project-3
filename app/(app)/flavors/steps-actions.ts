"use server";

import { requireSuperadmin } from "@/lib/auth";

export type StepActionState = {
  error?: string;
  ok?: number; // timestamp — changes on every success so useEffect always fires
};

function parseNumber(value: FormDataEntryValue | null, fallback?: number) {
  const stripQuotes = (input: string) => {
    let out = input.trim();
    for (let i = 0; i < 2; i++) {
      if (
        (out.startsWith('"') && out.endsWith('"')) ||
        (out.startsWith("'") && out.endsWith("'"))
      ) {
        out = out.slice(1, -1).trim();
      } else {
        break;
      }
    }
    return out;
  };

  let raw = value == null ? "" : value.toString();
  raw = stripQuotes(raw);
  if (raw === "") return fallback;
  if (raw === "undefined" || raw === "null") return fallback;
  const num = Number(raw);
  return Number.isFinite(num) ? num : fallback;
}

function parseOptionalBigint(
  value: FormDataEntryValue | null
): string | null {
  const stripQuotes = (input: string) => {
    let out = input.trim();
    for (let i = 0; i < 2; i++) {
      if (
        (out.startsWith('"') && out.endsWith('"')) ||
        (out.startsWith("'") && out.endsWith("'"))
      ) {
        out = out.slice(1, -1).trim();
      } else {
        break;
      }
    }
    return out;
  };

  let raw = value == null ? "" : value.toString();
  raw = stripQuotes(raw);
  if (raw === "") return null;
  if (raw === "undefined" || raw === "null") return null;
  return raw;
}

function parseRequiredBigint(
  value: FormDataEntryValue | null,
  fieldName: string
): string {
  const parsed = parseOptionalBigint(value);
  if (!parsed) {
    throw new Error(`${fieldName} is required.`);
  }
  return parsed;
}

function normalizeDbBigint(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  if (raw === "undefined" || raw === "null") return null;

  // Strip surrounding quotes if the DB returned them as text.
  const first = raw[0];
  const last = raw[raw.length - 1];
  if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
    return raw.slice(1, -1).trim() || null;
  }
  return raw;
}

export async function createFlavorStep(
  _prevState: StepActionState,
  formData: FormData
): Promise<StepActionState> {
  const { supabase } = await requireSuperadmin();

  const humorFlavorId = (() => {
    const raw = formData.get("humor_flavor_id");
    try {
      return parseRequiredBigint(raw, "humor_flavor_id");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new Error(msg);
    }
  })();
  const description = String(formData.get("description") ?? "");

  const llmInputTypeId = parseOptionalBigint(
    formData.get("llm_input_type_id")
  );
  const llmOutputTypeId = parseOptionalBigint(
    formData.get("llm_output_type_id")
  );
  const llmModelId = parseOptionalBigint(formData.get("llm_model_id"));
  const humorFlavorStepTypeId = parseOptionalBigint(
    formData.get("humor_flavor_step_type_id")
  );

  const llmTemperature = parseNumber(
    formData.get("llm_temperature"),
    undefined
  );

  const llmSystemPrompt = String(formData.get("llm_system_prompt") ?? "");
  const llmUserPrompt = String(formData.get("llm_user_prompt") ?? "");

  // Assign the next order_by value at the end of the list.
  const { data: maxRow, error: maxError } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", humorFlavorId)
    .order("order_by", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) return { error: maxError.message };

  const nextOrderBy =
    maxRow?.order_by == null ? 0 : Number(maxRow.order_by);
  const order_by = nextOrderBy + 1;

  const payload = {
    humor_flavor_id: humorFlavorId,
    order_by,
    description: description || null,
    llm_input_type_id: llmInputTypeId,
    llm_output_type_id: llmOutputTypeId,
    llm_model_id: llmModelId,
    humor_flavor_step_type_id: humorFlavorStepTypeId,
    llm_temperature: llmTemperature ?? null,
    llm_system_prompt: llmSystemPrompt || null,
    llm_user_prompt: llmUserPrompt || null,
  };

  const { error } = await supabase.from("humor_flavor_steps").insert(payload);
  if (error) return { error: error.message };

  return { ok: Date.now() };
}

export async function updateFlavorStep(
  _prevState: StepActionState,
  formData: FormData
): Promise<StepActionState> {
  const { supabase } = await requireSuperadmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  const description = String(formData.get("description") ?? "");
  const llmInputTypeId = parseOptionalBigint(
    formData.get("llm_input_type_id")
  );
  const llmOutputTypeId = parseOptionalBigint(
    formData.get("llm_output_type_id")
  );
  const llmModelId = parseOptionalBigint(formData.get("llm_model_id"));
  const humorFlavorStepTypeId = parseOptionalBigint(
    formData.get("humor_flavor_step_type_id")
  );
  const llmTemperature = parseNumber(
    formData.get("llm_temperature"),
    undefined
  );
  const llmSystemPrompt = String(formData.get("llm_system_prompt") ?? "");
  const llmUserPrompt = String(formData.get("llm_user_prompt") ?? "");

  const payload = {
    description: description || null,
    llm_input_type_id: llmInputTypeId,
    llm_output_type_id: llmOutputTypeId,
    llm_model_id: llmModelId,
    humor_flavor_step_type_id: humorFlavorStepTypeId,
    llm_temperature: llmTemperature ?? null,
    llm_system_prompt: llmSystemPrompt || null,
    llm_user_prompt: llmUserPrompt || null,
  };

  const { error } = await supabase
    .from("humor_flavor_steps")
    .update(payload)
    .eq("id", id);

  if (error) return { error: error.message };

  return { ok: Date.now() };
}

export async function deleteFlavorStep(
  _prevState: StepActionState,
  formData: FormData
): Promise<StepActionState> {
  const { supabase } = await requireSuperadmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  const { error } = await supabase
    .from("humor_flavor_steps")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  return { ok: Date.now() };
}

export async function reorderFlavorStep(
  _prevState: StepActionState,
  formData: FormData
): Promise<StepActionState> {
  const { supabase } = await requireSuperadmin();

  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id) return { error: "Missing id." };
  if (direction !== "up" && direction !== "down") {
    return { error: "direction must be 'up' or 'down'." };
  }

  const { data: current, error: currentError } = await supabase
    .from("humor_flavor_steps")
    .select("id, humor_flavor_id, order_by")
    .eq("id", id)
    .single();

  if (currentError) return { error: currentError.message };
  if (!current) return { error: "Step not found." };

  const currentOrder = Number(current.order_by);
  const currentHumorFlavorId = normalizeDbBigint(current.humor_flavor_id);
  if (!currentHumorFlavorId) {
    return { error: "Missing humor_flavor_id for reorder." };
  }
  const adjacentQuery =
    direction === "up"
      ? supabase
          .from("humor_flavor_steps")
          .select("id, order_by")
          .eq("humor_flavor_id", currentHumorFlavorId)
          .lt("order_by", currentOrder)
          .order("order_by", { ascending: false })
          .limit(1)
          .maybeSingle()
      : supabase
          .from("humor_flavor_steps")
          .select("id, order_by")
          .eq("humor_flavor_id", currentHumorFlavorId)
          .gt("order_by", currentOrder)
          .order("order_by", { ascending: true })
          .limit(1)
          .maybeSingle();

  const { data: adjacent, error: adjacentError } = await adjacentQuery;
  if (adjacentError) return { error: adjacentError.message };
  if (!adjacent) {
    // Already at the edge; no-op.
    return { ok: Date.now() };
  }

  const adjacentOrder = Number(adjacent.order_by);

  // Swap safely using a temporary order_by value to avoid unique constraint issues.
  const { data: minRow, error: minError } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", currentHumorFlavorId)
    .order("order_by", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (minError) return { error: minError.message };

  const { data: maxRow, error: maxError } = await supabase
    .from("humor_flavor_steps")
    .select("order_by")
    .eq("humor_flavor_id", currentHumorFlavorId)
    .order("order_by", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxError) return { error: maxError.message };

  const minOrder = minRow?.order_by == null ? 0 : Number(minRow.order_by);
  const maxOrder = maxRow?.order_by == null ? 0 : Number(maxRow.order_by);
  // Use a value well outside the current min/max range to avoid collisions.
  const tempOrderBy = direction === "up" ? minOrder - 1000000 : maxOrder + 1000000;

  // 1) Move current to temp
  const { error: t1 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: tempOrderBy })
    .eq("id", current.id);
  if (t1) return { error: t1.message };

  // 2) Move adjacent into current's slot
  const { error: t2 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: currentOrder })
    .eq("id", adjacent.id);
  if (t2) return { error: t2.message };

  // 3) Move current into adjacent's slot
  const { error: t3 } = await supabase
    .from("humor_flavor_steps")
    .update({ order_by: adjacentOrder })
    .eq("id", current.id);
  if (t3) return { error: t3.message };

  return { ok: Date.now() };
}

