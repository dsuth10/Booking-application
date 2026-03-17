import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Hero from "../components/ui/animated-shader-hero";

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
    <div className="relative min-h-screen" style={{ position: "relative", minHeight: "100vh" }}>
      <Hero
        trustBadge={{ text: "Staff access only", icons: ["🛡️"] }}
        headline={{ line1: "Secure", line2: "Admin Portal" }}
        subtitle="Manage events, teachers, and interview timetables from a single, secure dashboard."
      />

      <div
        className="px-4"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          paddingInline: 16,
        }}
      >
        <div
          className="pointer-events-auto w-full max-w-md rounded-2xl bg-slate-950/75 backdrop-blur-xl border border-slate-700/70 shadow-2xl p-8 text-slate-50"
          style={{ width: "100%", maxWidth: 420 }}
        >
          <div
            style={{
              borderRadius: 18,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow:
                "0 24px 80px -48px rgba(0,0,0,0.9), 0 1px 0 rgba(255,255,255,0.05) inset",
              padding: 18,
              textAlign: "center",
            }}
          >
            <div className="mb-6">
              <h1 className="text-xl font-semibold tracking-tight text-slate-50">
                Admin sign in
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                For school staff only. Enter your admin credentials.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-300"
                  style={{ marginBottom: 10, display: "block", width: "100%" }}
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  className="block w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-center text-sm text-slate-50 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  style={{ display: "block", width: "100%", textAlign: "center" }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.edu.au"
                  autoComplete="email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wide text-slate-300"
                  style={{ marginBottom: 10, marginTop: 14, display: "block", width: "100%" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="block w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-center text-sm text-slate-50 shadow-[0px_4px_12px_0px_rgba(0,0,0,0.15)] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                  style={{ display: "block", width: "100%", textAlign: "center" }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                  <span className="mt-0.5">!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex w-full items-center justify-center rounded-md bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-slate-300">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="transition-colors hover:text-emerald-200"
              >
                ← Back to parent booking
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
