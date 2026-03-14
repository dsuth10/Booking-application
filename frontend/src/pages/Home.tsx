import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useBookingContext } from "../context/BookingContext";

function Home(): JSX.Element {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useBookingContext();

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Please enter the event code from your school.");
      return;
    }

    setLoading(true);
    try {
      const response = await client.get(`/events/code/${encodeURIComponent(trimmed)}`);
      const event = response.data.event as { id: number };
      dispatch({ type: "setEvent", code: trimmed.toUpperCase(), eventId: event.id });
      navigate("/book/details");
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        "We could not find an open event with that code.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero-gradient flex items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", top: "-10%", right: "-5%", width: 480, height: 480,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,143,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "fixed", bottom: "-10%", left: "-5%", width: 360, height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-md fade-up">
        {/* Logo / badge */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "linear-gradient(135deg,#10b98f,#059475)",
            borderRadius: 50, padding: "8px 20px",
            boxShadow: "0 4px 20px rgba(16,185,143,0.3)",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "white", letterSpacing: "0.02em" }}>
              School Interviews
            </span>
          </div>
        </div>

        {/* Main card */}
        <div className="glass-card" style={{ borderRadius: 24, padding: "40px 36px" }}>
          {/* Heading */}
          <div style={{ marginBottom: 28, textAlign: "center" }}>
            <h1 style={{
              fontSize: "1.625rem", fontWeight: 800, color: "#0f172a",
              letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 10,
            }}>
              Parent–Teacher<br />Interviews
            </h1>
            <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6 }}>
              Enter the event code from your school&apos;s note or email to start booking your interviews.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 14 }}>
              <label htmlFor="eventCode" style={{
                display: "block", fontSize: "0.8125rem",
                fontWeight: 600, color: "#374151", marginBottom: 6,
              }}>
                Event code
              </label>
              <input
                id="eventCode"
                className="field-input"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. PT26A1"
                autoComplete="off"
                autoFocus
                style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontSize: "1.0625rem", fontWeight: 600 }}
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 14, background: "#fff1f2", border: "1.5px solid #fecdd3",
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: "0.8125rem", color: "#dc2626", margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%", marginTop: 4 }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56"/>
                  </svg>
                  Checking code&hellip;
                </>
              ) : (
                <>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Help text */}
          <p style={{
            marginTop: 20, fontSize: "0.8rem", textAlign: "center", color: "#94a3b8",
          }}>
            Unsure of your code? Contact the school office.
          </p>
        </div>

        {/* Admin link */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.8rem" }}>
          <a href="/admin/login" style={{ color: "#64748b", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#10b98f")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
          >
            School staff? Admin sign in →
          </a>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Home;
