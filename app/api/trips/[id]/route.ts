import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

// Shared by PATCH and DELETE: only the trip's OWNER or a site admin may
// edit/delete a trip. Returns null when allowed, or the error response to
// return immediately when not.
async function requireOwnerOrAdmin(
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireOwnerOrAdmin(session, id_num);
  if (authError) return authError;

  await prisma.trip.delete({ where: { id: id_num } })

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireOwnerOrAdmin(session, id_num);
  if (authError) return authError;

  const body = await request.json();

  // Two shapes hit this route: a full trip-details edit (name/destination/
  // dates/image, from the My Trips edit modal), and a lone invite-policy
  // toggle (from the invite popover). `name` being present distinguishes
  // which one this request is.
  const isFullEdit = body.name !== undefined;

  if (isFullEdit && (!body.name || !body.destination || !body.startDate || !body.endDate)) {
    return NextResponse.json(
      { error: "name, destination, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const updatedTrip = await prisma.trip.update({
    where: {
      id: id_num,
    },
    data: {
      ...(isFullEdit && {
        name: body.name,
        destination: body.destination,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        imageUrl: body.imageUrl || null,
      }),
      ...(body.allowMemberInvites !== undefined && { allowMemberInvites: body.allowMemberInvites }),
    },
  })

  return NextResponse.json(updatedTrip, { status: 200 });
}

