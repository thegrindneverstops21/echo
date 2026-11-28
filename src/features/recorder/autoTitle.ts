const MORNING_END_HOUR = 12;
const AFTERNOON_END_HOUR = 17;
const EVENING_END_HOUR = 21;
const NIGHT_START_HOUR = 5;

function partOfDay(hour: number): string {
  if (hour >= NIGHT_START_HOUR && hour < MORNING_END_HOUR) return "morning";
  if (hour >= MORNING_END_HOUR && hour < AFTERNOON_END_HOUR) return "afternoon";
  if (hour >= AFTERNOON_END_HOUR && hour < EVENING_END_HOUR) return "evening";
  return "night";
}

// Example: "Thursday morning, 09:14". Duplicates are fine, ids are unique.
export function makeAutoTitle(date: Date): string {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${weekday} ${partOfDay(date.getHours())}, ${time}`;
}
