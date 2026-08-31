import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireInvitePermission } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

// Generates a new invite token, replacing (and so invalidating) any
// existing one — this is also how "regenerate" works, there's no separate
// endpoint for it. Same permission rule as email invites.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;
  const tripId = Number(id);

  const authError = await requireInvitePermission(session, tripId);
  if (authError) return authError;

  try {
    const token = randomBytes(24).toString("base64url");
    const trip = await prisma.trip.update({
      where: { id: tripId },
      data: { inviteToken: token },
      select: { inviteToken: true },
    });

    return NextResponse.json(trip, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
