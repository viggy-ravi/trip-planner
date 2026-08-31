"use client";

import { Activity } from "../types";
import { toDateInputValue, toTimeInputValue } from "@/lib/dates";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useState } from "react";

// One modal for both create and edit: pass `activity` to edit it (PATCHes
// /api/activities/[id]), omit it to create a new one under `tripId` (POSTs
// /api/trips/[id]/activities).
export default function ActivityModal({
  tripId,
  activity,
  defaultDate,
  onSave,
  onClose,
}: {
  tripId?: number;
  activity?: Activity;
  defaultDate?: string;
  onSave: (activity: Activity) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState(activity?.title ?? "");
  const [description, setDescription] = useState(activity?.description ?? "");
  const [date, setDate] = useState(activity ? toDateInputValue(activity.date) : defaultDate ?? "");
  const [startTime, setStartTime] = useState(activity ? toTimeInputValue(activity.startTime) : "");
  const [endTime, setEndTime] = useState(activity ? toTimeInputValue(activity.endTime) : "");
  const [location, setLocation] = useState(activity?.location ?? "");
  const [url, setUrl] = useState(activity?.url ?? "");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const response = await fetch(
      activity ? `/api/activities/${activity.id}` : `/api/trips/${tripId}/activities`,
      {
        method: activity ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, date, startTime, endTime, location, url }),
      }
    );
    if (!response.ok) {
      const err = await response.json();
      setError(err.error ?? "Failed to save activity");
      return;
    }
    const saved = await response.json();
    onSave({
      ...saved,
      date: saved.date ? new Date(saved.date) : null,
      startTime: saved.startTime ? new Date(saved.startTime) : null,
      endTime: saved.endTime ? new Date(saved.endTime) : null,
    });
  }

  const labelStyles = "text-xs font-medium text-gray-500 mt-2";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {activity ? "Edit Activity" : "Add Activity"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-1">
            <label className={labelStyles}>Title</label>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" required />

            <label className={labelStyles}>Description</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full"
            />

            <label className={labelStyles}>Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full" />

            <label className={labelStyles}>Start time</label>
            <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full" />

            <label className={labelStyles}>End time</label>
            <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full" />

            <label className={labelStyles}>Location</label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full"
            />

            <label className={labelStyles}>URL</label>
            <Input type="text" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full" />

            <Button type="submit" className="mt-3">
              {activity ? "Save Changes" : "Add Activity"}
            </Button>
          </form>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </>
  );
}
