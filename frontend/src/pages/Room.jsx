import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWebRTC } from "../hooks/useWebRTC";
import { disconnectSocket } from "../hooks/useSocket";
import ChatPanel from "../components/ChatPanel";
import MediaControls from "../components/MediaControls";
import Whiteboard from "../components/Whiteboard";
import toast from "react-hot-toast";
import API from "../utils/api";

export default function Room() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [localStream, setLocalStream]     = useState(null);
    const [isMuted, setIsMuted]             = useState(false);
    const [isVideoOff, setIsVideoOff]       = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [showChat, setShowChat]           = useState(false);
    const [elapsed, setElapsed]             = useState(0);
    const [copied, setCopied]               = useState(false);

    const cameraStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const videoRefs       = useRef({});   // { id: <video element> }

    const { peers, replaceTrack } = useWebRTC(roomId, localStream);
    const peerCount        = Object.keys(peers).length;
    const totalParticipants = peerCount + 1;
        
    /* ── timer ── */
    useEffect(() => {
        const t = setInterval(() => setElapsed(s => s + 1), 1000);
        return () => clearInterval(t);
    }, []);
    const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

    useEffect(() => {
        const verifyRoom = async () => {
            try {
                const { data } = await API.get(`/users/validate_meeting/${roomId}`);
                if (!data.valid) {
                    toast.error("Invalid meeting room");
                    navigate("/");
                }
            } catch {
                toast.error("This meeting doesn't exist");
                navigate("/");
            }
        };
        verifyRoom();
    }, [roomId, navigate]);
    /* ── camera ── */
    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => { cameraStreamRef.current = stream; setLocalStream(stream); })
            .catch(() => toast.error("Camera/mic access denied"));
        return () => {
            cameraStreamRef.current?.getTracks().forEach(t => t.stop());
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
        };
    }, []);

    /* ── attach streams to video elements ── */
    const setVideoRef = useCallback((el, id, stream) => {
        if (!el || !stream) return;
        videoRefs.current[id] = el;
        if (el.srcObject !== stream) {
            el.srcObject = stream;
            el.play().catch(() => {});
        }
    }, []);

    /* ── controls ── */
    const toggleMute = useCallback(() => {
        cameraStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsMuted(p => !p);
    }, []);

    const toggleVideo = useCallback(() => {
        cameraStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setIsVideoOff(p => !p);
    }, []);

    const toggleScreen = useCallback(async () => {
        if (isScreenSharing) {
            screenStreamRef.current?.getTracks().forEach(t => t.stop());
            screenStreamRef.current = null;
            replaceTrack(cameraStreamRef.current);
            setIsScreenSharing(false);
        } else {
            try {
                const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screen;
                replaceTrack(screen);           // only peers see screen
                setIsScreenSharing(true);
                screen.getVideoTracks()[0].onended = () => {
                    replaceTrack(cameraStreamRef.current);
                    screenStreamRef.current = null;
                    setIsScreenSharing(false);
                };
            } catch { toast.error("Screen sharing cancelled"); }
        }
    }, [isScreenSharing, replaceTrack]);

    const leaveCall = () => {
        cameraStreamRef.current?.getTracks().forEach(t => t.stop());
        screenStreamRef.current?.getTracks().forEach(t => t.stop());
        disconnectSocket();
        navigate("/");
    };

    const copyCode = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        toast.success("Meeting code copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    /* ── grid columns ── */
    const cols = showWhiteboard ? 1
        : totalParticipants === 1 ? 1
        : totalParticipants <= 4  ? 2
        : 3;

    /* ── all participants ── */
    const allParticipants = [
        { id: "local", stream: localStream, label: "You", isLocal: true },
        ...Object.entries(peers).map(([id, stream]) => ({ id, stream, label: "Participant", isLocal: false })),
    ];

    /* ────────────────────────────── render ── */
    return (
        <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#030712", overflow:"hidden" }}>

            {/* ── TOP BAR ── */}
            <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"0 20px", height:52, flexShrink:0,
                borderBottom:"1px solid #1f2937", background:"#030712",
            }}>
                {/* logo */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30,height:30,background:"#2563eb",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center" }}>
                        <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                            <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                        </svg>
                    </div>
                    <span style={{ color:"white", fontWeight:600, fontSize:14 }}>MeetSpace</span>
                </div>

                {/* center info */}
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <button onClick={copyCode} style={{
                        display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                        background:"#111827", border:"1px solid #374151",
                        borderRadius:10, padding:"5px 12px",
                    }}>
                        <span style={{ fontFamily:"monospace", color:"#d1d5db", fontSize:13 }}>{roomId}</span>
                        <svg width="13" height="13" fill={copied ? "#4ade80" : "#6b7280"} viewBox="0 0 24 24">
                            {copied
                                ? <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                : <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            }
                        </svg>
                    </button>

                    <span style={{ fontSize:12, color:"#9ca3af", display:"flex", alignItems:"center", gap:5 }}>
                        <span style={{ width:6,height:6,background:"#22c55e",borderRadius:"50%",display:"inline-block" }}/>
                        {totalParticipants} participant{totalParticipants !== 1 ? "s" : ""}
                    </span>

                    <span style={{
                        fontFamily:"monospace", fontSize:12, color:"#6b7280",
                        background:"#111827", border:"1px solid #1f2937",
                        padding:"3px 10px", borderRadius:8,
                    }}>⏱ {fmt(elapsed)}</span>
                </div>

                <div style={{ width:100 }} />
            </div>

            {/* ── MAIN ── */}
            <div style={{ flex:1, display:"flex", minHeight:0, overflow:"hidden" }}>

                {/* LEFT: video + whiteboard */}
                <div style={{ flex:1, display:"flex", minWidth:0, minHeight:0 }}>

                    {/* VIDEO PANEL */}
                    <div style={{
                        width: showWhiteboard ? 280 : "100%",
                        flexShrink: 0,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 0,
                        borderRight: showWhiteboard ? "1px solid #1f2937" : "none",
                        transition: "width 0.3s ease",
                        background: "#030712",
                    }}>

                        {/* ── Video grid ── */}
                        <div style={{
                            flex: 1,
                            display: "grid",
                            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                            gridAutoRows: "minmax(0, 1fr)",
                            gap: 10,
                            padding: 10,
                            minHeight: 0,
                            overflow: "hidden",
                        }}>
                            {allParticipants.map(({ id, stream, label, isLocal }) => (
                                <div key={id} style={{
                                    position: "relative",
                                    background: "#111827",
                                    borderRadius: 14,
                                    overflow: "hidden",
                                    minWidth: 0,
                                    minHeight: 0,
                                    border: "1px solid #1f2937",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}>

                                    {/* Avatar — shown when no stream or video off */}
                                    {(!stream || (isLocal && isVideoOff)) && (
                                        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, zIndex:1 }}>
                                            <div style={{
                                                width: showWhiteboard ? 36 : 56,
                                                height: showWhiteboard ? 36 : 56,
                                                borderRadius:"50%",
                                                background:"linear-gradient(135deg,#2563eb,#7c3aed)",
                                                display:"flex", alignItems:"center", justifyContent:"center",
                                                fontSize: showWhiteboard ? 14 : 20,
                                                fontWeight:700, color:"white", textTransform:"uppercase",
                                            }}>
                                                {label.charAt(0)}
                                            </div>
                                            {!showWhiteboard && (
                                                <span style={{ fontSize:12, color:"#6b7280" }}>{label}</span>
                                            )}
                                        </div>
                                    )}

                                    {/* Video element */}
                                    {stream && !(isLocal && isVideoOff) && (
                                        <video
                                            ref={el => setVideoRef(el, id, stream)}
                                            autoPlay playsInline
                                            muted={isLocal}
                                            style={{
                                                position:"absolute", inset:0,
                                                width:"100%", height:"100%",
                                                objectFit:"cover",
                                                transform:"scaleX(-1)",
                                            }}
                                        />
                                    )}

                                    {/* Screen sharing overlay on local */}
                                    {isLocal && isScreenSharing && (
                                        <div style={{
                                            position:"absolute", inset:0, zIndex:2,
                                            background:"rgba(3,7,18,0.88)",
                                            backdropFilter:"blur(4px)",
                                            display:"flex", flexDirection:"column",
                                            alignItems:"center", justifyContent:"center", gap:8,
                                        }}>
                                            <div style={{
                                                width:42,height:42,borderRadius:12,
                                                background:"#1e3a5f", border:"1px solid #3b82f640",
                                                display:"flex", alignItems:"center", justifyContent:"center",
                                            }}>
                                                <svg width="20" height="20" fill="#60a5fa" viewBox="0 0 24 24">
                                                    <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                                                </svg>
                                            </div>
                                            <span style={{ color:"#60a5fa", fontSize:11, fontWeight:500 }}>Sharing your screen</span>
                                        </div>
                                    )}

                                    {/* Muted badge */}
                                    {!isLocal && isMuted && (
                                        <div style={{
                                            position:"absolute", top:8, right:8, zIndex:3,
                                            background:"#ef444480", borderRadius:8, padding:5,
                                        }}>
                                            <svg width="11" height="11" fill="white" viewBox="0 0 24 24">
                                                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                                            </svg>
                                        </div>
                                    )}

                                    {/* Name tag */}
                                    <div style={{
                                        position:"absolute", bottom:8, left:8, zIndex:3,
                                        display:"flex", alignItems:"center", gap:5,
                                        background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
                                        padding:"2px 9px", borderRadius:7,
                                    }}>
                                        {isLocal && (
                                            <span style={{ width:5,height:5,background:"#60a5fa",borderRadius:"50%",flexShrink:0 }}/>
                                        )}
                                        <span style={{
                                            fontSize:11, color:"white", fontWeight:500,
                                            maxWidth:90, overflow:"hidden",
                                            textOverflow:"ellipsis", whiteSpace:"nowrap",
                                        }}>
                                            {isLocal ? `You (${user?.name})` : label}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Invite hint */}
                        {peerCount === 0 && (
                            <div style={{
                                margin:"0 10px 10px", padding:"9px 14px", flexShrink:0,
                                background:"#ffffff06", border:"1px dashed #1f2937",
                                borderRadius:12, textAlign:"center",
                            }}>
                                <p style={{ color:"#4b5563", fontSize:12 }}>
                                    Invite: <span style={{ color:"#9ca3af", fontFamily:"monospace" }}>{roomId}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* WHITEBOARD */}
                    {showWhiteboard && (
                        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0 }}>
                            <Whiteboard />
                        </div>
                    )}
                </div>

                {/* RIGHT: Chat — flex sibling so videos shrink correctly */}
                {showChat && (
                    <div style={{
                        width: 300, flexShrink:0,
                        borderLeft:"1px solid #1f2937",
                        display:"flex", flexDirection:"column",
                        minHeight:0,
                    }}>
                        <ChatPanel onClose={() => setShowChat(false)} userName={user?.name} />
                    </div>
                )}
            </div>

            {/* ── CONTROLS ── */}
            <div style={{ flexShrink:0 }}>
                <MediaControls
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    isScreenSharing={isScreenSharing}
                    showWhiteboard={showWhiteboard}
                    showChat={showChat}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onToggleScreen={toggleScreen}
                    onToggleWhiteboard={() => setShowWhiteboard(p => !p)}
                    onToggleChat={() => setShowChat(p => !p)}
                    onLeave={leaveCall}
                    participantCount={totalParticipants}
                />
            </div>
        </div>
    );
}