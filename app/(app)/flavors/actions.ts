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

  const { error } = await supabase
    .from("humor_flavors")
    .insert(payload);

  if (error) {
    return { error: error.message };
  }

  redirect("/flavors");
}

export async function updateFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const id = String(formData.get("id") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const description = String(formData.get("description") ?? "");

  if (!id) return { error: "Missing id." };

  const payload = {
    slug,
    description,
  };

  const { error } = await supabase
    .from("humor_flavors")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  redirect(`/flavors/${id}`);
}

export async function deleteFlavor(
  _prevState: FlavorActionState,
  formData: FormData
): Promise<FlavorActionState> {
  const { supabase } = await requireSuperadmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };

  const { error } = await supabase.from("humor_flavors").delete().eq("id", id);
  if (error) {
    return { error: error.message };
  }

  redirect("/flavors");
}

