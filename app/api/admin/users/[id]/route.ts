import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const authError = requireAdmin(session);
  if (authError) return authError;

  const { id } = await params;
  const targetUserId = Number(id);

  if (targetUserId === Number(session!.user!.id)) {
    return NextResponse.json(
      { error: "You can't change your own admin status" },
      { status: 400 }
    );
  }

  const body = await request.json();
  if (typeof body.isAdmin !== "boolean") {
    return NextResponse.json({ error: "isAdmin (boolean) is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: targetUserId },
      data: { isAdmin: body.isAdmin },
      select: { id: true, name: true, email: true, isAdmin: true },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
