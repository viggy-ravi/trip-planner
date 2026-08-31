import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  await resetDb();
  vi.mocked(auth).mockReset();
});

async function seedTrip(allowMemberInvites = true) {
  const owner = await prisma.user.create({ data: { name: "Owner", email: "owner@test.local", password: "x" } });
  const collaborator = await prisma.user.create({ data: { name: "Collab", email: "collab@test.local", password: "x" } });
  const outsider = await prisma.user.create({ data: { name: "Outsider", email: "outsider@test.local", password: "x" } });
  const invitee = await prisma.user.create({ data: { name: "Invitee", email: "invitee@test.local", password: "x" } });
  const trip = await prisma.trip.create({
    data: {
      name: "Test Trip",
      destination: "Testville",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-05"),
      allowMemberInvites,
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: collaborator.id, role: "COLLABORATOR" },
        ],
      },
    },
  });
  return { owner, collaborator, outsider, invitee, trip };
}

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

function postInvite(tripId: number, body: unknown) {
  return import("@/app/api/trips/[id]/members/route").then(({ POST }) =>
    POST(new Request("http://localhost", { method: "POST", body: JSON.stringify(body) }), {
      params: Promise.resolve({ id: String(tripId) }),
    })
  );
}

describe("POST /api/trips/[id]/members", () => {
  it("invites an existing user as a COLLABORATOR", async () => {
    const { owner, invitee, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await postInvite(trip.id, { emails: [invitee.email] });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.invited).toHaveLength(1);
    expect(body.errors).toHaveLength(0);

    const membership = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: invitee.id } },
    });
    expect(membership?.role).toBe("COLLABORATOR");
  });

  it("reports a per-email error for an email with no account, without failing the whole request", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await postInvite(trip.id, { emails: ["nobody@test.local"] });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.invited).toHaveLength(0);
    expect(body.errors[0].error).toMatch(/no account/i);
  });

  it("reports a per-email error for someone already a member", async () => {
    const { owner, collaborator, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await postInvite(trip.id, { emails: [collaborator.email] });
    const body = await response.json();
    expect(body.errors[0].error).toMatch(/already a member/i);
  });

  it("403s a non-member caller", async () => {
    const { outsider, invitee, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const response = await postInvite(trip.id, { emails: [invitee.email] });
    expect(response.status).toBe(403);
  });

  it("403s a non-owner member when allowMemberInvites is off", async () => {
    const { collaborator, invitee, trip } = await seedTrip(false);
    vi.mocked(auth).mockResolvedValue(sessionFor(collaborator));

    const response = await postInvite(trip.id, { emails: [invitee.email] });
    expect(response.status).toBe(403);
  });

  it("lets a non-owner member invite when allowMemberInvites is on", async () => {
    const { collaborator, invitee, trip } = await seedTrip(true);
    vi.mocked(auth).mockResolvedValue(sessionFor(collaborator));

    const response = await postInvite(trip.id, { emails: [invitee.email] });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.invited).toHaveLength(1);
  });

  it("lets an admin invite even without being a trip member", async () => {
    const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
    const { invitee, trip } = await seedTrip(false);
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const response = await postInvite(trip.id, { emails: [invitee.email] });
    expect(response.status).toBe(200);
  });
});
