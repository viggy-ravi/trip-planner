import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";
import { resetRateLimiter } from "@/lib/rate-limit";

beforeEach(async () => {
  await resetDb();
  resetRateLimiter();
});

function postRegister(body: unknown) {
  return import("@/app/api/register/route").then(({ POST }) =>
    POST(new Request("http://localhost/api/register", { method: "POST", body: JSON.stringify(body) }))
  );
}

describe("POST /api/register", () => {
  it("creates a user and hashes the password", async () => {
    const response = await postRegister({ name: "Ada", email: "ada@test.local", password: "password123" });
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.email).toBe("ada@test.local");
    expect(body).not.toHaveProperty("password");

    const stored = await prisma.user.findUnique({ where: { email: "ada@test.local" } });
    expect(stored?.password).not.toBe("password123");
  });

  it("400s when a required field is missing", async () => {
    const response = await postRegister({ name: "Ada", email: "ada@test.local" });
    expect(response.status).toBe(400);
  });

  it("409s on a duplicate email", async () => {
    await postRegister({ name: "Ada", email: "ada@test.local", password: "password123" });
    const response = await postRegister({ name: "Ada Two", email: "ada@test.local", password: "password456" });
    expect(response.status).toBe(409);
  });

  it("400s on a malformed email", async () => {
    const response = await postRegister({ name: "Ada", email: "not-an-email", password: "password123" });
    expect(response.status).toBe(400);
  });

  it("400s on a too-short password", async () => {
    const response = await postRegister({ name: "Ada", email: "ada@test.local", password: "short" });
    expect(response.status).toBe(400);
  });

  it("429s past the attempt cap for one IP", async () => {
    for (let i = 0; i < 10; i++) {
      const response = await postRegister({ name: "Ada", email: `ada${i}@test.local`, password: "password123" });
      expect(response.status).not.toBe(429);
    }
    const eleventh = await postRegister({ name: "Ada", email: "ada-11@test.local", password: "password123" });
    expect(eleventh.status).toBe(429);
  });
});
