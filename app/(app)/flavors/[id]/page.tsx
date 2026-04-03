import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSuperadmin } from "@/lib/auth";
import FlavorDeleteButton from "@/app/(app)/flavors/FlavorDeleteButton";
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

  // Parse + validate so we never send `undefined` into bigint filters.
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
      <main className="p-6 max-w-4xl">
        <div className="mb-4">
          <Link href="/flavors" className="underline text-sm">
            Back to flavors
          </Link>
        </div>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
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
      <main className="p-6 max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <Link href="/flavors" className="underline text-sm">
              Back to flavors
            </Link>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Editing ID: {String(flavor.id)}
          </div>
        </div>
        <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
          {stepsError.message}
        </div>
      </main>
    );
  }

  const flavorSteps = (steps ?? []) as FlavorStepRow[];

  return (
    <main className="p-6 max-w-6xl min-w-0">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link href="/flavors" className="underline text-sm">
            Back to humor flavors
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-3 gap-y-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 break-words">
              {flavor.slug ?? "Untitled flavor"}
            </h1>
            <FlavorDeleteButton id={String(flavorIdNum)} />
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Manage flavor details, prompt-chain steps, testing, and generated
            caption history.
          </p>
        </div>
        <div className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          Flavor ID: {String(flavor.id)}
        </div>
      </div>

      <section className="mb-10">
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Flavor details</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Update the flavor identity and description.
          </p>
        </div>
        <FlavorEditForm
          id={String(flavorIdNum)}
          slug={flavor.slug ?? null}
          description={flavor.description ?? null}
        />
      </section>

      <section className="mb-10">
        <FlavorStepsManager
          flavorId={String(flavorIdNum)}
          steps={flavorSteps}
        />
      </section>

      <section className="mb-10">
        <FlavorTestForm
          flavorId={String(flavorIdNum)}
          flavorSlug={flavor.slug ?? null}
        />
      </section>

      <section className="min-w-0">
        <FlavorCaptions
          flavorId={String(flavorIdNum)}
          flavorSlug={flavor.slug}
        />
      </section>
    </main>
  );
}

