import nodemailer from "nodemailer";

interface BookingEmailDetails {
  parentName: string;
  parentEmail: string;
  schoolName: string;
  eventName: string;
  eventDate: string;
  items: {
    startTime: string;
    teacherName: string;
    subject?: string | null;
    room?: string | null;
  }[];
  confirmationCode: string;
}

const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
  SCHOOL_NAME,
} = process.env;

if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS || !EMAIL_FROM) {
  // In development it is acceptable to log a warning; production should configure these.
  // eslint-disable-next-line no-console
  console.warn("Email environment variables are not fully configured.");
}

const transporter =
  EMAIL_HOST && EMAIL_PORT && EMAIL_USER && EMAIL_PASS
    ? nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        secure: Number(EMAIL_PORT) === 465,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      })
    : null;

function bookingConfirmationTemplate(data: BookingEmailDetails): string {
  const school = data.schoolName || SCHOOL_NAME || "Your school";
  const lines = data.items
    .map(
      (b) =>
        `${b.startTime} – ${b.teacherName}${b.subject ? ` (${b.subject})` : ""}${
          b.room ? ` – Room ${b.room}` : ""
        }`,
    )
    .join("\n");

  return `
Dear ${data.parentName},

Your bookings for ${data.eventName} on ${data.eventDate} are confirmed:

${lines}

Your confirmation code: ${data.confirmationCode}

If you need to change your booking, please contact the school office.

– ${school}
`.trim();
}

function bookingCancellationTemplate(data: BookingEmailDetails): string {
  const school = data.schoolName || SCHOOL_NAME || "Your school";
  const lines = data.items
    .map(
      (b) =>
        `${b.startTime} – ${b.teacherName}${b.subject ? ` (${b.subject})` : ""}${
          b.room ? ` – Room ${b.room}` : ""
        }`,
    )
    .join("\n");

  return `
Dear ${data.parentName},

The following booking has been cancelled for ${data.eventName} on ${data.eventDate}:

${lines}

If this was a mistake, please contact the school office.

– ${school}
`.trim();
}

export async function sendBookingConfirmationEmail(
  details: BookingEmailDetails,
): Promise<void> {
  if (!transporter) return;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: details.parentEmail,
    subject: `Your booking confirmation – ${details.eventName}`,
    text: bookingConfirmationTemplate(details),
  });
}

export async function sendBookingCancellationEmail(
  details: BookingEmailDetails,
): Promise<void> {
  if (!transporter) return;

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: details.parentEmail,
    subject: `Booking cancelled – ${details.eventName}`,
    text: bookingCancellationTemplate(details),
  });
}

