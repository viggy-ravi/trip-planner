import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toDateOrNull, toTimeOrNull } from "@/lib/dates";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  await prisma.activity.delete({ where: { id: id_num } })

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  const body = await request.json();

  if (!body.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  const updatedActivity = await prisma.activity.update({
    where: {
      id: id_num,
    },
    data: {
      title: body.title,
      description: body.description,
      date: toDateOrNull(body.date),
      startTime: toTimeOrNull(body.startTime),
      endTime: toTimeOrNull(body.endTime),
      location: body.location,
      url: body.url,
    },
  })

  return NextResponse.json(updatedActivity, { status: 200 });
}
