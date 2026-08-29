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

  async function handleAddTrip(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const response = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTripName,
        destination: newTripDestination,
        startDate: newTripStartDate,
        endDate: newTripEndDate,
      }),
    });
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
  }

  return (
    <div>
      <h1>My Trips</h1>
      <form onSubmit={handleAddTrip}>
        <input
          type="text"
          placeholder="Trip name"
          value={newTripName}
          onChange={(e) => setNewTripName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Destination"
          value={newTripDestination}
          onChange={(e) => setNewTripDestination(e.target.value)}
        />
        <input
          type="date"
          value={newTripStartDate}
          onChange={(e) => setNewTripStartDate(e.target.value)}
        />
        <input
          type="date"
          value={newTripEndDate}
          onChange={(e) => setNewTripEndDate(e.target.value)}
        />
        <button type="submit">Add Trip</button>
      </form>
      <ul>
        {trips.map((trip) => (
          <TripListItem key={trip.id} trip={trip} />
        ))}
      </ul>
    </div>
  );
}
