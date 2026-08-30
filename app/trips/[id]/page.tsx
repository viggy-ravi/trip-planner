import TripDetail from "@/app/components/TripDetail";
import { prisma } from "@/lib/prisma";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id: Number(id) },
    include: { activities: true, notes: { include: { author: true } } },
  });

  if (!trip) {
    return <div>Trip not found.</div>;
  }

  return <TripDetail trip={trip} />;
}