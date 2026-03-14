import { pool } from "../db";
import bcrypt from "bcryptjs";

async function seedAdmin() {
  const email = "admin@school.com";
  const password = "password123";
  const name = "System Administrator";
  const role = "admin";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    
    if (existing.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (email, password, name, role) VALUES ($1, $2, $3, $4)",
        [email, hashedPassword, name, role]
      );
      console.log(`Seeded admin user: ${email} / ${password}`);
    } else {
      console.log(`Admin user ${email} already exists.`);
    }
  } catch (error) {
    console.error("Error seeding admin user:", error);
  } finally {
    process.exit(0);
  }
}

seedAdmin();
