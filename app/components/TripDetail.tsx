"use client";

import Link from "next/link";
import { Trip, Activity, Note, TripMember } from "../types";
import TripCalendar from "./TripCalendar";
import NotesSidebar from "./NotesSidebar";
import InvitePopover from "./InvitePopover";
import ConfirmDialog from "./ConfirmDialog";
import { PlusIcon, TrashIcon } from "./Icons";
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
    trip: Trip & { activities: Activity[]; notes: Note[]; members: TripMember[]; inviteToken: string | null };
    isOwner: boolean;
}) {
    const [showInvite, setShowInvite] = useState(false);
    const [allowMemberInvites, setAllowMemberInvites] = useState(trip.allowMemberInvites);
    const [inviteToken, setInviteToken] = useState(trip.inviteToken);

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
    const [removingMember, setRemovingMember] = useState<TripMember | null>(null);
    const [removeError, setRemoveError] = useState("");

    function handleMembersInvited(newMembers: TripMember[]) {
        setMembers([...members, ...newMembers]);
    }

    async function handleRemoveMember() {
        if (!removingMember) return;
        setRemoveError("");
        const response = await fetch(`/api/trips/${trip.id}/members/${removingMember.userId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            const body = await response.json().catch(() => ({}));
            setRemoveError(body.error ?? "Failed to remove member");
            return;
        }
        setMembers(members.filter((m) => m.id !== removingMember.id));
        setRemovingMember(null);
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
                                        inviteToken={inviteToken}
                                        onInviteTokenChange={setInviteToken}
                                    />
                                )}
                            </div>
                        </div>
                        <ul className="space-y-1 text-sm text-gray-700">
                            {members.map((member) => (
                                <li key={member.id} className="flex items-center justify-between gap-2 group">
                                    <span>
                                        {member.user.name} ({member.user.email}) — {member.role}
                                    </span>
                                    {isOwner && member.role !== "OWNER" && (
                                        <button
                                            onClick={() => setRemovingMember(member)}
                                            aria-label={`Remove ${member.user.name}`}
                                            title={`Remove ${member.user.name}`}
                                            className="text-gray-300 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                        {removeError && <p className="text-xs text-red-600 mt-2">{removeError}</p>}
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

            {removingMember && (
                <ConfirmDialog
                    title="Remove member?"
                    message={`Remove ${removingMember.user.name} from this trip? They'll lose access immediately.`}
                    onConfirm={handleRemoveMember}
                    onCancel={() => setRemovingMember(null)}
                />
            )}
        </div>
    );
}
