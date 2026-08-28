"use client";

import { Trip } from "./types";
import TripListItem from "./components/TripListItem";
import { useState } from "react";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([
    { id: 1, name: "Summer in Japan", destination: "Tokyo, Japan", startDate: "2026-09-10" },
    { id: 2, name: "Ski Trip", destination: "Aspen, Colorado", startDate: "2027-01-05" },
  ]);

  const [newTripName, setNewTripName] = useState("");
  const [newTripDestination, setNewTripDestination] = useState("");

  function handleAddTrip(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setTrips([
      ...trips,
      { id: Date.now(), name: newTripName, destination: newTripDestination, startDate: "2027-01-01" },
    ]);
    setNewTripName("");
    setNewTripDestination("");
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
