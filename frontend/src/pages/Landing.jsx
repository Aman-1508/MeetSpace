import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "white" }}>

            {/* Navbar */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "14px 20px", borderBottom: "1px solid #1f2937",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
                            <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                        </svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>MeetSpace</span>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <Link to="/login" style={{
                        color: "#9ca3af", textDecoration: "none", fontSize: 13,
                        padding: "8px 12px", borderRadius: 10,
                    }}>Sign in</Link>
                    <Link to="/register" style={{
                        background: "#2563eb", color: "white", textDecoration: "none",
                        fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 10,
                    }}>Get started</Link>
                </div>
            </nav>

            {/* Hero */}
            <div style={{ textAlign: "center", padding: "60px 20px 40px" }}>
                <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#172554", border: "1px solid #1e40af",
                    color: "#60a5fa", fontSize: 12, padding: "6px 14px",
                    borderRadius: 999, marginBottom: 24,
                }}>
                    <span style={{ width: 6, height: 6, background: "#60a5fa", borderRadius: "50%" }}/>
                    Free video conferencing
                </div>

                <h1 style={{
                    fontSize: "clamp(28px, 6vw, 52px)",
                    fontWeight: 700, lineHeight: 1.15,
                    margin: "0 auto 16px", maxWidth: 600,
                }}>
                    Video meetings for{" "}
                    <span style={{ color: "#3b82f6" }}>everyone</span>
                </h1>

                <p style={{
                    color: "#6b7280", fontSize: "clamp(14px, 3vw, 17px)",
                    maxWidth: 480, margin: "0 auto 32px", lineHeight: 1.6,
                    padding: "0 10px",
                }}>
                    Connect instantly with HD video, screen sharing, live chat and collaborative whiteboard.
                </p>

                <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", padding: "0 20px" }}>
                    <Link to="/register" style={{
                        background: "#2563eb", color: "white", textDecoration: "none",
                        fontWeight: 500, padding: "12px 28px", borderRadius: 12, fontSize: 14,
                    }}>Start for free</Link>
                    <Link to="/login" style={{
                        border: "1px solid #374151", color: "#d1d5db", textDecoration: "none",
                        fontWeight: 500, padding: "12px 28px", borderRadius: 12, fontSize: 14,
                    }}>Sign in</Link>
                </div>
            </div>

            {/* Features grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 12, padding: "0 20px 60px", maxWidth: 860, margin: "0 auto",
            }}>
                {[
                    { icon: "🎥", title: "HD Video", desc: "Crystal clear calls" },
                    { icon: "🖥️", title: "Screen share", desc: "One click sharing" },
                    { icon: "💬", title: "Live chat", desc: "Realtime messaging" },
                    { icon: "✏️", title: "Whiteboard", desc: "Draw together" },
                ].map(f => (
                    <div key={f.title} style={{
                        background: "#111827", border: "1px solid #1f2937",
                        borderRadius: 16, padding: "20px 16px",
                    }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{f.title}</div>
                        <div style={{ color: "#6b7280", fontSize: 12 }}>{f.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}