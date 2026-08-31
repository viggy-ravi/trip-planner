import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { resetRateLimiter } from "@/lib/rate-limit";

// Real credential verification (bcrypt compare against the DB) lives inside
// next-auth's Credentials provider `authorize()` callback, which can't run
// outside a real Next.js request (see tests/setup.ts's comment). These tests
// cover this route's own logic — validation and error translation — with
// `signIn` mocked to simulate next-auth's outcomes. The full real login flow
// (wrong password, duplicate signup, cookie set) has been manually verified
// via curl/browser throughout this project's build; that isn't re-covered
// here.
beforeEach(() => {
  vi.mocked(signIn).mockReset();
  resetRateLimiter();
});

function postLogin(body: unknown) {
  return import("@/app/api/login/route").then(({ POST }) =>
    POST(new Request("http://localhost/api/login", { method: "POST", body: JSON.stringify(body) }))
  );
}

describe("POST /api/login", () => {
  it("400s when email or password is missing, without calling signIn", async () => {
    const response = await postLogin({ email: "a@test.local" });
    expect(response.status).toBe(400);
    expect(signIn).not.toHaveBeenCalled();
  });

  it("401s and doesn't leak the underlying error when signIn throws AuthError", async () => {
    vi.mocked(signIn).mockRejectedValue(new AuthError("CredentialsSignin"));
    const response = await postLogin({ email: "a@test.local", password: "wrong" });
    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid email or password");
  });

  it("200s when signIn succeeds", async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never);
    const response = await postLogin({ email: "a@test.local", password: "correct" });
    expect(response.status).toBe(200);
  });

  it("500s (without leaking the raw error) when signIn fails for a non-auth reason", async () => {
    vi.mocked(signIn).mockRejectedValue(new Error("db connection lost"));
    const response = await postLogin({ email: "a@test.local", password: "x" });
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).not.toMatch(/db connection lost/);
  });

  it("429s past the attempt cap for one IP", async () => {
    vi.mocked(signIn).mockResolvedValue(undefined as never);
    for (let i = 0; i < 10; i++) {
      const response = await postLogin({ email: "a@test.local", password: "x" });
      expect(response.status).not.toBe(429);
    }
    const eleventh = await postLogin({ email: "a@test.local", password: "x" });
    expect(eleventh.status).toBe(429);
  });
});
