import TripsPage from "./components/TripsPage";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  const isAdmin = !!session?.user?.isAdmin;

  const trips = await prisma.trip.findMany({
    where: isAdmin ? undefined : { members: { some: { userId } } },
    include: { members: { where: { userId }, select: { role: true } } },
    orderBy: { startDate: "asc" },
  });

  const tripsWithCanManage = trips.map(({ members, ...trip }) => ({
    ...trip,
    canManage: isAdmin || members[0]?.role === "OWNER",
  }));

  return <TripsPage initialTrips={tripsWithCanManage} />;
}
