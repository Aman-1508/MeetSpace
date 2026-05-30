import { Link } from "react-router-dom";

export default function Landing() {
    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* Navbar */}
            <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                        </svg>
                    </div>
                    <span className="font-bold text-lg">MeetSpace</span>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition px-4 py-2">
                        Sign in
                    </Link>
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition">
                        Get started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-16">

                <div className="inline-flex items-center gap-2 bg-blue-950 border border-blue-800 text-blue-400 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Free video conferencing
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight max-w-3xl mb-6">
                    Video meetings for{" "}
                    <span className="text-blue-500">everyone</span>
                </h1>

                <p className="text-gray-400 text-lg max-w-xl mb-10">
                    Connect instantly with video calls, screen sharing, live chat, and collaborative whiteboard — all in one place.
                </p>

                <div className="flex items-center gap-4">
                    <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded-xl transition text-sm">
                        Start for free
                    </Link>
                    <Link to="/login" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition text-sm">
                        Sign in
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="max-w-5xl mx-auto px-8 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: "🎥", title: "Video & Audio", desc: "HD video calls with up to 6 participants" },
                        { icon: "🖥️", title: "Screen sharing", desc: "Share your screen with one click" },
                        { icon: "💬", title: "Live chat", desc: "Chat during calls, history saved" },
                        { icon: "✏️", title: "Whiteboard", desc: "Collaborate on a shared canvas" },
                    ].map((f) => (
                        <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <div className="text-3xl mb-3">{f.icon}</div>
                            <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                            <p className="text-gray-400 text-sm">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}