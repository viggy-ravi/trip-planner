import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. get id out of params (await it, then convert to a number)
  const { id } = await params;
  const id_num: number = +id;

  // 2. call prisma.trip.delete()
  await prisma.trip.delete({ where: { id: id_num } })

  // 3. return a response
  return new NextResponse(null, { status: 204 });

}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. get id out of params, same as DELETE
  const { id } = await params;
  const id_num: number = +id;

  // 2. read + validate the body, same checks as POST
  const editTrip = await request.json();

  if (!editTrip.name || !editTrip.destination || !editTrip.startDate || !editTrip.endDate) {
    return NextResponse.json(
      { error: "name, destination, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  // 3. call prisma.trip.update() — what shape does its argument need?
  const updatedTrip = await prisma.trip.update({
    where: {
      id: id_num, 
    },
    data: {
      name: editTrip.name,
      destination: editTrip.destination,
      startDate: new Date(editTrip.startDate),
      endDate: new Date(editTrip.endDate),
    },
  })
  
  // 4. return the updated trip
  return NextResponse.json(updatedTrip, { status: 200 });
}

