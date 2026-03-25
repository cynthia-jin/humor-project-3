import FlavorCreateForm from "@/app/(app)/flavors/FlavorCreateForm";

export default function NewFlavorPage() {
  return (
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Create Humor Flavor</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Add a new flavor and then you can create its steps.
      </p>
      <FlavorCreateForm />
    </main>
  );
}

