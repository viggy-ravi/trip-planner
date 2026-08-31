"use client";

import Link from "next/link";
import { Trip, Activity, Note, TripMember } from "../types";
import TripCalendar from "./TripCalendar";
import NotesSidebar from "./NotesSidebar";
import InvitePopover from "./InvitePopover";
import { PlusIcon } from "./Icons";
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
    isOwner,
}: {
    trip: Trip & { activities: Activity[]; notes: Note[]; members: TripMember[] };
    isOwner: boolean;
}) {
    const [showInvite, setShowInvite] = useState(false);
    const [allowMemberInvites, setAllowMemberInvites] = useState(trip.allowMemberInvites);

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

    function handleMembersInvited(newMembers: TripMember[]) {
        setMembers([...members, ...newMembers]);
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                ← Back to Trips
            </Link>

            <div className="mt-2 mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{trip.name}</h1>
                <p className="text-gray-600">{trip.destination}</p>
                <p className="text-sm text-gray-500 mt-1">
                    {formatDate(trip.startDate.toISOString().split("T")[0])} –{" "}
                    {formatDate(trip.endDate.toISOString().split("T")[0])}
                </p>
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

                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                            <div className="relative">
                                <button
                                    onClick={() => setShowInvite((v) => !v)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                                    aria-label="Invite a collaborator"
                                    title="Invite a collaborator"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                                {showInvite && (
                                    <InvitePopover
                                        tripId={trip.id}
                                        isOwner={isOwner}
                                        allowMemberInvites={allowMemberInvites}
                                        onAllowMemberInvitesChange={setAllowMemberInvites}
                                        onInvited={handleMembersInvited}
                                        onClose={() => setShowInvite(false)}
                                    />
                                )}
                            </div>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-700">
                            {members.map((member) => (
                                <li key={member.id}>
                                    {member.user.name} ({member.user.email}) — {member.role}
                                </li>
                            ))}
                        </ul>
                    </div>
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
        </div>
    );
}
