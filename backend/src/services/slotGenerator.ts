function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`;
}

export function generateSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number,
  bufferMinutes: number,
): { start_time: string; end_time: string }[] {
  const slots: { start_time: string; end_time: string }[] = [];
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const step = slotDurationMinutes + bufferMinutes;

  let current = start;

  while (current + slotDurationMinutes <= end) {
    const slotStart = current;
    const slotEnd = current + slotDurationMinutes;
    slots.push({
      start_time: minutesToTime(slotStart),
      end_time: minutesToTime(slotEnd),
    });
    current += step;
  }

  return slots;
}

