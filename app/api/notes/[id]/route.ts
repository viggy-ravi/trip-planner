import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireTripMember } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const note = await prisma.note.findUnique({ where: { id: id_num }, select: { tripId: true } });
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authError = await requireTripMember(session, note.tripId);
  if (authError) return authError;

  try {
    await prisma.note.delete({ where: { id: id_num } })
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const note = await prisma.note.findUnique({ where: { id: id_num }, select: { tripId: true } });
  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const authError = await requireTripMember(session, note.tripId);
  if (authError) return authError;

  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  try {
    const updatedNote = await prisma.note.update({
      where: {
        id: id_num,
      },
      data: {
        content: body.content,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
