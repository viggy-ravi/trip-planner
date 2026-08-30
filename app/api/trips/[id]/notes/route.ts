import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// No auth/session exists yet, so there's no logged-in user to attribute a
// note to. Hardcoded to the one seed User row until real auth is built.
const CURRENT_USER_ID = 1;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
      authorId: CURRENT_USER_ID,
    },
    include: { author: true },
  });

  return NextResponse.json(note, { status: 201 });
}
