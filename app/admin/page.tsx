import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersList from "@/app/components/AdminUsersList";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return (
      <div className="max-w-sm mx-auto mt-16 px-4 text-center">
        <div className="border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Not authorized</h1>
          <p className="text-sm text-gray-600">This page is only available to site admins.</p>
        </div>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, isAdmin: true },
  });

  return <AdminUsersList users={users} currentUserId={Number(session.user.id)} />;
}
