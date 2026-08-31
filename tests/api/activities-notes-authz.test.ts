import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { resetDb } from "../helpers/db";

// Regression coverage for a real gap found while building this suite:
// activities/notes create+edit+delete had no trip-membership check at all —
// any logged-in user could touch any trip's activities/notes by guessing
// IDs. See lib/authz.ts's requireTripMember, now used by all four routes.

beforeEach(async () => {
  await resetDb();
  vi.mocked(auth).mockReset();
});

async function seedTripWithOutsider() {
  const member = await prisma.user.create({ data: { name: "Member", email: "member@test.local", password: "x" } });
  const outsider = await prisma.user.create({ data: { name: "Outsider", email: "outsider@test.local", password: "x" } });
  const trip = await prisma.trip.create({
    data: {
      name: "Test Trip",
      destination: "Testville",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-01-05"),
      members: { create: { userId: member.id, role: "OWNER" } },
    },
  });
  const activity = await prisma.activity.create({ data: { tripId: trip.id, title: "Museum" } });
  const note = await prisma.note.create({ data: { tripId: trip.id, content: "hi", authorId: member.id } });
  return { member, outsider, trip, activity, note };
}

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

describe("activities: trip-membership enforcement", () => {
  it("403s a non-member creating an activity", async () => {
    const { outsider, trip } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const { POST } = await import("@/app/api/trips/[id]/activities/route");
    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ title: "Sneaky" }) }),
      { params: Promise.resolve({ id: String(trip.id) }) }
    );
    expect(response.status).toBe(403);
  });

  it("lets a member create an activity", async () => {
    const { member, trip } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(member));

    const { POST } = await import("@/app/api/trips/[id]/activities/route");
    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ title: "Legit" }) }),
      { params: Promise.resolve({ id: String(trip.id) }) }
    );
    expect(response.status).toBe(201);
  });

  it("403s a non-member deleting another trip's activity", async () => {
    const { outsider, activity } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const { DELETE } = await import("@/app/api/activities/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(activity.id) }) });
    expect(response.status).toBe(403);
    expect(await prisma.activity.findUnique({ where: { id: activity.id } })).not.toBeNull();
  });

  it("404s deleting an activity that doesn't exist", async () => {
    const { outsider } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const { DELETE } = await import("@/app/api/activities/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: "999999" }) });
    expect(response.status).toBe(404);
  });

  it("lets a member delete their trip's activity", async () => {
    const { member, activity } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(member));

    const { DELETE } = await import("@/app/api/activities/[id]/route");
    const response = await DELETE(new Request("http://localhost"), { params: Promise.resolve({ id: String(activity.id) }) });
    expect(response.status).toBe(204);
  });
});

describe("notes: trip-membership enforcement", () => {
  it("403s a non-member creating a note", async () => {
    const { outsider, trip } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const { POST } = await import("@/app/api/trips/[id]/notes/route");
    const response = await POST(
      new Request("http://localhost", { method: "POST", body: JSON.stringify({ content: "Sneaky" }) }),
      { params: Promise.resolve({ id: String(trip.id) }) }
    );
    expect(response.status).toBe(403);
  });

  it("403s a non-member editing another trip's note", async () => {
    const { outsider, note } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(outsider));

    const { PATCH } = await import("@/app/api/notes/[id]/route");
    const response = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ content: "Edited" }) }),
      { params: Promise.resolve({ id: String(note.id) }) }
    );
    expect(response.status).toBe(403);
  });

  it("lets a member edit their trip's note", async () => {
    const { member, note } = await seedTripWithOutsider();
    vi.mocked(auth).mockResolvedValue(sessionFor(member));

    const { PATCH } = await import("@/app/api/notes/[id]/route");
    const response = await PATCH(
      new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ content: "Edited" }) }),
      { params: Promise.resolve({ id: String(note.id) }) }
    );
    expect(response.status).toBe(200);
  });
});
