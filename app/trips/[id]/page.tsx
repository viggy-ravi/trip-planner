import TripDetail from "@/app/components/TripDetail";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const tripId = Number(id);

  const isAdmin = !!session?.user?.isAdmin;
  let isOwner = isAdmin;

  if (!isAdmin) {
    const membership = await prisma.tripMember.findUnique({
      where: {
        tripId_userId: { tripId, userId: Number(session?.user?.id) },
      },
    });

    if (!membership) {
      return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-600">Trip not found.</div>;
    }

    isOwner = membership.role === "OWNER";
  }

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      activities: true,
      notes: {
        include: { author: { select: { id: true, name: true, email: true } } },
      },
      members: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!trip) {
    return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-600">Trip not found.</div>;
  }

  // Same permission rule as inviting: redact the raw token here, in the
  // Server Component, so it never reaches the client at all for a viewer
  // who isn't allowed to see/share it — not just hidden in the UI.
  const canManageInviteLink = isOwner || trip.allowMemberInvites;
  const tripForClient = { ...trip, inviteToken: canManageInviteLink ? trip.inviteToken : null };

  return <TripDetail trip={tripForClient} isOwner={isOwner} />;
}