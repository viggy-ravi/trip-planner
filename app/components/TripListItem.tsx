import Link from "next/link";
import { Trip } from "../types";

export default function TripListItem({ trip }: { trip: Trip }) {
  return (
    <li>
      <Link href={`/trips/${trip.id}`}>
        {trip.name} — {trip.destination}
      </Link>
    </li>
  );
}