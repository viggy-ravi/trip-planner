"use client";

import { Activity } from "../types";
import { PencilIcon, TrashIcon } from "./Icons";
import ActivityModal from "./ActivityModal";
import { useState } from "react";

function formatTime(time: Date | null): string {
  if (!time) return "";
  return time.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export default function ActivityListItem({
  activity,
  onUpdate,
  onDelete,
}: {
  activity: Activity;
  onUpdate: (updated: Activity) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

  async function handleDeleteActivity(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const response = await fetch(`/api/activities/${activity.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Failed to delete activity");
      return;
    }
    onDelete(activity.id);
  }

  return (
    <li className="relative border border-gray-200 rounded-lg p-2.5 bg-white group">
      <span className="text-xs font-medium text-gray-900 break-words block pr-1">{activity.title}</span>
      {(activity.startTime || activity.location) && (
        <div className="text-[11px] text-gray-500 mt-0.5">
          {formatTime(activity.startTime)}
          {activity.startTime && activity.location && " · "}
          {activity.location}
        </div>
      )}
      {activity.url && (
        <a
          href={activity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-blue-600 hover:underline block mt-0.5 truncate"
        >
          {activity.url}
        </a>
      )}
      {error && <div className="text-[11px] text-red-600 mt-0.5">{error}</div>}
      {/* `hidden` (not opacity) so these take up no layout space until hovered. */}
      <span className="hidden group-hover:flex items-center gap-0.5 absolute top-1 right-1 bg-white/95 rounded-full">
        <button onClick={() => setIsEditing(true)} aria-label="Edit activity" className="text-gray-400 hover:text-gray-900 p-1">
          <PencilIcon className="w-3 h-3" />
        </button>
        <form onSubmit={handleDeleteActivity}>
          <button type="submit" aria-label="Delete activity" className="text-gray-400 hover:text-red-600 p-1">
            <TrashIcon className="w-3 h-3" />
          </button>
        </form>
      </span>

      {isEditing && (
        <ActivityModal
          activity={activity}
          onSave={(updated) => {
            onUpdate(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </li>
  );
}
