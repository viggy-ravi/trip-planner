"use client";

import { Activity } from "../types";
import ActivityListItem from "./ActivityListItem";
import { toDateInputValue } from "@/lib/dates";
import { useState } from "react";

// Builds the list of day-keys ("YYYY-MM-DD") spanning the trip, inclusive of
// both endpoints. Uses toDateInputValue's UTC-based formatting throughout so
// this can't drift a day off from how activity dates are stored/compared.
function tripDayKeys(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const cursor = new Date(startDate);
  const endKey = toDateInputValue(endDate);
  while (toDateInputValue(cursor) <= endKey) {
    days.push(toDateInputValue(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
}

function formatDayHeading(dayKey: string): string {
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export default function TripCalendar({
  tripId,
  startDate,
  endDate,
  activities,
  onActivityAdd,
  onActivityUpdate,
  onActivityDelete,
}: {
  tripId: number;
  startDate: Date;
  endDate: Date;
  activities: Activity[];
  onActivityAdd: (newActivity: Activity) => void;
  onActivityUpdate: (updated: Activity) => void;
  onActivityDelete: (id: number) => void;
}) {
  const days = tripDayKeys(startDate, endDate);

  const activitiesByDay: Record<string, Activity[]> = {};
  const unscheduled: Activity[] = [];
  for (const activity of activities) {
    if (!activity.date) {
      unscheduled.push(activity);
      continue;
    }
    const key = toDateInputValue(activity.date);
    (activitiesByDay[key] ??= []).push(activity);
  }
  for (const key in activitiesByDay) {
    activitiesByDay[key].sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.getTime() - b.startTime.getTime();
    });
  }

  const [newActivityTitle, setNewActivityTitle] = useState("");
  const [newActivityDescription, setNewActivityDescription] = useState("");
  const [newActivityDate, setNewActivityDate] = useState("");
  const [newActivityStartTime, setNewActivityStartTime] = useState("");
  const [newActivityEndTime, setNewActivityEndTime] = useState("");
  const [newActivityLocation, setNewActivityLocation] = useState("");
  const [newActivityUrl, setNewActivityUrl] = useState("");

  async function handleAddActivity(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const response = await fetch(`/api/trips/${tripId}/activities`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newActivityTitle,
        description: newActivityDescription,
        date: newActivityDate,
        startTime: newActivityStartTime,
        endTime: newActivityEndTime,
        location: newActivityLocation,
        url: newActivityUrl,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to add activity:", error);
      return;
    }
    const newActivity = await response.json();

    // date/startTime/endTime are optional — `new Date(null)` silently
    // becomes the 1970 epoch instead of staying null, so guard each one.
    onActivityAdd({
      ...newActivity,
      date: newActivity.date ? new Date(newActivity.date) : null,
      startTime: newActivity.startTime ? new Date(newActivity.startTime) : null,
      endTime: newActivity.endTime ? new Date(newActivity.endTime) : null,
    });

    setNewActivityTitle("");
    setNewActivityDescription("");
    setNewActivityDate("");
    setNewActivityStartTime("");
    setNewActivityEndTime("");
    setNewActivityLocation("");
    setNewActivityUrl("");
  }

  const inputStyles =
    "border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[120px] focus:outline-none focus:ring-2 focus:ring-gray-400";
  const sectionHeaderStyles = "text-lg font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-200";

  return (
    <div>
      <h2 className={sectionHeaderStyles}>Itinerary</h2>

      <div className="space-y-3 mb-4">
        {days.map((day) => (
          <div key={day} className="border border-gray-200 rounded-lg p-3">
            <div className="text-sm font-semibold text-gray-900 mb-2">{formatDayHeading(day)}</div>
            {activitiesByDay[day]?.length ? (
              <ul className="space-y-2">
                {activitiesByDay[day].map((activity) => (
                  <ActivityListItem
                    key={activity.id}
                    activity={activity}
                    onUpdate={onActivityUpdate}
                    onDelete={onActivityDelete}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No activities planned</p>
            )}
          </div>
        ))}
      </div>

      {unscheduled.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Unscheduled</div>
          <ul className="space-y-2">
            {unscheduled.map((activity) => (
              <ActivityListItem
                key={activity.id}
                activity={activity}
                onUpdate={onActivityUpdate}
                onDelete={onActivityDelete}
              />
            ))}
          </ul>
        </div>
      )}

      <form onSubmit={handleAddActivity} className="flex flex-wrap gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <input
          type="text" value={newActivityTitle}
          placeholder="Title"
          onChange={(e) => setNewActivityTitle(e.target.value)}
          className={inputStyles}
          required
        />
        <input
          type="text" value={newActivityDescription}
          placeholder="Description"
          onChange={(e) => setNewActivityDescription(e.target.value)}
          className={inputStyles}
        />
        <input
          type="date" value={newActivityDate}
          placeholder="Date"
          onChange={(e) => setNewActivityDate(e.target.value)}
          className={inputStyles}
        />
        <input
          type="time" value={newActivityStartTime}
          placeholder="Start time"
          onChange={(e) => setNewActivityStartTime(e.target.value)}
          className={inputStyles}
        />
        <input
          type="time" value={newActivityEndTime}
          placeholder="End time"
          onChange={(e) => setNewActivityEndTime(e.target.value)}
          className={inputStyles}
        />
        <input
          type="text" value={newActivityLocation}
          placeholder="Location"
          onChange={(e) => setNewActivityLocation(e.target.value)}
          className={inputStyles}
        />
        <input
          type="text" value={newActivityUrl}
          placeholder="URL"
          onChange={(e) => setNewActivityUrl(e.target.value)}
          className={inputStyles}
        />
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-700"
        >
          Add Activity
        </button>
      </form>
    </div>
  );
}
