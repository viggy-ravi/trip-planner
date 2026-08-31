import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireTripMember } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const tripId = Number(id);

  // Base gate: must be a member (or admin) at all. The extra "non-owner
  // members need the trip's invite policy to allow it" rule below is more
  // specific than requireTripMember's plain membership check, so it's kept
  // inline rather than folded into the shared helper.
  const authError = await requireTripMember(session, tripId);
  if (authError) return authError;

  if (!session!.user!.isAdmin) {
    const membership = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: Number(session!.user!.id) },
      },
    });

    if (membership?.role !== "OWNER") {
      const trip = await prisma.trip.findUnique({ where: { id: tripId }, select: { allowMemberInvites: true } });
      if (!trip?.allowMemberInvites) {
        return NextResponse.json(
          { error: "Only the trip owner can invite collaborators right now" },
          { status: 403 }
        );
      }
    }
  }

  const body = await request.json();
  const emails: string[] = body.emails ?? (body.email ? [body.email] : []);

  if (emails.length === 0) {
    return NextResponse.json({ error: "At least one email is required" }, { status: 400 });
  }

  try {
    const invited = [];
    const errors: { email: string; error: string }[] = [];

    for (const email of emails) {
      const invitedUser = await prisma.user.findUnique({ where: { email } });

      if (!invitedUser) {
        errors.push({ email, error: "No account found — ask them to sign up first" });
        continue;
      }

      const existingMembership = await prisma.tripMember.findUnique({
        where: { tripId_userId: { tripId, userId: invitedUser.id } },
      });

      if (existingMembership) {
        errors.push({ email, error: "Already a member of this trip" });
        continue;
      }

      const member = await prisma.tripMember.create({
        data: { tripId, userId: invitedUser.id, role: "COLLABORATOR" },
        include: { user: { select: { id: true, name: true, email: true } } },
      });
      invited.push(member);
    }

    return NextResponse.json({ invited, errors }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
