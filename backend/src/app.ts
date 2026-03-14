import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import eventsRouter from "./routes/events";
import bookingsRouter from "./routes/bookings";
import teachersRouter from "./routes/teachers";
import adminRouter from "./routes/admin";
import { pingDatabase } from "./db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req: Request, res: Response) => {
  try {
    await pingDatabase();
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Database unreachable" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/events", eventsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/teachers", teachersRouter);
app.use("/api/admin", adminRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Basic global error handler; can be expanded in later sprints.
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${PORT}`);
});

export default app;

