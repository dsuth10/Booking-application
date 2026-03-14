module.exports = {
  apps: [
    {
      name: "school-interviews-api",
      script: "./backend/dist/app.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        DATABASE_URL: "postgresql://user:pass@localhost/schoolbookings",
        JWT_SECRET: "replace-with-a-long-random-secret",
        EMAIL_HOST: "smtp.yourprovider.com",
        EMAIL_PORT: 587,
        EMAIL_USER: "booking-notifications@yourschool.edu.au",
        EMAIL_PASS: "app-password-here",
        EMAIL_FROM: "Your School Bookings <booking-notifications@yourschool.edu.au>",
        SCHOOL_NAME: "Your School Name",
        PUBLIC_BASE_URL: "https://schoolbookings.yourdomain.com.au",
      },
    },
  ],
};

