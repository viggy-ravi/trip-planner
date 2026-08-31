import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

// Requires the caller be logged in and a member of the given trip (or a site
// admin). Use for actions any collaborator should be able to do — adding or
// editing activities/notes. Returns null when allowed, or the response to
// return immediately when not.
export async function requireTripMember(
  session: Session | null,
  tripId: number
): Promise<NextResponse | null> {
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.isAdmin) return null;

  const membership = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: Number(session.user.id) } },
  });

  if (!membership) {
    return NextResponse.json({ error: "You're not a member of this trip" }, { status: 403 });
  }
  return null;
}

// Requires the caller be the trip's OWNER or a site admin. Use for
// trip-level ownership actions (edit/delete the trip itself).
export async function requireOwnerOrAdmin(
  session: Session | null,
  tripId: number
): Promise<NextResponse | null> {
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (session.user.isAdmin) return null;

  const membership = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: Number(session.user.id) } },
  });

  if (membership?.role !== "OWNER") {
    return NextResponse.json(
      { error: "Only the trip owner or an admin can do this" },
      { status: 403 }
    );
  }
  return null;
}
