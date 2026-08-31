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

// Requires the caller be able to invite collaborators to this trip — the
// trip's OWNER, a site admin, or (when the owner has allowed it) any
// member. Shared by both invite mechanisms: email invites and the
// shareable join link, so they can never drift apart into two different
// permission rules for what's conceptually the same action.
export async function requireInvitePermission(
  session: Session | null,
  tripId: number
): Promise<NextResponse | null> {
  const memberError = await requireTripMember(session, tripId);
  if (memberError) return memberError;

  if (session!.user!.isAdmin) return null;

  const membership = await prisma.tripMember.findUnique({
    where: { tripId_userId: { tripId, userId: Number(session!.user!.id) } },
  });

  if (membership?.role === "OWNER") return null;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { allowMemberInvites: true },
  });

  if (!trip?.allowMemberInvites) {
    return NextResponse.json(
      { error: "Only the trip owner can invite collaborators right now" },
      { status: 403 }
    );
  }
  return null;
}

// Requires the caller be a site admin. Use for admin-portal actions that
// aren't scoped to any particular trip.
export function requireAdmin(session: Session | null): NextResponse | null {
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!session.user.isAdmin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
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
