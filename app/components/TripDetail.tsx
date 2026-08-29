"use client";

import { Trip } from "../types";
import { useRouter } from "next/navigation";

export default function TripDetail({ trip }: { trip: Trip }) {

    const router = useRouter()

    async function handleDeleteTrip(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });
        router.push("/")
    }

    return (
    <div>
        <h1>{trip.name}</h1>
        <p>{trip.destination}</p>
        <p>{trip.startDate.toLocaleDateString()}</p>
        
        <form onSubmit={handleDeleteTrip}>
        <button type="submit">Delete Trip</button>
        </form>
    </div>
    );
}
