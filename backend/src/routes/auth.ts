import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { authRateLimiter } from "../middleware/rateLimit";
import { findUserByEmail, verifyPassword } from "../models/user";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "8h";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in environment");
}

router.post(
  "/login",
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const user = await findUserByEmail(email);

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const passwordOk = await verifyPassword(password, user.password);

    if (!passwordOk) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  },
);

router.post("/logout", (_req: Request, res: Response): void => {
  // Stateless JWT logout: client should discard token.
  res.status(204).send();
});

export default router;

