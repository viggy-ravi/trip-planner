"use client";

import { Trip } from "./types";
import TripListItem from "./components/TripListItem";
import { useState } from "react";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([
    { id: 1, name: "Summer in Japan", destination: "Tokyo, Japan", startDate: "2026-09-10" },
    { id: 2, name: "Ski Trip", destination: "Aspen, Colorado", startDate: "2027-01-05" },
  ]);

  return (
    <div>
      <h1>My Trips</h1>
      <button
        onClick={() =>
          setTrips([
            ...trips,
            { id: Date.now(), name: "New Trip", destination: "TBD", startDate: "2027-06-01" },
          ])
        }
      >
        Add Trip
      </button>
      <ul>
        {trips.map((trip) => (
          <TripListItem key={trip.id} trip={trip} />
        ))}
      </ul>
    </div>
  );
}
