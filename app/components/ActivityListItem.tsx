import { Activity } from "../types";

export default function ActivityListItem({ activity }: { activity: Activity }) {
  return (
    <li>
      {activity.title}
      {activity.location && ` — ${activity.location}`}
    </li>
  );
}
