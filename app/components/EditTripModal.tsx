"use client";

import { Trip } from "../types";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useState } from "react";

export default function EditTripModal({
  trip,
  onSave,
  onClose,
}: {
  trip: Trip;
  onSave: (updated: Trip) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [startDate, setStartDate] = useState(trip.startDate.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(trip.endDate.toISOString().split("T")[0]);
  const [imageUrl, setImageUrl] = useState(trip.imageUrl ?? "");
  const [error, setError] = useState("");

  async function handleSave(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const response = await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, destination, startDate, endDate, imageUrl }),
    });
    if (!response.ok) {
      const err = await response.json();
      setError(err.error ?? "Failed to update trip");
      return;
    }
    const updatedTrip = await response.json();
    onSave({
      ...updatedTrip,
      startDate: new Date(updatedTrip.startDate),
      endDate: new Date(updatedTrip.endDate),
    });
  }

  const labelStyles = "text-xs font-medium text-gray-500 mt-2";

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Edit Trip</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <form onSubmit={handleSave} className="flex flex-col gap-1">
            <label className={labelStyles}>Name</label>
            <Input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full" required />

            <label className={labelStyles}>Destination</label>
            <Input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full"
              required
            />

            <label className={labelStyles}>Start date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
              required
            />

            <label className={labelStyles}>End date</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full" required />

            <label className={labelStyles}>Image URL</label>
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full"
              placeholder="https://..."
            />

            <Button type="submit" className="mt-3">Save Changes</Button>
          </form>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>
      </div>
    </>
  );
}
