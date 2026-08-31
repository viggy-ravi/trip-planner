"use client";

import Link from "next/link";
import { Trip, Activity, Note, TripMember } from "../types";
import TripCalendar from "./TripCalendar";
import NotesSidebar from "./NotesSidebar";
import TripSettingsPanel from "./TripSettingsPanel";
import InvitePopover from "./InvitePopover";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatDate(dateStr: string): string {
    return new Date(`${dateStr}T00:00:00Z`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default function TripDetail({
    trip,
    canDelete,
}: {
    trip: Trip & { activities: Activity[]; notes: Note[]; members: TripMember[] };
    canDelete: boolean;
}) {
    const router = useRouter()
    const [deleteError, setDeleteError] = useState("");

    async function handleDeleteTrip(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setDeleteError("");
        const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });

        if (!response.ok) {
            const error = await response.json();
            setDeleteError(error.error ?? "Failed to delete trip");
            return;
        }

        router.push("/")
    }

    const [name, setName] = useState(trip.name);
    const [destination, setDestination] = useState(trip.destination);
    const [startDate, setStartDate] = useState(trip.startDate.toISOString().split("T")[0]);
    const [endDate, setEndDate] = useState(trip.endDate.toISOString().split("T")[0]);
    const [imageUrl, setImageUrl] = useState(trip.imageUrl ?? "");
    const [showSettings, setShowSettings] = useState(false);
    const [showInvite, setShowInvite] = useState(false);

    async function handleEditTrip(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, destination, startDate, endDate, imageUrl }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to update trip:", error);
            return;
        }
        setShowSettings(false);
    }

    const [activities, setActivities] = useState<Activity[]>(trip.activities);

    function handleActivityAdd(newActivity: Activity) {
        setActivities([...activities, newActivity]);
    }

    function handleActivityUpdate(updated: Activity) {
        setActivities(activities.map((a) => (a.id === updated.id ? updated : a)));
    }

    function handleActivityDelete(id: number) {
        setActivities(activities.filter((a) => a.id !== id));
    }

    const [notes, setNotes] = useState<Note[]>(trip.notes);

    function handleNoteAdd(newNote: Note) {
        setNotes([...notes, newNote]);
    }

    function handleNoteUpdate(updated: Note) {
        setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
    }

    function handleNoteDelete(id: number) {
        setNotes(notes.filter((n) => n.id !== id));
    }

    const [members, setMembers] = useState<TripMember[]>(trip.members);

    function handleMemberInvited(newMember: TripMember) {
        setMembers([...members, newMember]);
        setShowInvite(false);
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                ← Back to Trips
            </Link>

            <div className="flex items-start justify-between mt-2 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                    <p className="text-gray-600">{destination}</p>
                    <p className="text-sm text-gray-500 mt-1">
                        {formatDate(startDate)} – {formatDate(endDate)}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <div className="relative">
                        <button
                            onClick={() => setShowInvite((v) => !v)}
                            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
                            aria-label="Invite a collaborator"
                            title="Invite a collaborator"
                        >
                            ✉️
                        </button>
                        {showInvite && (
                            <InvitePopover
                                tripId={trip.id}
                                onInvited={handleMemberInvited}
                                onClose={() => setShowInvite(false)}
                            />
                        )}
                    </div>
                    <button
                        onClick={() => setShowSettings(true)}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-lg"
                        aria-label="Trip settings"
                        title="Trip settings"
                    >
                        ⚙️
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 min-w-0">
                    <TripCalendar
                        tripId={trip.id}
                        startDate={trip.startDate}
                        endDate={trip.endDate}
                        activities={activities}
                        onActivityAdd={handleActivityAdd}
                        onActivityUpdate={handleActivityUpdate}
                        onActivityDelete={handleActivityDelete}
                    />
                </div>
                <div className="lg:w-72 shrink-0">
                    <NotesSidebar
                        tripId={trip.id}
                        notes={notes}
                        onNoteAdd={handleNoteAdd}
                        onNoteUpdate={handleNoteUpdate}
                        onNoteDelete={handleNoteDelete}
                    />
                </div>
            </div>

            {showSettings && (
                <TripSettingsPanel
                    name={name}
                    setName={setName}
                    destination={destination}
                    setDestination={setDestination}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    imageUrl={imageUrl}
                    setImageUrl={setImageUrl}
                    onSave={handleEditTrip}
                    canDelete={canDelete}
                    onDelete={handleDeleteTrip}
                    deleteError={deleteError}
                    members={members}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}
