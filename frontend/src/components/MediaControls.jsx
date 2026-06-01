import { useIsMobile } from "../hooks/useIsMobile";

export default function MediaControls({
    isMuted, isVideoOff, isScreenSharing, showWhiteboard, showChat,
    onToggleMute, onToggleVideo, onToggleScreen,
    onToggleWhiteboard, onToggleChat, onLeave, participantCount,
}) {
    const isMobile = useIsMobile();

    const Btn = ({ onClick, active = false, danger = false, icon, label }) => (
        <button onClick={onClick} style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 4,
            background: "transparent", border: "none", cursor: "pointer",
        }}>
            <div style={{
                width: isMobile ? 46 : 44,
                height: isMobile ? 46 : 44,
                borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                background: danger
                    ? "rgba(239,68,68,0.15)"
                    : active ? "#2563eb" : "#1f2937",
                border: danger
                    ? "1px solid rgba(239,68,68,0.4)"
                    : active ? "none" : "1px solid #374151",
            }}>
                {icon}
            </div>
            {!isMobile && (
                <span style={{ fontSize: 10, color: "#6b7280" }}>{label}</span>
            )}
        </button>
    );

    return (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: isMobile ? "10px 16px" : "0 24px",
            height: isMobile ? 68 : 76,
            borderTop: "1px solid #1f2937",
            background: "#030712", flexShrink: 0,
        }}>

            {/* Left */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "#111827", border: "1px solid #1f2937",
                    borderRadius: 999, padding: "5px 10px",
                }}>
                    <span style={{ width: 6, height: 6, background: "#22c55e", borderRadius: "50%" }}/>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>
                        {participantCount} {!isMobile && "in call"}
                    </span>
                </div>
            </div>

            {/* Center controls */}
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 10 }}>
                <Btn onClick={onToggleMute} active={isMuted} label={isMuted ? "Unmute" : "Mute"}
                    icon={
                        <svg width="18" height="18" fill={isMuted ? "white" : "#9ca3af"} viewBox="0 0 24 24">
                            {isMuted
                                ? <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                                : <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            }
                        </svg>
                    }
                />

                <Btn onClick={onToggleVideo} active={isVideoOff} label={isVideoOff ? "Start video" : "Stop video"}
                    icon={
                        <svg width="18" height="18" fill={isVideoOff ? "white" : "#9ca3af"} viewBox="0 0 24 24">
                            {isVideoOff
                                ? <path d="M21 6.5l-4-4-1.27 1.27 1.97 1.97L15 7.73V9l-2-2-9.38-9.38L2.27 1l2.92 2.92C4.45 4.28 4 5.1 4 6v12c0 1.1.9 2 2 2h12c.52 0 .99-.2 1.35-.51L21.27 22 22.6 20.67 21 19.07V6.5zm-3 10.44L7.06 6H18v10.94z"/>
                                : <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                            }
                        </svg>
                    }
                />

                {!isMobile && (
                    <Btn onClick={onToggleScreen} active={isScreenSharing} label={isScreenSharing ? "Stop share" : "Share screen"}
                        icon={<svg width="18" height="18" fill={isScreenSharing ? "white" : "#9ca3af"} viewBox="0 0 24 24"><path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>}
                    />
                )}

                <Btn onClick={onToggleWhiteboard} active={showWhiteboard} label="Whiteboard"
                    icon={<svg width="18" height="18" fill={showWhiteboard ? "white" : "#9ca3af"} viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>}
                />

                <Btn onClick={onToggleChat} active={showChat} label="Chat"
                    icon={<svg width="18" height="18" fill={showChat ? "white" : "#9ca3af"} viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>}
                />
            </div>

            {/* Right — leave */}
            <button onClick={onLeave} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 14, padding: isMobile ? "10px 14px" : "10px 16px",
                cursor: "pointer", color: "#f87171", fontSize: 12, fontWeight: 500,
            }}>
                <svg width="18" height="18" fill="#f87171" viewBox="0 0 24 24">
                    <path d="M10.9 15.5l-1.4-1.4 2.1-2.1-2.1-2.1 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                </svg>
                {isMobile ? "" : "Leave"}
            </button>
        </div>
    );
}