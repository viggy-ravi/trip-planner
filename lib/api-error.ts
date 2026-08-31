import { NextResponse } from "next/server";
import { Prisma } from "@/app/generated/prisma/client";

// Wraps an unexpected error from inside a Route Handler into a consistent,
// safe JSON response. Known Prisma error codes get a specific status;
// anything else is logged server-side and returned as a generic 500 —
// never the raw error message/stack, which could leak internals.
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Already exists" }, { status: 409 });
    }
  }

  console.error(error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
