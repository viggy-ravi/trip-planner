"use client";

import { Trip, Activity, Note, TripMember } from "../types";
import ActivityListItem from "./ActivityListItem";
import NoteListItem from "./NoteListItem";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    const [isEditing, setIsEditing] = useState(false);

    async function handleEditTrip(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}`, { 
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, destination, startDate, endDate }),
        });
        const updatedTrip = await response.json();
        setIsEditing(false); 
    }

    const [activities, setActivities] = useState<Activity[]>(trip.activities);

    function handleActivityUpdate(updated: Activity) {
        setActivities(activities.map((a) => (a.id === updated.id ? updated : a)));
    }

    function handleActivityDelete(id: number) {
        setActivities(activities.filter((a) => a.id !== id));
    }

    const [newActivityTitle, setNewActivityTitle] = useState("");
    const [newActivityDescription, setNewActivityDescription] = useState("");
    const [newActivityDate, setNewActivityDate] = useState("");
    const [newActivityStartTime, setNewActivityStartTime] = useState("");
    const [newActivityEndTime, setNewActivityEndTime] = useState("");
    const [newActivityLocation, setNewActivityLocation] = useState("");
    const [newActivityUrl, setNewActivityUrl] = useState("");

    async function handleAddActivity(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newActivityTitle,
                description: newActivityDescription,
                date: newActivityDate,
                startTime: newActivityStartTime,
                endTime: newActivityEndTime,
                location: newActivityLocation,
                url: newActivityUrl,
            }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to add activity:", error);
            return;
        }
        const newActivity = await response.json();

        // date/startTime/endTime are optional — `new Date(null)` silently
        // becomes the 1970 epoch instead of staying null, so guard each one.
        setActivities([
            ...activities,
            {
                ...newActivity,
                date: newActivity.date ? new Date(newActivity.date) : null,
                startTime: newActivity.startTime ? new Date(newActivity.startTime) : null,
                endTime: newActivity.endTime ? new Date(newActivity.endTime) : null,
            },
        ]);

        setNewActivityTitle("");
        setNewActivityDescription("");
        setNewActivityDate("");
        setNewActivityStartTime("");
        setNewActivityEndTime("");
        setNewActivityLocation("");
        setNewActivityUrl("");
    }

    const [notes, setNotes] = useState<Note[]>(trip.notes);

    function handleNoteUpdate(updated: Note) {
        setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
    }

    function handleNoteDelete(id: number) {
        setNotes(notes.filter((n) => n.id !== id));
    }

    const [newNoteContent, setNewNoteContent] = useState("");

    async function handleAddNote(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}/notes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newNoteContent }),
        });
        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to add note:", error);
            return;
        }
        const newNote = await response.json();
        setNotes([...notes, newNote]);
        setNewNoteContent("");
    }

    const [members, setMembers] = useState<TripMember[]>(trip.members);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteError, setInviteError] = useState("");

    async function handleInvite(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setInviteError("");
        const response = await fetch(`/api/trips/${trip.id}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: inviteEmail }),
        });
        if (!response.ok) {
            const error = await response.json();
            setInviteError(error.error ?? "Failed to invite collaborator");
            return;
        }
        const newMember = await response.json();
        setMembers([...members, newMember]);
        setInviteEmail("");
    }

    return (
        <div>
            {isEditing ? (
                    <form onSubmit={handleEditTrip}>
                        <input 
                            type="text" value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <input 
                            type="text" value={destination} 
                            onChange={(e) => setDestination(e.target.value)} 
                        />
                        <input 
                            type="date" value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                        />
                        <input 
                            type="date" value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                        />
                        <button type="submit">Save</button>
                    </form>
                ) : (
                    <>
                        <h1>{name}</h1>
                        <p>{destination}</p>
                        <p>{new Date(startDate).toLocaleDateString()}</p>
                        <button onClick={() => setIsEditing(true)}>Edit</button>
                    </>
            )}

            {canDelete && (
                <form onSubmit={handleDeleteTrip}>
                    <button type="submit">Delete Trip</button>
                </form>
            )}
            {deleteError && <p>{deleteError}</p>}

            <h2>Members</h2>
            <ul>
                {members.map((member) => (
                    <li key={member.id}>
                        {member.user.name} ({member.user.email}) — {member.role}
                    </li>
                ))}
            </ul>

            <form onSubmit={handleInvite}>
                <input
                    type="email" value={inviteEmail}
                    placeholder="Invite by email"
                    onChange={(e) => setInviteEmail(e.target.value)}
                />
                <button type="submit">Invite</button>
            </form>
            {inviteError && <p>{inviteError}</p>}

            <h2>Activities</h2>
            <ul>
                {activities.map((activity) => (
                    <ActivityListItem
                        key={activity.id}
                        activity={activity}
                        onUpdate={handleActivityUpdate}
                        onDelete={handleActivityDelete}
                    />
                ))}
            </ul>

            <form onSubmit={handleAddActivity}>
                <input 
                    type="text" value={newActivityTitle} 
                    placeholder="Title" 
                    onChange={(e) => setNewActivityTitle(e.target.value)} 
                />
                <input 
                    type="text" value={newActivityDescription} 
                    placeholder="Description" 
                    onChange={(e) => setNewActivityDescription(e.target.value)} 
                />
                <input
                    type="date" value={newActivityDate}
                    placeholder="Date"
                    onChange={(e) => setNewActivityDate(e.target.value)}
                />
                <input
                    type="time" value={newActivityStartTime}
                    placeholder="Start time"
                    onChange={(e) => setNewActivityStartTime(e.target.value)}
                />
                <input
                    type="time" value={newActivityEndTime}
                    placeholder="End time"
                    onChange={(e) => setNewActivityEndTime(e.target.value)}
                />
                <input 
                    type="text" value={newActivityLocation} 
                    placeholder="Location" 
                    onChange={(e) => setNewActivityLocation(e.target.value)} 
                />
                <input 
                    type="text" value={newActivityUrl} 
                    placeholder="URL" 
                    onChange={(e) => setNewActivityUrl(e.target.value)} 
                />
                <button type="submit">Add Activity</button>
            </form>

            <h2>Notes</h2>
            <ul>
                {notes.map((note) => (
                    <NoteListItem
                        key={note.id}
                        note={note}
                        onUpdate={handleNoteUpdate}
                        onDelete={handleNoteDelete}
                    />
                ))}
            </ul>

            <form onSubmit={handleAddNote}>
                <input
                    type="text" value={newNoteContent}
                    placeholder="Add a note"
                    onChange={(e) => setNewNoteContent(e.target.value)}
                />
                <button type="submit">Add Note</button>
            </form>
        </div>
    );
}
