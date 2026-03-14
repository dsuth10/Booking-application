import { pool } from "../db";

export interface Teacher {
  id: number;
  event_id: number;
  name: string;
  subject: string | null;
  email: string | null;
  room: string | null;
  created_at: Date;
}

export async function listTeachersForEvent(eventId: number): Promise<Teacher[]> {
  const result = await pool.query<Teacher>(
    "SELECT * FROM teachers WHERE event_id = $1 ORDER BY name ASC",
    [eventId],
  );
  return result.rows;
}

export async function createTeacher(data: {
  event_id: number;
  name: string;
  subject?: string;
  email?: string;
  room?: string;
}): Promise<Teacher> {
  const result = await pool.query<Teacher>(
    `
      INSERT INTO teachers (event_id, name, subject, email, room)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `,
    [data.event_id, data.name, data.subject ?? null, data.email ?? null, data.room ?? null],
  );

  return result.rows[0];
}

export async function updateTeacher(
  id: number,
  data: Partial<{
    name: string;
    subject: string | null;
    email: string | null;
    room: string | null;
  }>,
): Promise<Teacher | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  let index = 1;
  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${index}`);
    values.push(value);
    index += 1;
  }

  if (fields.length === 0) {
    const result = await pool.query<Teacher>("SELECT * FROM teachers WHERE id = $1", [id]);
    return result.rows[0] ?? null;
  }

  values.push(id);

  const result = await pool.query<Teacher>(
    `UPDATE teachers SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteTeacher(id: number): Promise<void> {
  await pool.query("DELETE FROM teachers WHERE id = $1", [id]);
}

