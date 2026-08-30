import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const id_num: number = +id;

  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const note = await prisma.note.create({
    data: {
      tripId: id_num,
      content: body.content,
      authorId: Number(session.user.id),
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(note, { status: 201 });
}
