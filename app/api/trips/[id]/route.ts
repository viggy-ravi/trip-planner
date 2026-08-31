import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireOwnerOrAdmin } from "@/lib/authz";
import { handleApiError } from "@/lib/api-error";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireOwnerOrAdmin(session, id_num);
  if (authError) return authError;

  try {
    await prisma.trip.delete({ where: { id: id_num } })
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;
  const id_num: number = +id;

  const authError = await requireOwnerOrAdmin(session, id_num);
  if (authError) return authError;

  const body = await request.json();

  // Two shapes hit this route: a full trip-details edit (name/destination/
  // dates/image, from the My Trips edit modal), and a lone invite-policy
  // toggle (from the invite popover). `name` being present distinguishes
  // which one this request is.
  const isFullEdit = body.name !== undefined;

  if (isFullEdit && (!body.name || !body.destination || !body.startDate || !body.endDate)) {
    return NextResponse.json(
      { error: "name, destination, startDate, and endDate are required" },
      { status: 400 }
    );
  }

  try {
    const updatedTrip = await prisma.trip.update({
      where: {
        id: id_num,
      },
      data: {
        ...(isFullEdit && {
          name: body.name,
          destination: body.destination,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          imageUrl: body.imageUrl || null,
        }),
        ...(body.allowMemberInvites !== undefined && { allowMemberInvites: body.allowMemberInvites }),
      },
    })

    return NextResponse.json(updatedTrip, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

