import TripsPage from "./components/TripsPage";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  const isAdmin = !!session?.user?.isAdmin;

  const trips = await prisma.trip.findMany({
    where: isAdmin ? undefined : { members: { some: { userId } } },
    // Explicit select (rather than the default "every column") so
    // Trip.inviteToken — a secret, not just data the homepage happens not
    // to render — never reaches the client here at all, regardless of
    // whether this viewer has invite permission on a given trip.
    select: {
      id: true,
      name: true,
      destination: true,
      startDate: true,
      endDate: true,
      imageUrl: true,
      allowMemberInvites: true,
      members: { where: { userId }, select: { role: true } },
    },
    orderBy: { startDate: "asc" },
  });

  const tripsWithCanManage = trips.map(({ members, ...trip }) => ({
    ...trip,
    canManage: isAdmin || members[0]?.role === "OWNER",
  }));

  return <TripsPage initialTrips={tripsWithCanManage} />;
}
