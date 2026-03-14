import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLogin(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate("/admin");
    } catch (err) {
      const message =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        "Login failed. Please check your details.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* Left panel */}
      <div
        className="bg-admin-gradient"
        style={{
          flex: "0 0 45%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "60px 48px", position: "relative", overflow: "hidden",
        }}
      >
        {/* Background decorations */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "15%", left: "10%",
          width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,185,143,0.12) 0%, transparent 70%)",
        }} />
        <div aria-hidden="true" style={{
          position: "absolute", bottom: "10%", right: "5%",
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 320 }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 16, marginBottom: 24, marginInline: "auto",
            background: "linear-gradient(135deg,#10b98f,#059475)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 24px rgba(16,185,143,0.35)",
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h2 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            School Interviews
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: 1.6 }}>
            Manage parent–teacher interview events, teacher timetables, and bookings — all in one place.
          </p>

          {/* Features */}
          {[
            "Create and manage events",
            "Set up teacher schedules",
            "View live booking timetables",
          ].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20, textAlign: "left" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: "rgba(16,185,143,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#10b98f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <span style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "#f8fafc", padding: "48px 40px",
      }}>
        <div className="fade-up" style={{ width: "100%", maxWidth: 380 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontSize: "1.5rem", fontWeight: 800, color: "#0f172a",
              letterSpacing: "-0.03em", marginBottom: 8,
            }}>
              Admin sign in
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
              For school staff only. Enter your admin credentials.
            </p>
          </div>

          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={{
                display: "block", fontSize: "0.8125rem",
                fontWeight: 600, color: "#374151", marginBottom: 6,
              }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="field-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@school.edu.au"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="password" style={{
                display: "block", fontSize: "0.8125rem",
                fontWeight: 600, color: "#374151", marginBottom: 6,
              }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                marginBottom: 16, background: "#fff1f2", border: "1.5px solid #fecdd3",
                borderRadius: 10, padding: "10px 14px",
                display: "flex", alignItems: "flex-start", gap: 8,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <p style={{ fontSize: "0.8125rem", color: "#dc2626", margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ width: "100%" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: "center", fontSize: "0.8rem" }}>
            <a href="/" style={{ color: "#64748b", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#10b98f")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
            >
              ← Back to parent booking
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
