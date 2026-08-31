import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/prisma";
import { resetDb } from "../helpers/db";

beforeEach(async () => {
  await resetDb();
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
});
