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
  return value ? new Date(`1970-01-01T${value}`) : null;
}
