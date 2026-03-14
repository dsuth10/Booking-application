import { pool } from "../db";

export interface Slot {
  id: number;
  teacher_id: number;
  event_id: number;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
}

export async function listSlotsForTeacher(teacherId: number): Promise<Slot[]> {
  const result = await pool.query<Slot>(
    "SELECT * FROM slots WHERE teacher_id = $1 ORDER BY start_time ASC",
    [teacherId],
  );
  return result.rows;
}

export async function createSlotsForTeacher(
  eventId: number,
  teacherId: number,
  slots: { start_time: string; end_time: string }[],
): Promise<Slot[]> {
  const values: unknown[] = [];
  const rows: string[] = [];

  slots.forEach((slot, index) => {
    const base = index * 4;
    rows.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
    values.push(teacherId, eventId, slot.start_time, slot.end_time);
  });

  if (rows.length === 0) {
    return [];
  }

  const result = await pool.query<Slot>(
    `
      INSERT INTO slots (teacher_id, event_id, start_time, end_time)
      VALUES ${rows.join(", ")}
      RETURNING *
    `,
    values,
  );

  return result.rows;
}

export async function blockSlot(id: number): Promise<Slot | null> {
  const result = await pool.query<Slot>(
    "UPDATE slots SET is_blocked = TRUE WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function unblockSlot(id: number): Promise<Slot | null> {
  const result = await pool.query<Slot>(
    "UPDATE slots SET is_blocked = FALSE WHERE id = $1 RETURNING *",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function deleteSlot(id: number): Promise<void> {
  await pool.query("DELETE FROM slots WHERE id = $1", [id]);
}

