-- Initial schema for single-school parent-teacher booking MVP

-- Admin users (single school MVP = 1-2 admin accounts)
CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,       -- bcrypt hash
  name        VARCHAR(255),
  role        VARCHAR(50) DEFAULT 'admin', -- 'admin' | 'staff'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Events (parent-teacher nights, subject selection, etc.)
CREATE TABLE IF NOT EXISTS events (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  event_code      VARCHAR(10) UNIQUE NOT NULL,  -- e.g. 'PT2026A'
  event_date      DATE NOT NULL,
  open_time       TIMESTAMPTZ,       -- when parents can START booking
  close_time      TIMESTAMPTZ,       -- when bookings are locked
  slot_duration   INTEGER DEFAULT 10, -- minutes per slot
  buffer_minutes  INTEGER DEFAULT 0,  -- gap between slots
  is_active       BOOLEAN DEFAULT TRUE,
  created_by      INTEGER REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers participating in an event
CREATE TABLE IF NOT EXISTS teachers (
  id          SERIAL PRIMARY KEY,
  event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  subject     VARCHAR(255),         -- e.g. "Year 8 Maths"
  email       VARCHAR(255),         -- optional, for their own timetable link
  room        VARCHAR(50),          -- room number/name
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Available time slots per teacher
-- Generated from event settings OR manually set
CREATE TABLE IF NOT EXISTS slots (
  id          SERIAL PRIMARY KEY,
  teacher_id  INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
  start_time  TIME NOT NULL,       -- e.g. 17:00
  end_time    TIME NOT NULL,       -- e.g. 17:10
  is_blocked  BOOLEAN DEFAULT FALSE  -- admin can block a slot (lunch break, etc.)
);

-- Parent bookings
CREATE TABLE IF NOT EXISTS bookings (
  id               SERIAL PRIMARY KEY,
  event_id         INTEGER REFERENCES events(id),
  slot_id          INTEGER REFERENCES slots(id),
  parent_name      VARCHAR(255) NOT NULL,
  parent_email     VARCHAR(255) NOT NULL,
  student_names    TEXT NOT NULL,        -- comma-separated or JSON array
  notes            TEXT,
  booked_at        TIMESTAMPTZ DEFAULT NOW(),
  cancelled        BOOLEAN DEFAULT FALSE,
  confirmation_code VARCHAR(20) UNIQUE  -- for resend/cancel
);

-- Indexes for performance and integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_slot_booked 
  ON bookings(slot_id) 
  WHERE cancelled = FALSE;  -- enforce 1 booking per slot at DB level

CREATE INDEX IF NOT EXISTS idx_event_code ON events(event_code);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(parent_email);

