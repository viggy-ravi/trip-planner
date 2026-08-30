import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. get id out of params
  const { id } = await params;
  const id_num: number = +id;

  // 2. read + validate the body
  const body = await request.json();

  if (!body.date || !body.description || !body.location || !body.title) {
    return NextResponse.json(
      { error: "date, description, location, and title are required" },
      { status: 400 }
    );
  }

  // 3. call prisma.trip.create() to create new activity in Activity
  const activity = await prisma.activity.create({
    data: {
      tripId: id_num,
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      time: body.time, 
      location: body.location,
      url: body.url,
    },
  })
  
  // 4. return new activity
  return NextResponse.json(activity, { status: 201 });
}