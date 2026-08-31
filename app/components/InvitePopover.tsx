"use client";

import { TripMember } from "../types";
import { useState } from "react";

export default function InvitePopover({
  tripId,
  onInvited,
  onClose,
}: {
  tripId: number;
  onInvited: (member: TripMember) => void;
  onClose: () => void;
}) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");

  async function handleInvite(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteError("");
    const response = await fetch(`/api/trips/${tripId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    if (!response.ok) {
      const error = await response.json();
      setInviteError(error.error ?? "Failed to invite collaborator");
      return;
    }
    const newMember = await response.json();
    onInvited(newMember);
    setInviteEmail("");
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="text-sm font-semibold text-gray-900 mb-2">Invite by email</div>
        <form onSubmit={handleInvite} className="flex gap-2">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Email address"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-0 focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <button
            type="submit"
            className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-gray-700 shrink-0"
          >
            Invite
          </button>
        </form>
        {inviteError && <p className="text-sm text-red-600 mt-2">{inviteError}</p>}
      </div>
    </>
  );
}
