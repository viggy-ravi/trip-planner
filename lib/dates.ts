// Converts a raw form value into what Prisma's `data` argument expects:
// - key not sent at all (undefined) -> undefined, so `update()` leaves the column untouched
// - key sent as an empty string -> null, clearing the column
// - key sent with a real value -> a parsed Date
export function toDateOrNull(value: string | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value) : null;
}

// Same three-way behavior, but for <input type="time"> values ("HH:MM"),
// which need a placeholder date prefix before `new Date(...)` can parse them.
export function toTimeOrNull(value: string | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  // The trailing Z is required — without it, a date-time string with no
  // offset is parsed in the *server's* local timezone (not UTC), so the
  // stored time silently drifted from what was actually typed depending on
  // where the server happened to be running.
  return value ? new Date(`1970-01-01T${value}Z`) : null;
}

// The reverse direction: formats a Date (or null) back into the plain
// strings <input type="date">/<input type="time"> expect as their `value`.
export function toDateInputValue(value: Date | null): string {
  return value ? value.toISOString().split("T")[0] : "";
}

export function toTimeInputValue(value: Date | null): string {
  return value ? value.toISOString().slice(11, 16) : "";
}
