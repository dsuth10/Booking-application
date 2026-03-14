import { pool } from "../db";
import bcrypt from "bcryptjs";

export type UserRole = "admin" | "staff";

export interface User {
  id: number;
  email: string;
  password: string;
  name: string | null;
  role: UserRole;
  created_at: Date;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query<User>("SELECT * FROM users WHERE email = $1", [email]);
  return result.rows[0] ?? null;
}

export async function createUser(params: {
  email: string;
  password: string;
  name?: string;
  role?: UserRole;
}): Promise<User> {
  const hashed = await bcrypt.hash(params.password, 10);

  const result = await pool.query<User>(
    `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [params.email, hashed, params.name ?? null, params.role ?? "admin"],
  );

  return result.rows[0];
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

