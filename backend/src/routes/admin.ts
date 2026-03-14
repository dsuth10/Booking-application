import { Router, Request, Response } from "express";
import { authenticateJwt } from "../middleware/auth";
import {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
} from "../models/event";
import {
  listTeachersForEvent,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../models/teacher";
import {
  createSlotsForTeacher,
  blockSlot,
  deleteSlot,
  listSlotsForTeacher,
} from "../models/slot";
import { listBookingsForEvent, cancelBooking, getBookingWithDetails } from "../models/booking";
import { generateEventQrPng } from "../services/qrcode";

const router = Router();

router.use(authenticateJwt);

router.get("/events", async (_req: Request, res: Response): Promise<void> => {
  const events = await listEvents();
  res.json({ events });
});

router.post("/events", async (req: Request, res: Response): Promise<void> => {
  const {
    name,
    description,
    event_code,
    event_date,
    open_time,
    close_time,
    slot_duration,
    buffer_minutes,
  } = req.body;

  if (!name || !event_code || !event_date) {
    res.status(400).json({ error: "name, event_code and event_date are required" });
    return;
  }

  const created = await createEvent({
    name,
    description,
    event_code: String(event_code).toUpperCase(),
    event_date,
    open_time,
    close_time,
    slot_duration: Number(slot_duration) || 10,
    buffer_minutes: Number(buffer_minutes) || 0,
  });

  res.status(201).json({ event: created });
});

router.put("/events/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }

  const updated = await updateEvent(id, req.body);
  if (!updated) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  res.json({ event: updated });
});

router.delete("/events/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }
  await deleteEvent(id);
  res.status(204).send();
});

router.get("/events/:id/teachers", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }
  const teachers = await listTeachersForEvent(id);
  res.json({ teachers });
});

router.post("/events/:id/teachers", async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }
  const { name, subject, email, room } = req.body;
  if (!name) {
    res.status(400).json({ error: "Teacher name is required" });
    return;
  }
  const teacher = await createTeacher({ event_id: eventId, name, subject, email, room });
  res.status(201).json({ teacher });
});

router.put("/teachers/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid teacher id" });
    return;
  }
  const teacher = await updateTeacher(id, req.body);
  if (!teacher) {
    res.status(404).json({ error: "Teacher not found" });
    return;
  }
  res.json({ teacher });
});

router.delete("/teachers/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid teacher id" });
    return;
  }
  await deleteTeacher(id);
  res.status(204).send();
});

router.post("/teachers/:id/slots/generate", async (req: Request, res: Response): Promise<void> => {
  const teacherId = Number(req.params.id);
  if (Number.isNaN(teacherId)) {
    res.status(400).json({ error: "Invalid teacher id" });
    return;
  }
  const { event_id, slots } = req.body as {
    event_id?: number;
    slots?: { start_time: string; end_time: string }[];
  };

  if (!event_id || !Array.isArray(slots) || slots.length === 0) {
    res.status(400).json({ error: "event_id and slots array are required" });
    return;
  }

  const created = await createSlotsForTeacher(Number(event_id), teacherId, slots);
  res.status(201).json({ slots: created });
});

router.post("/slots/:id/block", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid slot id" });
    return;
  }
  const updated = await blockSlot(id);
  if (!updated) {
    res.status(404).json({ error: "Slot not found" });
    return;
  }
  res.json({ slot: updated });
});

router.delete("/slots/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid slot id" });
    return;
  }
  await deleteSlot(id);
  res.status(204).send();
});

router.get("/events/:id/bookings", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }
  const bookings = await listBookingsForEvent(id);
  res.json({ bookings });
});

router.post("/bookings/:id/cancel", async (req: Request, res: Response): Promise<void> => {
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
  res.json({ booking });
});

router.get("/events/:id/timetable", async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }

  const event = await getEventById(eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const slots = await listSlotsForTeacher(eventId);
  res.json({ event, slots });
});

router.get("/events/:id/qrcode", async (req: Request, res: Response): Promise<void> => {
  const eventId = Number(req.params.id);
  if (Number.isNaN(eventId)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }

  const event = await getEventById(eventId);
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  const baseUrl = process.env.PUBLIC_BASE_URL ?? "https://example.com";
  const url = `${baseUrl}/?code=${encodeURIComponent(event.event_code)}`;
  const png = await generateEventQrPng(url);

  res.setHeader("Content-Type", "image/png");
  res.send(png);
});

export default router;

