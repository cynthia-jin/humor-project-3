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

