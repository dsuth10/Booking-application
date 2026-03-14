<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Could you do a deep dive? I want to build this out. I'd like a detailed minimum viable product (MVP) for a single school. Get that up and running first. I want you to go down to great detail on this one.

Here is a full, production-quality MVP spec for a single-school clone of SchoolInterviews.com.au. This is written to be handed directly to a developer (or yourself) and built out systematically.

***

## What the MVP Does

The core loop, derived directly from SchoolInterviews, is three-sided:[^1]

- **Admin** creates an event, sets teachers, sets time slots, opens/closes bookings
- **Parents** visit the site, enter an event code, pick teachers + times, get a confirmation email
- **Admin/teachers** print or view their timetable on the day

***

## Tech Stack

Given your existing infra (VPS, Node.js, Python, React, PostgreSQL), this is the recommended single-school MVP stack:[^2][^3]


| Layer | Choice | Reason |
| :-- | :-- | :-- |
| Frontend | React + Tailwind CSS | Fast to build, responsive, clean UI |
| Backend | Node.js + Express | REST API, fast iteration |
| Database | PostgreSQL | Relational, handles concurrent bookings safely |
| Email | Nodemailer + Gmail SMTP or SendGrid free tier | Booking confirmations |
| QR Codes | `qrcode` npm package | Event QR code on printed flyers |
| Auth | JWT + bcrypt | Admin login |
| Hosting | Your Hostinger VPS + Nginx + PM2 | Aligns with your existing setup |
| Scheduling/Jobs | `node-cron` | Auto-close events at set time |


***

## Project Structure

```
school-interviews-mvp/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── events.js
│   │   │   ├── teachers.js
│   │   │   ├── bookings.js
│   │   │   └── admin.js
│   │   ├── middleware/
│   │   │   ├── auth.js         # JWT verify
│   │   │   └── rateLimit.js    # Prevent abuse
│   │   ├── services/
│   │   │   ├── email.js        # Nodemailer service
│   │   │   ├── qrcode.js       # QR generation
│   │   │   └── scheduler.js    # node-cron jobs
│   │   ├── models/             # Postgres query functions
│   │   │   ├── event.js
│   │   │   ├── teacher.js
│   │   │   ├── booking.js
│   │   │   └── user.js
│   │   ├── db.js               # pg Pool connection
│   │   └── app.js
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx         # Event code entry
│   │   │   ├── BookStep1.jsx    # Enter name/email/students
│   │   │   ├── BookStep2.jsx    # Select teacher + slot
│   │   │   ├── BookStep3.jsx    # Review + confirm
│   │   │   ├── Confirmation.jsx # Post-booking summary
│   │   │   ├── AdminLogin.jsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       ├── EventCreate.jsx
│   │   │       ├── EventManage.jsx
│   │   │       ├── TeacherSetup.jsx
│   │   │       ├── Timetable.jsx
│   │   │       └── ManualBooking.jsx
│   │   ├── components/
│   │   │   ├── SlotPicker.jsx
│   │   │   ├── TimeslotGrid.jsx
│   │   │   └── PrintView.jsx
│   │   └── App.jsx
│   └── package.json
└── nginx/
    └── school-interviews.conf
```


***

## Database Schema (PostgreSQL)

Full SQL to create all tables:

```sql
-- Admin users (single school MVP = 1-2 admin accounts)
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,       -- bcrypt hash
  name        VARCHAR(255),
  role        VARCHAR(50) DEFAULT 'admin', -- 'admin' | 'staff'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Events (parent-teacher nights, subject selection, etc.)
CREATE TABLE events (
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
CREATE TABLE teachers (
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
CREATE TABLE slots (
  id          SERIAL PRIMARY KEY,
  teacher_id  INTEGER REFERENCES teachers(id) ON DELETE CASCADE,
  event_id    INTEGER REFERENCES events(id) ON DELETE CASCADE,
  start_time  TIME NOT NULL,       -- e.g. 17:00
  end_time    TIME NOT NULL,       -- e.g. 17:10
  is_blocked  BOOLEAN DEFAULT FALSE  -- admin can block a slot (lunch break, etc.)
);

-- Parent bookings
CREATE TABLE bookings (
  id              SERIAL PRIMARY KEY,
  event_id        INTEGER REFERENCES events(id),
  slot_id         INTEGER REFERENCES slots(id),
  parent_name     VARCHAR(255) NOT NULL,
  parent_email    VARCHAR(255) NOT NULL,
  student_names   TEXT NOT NULL,        -- comma-separated or JSON array
  notes           TEXT,
  booked_at       TIMESTAMPTZ DEFAULT NOW(),
  cancelled       BOOLEAN DEFAULT FALSE,
  confirmation_code VARCHAR(20) UNIQUE  -- for resend/cancel
);

-- Indexes for performance
CREATE UNIQUE INDEX idx_slot_booked 
  ON bookings(slot_id) 
  WHERE cancelled = FALSE;  -- enforce 1 booking per slot at DB level

CREATE INDEX idx_event_code ON events(event_code);
CREATE INDEX idx_bookings_email ON bookings(parent_email);
```

The `UNIQUE INDEX` on `bookings(slot_id) WHERE cancelled = FALSE` is critical — it prevents double-booking at the database level even under concurrent requests.[^4][^5]

***

## Backend API Endpoints

### Public Routes (no auth)

```
GET  /api/events/code/:eventCode        → Get event + teacher list (if open)
GET  /api/events/:eventId/teachers      → List teachers with available slots
GET  /api/teachers/:teacherId/slots     → Get slots (available/booked status)
POST /api/bookings                      → Create booking
GET  /api/bookings/summary?email=&code= → Retrieve booking by email+event code
POST /api/bookings/:id/cancel           → Cancel via confirmation_code
POST /api/bookings/:id/resend-email     → Resend confirmation email
```


### Admin Routes (JWT required)

```
POST /api/auth/login                     → Returns JWT
POST /api/auth/logout

GET  /api/admin/events                   → List all events
POST /api/admin/events                   → Create event
PUT  /api/admin/events/:id              → Edit event
DELETE /api/admin/events/:id            → Delete event
POST /api/admin/events/:id/open         → Open bookings now
POST /api/admin/events/:id/close        → Close bookings now

POST /api/admin/events/:id/teachers     → Add teacher to event
PUT  /api/admin/teachers/:id            → Edit teacher
DELETE /api/admin/teachers/:id          → Remove teacher

POST /api/admin/teachers/:id/slots/generate  → Auto-generate slots
POST /api/admin/slots/:id/block              → Block a slot
DELETE /api/admin/slots/:id                  → Delete slot

GET  /api/admin/events/:id/bookings     → All bookings for event
POST /api/admin/bookings                → Manual/phone booking by staff
DELETE /api/admin/bookings/:id          → Cancel any booking

GET  /api/admin/events/:id/timetable    → Formatted timetable (printable)
GET  /api/admin/events/:id/qrcode       → QR code PNG for event booking link
```


***

## Core Backend Logic

### Slot Generation Algorithm

When admin sets teachers up, call this to auto-fill slots:

```js
// services/slotGenerator.js
function generateSlots(startTime, endTime, slotDuration, bufferMinutes) {
  const slots = [];
  let current = parseTime(startTime); // e.g. "17:00" → minutes from midnight
  const end = parseTime(endTime);
  const step = slotDuration + bufferMinutes;

  while (current + slotDuration <= end) {
    slots.push({
      start_time: minutesToTime(current),
      end_time: minutesToTime(current + slotDuration)
    });
    current += step;
  }
  return slots;
}
// Example: 5:00pm–8:00pm, 10min slots, 0 buffer → 18 slots
```


### Booking Conflict Prevention

Always use a **database transaction + the unique index** to prevent race conditions:[^4]

```js
// models/booking.js
async function createBooking(data) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock the slot row
    const slot = await client.query(
      'SELECT * FROM slots WHERE id = $1 FOR UPDATE',
      [data.slot_id]
    );
    if (slot.rows[^0].is_blocked) throw new Error('Slot is blocked');

    // 2. Check no existing booking
    const existing = await client.query(
      'SELECT id FROM bookings WHERE slot_id=$1 AND cancelled=FALSE',
      [data.slot_id]
    );
    if (existing.rows.length > 0) throw new Error('Slot already booked');

    // 3. Check parent doesn't have conflicting time (same event)
    const conflict = await client.query(`
      SELECT b.id FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN slots s2 ON s2.id = $1
      WHERE b.parent_email = $2
        AND b.event_id = $3
        AND b.cancelled = FALSE
        AND s.start_time = s2.start_time
    `, [data.slot_id, data.parent_email, data.event_id]);
    if (conflict.rows.length > 0) throw new Error('You already have a booking at this time');

    // 4. Insert booking
    const code = generateConfirmationCode(); // 8-char alphanumeric
    const result = await client.query(`
      INSERT INTO bookings (event_id, slot_id, parent_name, parent_email, 
                            student_names, notes, confirmation_code)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *
    `, [data.event_id, data.slot_id, data.parent_name, data.parent_email,
        data.student_names, data.notes, code]);

    await client.query('COMMIT');
    return result.rows[^0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```


***

## Frontend: Parent Booking Flow

### Step 1 — Event Code Entry (`Home.jsx`)

- Large centered input field for event code
- "GO" button
- On submit: `GET /api/events/code/:code`
- Show error if event not found, not yet open, or already closed
- Show school name + event name if found → redirect to Step 2


### Step 2 — Parent Details (`BookStep1.jsx`)

- Fields: **Parent Name**, **Email**, **Student Name(s)** (add multiple)
- Validate email format client-side
- Store in React context/session — don't hit API yet
- "Next →" button


### Step 3 — Select Teachers \& Slots (`BookStep2.jsx`)

This is the most complex page. Key design rules:[^5][^4]

- Show **all teachers** as cards with name + subject
- Clicking a teacher opens their **slot grid** (time slots as buttons: green=available, grey=taken)
- Parent can select **multiple teachers** but **cannot pick two slots at the same time**
- Already-selected times are highlighted on all other teacher slot grids
- Show a **"Your Schedule So Far"** summary panel on the right (or bottom on mobile)
- Slots refresh every 30 seconds via polling (or WebSocket for real-time)

```jsx
// SlotPicker.jsx logic sketch
const SlotPicker = ({ teacher, selectedTimes, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {teacher.slots.map(slot => {
        const isBooked = slot.booking_count > 0;
        const isConflict = selectedTimes.includes(slot.start_time);
        return (
          <button
            key={slot.id}
            disabled={isBooked || isConflict}
            onClick={() => onSelect(teacher.id, slot)}
            className={`
              p-2 rounded text-sm font-medium
              ${isBooked ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}
              ${isConflict ? 'bg-yellow-100 text-yellow-600 cursor-not-allowed' : ''}
              ${!isBooked && !isConflict ? 'bg-green-100 hover:bg-green-300' : ''}
            `}
          >
            {slot.start_time}
          </button>
        );
      })}
    </div>
  );
};
```


### Step 4 — Review \& Confirm (`BookStep3.jsx`)

- Summary table: Teacher | Subject | Room | Time
- "Edit" link back to Step 3
- "Confirm Bookings" → `POST /api/bookings` for each selection
- On success → `Confirmation.jsx`


### Confirmation Page (`Confirmation.jsx`)

- "✅ Bookings confirmed! Check your email."
- Show booking summary table
- Display confirmation code
- "Resend Email" button
- "Cancel a Booking" link

***

## Email Confirmation

Send via Nodemailer after successful booking:[^1]

```js
// services/email.js
const bookingConfirmationTemplate = (data) => `
Subject: Your booking confirmation – ${data.event_name}

Dear ${data.parent_name},

Your bookings for ${data.event_name} on ${data.event_date} are confirmed:

${data.bookings.map(b => 
  `  ${b.start_time} – ${b.teacher_name} (${b.subject}) – Room ${b.room}`
).join('\n')}

Your confirmation code: ${data.confirmation_code}
To cancel or view: https://yourdomain.com/bookings/${data.confirmation_code}

If you did not receive this email, check your spam folder.
– ${data.school_name}
`;
```


***

## Admin Dashboard Spec

### Event Create Form

- Event name, date, description
- Booking open time + close time (date + time pickers)
- Default slot duration (5 / 10 / 15 / 20 min dropdown)
- Buffer between slots (0 / 5 min)
- Submit → generates event code automatically (6-char: e.g. `PT26A1`)


### Teacher Setup

- Add teachers: Name, Subject, Room, Start time, End time
- "Generate Slots" button per teacher (runs the slot algorithm)
- Slot grid view — admin can click to **block** individual slots (lunch, unavailable)
- Bulk import via CSV (MVP v1.1 feature — stub it now)


### Live Timetable View

- Dropdown to select teacher
- Table: Time | Status | Parent Name | Student(s)
- Manual booking button → opens form with parent details
- All bookings refresh on page load


### Printable Timetable

- `window.print()` triggered by button
- Print-specific CSS: clean table, black-on-white, no nav
- One page per teacher option


### QR Code + Booking Link

- Display event URL: `https://yourdomain.com/code/PT26A1`
- Render QR code image (downloadable PNG)
- "Copy link" button[^1]

***

## Deployment on Your VPS

```nginx
# nginx/school-interviews.conf
server {
    listen 80;
    server_name schoolbookings.yourdomain.com.au;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name schoolbookings.yourdomain.com.au;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain/privkey.pem;

    # Serve React build
    location / {
        root /var/www/school-interviews/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# PM2 ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'school-interviews-api',
    script: './backend/src/app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'postgresql://user:pass@localhost/schoolbookings',
      JWT_SECRET: 'your-secret-here',
      EMAIL_USER: 'noreply@yourschool.edu.au',
      EMAIL_PASS: 'app-password-here'
    }
  }]
}
```


***

## MVP Build Order (Sprints)

Build in this sequence to get a working product as fast as possible:[^3]

1. **Sprint 1** — DB setup + backend auth + event/teacher CRUD API (2–3 days)
2. **Sprint 2** — Slot generation + booking API with conflict prevention (2 days)
3. **Sprint 3** — Parent booking frontend: Home → Step1 → Step2 → Step3 → Confirm (3–4 days)
4. **Sprint 4** — Email confirmations + confirmation code resend/cancel (1–2 days)
5. **Sprint 5** — Admin dashboard: event management + timetable view + manual booking (2–3 days)
6. **Sprint 6** — QR code generation + printable timetable CSS + Nginx deployment (1 day)

**Total estimated MVP time: ~2–3 weeks** for a solo developer moving at a solid pace.

***

## MVP Exclusions (Build Later)

These are on SchoolInterviews but **out of scope for MVP** to keep scope tight :

- Multi-school / multi-tenant accounts
- Paid subscription billing (Stripe)
- Video interview links (Phase 2)
- CSV teacher import
- SMS notifications
- Parent-facing cancellation portal (Phase 2)
- Multiple simultaneous events (Phase 2)

Would you like me to generate the full starter code scaffold for any specific sprint — for example, the complete PostgreSQL migration file and Express router setup for Sprint 1?
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://www.schoolinterviews.com.au/faq

[^2]: https://www.reddit.com/r/SaaS/comments/1goqj65/whats_your_preferred_tech_stack_when_building_an/

[^3]: https://dev.to/martinxpn/the-ultimate-tech-stack-for-building-a-full-stack-mvp-and-iterating-quickly-3cdk

[^4]: https://koalendar.com/blog/scheduling-conflicts-meaning-causes-prevention

[^5]: https://www.academic-scheduler.com/blog/how-to-create-conflict-free-school-timetables-in-under-10-minutes

[^6]: https://www.youtube.com/watch?v=YKL7aFzgsaQ

[^7]: https://www.linkedin.com/posts/adityasraj_aditya-on-instagram-choosing-boring-proven-activity-7413114773476724737-hTRy

[^8]: https://www.spaceotechnologies.com/blog/edtech-mvp-development-guide/

[^9]: https://www.youtube.com/watch?v=k3Vfj-e1Ma4

[^10]: https://github.com/CLiz17/schooldb-mockaroo

[^11]: https://github.com/sash9696/frontend-interview-kit

[^12]: https://dev.to/chandra179/hotel-reservation-schema-design-postgresql-3i9j

[^13]: https://stackoverflow.com/questions/70645185/how-to-create-a-meeting-booking-app-in-node-js

[^14]: https://stackoverflow.com/questions/48995844/database-what-is-a-good-database-design-for-a-booking-system

[^15]: https://www.booking-wp-plugin.com/blog/scheduling-conflicts-top-causes-proven-ways-to-prevent-them/

[^16]: https://www.reddit.com/r/SoftwareEngineering/comments/1ayxqf4/database_structure_for_storing_booking_data_in_a/

