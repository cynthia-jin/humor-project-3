import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import FlavorDeleteButton from "@/app/(app)/flavors/FlavorDeleteButton";
import FlavorDuplicateButton from "@/app/(app)/flavors/FlavorDuplicateButton";
import FlavorEditForm from "@/app/(app)/flavors/FlavorEditForm";
import FlavorStepsManager, {
  type FlavorStepRow,
} from "@/app/(app)/flavors/FlavorStepsManager";
import FlavorCaptions from "@/app/(app)/flavors/FlavorCaptions";
import FlavorTestForm from "@/app/(app)/flavors/FlavorTestForm";

export default async function EditFlavorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { supabase } = await requireSuperadmin();
  const { id } = await params;

  const flavorIdNum = Number(id);
  if (!Number.isFinite(flavorIdNum) || !Number.isSafeInteger(flavorIdNum)) {
    return notFound();
  }

  const { data: flavor, error } = await supabase
    .from("humor_flavors")
    .select("id, slug, description")
    .eq("id", flavorIdNum)
    .single();

  if (error) {
    return (
      <main className="p-8 max-w-4xl">
        <div className="mb-4">
          <Link href="/flavors" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            &larr; Back to flavors
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
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
    .eq("humor_flavor_id", flavorIdNum)
    .order("order_by", { ascending: true })
    .limit(200);

  if (stepsError) {
    return (
      <main className="p-8 max-w-4xl">
        <div className="mb-4">
          <Link href="/flavors" className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
            &larr; Back to flavors
          </Link>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {stepsError.message}
        </div>
      </main>
    );
  }

  const flavorSteps = (steps ?? []) as FlavorStepRow[];

  return (
    <main className="p-8 max-w-5xl min-w-0">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/flavors"
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
        >
          &larr; Humor Flavors
        </Link>
      </div>

      {/* Page header */}
      <div className="mb-10 flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {flavor.slug ?? "Untitled flavor"}
          </h1>
          {flavor.description && (
            <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
              {flavor.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <FlavorDuplicateButton id={String(flavorIdNum)} variant="subtle" />
          <FlavorDeleteButton id={String(flavorIdNum)} />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-12">
        <FlavorEditForm
          id={String(flavorIdNum)}
          slug={flavor.slug ?? null}
          description={flavor.description ?? null}
        />

        <FlavorStepsManager
          flavorId={String(flavorIdNum)}
          steps={flavorSteps}
        />

        <FlavorTestForm
          flavorId={String(flavorIdNum)}
          flavorSlug={flavor.slug ?? null}
        />

        <FlavorCaptions
          flavorId={String(flavorIdNum)}
          flavorSlug={flavor.slug}
        />
      </div>
    </main>
  );
}
