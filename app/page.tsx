import TripsPage from "./components/TripsPage";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const trips = await prisma.trip.findMany();
  return <TripsPage initialTrips={trips} />;
}
