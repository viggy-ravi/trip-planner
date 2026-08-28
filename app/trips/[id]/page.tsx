import { initialTrips } from "../../data";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = initialTrips.find((t) => t.id === Number(id));

  if (!trip) {
    return <div>Trip not found.</div>;
  }

  return (
    <div>
      <h1>{trip.name}</h1>
      <p>{trip.destination}</p>
      <p>{trip.startDate}</p>
    </div>
  );
}