import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name || !body.destination || !body.startDate || !body.endDate) {
    return NextResponse.json(
      { error: "name, destination, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  const trip = await prisma.trip.create({
    data: {
      name: body.name,
      destination: body.destination,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    },
  });

  return NextResponse.json(trip, { status: 201 });
}