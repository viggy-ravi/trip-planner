import TripsPage from "./components/TripsPage";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  const trips = await prisma.trip.findMany(
    session?.user?.isAdmin
      ? undefined
      : { where: { members: { some: { userId: Number(session?.user?.id) } } } }
  );

  return <TripsPage initialTrips={trips} />;
}
