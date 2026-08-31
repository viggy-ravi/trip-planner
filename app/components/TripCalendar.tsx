"use client";

import { Activity } from "../types";
import ActivityListItem from "./ActivityListItem";
import ActivityModal from "./ActivityModal";
import Button from "./ui/Button";
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

function formatDayHeading(dayKey: string, showMonth: boolean): string {
  const d = new Date(`${dayKey}T00:00:00Z`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: showMonth ? "short" : undefined,
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
  const [showAddActivity, setShowAddActivity] = useState(false);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Itinerary</h2>
        <Button size="sm" onClick={() => setShowAddActivity(true)}>+ Add Activity</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
        {days.map((day, i) => (
          <div key={day} className="border border-gray-200 rounded-lg p-3 min-h-[220px] bg-gray-50">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              {formatDayHeading(day, i === 0 || day.endsWith("-01"))}
            </div>
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
              <p className="text-xs text-gray-400">No activities</p>
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

      {showAddActivity && (
        <ActivityModal
          tripId={tripId}
          defaultDate={toDateInputValue(startDate)}
          onSave={(newActivity) => {
            onActivityAdd(newActivity);
            setShowAddActivity(false);
          }}
          onClose={() => setShowAddActivity(false)}
        />
      )}
    </div>
  );
}
