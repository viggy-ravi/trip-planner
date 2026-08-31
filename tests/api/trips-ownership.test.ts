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
  const other = await prisma.user.create({ data: { name: "Other", email: "other@test.local", password: "x" } });
  const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
  const trip = await prisma.trip.create({
    data: {
      name: "Test Trip",
      destination: "Testville",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-05"),
      members: { create: { userId: owner.id, role: "OWNER" } },
    },
  });
  return { owner, other, admin, trip };
}

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

describe("DELETE /api/trips/[id]", () => {
  it("403s a logged-in caller who isn't the owner or an admin", async () => {
    const { other, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(other));

    const { DELETE } = await import("@/app/api/trips/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(trip.id) }) });

    expect(response.status).toBe(403);
    expect(await prisma.trip.findUnique({ where: { id: trip.id } })).not.toBeNull();
  });

  it("401s when there's no session", async () => {
    const { trip } = await seedTrip();
    // `auth` is next-auth's overloaded export (session-fetch vs. middleware-
    // wrapping); TS picks the wrong overload for a bare mocked null return —
    // same gotcha documented in app/api/trips/[id]/route.ts's own history.
    vi.mocked(auth).mockResolvedValue(null as never);

    const { DELETE } = await import("@/app/api/trips/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(trip.id) }) });

    expect(response.status).toBe(401);
  });

  it("lets the owner delete their trip", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const { DELETE } = await import("@/app/api/trips/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(trip.id) }) });

    expect(response.status).toBe(204);
    expect(await prisma.trip.findUnique({ where: { id: trip.id } })).toBeNull();
  });

  it("lets an admin delete a trip they aren't even a member of", async () => {
    const { admin, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const { DELETE } = await import("@/app/api/trips/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(trip.id) }) });

    expect(response.status).toBe(204);
  });
});

describe("PATCH /api/trips/[id]", () => {
  it("403s a non-owner, non-admin caller", async () => {
    const { other, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(other));

    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const response = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ allowMemberInvites: false }) }),
      { params: Promise.resolve({ id: String(trip.id) }) }
    );

    expect(response.status).toBe(403);
  });

  it("lets the owner update trip fields", async () => {
    const { owner, trip } = await seedTrip();
    vi.mocked(auth).mockResolvedValue(sessionFor(owner));

    const { PATCH } = await import("@/app/api/trips/[id]/route");
    const response = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({
          name: "Renamed Trip",
          destination: "Testville",
          startDate: "2026-01-01",
          endDate: "2026-01-05",
        }),
      }),
      { params: Promise.resolve({ id: String(trip.id) }) }
    );

    expect(response.status).toBe(200);
    const updated = await prisma.trip.findUnique({ where: { id: trip.id } });
    expect(updated?.name).toBe("Renamed Trip");
  });
});
