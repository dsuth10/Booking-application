import { pool } from "../db";

export interface Event {
  id: number;
  name: string;
  description: string | null;
  event_code: string;
  event_date: string; // ISO date
  open_time: string | null; // ISO timestamp
  close_time: string | null; // ISO timestamp
  slot_duration: number;
  buffer_minutes: number;
  is_active: boolean;
  created_by: number | null;
  created_at: Date;
}

export async function getEventByCode(code: string): Promise<Event | null> {
  const result = await pool.query<Event>(
    "SELECT * FROM events WHERE event_code = $1 AND is_active = TRUE",
    [code],
  );
  return result.rows[0] ?? null;
}

export async function getEventById(id: number): Promise<Event | null> {
  const result = await pool.query<Event>("SELECT * FROM events WHERE id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function listEvents(): Promise<Event[]> {
  const result = await pool.query<Event>(
    "SELECT * FROM events ORDER BY event_date DESC, id DESC",
  );
  return result.rows;
}

export async function createEvent(data: {
  name: string;
  description?: string;
  event_code: string;
  event_date: string;
  open_time?: string | null;
  close_time?: string | null;
  slot_duration: number;
  buffer_minutes: number;
  created_by?: number | null;
}): Promise<Event> {
  const result = await pool.query<Event>(
    `
      INSERT INTO events (
        name, description, event_code, event_date,
        open_time, close_time, slot_duration, buffer_minutes,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `,
    [
      data.name,
      data.description ?? null,
      data.event_code,
      data.event_date,
      data.open_time ?? null,
      data.close_time ?? null,
      data.slot_duration,
      data.buffer_minutes,
      data.created_by ?? null,
    ],
  );
  return result.rows[0];
}

export async function updateEvent(
  id: number,
  data: Partial<{
    name: string;
    description: string | null;
    event_date: string;
    open_time: string | null;
    close_time: string | null;
    slot_duration: number;
    buffer_minutes: number;
    is_active: boolean;
  }>,
): Promise<Event | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  let index = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index += 1;
  }

  if (fields.length === 0) {
    return getEventById(id);
  }

  values.push(id);

  const result = await pool.query<Event>(
    `UPDATE events SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteEvent(id: number): Promise<void> {
  await pool.query("DELETE FROM events WHERE id = $1", [id]);
}

