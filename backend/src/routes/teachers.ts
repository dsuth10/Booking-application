import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

router.get("/:id/slots", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid teacher id" });
    return;
  }

  const result = await pool.query<{
    id: number;
    start_time: string;
    end_time: string;
    is_blocked: boolean;
    is_booked: boolean;
  }>(
    `
      SELECT
        s.id,
        s.start_time::text AS start_time,
        s.end_time::text AS end_time,
        s.is_blocked,
        (EXISTS (
          SELECT 1 FROM bookings b
          WHERE b.slot_id = s.id
            AND b.cancelled = FALSE
        )) AS is_booked
      FROM slots s
      WHERE s.teacher_id = $1
      ORDER BY s.start_time ASC
    `,
    [id],
  );

  res.json({ slots: result.rows });
});

export default router;

