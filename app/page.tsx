import { Trip } from "./types";

const trips: Trip[] = [
  { id: 1, name: "Summer in Japan", destination: "Tokyo, Japan", startDate: "2026-09-10" },
  { id: 2, name: "Ski Trip", destination: "Aspen, Colorado", startDate: "2027-01-05" },
];

export default function Home() {
  return (
    <div>
      <h1>My Trips</h1>
      <ul>
        {trips.map((trip) => (
          <li key={trip.id}>
            {trip.name} — {trip.destination}
          </li>
        ))}
      </ul>
    </div>
  );
}
