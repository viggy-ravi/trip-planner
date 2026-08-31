"use client";

import { TripMember } from "../types";
import { useState } from "react";

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\s,]+/)
    .map((email) => email.trim())
    .filter(Boolean);
}

export default function InvitePopover({
  tripId,
  isOwner,
  allowMemberInvites,
  onAllowMemberInvitesChange,
  onInvited,
  onClose,
}: {
  tripId: number;
  isOwner: boolean;
  allowMemberInvites: boolean;
  onAllowMemberInvitesChange: (allow: boolean) => void;
  onInvited: (members: TripMember[]) => void;
  onClose: () => void;
}) {
  const [emailsInput, setEmailsInput] = useState("");
  const [errors, setErrors] = useState<{ email: string; error: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState("");

  async function handleInvite(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage("");

    const emails = parseEmails(emailsInput);
    if (emails.length === 0) return;

    const response = await fetch(`/api/trips/${tripId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    if (!response.ok) {
      const error = await response.json();
      setErrors([{ email: "", error: error.error ?? "Failed to invite collaborators" }]);
      return;
    }

    const { invited, errors: inviteErrors } = await response.json();
    if (invited.length > 0) {
      onInvited(invited);
      setSuccessMessage(`Invited ${invited.length} ${invited.length === 1 ? "person" : "people"}`);
    }
    setErrors(inviteErrors);
    setEmailsInput("");
  }

  async function handleToggleAllowMemberInvites() {
    const next = !allowMemberInvites;
    onAllowMemberInvitesChange(next);
    const response = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowMemberInvites: next }),
    });
    if (!response.ok) {
      onAllowMemberInvitesChange(!next);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
        <div className="text-sm font-semibold text-gray-900 mb-2">Invite by email</div>
        <form onSubmit={handleInvite} className="flex flex-col gap-2">
          <textarea
            value={emailsInput}
            onChange={(e) => setEmailsInput(e.target.value)}
            placeholder="Email addresses, separated by commas or new lines"
            rows={2}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-400"
            required
          />
          <button
            type="submit"
            className="bg-gray-900 text-white text-sm font-medium px-3 py-1.5 rounded hover:bg-gray-700 self-start"
          >
            Invite
          </button>
        </form>
        {successMessage && <p className="text-sm text-green-700 mt-2">{successMessage}</p>}
        {errors.map((e, i) => (
          <p key={i} className="text-sm text-red-600 mt-1">
            {e.email ? `${e.email}: ${e.error}` : e.error}
          </p>
        ))}

        {isOwner && (
          <label className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={allowMemberInvites}
              onChange={handleToggleAllowMemberInvites}
              className="rounded"
            />
            Any member can invite others
          </label>
        )}
      </div>
    </>
  );
}
