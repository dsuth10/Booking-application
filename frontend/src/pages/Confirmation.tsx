function Confirmation(): JSX.Element {
  return (
    <div className="bg-hero-gradient" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="glass-card fade-up" style={{ borderRadius: 24, padding: "48px 36px", width: "100%", maxWidth: 480, textAlign: "center" }}>
        {/* Animated success icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg,#10b98f,#059475)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 24px",
          boxShadow: "0 10px 30px rgba(16,185,143,0.3)",
          animation: "bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>

        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.03em", marginBottom: 12 }}>
          Bookings confirmed!
        </h1>
        <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: 1.6, marginBottom: 28 }}>
          Your interviews have been booked. A confirmation email with your full schedule has been sent to you. Please check your inbox (and spam folder) shortly.
        </p>

        {/* Next steps */}
        <div style={{
          background: "#f0fdf8", borderRadius: 14, padding: "16px 20px",
          border: "1.5px solid #bbf7e0", marginBottom: 24, textAlign: "left",
        }}>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#047761", marginBottom: 10 }}>
            What happens next?
          </p>
          {[
            "Check your email for a summary of your bookings",
            "Arrive on time for each scheduled interview",
            "Contact the school if you need to make changes",
          ].map((item) => (
            <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{
                width: 18, height: 18, borderRadius: "50%", background: "rgba(16,185,143,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
              }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#10b98f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontSize: "0.83rem", color: "#374151", margin: 0, lineHeight: 1.4 }}>{item}</p>
            </div>
          ))}
        </div>

        <a href="/" className="btn-primary" style={{ width: "100%", display: "inline-flex" }}>
          Back to home
        </a>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default Confirmation;
