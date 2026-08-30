import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  await prisma.note.delete({ where: { id: id_num } })

  return new NextResponse(null, { status: 204 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const id_num: number = +id;

  const body = await request.json();

  if (!body.content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const updatedNote = await prisma.note.update({
    where: {
      id: id_num,
    },
    data: {
      content: body.content,
    },
    include: { author: true },
  })

  return NextResponse.json(updatedNote, { status: 200 });
}
