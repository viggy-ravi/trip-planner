import { prisma } from "@/lib/prisma";

// Wipes every table and resets id sequences so each test starts from a
// known-empty state. Only ever points at DATABASE_URL from .env.test.
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "TripMember", "Note", "Activity", "Trip", "User" RESTART IDENTITY CASCADE;`
  );
}
