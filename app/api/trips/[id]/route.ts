import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // 1. get id out of params (await it, then convert to a number)
  const { id } = await params;
  const id_num: number = +id;

  // 2. call prisma.trip.delete()
  await prisma.trip.delete({ where: { id: id_num } })

  // 3. return a response
  return new NextResponse(null, { status: 204 });

}
