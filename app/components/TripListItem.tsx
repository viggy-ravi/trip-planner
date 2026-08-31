"use client";

import Link from "next/link";
import { Trip } from "../types";
import { PencilIcon, TrashIcon, IconButton } from "./Icons";
import EditTripModal from "./EditTripModal";
import { useState } from "react";

export default function TripListItem({
  trip,
  canManage,
  onUpdate,
  onDelete,
}: {
  trip: Trip;
  canManage: boolean;
  onUpdate: (updated: Trip) => void;
  onDelete: (id: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${trip.name}"? This can't be undone.`)) return;
    const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (!response.ok) {
      console.error("Failed to delete trip");
      return;
    }
    onDelete(trip.id);
  }

  return (
    <li className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white relative">
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

      {canManage && (
        <div className="absolute top-2 right-2 flex gap-1.5">
          <IconButton label="Edit trip" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </IconButton>
          <IconButton label="Delete trip" onClick={handleDelete}>
            <TrashIcon className="w-4 h-4" />
          </IconButton>
        </div>
      )}

      {isEditing && (
        <EditTripModal
          trip={trip}
          onSave={(updated) => {
            onUpdate(updated);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
        />
      )}
    </li>
  );
}
