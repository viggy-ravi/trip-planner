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
  return { owner, collaborator, outsider, trip };
}

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

function generateLink(tripId: number) {
  return import("@/app/api/trips/[id]/invite-link/route").then(({ POST }) =>
    POST(new Request("http://localhost", { method: "POST" }), {
      params: Promise.resolve({ id: String(tripId) }),
    })
  );
}

describe("POST /api/trips/[id]/invite-link", () => {
  it("403s a non-member", async () => {
    const { outsider, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const response = await generateLink(trip.id);
    expect(response.status).toBe(403);
  });

  it("lets the owner generate a link", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await generateLink(trip.id);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(typeof body.inviteToken).toBe("string");
    expect(body.inviteToken.length).toBeGreaterThan(10);
  });

  it("403s a non-owner member when allowMemberInvites is off", async () => {
    const { collaborator, trip } = await seedTrip(false);
    vi.mocked(auth).mockResolvedValue(sessionFor(collaborator));

    const response = await generateLink(trip.id);
    expect(response.status).toBe(403);
  });

  it("lets a non-owner member generate a link when allowMemberInvites is on", async () => {
    const { collaborator, trip } = await seedTrip(true);
    vi.mocked(auth).mockResolvedValue(sessionFor(collaborator));

    const response = await generateLink(trip.id);
    expect(response.status).toBe(200);
  });

  it("regenerating replaces the old token so it stops working", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const first = await generateLink(trip.id);
    const { inviteToken: firstToken } = await first.json();

    const second = await generateLink(trip.id);
    const { inviteToken: secondToken } = await second.json();

    expect(secondToken).not.toBe(firstToken);

    const byOldToken = await prisma.trip.findUnique({ where: { inviteToken: firstToken } });
    expect(byOldToken).toBeNull();
  });
});
