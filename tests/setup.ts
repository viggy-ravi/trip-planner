import { config } from "dotenv";
import { vi } from "vitest";

config({ path: ".env.test", quiet: true });

// Guardrail: tests truncate tables between runs (see tests/helpers/db.ts).
// If DATABASE_URL isn't pointed at the dedicated test database — e.g. it
// leaked in from the shell environment instead of .env.test — abort before
// any test can touch real data.
if (!process.env.DATABASE_URL?.includes("trip_planner_test")) {
  throw new Error(
    `Refusing to run tests: DATABASE_URL doesn't look like the test database (got: ${process.env.DATABASE_URL}).`
  );
}

// Route handlers that call `auth()`/`signIn()`/`signOut()` throw when
// imported and invoked directly outside a real Next.js request (they rely
// on `next/headers`, which needs Next's own request-scoped storage — see
// tests/spike.test.ts for the empirical check). Mocking this module lets
// route-level tests exercise real authorization/business logic against a
// real database, while controlling "who's logged in" per test.
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));
