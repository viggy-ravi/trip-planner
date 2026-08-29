"use client";

import { Trip } from "../types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TripDetail({ trip }: { trip: Trip }) {

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

    // Return
    return ( 
        <div>
            {isEditing ? (
                    <form onSubmit={handleEditTrip}>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                        <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
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
        </div>
    );
}
