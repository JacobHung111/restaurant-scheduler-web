// src/utils.ts

export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    // Add validation for hours and minutes range
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return hours * 60 + minutes;
    } else {
      console.warn(`timeToMinutes received out-of-range time: ${timeStr}`);
      return 0; // Or throw an error? Return 0 for now.
    }
  } catch {
    console.warn(`timeToMinutes failed to parse time: ${timeStr}`);
    return 0;
  }
}

// Helper to convert minutes back to HH:MM
export function minutesToTime(minutes: number): string {
  if (minutes < 0 || minutes >= 24 * 60) return "??:??";
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}
