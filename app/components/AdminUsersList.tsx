"use client";

import { useState } from "react";
import Button from "./ui/Button";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  isAdmin: boolean;
}

export default function AdminUsersList({
  users: initialUsers,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: number;
}) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [error, setError] = useState("");

  async function handleToggleAdmin(user: AdminUser) {
    setError("");
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to update admin status");
      return;
    }
    const updated = await response.json();
    setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin — Users</h1>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id} className="px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </div>
            <div className="flex items-center gap-3">
              {user.isAdmin && (
                <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  Admin
                </span>
              )}
              {user.id === currentUserId ? (
                <span className="text-xs text-gray-400">You</span>
              ) : (
                <Button
                  size="sm"
                  variant={user.isAdmin ? "secondary" : "primary"}
                  onClick={() => handleToggleAdmin(user)}
                >
                  {user.isAdmin ? "Revoke admin" : "Make admin"}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
