import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireTripMember } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireTripMember(session, id_num);
  if (authError) return authError;

  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  try {
    const note = await prisma.note.create({
      data: {
        tripId: id_num,
        content: body.content,
        authorId: Number(session!.user!.id),
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
