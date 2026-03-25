import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import FlavorEditForm from "@/app/(app)/flavors/FlavorEditForm";
import FlavorStepsManager, {
  type FlavorStepRow,
} from "@/app/(app)/flavors/FlavorStepsManager";
import FlavorCaptions from "@/app/(app)/flavors/FlavorCaptions";

export default async function EditFlavorPage({
  params,
}: {
  params: { id: string };
}) {
  const { supabase } = await requireSuperadmin();

  const { data: flavor, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .eq("id", params.id)
    .single();

  if (error) {
    return (
      <main className="p-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/flavors" className="underline text-sm">
            Back to flavors
          </Link>
        </div>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
          {error.message}
        </div>
      </main>
    );
  }

  if (!flavor) return notFound();

  const { data: steps, error: stepsError } = await supabase
    .from("humor_flavor_steps")
    .select(
      "id, humor_flavor_id, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_temperature, description, llm_system_prompt, llm_user_prompt, created_datetime_utc"
    )
    .eq("humor_flavor_id", params.id)
    .order("order_by", { ascending: true })
    .limit(200);

  if (stepsError) {
    return (
      <main className="p-6 max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Link href="/flavors" className="underline text-sm">
              Back to flavors
            </Link>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Editing ID: {String(flavor.id)}
          </div>
        </div>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
          {stepsError.message}
        </div>
      </main>
    );
  }

  const flavorSteps = (steps ?? []) as FlavorStepRow[];

  return (
    <main className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <Link href="/flavors" className="underline text-sm">
            Back to flavors
          </Link>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Editing ID: {String(flavor.id)}
        </div>
      </div>

      <FlavorEditForm
        id={String(flavor.id)}
        slug={flavor.slug ?? null}
        description={flavor.description ?? null}
      />

      <FlavorStepsManager
        flavorId={String(flavor.id)}
        steps={flavorSteps}
      />

      <FlavorCaptions flavorId={String(flavor.id)} flavorSlug={flavor.slug} />
    </main>
  );
}

