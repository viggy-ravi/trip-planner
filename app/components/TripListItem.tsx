import { Trip } from "../types";

export default function TripListItem({ trip }: { trip: Trip }) {
  return (
    <li>
      {trip.name} — {trip.destination}
    </li>
  );
}