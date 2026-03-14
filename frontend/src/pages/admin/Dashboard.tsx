import { useEffect, useState } from "react";
import { fetchAdminEvents } from "../../api/admin";
import AdminLayout from "../../components/layout/AdminLayout";

interface EventDto {
  id: number;
  name: string;
  event_code: string;
  event_date: string;
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{
      background: "white", borderRadius: 16, padding: "20px 22px",
      border: "1.5px solid #e2e8f0",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: "1.625rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>{value}</p>
      </div>
    </div>
  );
}

function Dashboard(): JSX.Element {
  const [events, setEvents] = useState<EventDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminEvents()
      .then((e) => { setEvents(e ?? []); setLoading(false); })
      .catch(() => { setEvents([]); setLoading(false); });
  }, []);

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date());

  return (
    <AdminLayout>
      <div style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#64748b", marginTop: 4 }}>
            Overview of your parent–teacher interview events.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard
            label="Total events"
            value={loading ? "—" : events.length}
            color="linear-gradient(135deg,#dbeafe,#bfdbfe)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            }
          />
          <StatCard
            label="Upcoming"
            value={loading ? "—" : upcoming.length}
            color="linear-gradient(135deg,#d1fae5,#a7f3d0)"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b98f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            }
          />
        </div>

        {/* Events list */}
        <div style={{ background: "white", borderRadius: 16, border: "1.5px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>All events</h2>
            <a href="/admin/events" style={{
              fontSize: "0.8rem", fontWeight: 600, color: "#10b98f", textDecoration: "none",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              Manage
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
          {loading ? (
            <div style={{ padding: "32px 22px", textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>
              Loading events&hellip;
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: "40px 22px", textAlign: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "#f1f5f9",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 12px",
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: "0.875rem", fontWeight: 600, color: "#64748b" }}>No events yet</p>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "#94a3b8" }}>Create your first event to get started.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["Event name", "Code", "Date", "Status"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 22px", textAlign: "left",
                      fontSize: "0.73rem", fontWeight: 700, color: "#64748b",
                      textTransform: "uppercase", letterSpacing: "0.06em",
                      borderBottom: "1.5px solid #e2e8f0",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => {
                  const isUpcoming = new Date(event.event_date) >= new Date();
                  return (
                    <tr key={event.id} style={{ background: i % 2 === 0 ? "white" : "#fafafa", borderBottom: "1px solid #f1f5f9" }}>
                      <td style={{ padding: "14px 22px", fontWeight: 600, color: "#0f172a" }}>{event.name}</td>
                      <td style={{ padding: "14px 22px" }}>
                        <span style={{
                          display: "inline-block", padding: "2px 10px", borderRadius: 6,
                          background: "#f1f5f9", fontFamily: "monospace", fontSize: "0.8rem",
                          fontWeight: 700, color: "#475569", letterSpacing: "0.06em",
                        }}>
                          {event.event_code}
                        </span>
                      </td>
                      <td style={{ padding: "14px 22px", color: "#64748b" }}>
                        {new Date(event.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 22px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          padding: "3px 10px", borderRadius: 20,
                          fontSize: "0.73rem", fontWeight: 600,
                          background: isUpcoming ? "#d1fae5" : "#f1f5f9",
                          color: isUpcoming ? "#047761" : "#64748b",
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: isUpcoming ? "#10b98f" : "#94a3b8",
                          }} />
                          {isUpcoming ? "Upcoming" : "Past"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Dashboard;
