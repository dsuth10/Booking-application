import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useBookingContext } from "../context/BookingContext";

function BookStep3(): JSX.Element {
  const { eventId, parentName, parentEmail, studentNames, selections, dispatch } = useBookingContext();
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!eventId) { navigate("/"); return; }
    await Promise.all(
      selections.map((s) =>
        client.post("/bookings", {
          event_id: eventId,
          slot_id: s.slotId,
          parent_name: parentName,
          parent_email: parentEmail,
          student_names: studentNames.join(", "),
        }),
      ),
    );
    dispatch({ type: "reset" });
    navigate("/book/confirmed");
  };

  return (
    <div className="bg-hero-gradient" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 16px" }}>
      {/* Steps */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
        <div className="step-dot done" />
        <div className="step-dot done" />
        <div className="step-dot active" />
      </div>

      <div className="glass-card fade-up" style={{ borderRadius: 24, padding: "36px 32px", width: "100%", maxWidth: 600 }}>
        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#10b98f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          Step 3 of 3
        </p>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>
          Review your bookings
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 24, lineHeight: 1.5 }}>
          Check the details below, then confirm to finalise your interviews.
        </p>

        {/* Parent summary */}
        <div style={{
          background: "linear-gradient(135deg,#f0fdf8,#e7fef5)",
          borderRadius: 12, padding: "12px 16px", marginBottom: 20,
          border: "1.5px solid #bbf7e0",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg,#10b98f,#059475)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{parentName}</p>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#10b98f" }}>{parentEmail}</p>
          </div>
        </div>

        {/* Bookings table */}
        <div style={{ borderRadius: 12, border: "1.5px solid #e2e8f0", overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Time", "Teacher", "Subject", "Room"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
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
              {selections.map((s, i) => (
                <tr key={s.slotId} style={{ background: i % 2 === 0 ? "white" : "#fafafa" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>
                    {s.startTime}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#0f172a", fontWeight: 500 }}>
                    {s.teacherName}
                  </td>
                  <td style={{ padding: "12px 14px", color: "#64748b" }}>{s.subject ?? "—"}</td>
                  <td style={{ padding: "12px 14px", color: "#64748b" }}>{s.room ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button type="button" onClick={() => navigate("/book/teachers")} className="btn-ghost">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back
          </button>
          <button type="button" onClick={handleConfirm} className="btn-primary">
            Confirm bookings
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookStep3;
