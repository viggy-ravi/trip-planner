export interface Trip {
  id: number;
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
}

export interface Activity {
  id: number;
  tripId: number;
  title: string;
  description: string | null;
  date: Date | null;
  // Postgres TIME columns still come back through Prisma as JS Date objects —
  // only the time-of-day part is meaningful; the date part is a fixed placeholder.
  startTime: Date | null;
  endTime: Date | null;
  location: string | null;
  url: string | null;
}