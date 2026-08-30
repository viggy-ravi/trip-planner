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

  if (isEditing) {
    return (
      <li>
        <form onSubmit={handleEditActivity}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
          <button type="submit">Save</button>
        </form>
      </li>
    );
  }

  return (
    <li>
      {activity.title}
      {activity.location && ` — ${activity.location}`}
      {" "}
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {" "}
      <form onSubmit={handleDeleteActivity} style={{ display: "inline" }}>
        <button type="submit">Delete</button>
      </form>
    </li>
  );
}
