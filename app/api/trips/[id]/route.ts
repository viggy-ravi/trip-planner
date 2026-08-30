import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

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

