import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tripId = Number(id);

  if (!session.user.isAdmin) {
    const membership = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: Number(session.user.id) },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Only a trip member or an admin can invite collaborators" },
        { status: 403 }
      );
    }
  }

  const body = await request.json();

  if (!body.email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const invitedUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!invitedUser) {
    return NextResponse.json(
      { error: "No account found with this email — ask them to sign up first" },
      { status: 404 }
    );
  }

  const existingMembership = await prisma.tripMember.findUnique({
    where: {
      tripId_userId: { tripId, userId: invitedUser.id },
    },
  });

  if (existingMembership) {
    return NextResponse.json(
      { error: "This user is already a member of this trip" },
      { status: 409 }
    );
  }

  const member = await prisma.tripMember.create({
    data: { tripId, userId: invitedUser.id, role: "COLLABORATOR" },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  return NextResponse.json(member, { status: 201 });
}
