"use client";

import { Activity } from "../types";
import { toDateInputValue, toTimeInputValue } from "@/lib/dates";
import { useState } from "react";

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

  const [title, setTitle] = useState(activity.title);
  const [description, setDescription] = useState(activity.description ?? "");
  const [date, setDate] = useState(toDateInputValue(activity.date));
  const [startTime, setStartTime] = useState(toTimeInputValue(activity.startTime));
  const [endTime, setEndTime] = useState(toTimeInputValue(activity.endTime));
  const [location, setLocation] = useState(activity.location ?? "");
  const [url, setUrl] = useState(activity.url ?? "");

  async function handleEditActivity(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/activities/${activity.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, date, startTime, endTime, location, url }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to update activity:", error);
      return;
    }
    const updatedActivity = await response.json();
    onUpdate({
      ...updatedActivity,
      date: updatedActivity.date ? new Date(updatedActivity.date) : null,
      startTime: updatedActivity.startTime ? new Date(updatedActivity.startTime) : null,
      endTime: updatedActivity.endTime ? new Date(updatedActivity.endTime) : null,
    });
    setIsEditing(false);
  }

  async function handleDeleteActivity(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/activities/${activity.id}`, { method: "DELETE" });
    if (!response.ok) {
      console.error("Failed to delete activity");
      return;
    }
    onDelete(activity.id);
  }

  const inputStyles =
    "border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-gray-400";

  if (isEditing) {
    return (
      <li className="border border-gray-200 rounded-lg p-3">
        <form onSubmit={handleEditActivity} className="flex flex-wrap gap-2">
          <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputStyles} />
          <input type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className={inputStyles} />
          <input type="date" placeholder="Date" value={date} onChange={(e) => setDate(e.target.value)} className={inputStyles} />
          <input type="time" placeholder="Start time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={inputStyles} />
          <input type="time" placeholder="End time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={inputStyles} />
          <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputStyles} />
          <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className={inputStyles} />
          <button
            type="submit"
            className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-700"
          >
            Save
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between gap-2">
      <span className="text-sm text-gray-900">
        {activity.title}
        {activity.location && <span className="text-gray-500"> — {activity.location}</span>}
      </span>
      <span className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setIsEditing(true)}
          className="text-xs text-gray-500 hover:text-gray-900"
        >
          Edit
        </button>
        <form onSubmit={handleDeleteActivity} className="inline">
          <button type="submit" className="text-xs text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </span>
    </li>
  );
}
