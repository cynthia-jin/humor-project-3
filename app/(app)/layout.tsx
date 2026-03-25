import Sidebar from "@/app/components/Sidebar";
import { requireSuperadmin } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSuperadmin();

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar userEmail={user.email ?? "Unknown user"} />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

