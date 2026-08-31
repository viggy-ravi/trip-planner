import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  await resetDb();
  vi.mocked(auth).mockReset();
});

function sessionFor(user: { id: number; isAdmin?: boolean }) {
  return { user: { id: String(user.id), isAdmin: user.isAdmin ?? false } } as never;
}

function toggleAdmin(userId: number, isAdmin: boolean) {
  return import("@/app/api/admin/users/[id]/route").then(({ PATCH }) =>
    PATCH(new Request("http://localhost", { method: "PATCH", body: JSON.stringify({ isAdmin }) }), {
      params: Promise.resolve({ id: String(userId) }),
    })
  );
}

describe("PATCH /api/admin/users/[id]", () => {
  it("403s a non-admin caller", async () => {
    const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
    const regular = await prisma.user.create({ data: { name: "Regular", email: "regular@test.local", password: "x" } });
    vi.mocked(auth).mockResolvedValue(sessionFor(regular));

    const response = await toggleAdmin(admin.id, false);
    expect(response.status).toBe(403);
  });

  it("lets an admin grant admin to another user", async () => {
    const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
    const regular = await prisma.user.create({ data: { name: "Regular", email: "regular@test.local", password: "x" } });
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const response = await toggleAdmin(regular.id, true);
    expect(response.status).toBe(200);

    const updated = await prisma.user.findUnique({ where: { id: regular.id } });
    expect(updated?.isAdmin).toBe(true);
  });

  it("lets an admin revoke another admin's admin status", async () => {
    const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
    const otherAdmin = await prisma.user.create({ data: { name: "Other Admin", email: "other-admin@test.local", password: "x", isAdmin: true } });
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const response = await toggleAdmin(otherAdmin.id, false);
    expect(response.status).toBe(200);

    const updated = await prisma.user.findUnique({ where: { id: otherAdmin.id } });
    expect(updated?.isAdmin).toBe(false);
  });

  it("400s an admin trying to change their own admin status", async () => {
    const admin = await prisma.user.create({ data: { name: "Admin", email: "admin@test.local", password: "x", isAdmin: true } });
    vi.mocked(auth).mockResolvedValue(sessionFor(admin));

    const response = await toggleAdmin(admin.id, false);
    expect(response.status).toBe(400);

    const stillAdmin = await prisma.user.findUnique({ where: { id: admin.id } });
    expect(stillAdmin?.isAdmin).toBe(true);
  });
});
