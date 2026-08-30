-- AlterTable
-- The User table already has rows (the seed account, id 1), so a plain
-- NOT NULL column addition would fail. Add it with a placeholder default,
-- backfill is a no-op (Postgres applies the default to existing rows
-- automatically), then drop the default so every future INSERT must supply
-- a real password explicitly.
ALTER TABLE "User" ADD COLUMN "password" TEXT NOT NULL DEFAULT 'unset';
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;
