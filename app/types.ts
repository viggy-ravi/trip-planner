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
  description: string;
  date: Date;
  time: string | null;
  location: string;
  url: string | null;
}