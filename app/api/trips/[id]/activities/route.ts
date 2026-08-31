import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { toDateOrNull, toTimeOrNull } from "@/lib/dates";
import { requireTripMember } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireTripMember(session, id_num);
  if (authError) return authError;

  const body = await request.json();

  if (!body.title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400 }
    );
  }

  try {
    const activity = await prisma.activity.create({
      data: {
        tripId: id_num,
        title: body.title,
        description: body.description,
        date: toDateOrNull(body.date),
        startTime: toTimeOrNull(body.startTime),
        endTime: toTimeOrNull(body.endTime),
        location: body.location,
        url: body.url,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}