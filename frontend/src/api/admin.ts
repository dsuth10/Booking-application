import client from "./client";

export async function adminLogin(email: string, password: string) {
  return client.post("/auth/login", { email, password });
}

export async function fetchAdminEvents() {
  const res = await client.get("/admin/events");
  return res.data.events;
}

