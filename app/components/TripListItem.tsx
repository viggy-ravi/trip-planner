"use client";

import Link from "next/link";
import { Trip } from "../types";
import { PencilIcon, TrashIcon, IconButton } from "./Icons";
import EditTripModal from "./EditTripModal";
import ConfirmDialog from "./ConfirmDialog";
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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function handleDelete() {
    setConfirmingDelete(false);
    setDeleteError("");
    const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setDeleteError(body.error ?? "Failed to delete trip");
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
          {deleteError && <div className="text-xs text-red-600 mt-1">{deleteError}</div>}
        </div>
      </Link>

      {canManage && (
        <div className="absolute top-2 right-2 flex gap-1.5">
          <IconButton label="Edit trip" onClick={() => setIsEditing(true)}>
            <PencilIcon className="w-4 h-4" />
          </IconButton>
          <IconButton label="Delete trip" onClick={() => setConfirmingDelete(true)}>
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

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete trip?"
          message={`Delete "${trip.name}"? This can't be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </li>
  );
}
