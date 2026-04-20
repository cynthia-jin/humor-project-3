"use server";

import { redirect } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";

export type FlavorActionState = {
  error?: string;
};

export async function createFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "");

  const payload = {
    slug,
    description,
  };

  const { data, error } = await supabase
    .from("humor_flavors")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  const rawId = data?.id;
  const newId =
    typeof rawId === "number"
      ? rawId
      : typeof rawId === "string"
        ? Number(rawId)
        : NaN;
  if (!Number.isFinite(newId) || !Number.isSafeInteger(newId)) {
    return { error: "Created flavor but could not read its id." };
  }

  redirect(`/flavors/${newId}`);
}

export async function updateFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const rawId = formData.get("id");
  const idStr = rawId == null ? "" : rawId.toString().trim();
  const normalizedIdStr =
    idStr === '"undefined"' || idStr === "'undefined'" || idStr === "undefined"
      ? ""
      : idStr;
  const idNum = Number(normalizedIdStr);
  if (!Number.isFinite(idNum) || !Number.isSafeInteger(idNum)) {
    return { error: "Invalid id." };
  }
  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "");

  const payload = {
    slug,
    description,
  };

  const { error } = await supabase
    .from("humor_flavors")
    .update(payload)
    .eq("id", idNum);

  if (error) {
    return { error: error.message };
  }

  redirect(`/flavors/${idNum}`);
}

export async function duplicateFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const rawId = formData.get("id");
  const idStr = rawId == null ? "" : rawId.toString().trim();
  const normalizedIdStr =
    idStr === '"undefined"' || idStr === "'undefined'" || idStr === "undefined"
      ? ""
      : idStr;
  const idNum = Number(normalizedIdStr);
  if (!Number.isFinite(idNum) || !Number.isSafeInteger(idNum)) {
    return { error: "Invalid id." };
  }

  // Load source flavor
  const { data: source, error: srcError } = await supabase
    .from("humor_flavors")
    .select("slug, description")
    .eq("id", idNum)
    .single();
  if (srcError) return { error: srcError.message };
  if (!source) return { error: "Source flavor not found." };

  // Find a unique slug: `{slug}-copy`, `{slug}-copy-2`, `{slug}-copy-3`, ...
  const baseSlug = source.slug ?? "flavor";
  let candidate = `${baseSlug}-copy`;
  let attempt = 2;
  while (true) {
    const { data: existing, error: lookupError } = await supabase
      .from("humor_flavors")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (lookupError) return { error: lookupError.message };
    if (!existing) break;
    candidate = `${baseSlug}-copy-${attempt}`;
    attempt++;
    if (attempt > 100) return { error: "Could not find a unique slug." };
  }

  // Insert new flavor
  const { data: created, error: insertError } = await supabase
    .from("humor_flavors")
    .insert({ slug: candidate, description: source.description ?? "" })
    .select("id")
    .single();
  if (insertError) return { error: insertError.message };

  const newIdRaw = created?.id;
  const newId =
    typeof newIdRaw === "number"
      ? newIdRaw
      : typeof newIdRaw === "string"
        ? Number(newIdRaw)
        : NaN;
  if (!Number.isFinite(newId) || !Number.isSafeInteger(newId)) {
    return { error: "Duplicated flavor but could not read its id." };
  }

  // Load source steps
  const { data: sourceSteps, error: stepsError } = await supabase
    .from("humor_flavor_steps")
    .select(
      "order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, description, llm_system_prompt, llm_user_prompt"
    )
    .eq("humor_flavor_id", idNum)
    .order("order_by", { ascending: true });
  if (stepsError) {
    // Roll back: delete the new flavor so we don't leave an orphan
    await supabase.from("humor_flavors").delete().eq("id", newId);
    return { error: stepsError.message };
  }

  if (sourceSteps && sourceSteps.length > 0) {
    const newSteps = sourceSteps.map((s) => ({
      humor_flavor_id: newId,
      order_by: s.order_by,
      llm_input_type_id: s.llm_input_type_id,
      llm_output_type_id: s.llm_output_type_id,
      llm_model_id: s.llm_model_id,
      humor_flavor_step_type_id: s.humor_flavor_step_type_id,
      llm_temperature: s.llm_temperature,
      description: s.description,
      llm_system_prompt: s.llm_system_prompt,
      llm_user_prompt: s.llm_user_prompt,
    }));

    const { error: insertStepsError } = await supabase
      .from("humor_flavor_steps")
      .insert(newSteps);
    if (insertStepsError) {
      await supabase.from("humor_flavors").delete().eq("id", newId);
      return { error: insertStepsError.message };
    }
  }

  redirect(`/flavors/${newId}`);
}

export async function deleteFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const rawId = formData.get("id");
  const idStr = rawId == null ? "" : rawId.toString().trim();
  const normalizedIdStr =
    idStr === '"undefined"' || idStr === "'undefined'" || idStr === "undefined"
      ? ""
      : idStr;
  const idNum = Number(normalizedIdStr);
  if (!Number.isFinite(idNum) || !Number.isSafeInteger(idNum)) {
    return { error: "Invalid id." };
  }

  const { error } = await supabase
    .from("humor_flavors")
    .delete()
    .eq("id", idNum);
  if (error) {
    return { error: error.message };
  }

  redirect("/flavors");
}

