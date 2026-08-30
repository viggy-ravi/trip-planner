import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  const body = await request.json();

  if (!body.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  const activity = await prisma.activity.create({
    data: {
      tripId: id_num,
      title: body.title,
      description: body.description,
      // date/startTime/endTime are all optional now — an empty string would
      // fail `new Date(...)`, so only convert when a value was actually sent.
      date: body.date ? new Date(body.date) : null,
      // <input type="time"> sends bare "HH:MM", which isn't a parseable Date
      // on its own — prefix a placeholder date so `new Date(...)` succeeds;
      // only the time-of-day part is stored, since the column is @db.Time.
      startTime: body.startTime ? new Date(`1970-01-01T${body.startTime}`) : null,
      endTime: body.endTime ? new Date(`1970-01-01T${body.endTime}`) : null,
      location: body.location,
      url: body.url,
    },
  });

  return NextResponse.json(activity, { status: 201 });
}