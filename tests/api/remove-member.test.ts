import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  await resetDb();
  vi.mocked(auth).mockReset();
});

async function seedTrip() {
  const owner = await prisma.user.create({ data: { name: "Owner", email: "owner@test.local", password: "x" } });
  const collaborator = await prisma.user.create({ data: { name: "Collab", email: "collab@test.local", password: "x" } });
  const outsider = await prisma.user.create({ data: { name: "Outsider", email: "outsider@test.local", password: "x" } });
  const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
  const trip = await prisma.trip.create({
    data: {
      name: "Test Trip",
      destination: "Testville",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-05"),
      members: {
        create: [
          { userId: owner.id, role: "OWNER" },
          { userId: collaborator.id, role: "COLLABORATOR" },
        ],
      },
    },
  });
  return { owner, collaborator, outsider, admin, trip };
}

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

function removeMember(tripId: number, userId: number) {
  return import("@/app/api/trips/[id]/members/[userId]/route").then(({ DELETE }) =>
    DELETE(new Request("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: String(tripId), userId: String(userId) }),
    })
  );
}

describe("DELETE /api/trips/[id]/members/[userId]", () => {
  it("403s a non-owner, non-admin caller", async () => {
    const { collaborator, outsider, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const response = await removeMember(trip.id, collaborator.id);
    expect(response.status).toBe(403);
  });

  it("lets the owner remove a collaborator", async () => {
    const { owner, collaborator, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await removeMember(trip.id, collaborator.id);
    expect(response.status).toBe(204);

    const membership = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: collaborator.id } },
    });
    expect(membership).toBeNull();
  });

  it("lets an admin remove a collaborator even without being a member", async () => {
    const { admin, collaborator, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const response = await removeMember(trip.id, collaborator.id);
    expect(response.status).toBe(204);
  });

  it("400s trying to remove the owner", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await removeMember(trip.id, owner.id);
    expect(response.status).toBe(400);

    const stillThere = await prisma.tripMember.findUnique({
      where: { tripId_userId: { tripId: trip.id, userId: owner.id } },
    });
    expect(stillThere).not.toBeNull();
  });

  it("404s removing someone who isn't a member", async () => {
    const { owner, outsider, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const response = await removeMember(trip.id, outsider.id);
    expect(response.status).toBe(404);
  });
});
