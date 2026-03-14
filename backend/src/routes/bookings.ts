import { Router, Request, Response } from "express";
import {
  createBooking,
  cancelBooking,
  getBookingByConfirmationCode,
  getBookingWithDetails,
} from "../models/booking";
import {
  sendBookingCancellationEmail,
  sendBookingConfirmationEmail,
} from "../services/email";

const router = Router();

// Public: create booking
router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { event_id, slot_id, parent_name, parent_email, student_names, notes } = req.body;

  if (!event_id || !slot_id || !parent_name || !parent_email || !student_names) {
    res.status(400).json({
      error: "event_id, slot_id, parent_name, parent_email, and student_names are required",
    });
    return;
  }

  try {
    const booking = await createBooking({
      event_id: Number(event_id),
      slot_id: Number(slot_id),
      parent_name,
      parent_email,
      student_names,
      notes,
    });
    const details = await getBookingWithDetails(booking.id);

    if (details) {
      await sendBookingConfirmationEmail({
        parentName: details.booking.parent_name,
        parentEmail: details.booking.parent_email,
        schoolName: process.env.SCHOOL_NAME ?? "Your school",
        eventName: details.event_name,
        eventDate: details.event_date,
        items: [
          {
            startTime: details.start_time,
            teacherName: details.teacher_name,
            subject: details.subject,
            room: details.room,
          },
        ],
        confirmationCode: details.booking.confirmation_code,
      });
    }

    res.status(201).json({ booking });
  } catch (error) {
    res.status(409).json({ error: (error as Error).message });
  }
});

// Public: cancel booking by id
router.post("/:id/cancel", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid booking id" });
    return;
  }

  const booking = await cancelBooking(id);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  const details = await getBookingWithDetails(booking.id);

  if (details) {
    await sendBookingCancellationEmail({
      parentName: details.booking.parent_name,
      parentEmail: details.booking.parent_email,
      schoolName: process.env.SCHOOL_NAME ?? "Your school",
      eventName: details.event_name,
      eventDate: details.event_date,
      items: [
        {
          startTime: details.start_time,
          teacherName: details.teacher_name,
          subject: details.subject,
          room: details.room,
        },
      ],
      confirmationCode: details.booking.confirmation_code,
    });
  }

  res.json({ booking });
});

// Public: lookup by confirmation code
router.get("/summary", async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query as { code?: string };

  if (!code) {
    res.status(400).json({ error: "code is required" });
    return;
  }

  const booking = await getBookingByConfirmationCode(code);

  if (!booking) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  res.json({ booking });
});

// Public: resend confirmation email by booking id
router.post("/:id/resend-email", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid booking id" });
    return;
  }

  const details = await getBookingWithDetails(id);

  if (!details) {
    res.status(404).json({ error: "Booking not found" });
    return;
  }

  await sendBookingConfirmationEmail({
    parentName: details.booking.parent_name,
    parentEmail: details.booking.parent_email,
    schoolName: process.env.SCHOOL_NAME ?? "Your school",
    eventName: details.event_name,
    eventDate: details.event_date,
    items: [
      {
        startTime: details.start_time,
        teacherName: details.teacher_name,
        subject: details.subject,
        room: details.room,
      },
    ],
    confirmationCode: details.booking.confirmation_code,
  });

  res.status(204).send();
});

export default router;

