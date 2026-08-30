import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const id_num: number = +id;

  if (!session.user.isAdmin) {
    const membership = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId: id_num, userId: Number(session.user.id) },
      },
    });

    if (membership?.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only the trip owner or an admin can delete this trip" },
        { status: 403 }
      );
    }
  }

  await prisma.trip.delete({ where: { id: id_num } })

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  const body = await request.json();

  if (!body.name || !body.destination || !body.startDate || !body.endDate) {
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
      name: body.name,
      destination: body.destination,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  })

  return NextResponse.json(updatedTrip, { status: 200 });
}

