"use client";

import { Trip } from "../types";
import TripListItem from "./TripListItem";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { useState } from "react";

type TripWithCanManage = Trip & { canManage: boolean };

export default function TripsPage({ initialTrips }: { initialTrips: TripWithCanManage[] }) {
  const [trips, setTrips] = useState<TripWithCanManage[]>(initialTrips);

  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");
  const [newTripStartDate, setNewTripStartDate] = useState("");
  const [newTripEndDate, setNewTripEndDate] = useState("");
  const [newTripImageUrl, setNewTripImageUrl] = useState("");
  const [addTripError, setAddTripError] = useState("");

  async function handleAddTrip(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddTripError("");

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTripName,
        destination: newTripDestination,
        startDate: newTripStartDate,
        endDate: newTripEndDate,
        imageUrl: newTripImageUrl,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      setAddTripError(error.error ?? "Failed to add trip");
      return;
    }
    const newTrip = await response.json();

    setTrips([
      ...trips,
      {
        ...newTrip,
        startDate: new Date(newTrip.startDate),
        endDate: new Date(newTrip.endDate),
        canManage: true, // creating a trip always makes you its OWNER
      },
    ]);
    setNewTripName("");
    setNewTripDestination("");
    setNewTripStartDate("");
    setNewTripEndDate("");
    setNewTripImageUrl("");
  }

  function handleTripUpdate(updated: Trip) {
    setTrips(trips.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  }

  function handleTripDelete(id: number) {
    setTrips(trips.filter((t) => t.id !== id));
  }

  const sortedTrips = [...trips].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trips</h1>

      <form
        onSubmit={handleAddTrip}
        className="flex flex-wrap gap-2 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <label className="sr-only" htmlFor="new-trip-name">Trip name</label>
        <Input
          id="new-trip-name"
          type="text"
          placeholder="Trip name"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
          className="flex-1 min-w-[140px]"
          required
        />
        <label className="sr-only" htmlFor="new-trip-destination">Destination</label>
        <Input
          id="new-trip-destination"
          type="text"
          placeholder="Destination"
          value={newTripDestination}
          onChange={(e) => setNewTripDestination(e.target.value)}
          className="flex-1 min-w-[140px]"
          required
        />
        <label className="sr-only" htmlFor="new-trip-start-date">Start date</label>
        <Input
          id="new-trip-start-date"
          type="date"
          value={newTripStartDate}
          onChange={(e) => setNewTripStartDate(e.target.value)}
          className="flex-1 min-w-[140px]"
          required
        />
        <label className="sr-only" htmlFor="new-trip-end-date">End date</label>
        <Input
          id="new-trip-end-date"
          type="date"
          value={newTripEndDate}
          onChange={(e) => setNewTripEndDate(e.target.value)}
          className="flex-1 min-w-[140px]"
          required
        />
        <label className="sr-only" htmlFor="new-trip-image-url">Image URL (optional)</label>
        <Input
          id="new-trip-image-url"
          type="url"
          placeholder="Image URL (optional)"
          value={newTripImageUrl}
          onChange={(e) => setNewTripImageUrl(e.target.value)}
          className="flex-1 min-w-[140px]"
        />
        <Button type="submit">Add Trip</Button>
      </form>
      {addTripError && <p className="text-sm text-red-600 mb-6">{addTripError}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {sortedTrips.map((trip) => (
          <TripListItem
            key={trip.id}
            trip={trip}
            canManage={trip.canManage}
            onUpdate={handleTripUpdate}
            onDelete={handleTripDelete}
          />
        ))}
      </ul>
    </div>
  );
}
