import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toDateOrNull, toTimeOrNull } from "@/lib/dates";
import { requireTripMember } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const activity = await prisma.activity.findUnique({ where: { id: id_num }, select: { tripId: true } });
  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authError = await requireTripMember(session, activity.tripId);
  if (authError) return authError;

  try {
    await prisma.activity.delete({ where: { id: id_num } })
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const activity = await prisma.activity.findUnique({ where: { id: id_num }, select: { tripId: true } });
  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authError = await requireTripMember(session, activity.tripId);
  if (authError) return authError;

  const body = await request.json();

  if (!body.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  try {
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
  } catch (error) {
    return handleApiError(error);
  }
}
