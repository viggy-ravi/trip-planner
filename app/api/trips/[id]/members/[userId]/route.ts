import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireOwnerOrAdmin } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const session = await auth();
  const { id, userId } = await params;
  const tripId = Number(id);
  const targetUserId = Number(userId);

  const authError = await requireOwnerOrAdmin(session, tripId);
  if (authError) return authError;

  try {
    const membership = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    if (!membership) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (membership.role === "OWNER") {
      return NextResponse.json(
        { error: "Can't remove the trip owner" },
        { status: 400 }
      );
    }

    await prisma.tripMember.delete({
      where: { tripId_userId: { tripId, userId: targetUserId } },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}
