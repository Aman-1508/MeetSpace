import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [joinCode, setJoinCode] = useState("");
    const [activity, setActivity] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [joining, setJoining] = useState(false);

    useEffect(() => { fetchActivity(); }, []);

    const fetchActivity = async () => {
        try {
            const { data } = await API.get("/users/get_all_activity");
            setActivity(data.activity || []);
        } catch {} finally { setLoadingHistory(false); }
    };

    const createMeeting = async () => {
        const roomId = uuidv4().slice(0, 8);
        try {
            await API.post("/users/add_to_activity", { meetingCode: roomId });
            navigate(`/room/${roomId}`);
        } catch { toast.error("Failed to create meeting"); }
    };

    const joinMeeting = async () => {
        if (!joinCode.trim()) return toast.error("Enter a meeting code");
        setJoining(true);
        try {
            const { data } = await API.get(`/users/validate_meeting/${joinCode.trim()}`);
            if (data.valid) navigate(`/room/${joinCode.trim()}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid meeting code");
        } finally { setJoining(false); }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div style={{ minHeight: "100vh", background: "#030712", color: "white" }}>

            {/* Navbar */}
            <nav style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 20px", borderBottom: "1px solid #1f2937",
                position: "sticky", top: 0, background: "#030712", zIndex: 10,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, background: "#2563eb", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                            <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                        </svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>MeetSpace</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: "50%",
                        background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 13, color: "white", textTransform: "uppercase",
                    }}>
                        {user?.name?.charAt(0)}
                    </div>
                    <button onClick={() => { logout(); navigate("/landing"); }} style={{
                        background: "transparent", border: "1px solid #374151",
                        color: "#9ca3af", borderRadius: 10, padding: "6px 12px",
                        fontSize: 12, cursor: "pointer",
                    }}>Sign out</button>
                </div>
            </nav>

            <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 16px" }}>

                {/* Greeting */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 700, margin: "0 0 4px" }}>
                        Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Start or join a meeting</p>
                </div>

                {/* Action cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 24 }}>

                    {/* New meeting */}
                    <button onClick={createMeeting} style={{
                        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                        border: "none", borderRadius: 16, padding: "22px 20px",
                        textAlign: "left", cursor: "pointer", width: "100%",
                    }}>
                        <div style={{ width: 44, height: 44, background: "rgba(255,255,255,0.15)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                            <svg width="22" height="22" fill="white" viewBox="0 0 24 24">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                        </div>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>New meeting</div>
                        <div style={{ color: "#bfdbfe", fontSize: 12 }}>Start an instant meeting</div>
                    </button>

                    {/* Join meeting */}
                    <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 16, padding: "22px 20px" }}>
                        <div style={{ width: 44, height: 44, background: "#1f2937", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                            <svg width="22" height="22" fill="#9ca3af" viewBox="0 0 24 24">
                                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
                            </svg>
                        </div>
                        <div style={{ color: "white", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Join meeting</div>
                        <div style={{ color: "#6b7280", fontSize: 12, marginBottom: 14 }}>Enter a code to join</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <input
                                value={joinCode}
                                onChange={e => setJoinCode(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && joinMeeting()}
                                placeholder="Meeting code"
                                style={{
                                    flex: 1, background: "#1f2937", border: "1px solid #374151",
                                    borderRadius: 10, padding: "10px 14px", color: "white",
                                    fontSize: 13, outline: "none",
                                }}
                            />
                            <button onClick={joinMeeting} disabled={joining} style={{
                                background: "#2563eb", color: "white", border: "none",
                                borderRadius: 10, padding: "10px 16px", fontSize: 13,
                                fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
                            }}>
                                {joining ? "..." : "Join"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Features pills */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
                    {[
                        { icon: "🎥", label: "HD video" },
                        { icon: "🖥️", label: "Screen share" },
                        { icon: "💬", label: "Live chat" },
                        { icon: "✏️", label: "Whiteboard" },
                    ].map(f => (
                        <div key={f.label} style={{
                            display: "flex", alignItems: "center", gap: 6,
                            background: "#111827", border: "1px solid #1f2937",
                            borderRadius: 999, padding: "6px 14px", fontSize: 12, color: "#d1d5db",
                        }}>
                            <span>{f.icon}</span> {f.label}
                        </div>
                    ))}
                </div>

                {/* Meeting history */}
                <div>
                    <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Recent meetings</h2>

                    {loadingHistory ? (
                        <div style={{ color: "#6b7280", fontSize: 13 }}>Loading...</div>
                    ) : activity.length === 0 ? (
                        <div style={{
                            background: "#111827", border: "1px solid #1f2937",
                            borderRadius: 16, padding: "32px 20px", textAlign: "center",
                        }}>
                            <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
                            <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>No meetings yet. Start your first one!</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {activity.map(item => (
                                <div key={item._id} style={{
                                    background: "#111827", border: "1px solid #1f2937",
                                    borderRadius: 14, padding: "14px 16px",
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 38, height: 38, background: "#1f2937", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="18" height="18" fill="#6b7280" viewBox="0 0 24 24">
                                                <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <div style={{ fontFamily: "monospace", fontSize: 13, color: "white", fontWeight: 500 }}>{item.meetingCode}</div>
                                            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{formatDate(item.date)}</div>
                                        </div>
                                    </div>
                                    <button onClick={() => navigate(`/room/${item.meetingCode}`)} style={{
                                        background: "transparent", border: "1px solid #1e40af",
                                        color: "#60a5fa", borderRadius: 8, padding: "6px 12px",
                                        fontSize: 12, cursor: "pointer",
                                    }}>Rejoin</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}