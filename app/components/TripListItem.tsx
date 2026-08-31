import Link from "next/link";
import { Trip } from "../types";

export default function TripListItem({ trip }: { trip: Trip }) {
  return (
    <li className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
      <Link href={`/trips/${trip.id}`}>
        {trip.imageUrl ? (
          <img
            src={trip.imageUrl}
            alt={trip.destination}
            className="w-full h-32 object-cover"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-400 text-3xl">
            ✈
          </div>
        )}
        <div className="px-4 py-3">
          <div className="font-medium text-gray-900">{trip.name}</div>
          <div className="text-sm text-gray-500">{trip.destination}</div>
        </div>
      </Link>
    </li>
  );
}