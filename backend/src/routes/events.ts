import { Router, Request, Response } from "express";
import {
  getEventByCode,
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../models/event";
import { listTeachersForEvent } from "../models/teacher";

const router = Router();

// Public: get event by code
router.get("/code/:eventCode", async (req: Request, res: Response): Promise<void> => {
  const { eventCode } = req.params;

  const event = await getEventByCode(eventCode.toUpperCase());

  if (!event) {
    res.status(404).json({ error: "Event not found or inactive" });
    return;
  }

  const now = new Date();
  const open = event.open_time ? new Date(event.open_time) : null;
  const close = event.close_time ? new Date(event.close_time) : null;

  if (open && now < open) {
    res.status(403).json({ error: "Bookings are not open yet" });
    return;
  }

  if (close && now > close) {
    res.status(403).json({ error: "Bookings are closed" });
    return;
  }

  res.json({ event });
});

// Admin: list all events
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  const events = await listEvents();
  res.json({ events });
});

// Public/Admin: list teachers for an event
router.get("/:id/teachers", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }

  const teachers = await listTeachersForEvent(id);
  res.json({ teachers });
});

// Admin: create event
router.post("/", async (req: Request, res: Response): Promise<void> => {
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

// Admin: update event
router.put("/:id", async (req: Request, res: Response): Promise<void> => {
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

// Admin: delete event
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    res.status(400).json({ error: "Invalid event id" });
    return;
  }

  await deleteEvent(id);
  res.status(204).send();
});

export default router;

