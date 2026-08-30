"use client";

import { Trip, Activity } from "../types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TripDetail({ trip }: { trip: Trip & { activities: Activity[] } }) {

    // Delete Trip
    const router = useRouter()

    async function handleDeleteTrip(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
        router.push("/")
    }

    // Edit Trip
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

    // Add Activity
    const [activities, setActivities] = useState(trip.activities);
    
    const [newActivityTitle, setNewActivityTitle] = useState("");
    const [newActivityDescription, setNewActivityDescription] = useState("");
    const [newActivityDate, setNewActivityDate] = useState("");
    const [newActivityTime, setNewActivityTime] = useState("");
    const [newActivityLocation, setNewActivityLocation] = useState("");
    const [newActivityUrl, setNewActivityUrl] = useState("");

    async function handleAddActivity(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        // 1. POST to `/api/trips/${trip.id}/activities` with the field values as JSON
        const response = await fetch(`/api/trips/${trip.id}/activities`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newActivityTitle,
                description: newActivityDescription,
                date: newActivityDate,
                time: newActivityTime,
                location: newActivityLocation,
                url: newActivityUrl,
            }),
        });
        const newActivity = await response.json();

        // 2. parse the response JSON — this is the newly created activity, WITH its real db id
        

        // 3. setActivities(...) — append the new activity to the existing array
        setActivities([
        ...activities,
        {
            ...newActivity,
            date: new Date(newActivity.date),
        },
        ]);

        // 4. reset the form fields back to empty strings
        setNewActivityTitle("");
        setNewActivityDescription("");
        setNewActivityDate("");
        setNewActivityTime("");
        setNewActivityLocation("");
        setNewActivityUrl("");
    }
    
    // Return
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

            <form onSubmit={handleDeleteTrip}>
                <button type="submit">Delete Trip</button>
            </form>

            <h2>Activities</h2>
            <ul>
                {activities.map((activity) => (
                    <li key={activity.id}>{activity.title}</li>
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
                    type="text" value={newActivityTime} 
                    placeholder="Time" 
                    onChange={(e) => setNewActivityTime(e.target.value)} 
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
        </div>
    );
}
