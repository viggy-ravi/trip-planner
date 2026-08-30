"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null } | null;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (!user) {
    return (
      <nav>
        <Link href="/login">Log In</Link> <Link href="/signup">Sign Up</Link>
      </nav>
    );
  }

  return (
    <nav>
      <span>Logged in as {user.name}</span>{" "}
      <button onClick={handleLogout}>Log Out</button>
    </nav>
  );
}
