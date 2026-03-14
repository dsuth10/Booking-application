import { pool } from "../db";

export interface Booking {
  id: number;
  event_id: number;
  slot_id: number;
  parent_name: string;
  parent_email: string;
  student_names: string;
  notes: string | null;
  booked_at: Date;
  cancelled: boolean;
  confirmation_code: string;
}

function generateConfirmationCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i += 1) {
    const index = Math.floor(Math.random() * chars.length);
    code += chars[index];
  }
  return code;
}

export async function createBooking(data: {
  event_id: number;
  slot_id: number;
  parent_name: string;
  parent_email: string;
  student_names: string;
  notes?: string;
}): Promise<Booking> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const slotResult = await client.query(
      "SELECT * FROM slots WHERE id = $1 FOR UPDATE",
      [data.slot_id],
    );

    const slot = slotResult.rows[0];

    if (!slot) {
      throw new Error("Slot not found");
    }

    if (slot.is_blocked) {
      throw new Error("Slot is blocked");
    }

    const existing = await client.query(
      "SELECT id FROM bookings WHERE slot_id = $1 AND cancelled = FALSE",
      [data.slot_id],
    );

    if (existing.rows.length > 0) {
      throw new Error("Slot already booked");
    }

    const conflict = await client.query(
      `
        SELECT b.id
        FROM bookings b
        JOIN slots s ON b.slot_id = s.id
        JOIN slots s2 ON s2.id = $1
        WHERE b.parent_email = $2
          AND b.event_id = $3
          AND b.cancelled = FALSE
          AND s.start_time = s2.start_time
      `,
      [data.slot_id, data.parent_email, data.event_id],
    );

    if (conflict.rows.length > 0) {
      throw new Error("You already have a booking at this time");
    }

    const confirmationCode = generateConfirmationCode();

    const bookingResult = await client.query<Booking>(
      `
        INSERT INTO bookings (
          event_id,
          slot_id,
          parent_name,
          parent_email,
          student_names,
          notes,
          confirmation_code
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
      `,
      [
        data.event_id,
        data.slot_id,
        data.parent_name,
        data.parent_email,
        data.student_names,
        data.notes ?? null,
        confirmationCode,
      ],
    );

    await client.query("COMMIT");
    return bookingResult.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listBookingsForEvent(eventId: number): Promise<Booking[]> {
  const result = await pool.query<Booking>(
    "SELECT * FROM bookings WHERE event_id = $1 ORDER BY booked_at ASC",
    [eventId],
  );
  return result.rows;
}

export async function cancelBooking(id: number): Promise<Booking | null> {
  const result = await pool.query<Booking>(
    `
      UPDATE bookings
      SET cancelled = TRUE
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getBookingByConfirmationCode(
  code: string,
): Promise<Booking | null> {
  const result = await pool.query<Booking>(
    "SELECT * FROM bookings WHERE confirmation_code = $1",
    [code],
  );
  return result.rows[0] ?? null;
}

export interface BookingWithDetails {
  booking: Booking;
  event_name: string;
  event_date: string;
  teacher_name: string;
  subject: string | null;
  room: string | null;
  start_time: string;
}

export async function getBookingWithDetails(id: number): Promise<BookingWithDetails | null> {
  const result = await pool.query<
    Booking &
      Pick<
        BookingWithDetails,
        "event_name" | "event_date" | "teacher_name" | "subject" | "room" | "start_time"
      >
  >(
    `
      SELECT
        b.*,
        e.name AS event_name,
        e.event_date::text AS event_date,
        t.name AS teacher_name,
        t.subject,
        t.room,
        s.start_time::text AS start_time
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN slots s ON b.slot_id = s.id
      JOIN teachers t ON s.teacher_id = t.id
      WHERE b.id = $1
    `,
    [id],
  );

  const row = result.rows[0];
  if (!row) return null;

  const { event_name, event_date, teacher_name, subject, room, start_time, ...booking } = row;
  return {
    booking,
    event_name,
    event_date,
    teacher_name,
    subject,
    room,
    start_time,
  };
}


