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

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        try {
            const { data } = await API.get("/users/get_all_activity");
            setActivity(data.activity || []);
        } catch {
            // silently fail if no history
        } finally {
            setLoadingHistory(false);
        }
    };

    const createMeeting = async () => {
        const roomId = uuidv4().slice(0, 8); // short 8-char code
        try {
            await API.post("/users/add_to_activity", { meetingCode: roomId });
            navigate(`/room/${roomId}`);
        } catch {
            toast.error("Failed to create meeting");
        }
    };

    const joinMeeting = () => {
        if (!joinCode.trim()) return toast.error("Enter a meeting code");
        navigate(`/room/${joinCode.trim()}`);
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg">MeetSpace</span>
                </div>

                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold uppercase">
                            {user?.name?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-300 hidden sm:block">{user?.name}</span>
                    </div>
                    <button
                        onClick={() => { logout(); navigate("/landing"); }}
                        className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition"
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Main */}
            <div className="max-w-4xl mx-auto px-6 py-12">

                {/* Greeting */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white">
                        Good {getGreeting()}, {user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-gray-400 mt-1">Start or join a meeting below.</p>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">

                    {/* New Meeting */}
                    <div className="bg-blue-600 hover:bg-blue-700 rounded-2xl p-6 cursor-pointer transition group"
                        onClick={createMeeting}>
                        <div className="w-12 h-12 bg-blue-500 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-4 transition">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-1">New meeting</h2>
                        <p className="text-blue-200 text-sm">Start an instant meeting and invite others</p>
                    </div>

                    {/* Join Meeting */}
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-semibold text-white mb-1">Join meeting</h2>
                        <p className="text-gray-400 text-sm mb-4">Enter a code to join an existing meeting</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && joinMeeting()}
                                placeholder="Enter meeting code"
                                className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                            />
                            <button
                                onClick={joinMeeting}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                                Join
                            </button>
                        </div>
                    </div>

                </div>

                {/* Quick Feature Icons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
                    {[
                        { icon: "🎥", label: "HD video" },
                        { icon: "🖥️", label: "Screen share" },
                        { icon: "💬", label: "Live chat" },
                        { icon: "✏️", label: "Whiteboard" },
                    ].map((f) => (
                        <div key={f.label} className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3">
                            <span className="text-xl">{f.icon}</span>
                            <span className="text-sm text-gray-300">{f.label}</span>
                        </div>
                    ))}
                </div>

                {/* Meeting History */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Recent meetings</h2>

                    {loadingHistory ? (
                        <div className="text-gray-500 text-sm">Loading history...</div>
                    ) : activity.length === 0 ? (
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
                            <div className="text-4xl mb-3">📅</div>
                            <p className="text-gray-400 text-sm">No meetings yet. Start your first one above!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activity.map((item) => (
                                <div key={item._id}
                                    className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl px-5 py-4 flex items-center justify-between transition group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white font-mono">{item.meetingCode}</p>
                                            <p className="text-xs text-gray-500">{formatDate(item.date)}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/room/${item.meetingCode}`)}
                                        className="text-xs text-blue-400 hover:text-blue-300 border border-blue-800 hover:border-blue-600 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                        Rejoin
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

// Helper
function getGreeting() {
    const h = new Date().getHours();
    if (h < 12) return "morning";
    if (h < 17) return "afternoon";
    return "evening";
}