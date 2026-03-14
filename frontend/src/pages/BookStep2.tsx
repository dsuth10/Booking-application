import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useBookingContext } from "../context/BookingContext";
import SlotPicker from "../components/SlotPicker";
import ScheduleSummary from "../components/ScheduleSummary";
import { useSlots } from "../hooks/useSlots";

interface TeacherDto {
  id: number;
  name: string;
  subject?: string;
  room?: string;
}

function BookStep2(): JSX.Element {
  const { eventId, selections, dispatch } = useBookingContext();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<TeacherDto[]>([]);
  const [activeTeacherId, setActiveTeacherId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { slots, loading: slotsLoading } = useSlots(activeTeacherId);

  useEffect(() => {
    if (!eventId) { navigate("/"); return; }
    const fetchTeachers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await client.get(`/events/${eventId}/teachers`);
        const list = (response.data.teachers ?? []) as TeacherDto[];
        setTeachers(list);
        if (list.length && !activeTeacherId) setActiveTeacherId(list[0].id);
      } catch (err) {
        const message = (err as { response?: { data?: { error?: string } } }).response?.data?.error ?? "Could not load teachers.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [eventId, navigate, activeTeacherId]);

  const selectedStartTimes = selections.map((s) => s.startTime);

  return (
    <div className="bg-hero-gradient" style={{ minHeight: "100vh", padding: "36px 16px" }}>
      {/* Step indicator */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28 }}>
        <div className="step-dot done" />
        <div className="step-dot active" />
        <div className="step-dot" />
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Main column */}
        <div className="fade-up" style={{ flex: 1, minWidth: 300 }}>
          <div className="glass-card" style={{ borderRadius: 20, padding: "28px 24px" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#10b98f", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
              Step 2 of 3
            </p>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 6 }}>
              Choose teachers &amp; times
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: 20, lineHeight: 1.5 }}>
              Select a teacher and pick an available time slot. You cannot book two interviews at the same time.
            </p>

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: "0.875rem", padding: "16px 0" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b98f" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Loading teachers&hellip;
              </div>
            )}

            {error && (
              <div style={{ background: "#fff1f2", border: "1.5px solid #fecdd3", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: "0.875rem", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {teachers.map((teacher) => {
                const isActive = teacher.id === activeTeacherId;
                const teacherSlots = isActive ? slots : [];
                const hasSelection = selections.some((s) => s.teacherId === teacher.id);

                return (
                  <div key={teacher.id} style={{
                    borderRadius: 14,
                    border: isActive ? "2px solid #10b98f" : "1.5px solid #e2e8f0",
                    background: "white",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    boxShadow: isActive ? "0 4px 20px rgba(16,185,143,0.12)" : undefined,
                  }}>
                    <button
                      type="button"
                      onClick={() => setActiveTeacherId(isActive ? null : teacher.id)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center",
                        padding: "14px 16px", background: "none", border: "none",
                        cursor: "pointer", textAlign: "left", gap: 12,
                      }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: isActive
                          ? "linear-gradient(135deg,#10b98f,#059475)"
                          : "linear-gradient(135deg,#e2e8f0,#cbd5e1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.875rem", fontWeight: 700,
                        color: isActive ? "white" : "#64748b",
                      }}>
                        {teacher.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>
                          {teacher.name}
                          {hasSelection && (
                            <span style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 16, height: 16, borderRadius: "50%", background: "#10b98f" }}>
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </span>
                          )}
                        </p>
                        <p style={{ fontSize: "0.78rem", color: "#94a3b8", margin: 0 }}>
                          {teacher.subject ?? "Teacher"} · Room {teacher.room ?? "TBA"}
                        </p>
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? "#10b98f" : "#94a3b8"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isActive ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>

                    {isActive && (
                      <div style={{ borderTop: "1.5px solid #e2e8f0", padding: "14px 16px" }}>
                        {slotsLoading && (
                          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Loading time slots&hellip;</p>
                        )}
                        {!slotsLoading && teacherSlots.length === 0 && (
                          <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No time slots configured yet.</p>
                        )}
                        {!slotsLoading && teacherSlots.length > 0 && (
                          <SlotPicker
                            teacherId={teacher.id}
                            teacherName={teacher.name}
                            subject={teacher.subject}
                            room={teacher.room}
                            slots={teacherSlots}
                            selectedStartTimes={selectedStartTimes}
                            onSelect={(selection) => dispatch({ type: "addSelection", payload: selection })}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
              <button type="button" onClick={() => navigate("/book/details")} className="btn-ghost">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Back
              </button>
              <button
                type="button"
                onClick={() => navigate("/book/review")}
                disabled={selections.length === 0}
                className="btn-primary"
              >
                Review bookings
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar summary */}
        <aside style={{ width: "100%", maxWidth: 320, flexShrink: 0 }}>
          <ScheduleSummary
            selections={selections}
            onRemove={(slotId) => dispatch({ type: "removeSelection", slotId })}
          />
        </aside>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default BookStep2;
