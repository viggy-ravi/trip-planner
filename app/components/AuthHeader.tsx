"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null; isAdmin?: boolean } | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <nav className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900">
          Trip Planner
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/login" className="text-gray-600 hover:text-gray-900">
            Log In
          </Link>
          <Link href="/signup" className="text-gray-600 hover:text-gray-900">
            Sign Up
          </Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
      <Link href="/" className="font-semibold text-gray-900">
        Trip Planner
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user.isAdmin && (
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">
            Admin
          </Link>
        )}
        <span className="text-gray-600">Logged in as {user.name}</span>
        <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
          Log Out
        </button>
      </div>
    </nav>
  );
}
