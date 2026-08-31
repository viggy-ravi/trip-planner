"use client";

import { Trip } from "../types";
import TripListItem from "./TripListItem";
import { useState } from "react";

export default function TripsPage({ initialTrips }: { initialTrips: Trip[] }) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);

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
      },
    ]);
    setNewTripName("");
    setNewTripDestination("");
    setNewTripStartDate("");
    setNewTripEndDate("");
    setNewTripImageUrl("");
  }

  const inputStyles =
    "border border-gray-300 rounded px-3 py-1.5 text-sm flex-1 min-w-[140px] focus:outline-none focus:ring-2 focus:ring-gray-400";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Trips</h1>

      <form
        onSubmit={handleAddTrip}
        className="flex flex-wrap gap-2 mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
      >
        <input
          type="text"
          placeholder="Trip name"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
          className={inputStyles}
          required
        />
        <input
          type="text"
          placeholder="Destination"
          value={newTripDestination}
          onChange={(e) => setNewTripDestination(e.target.value)}
          className={inputStyles}
          required
        />
        <input
          type="date"
          value={newTripStartDate}
          onChange={(e) => setNewTripStartDate(e.target.value)}
          className={inputStyles}
          required
        />
        <input
          type="date"
          value={newTripEndDate}
          onChange={(e) => setNewTripEndDate(e.target.value)}
          className={inputStyles}
          required
        />
        <input
          type="url"
          placeholder="Image URL (optional)"
          value={newTripImageUrl}
          onChange={(e) => setNewTripImageUrl(e.target.value)}
          className={inputStyles}
        />
        <button
          type="submit"
          className="bg-gray-900 text-white text-sm font-medium px-4 py-1.5 rounded hover:bg-gray-700"
        >
          Add Trip
        </button>
      </form>
      {addTripError && <p className="text-sm text-red-600 mb-6">{addTripError}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {trips.map((trip) => (
          <TripListItem key={trip.id} trip={trip} />
        ))}
      </ul>
    </div>
  );
}
