import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/landing");
    };

    return (
        <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
            {/* Logo */}
            <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
            >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                </div>
                <span className="font-bold text-lg text-white">MeetSpace</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Avatar + name */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold uppercase text-white">
                        {user?.name?.charAt(0) || user?.username?.charAt(0) || "?"}
                    </div>
                    <span className="text-sm text-gray-300 hidden sm:block">
                        {user?.name || user?.username}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition"
                >
                    Sign out
                </button>
            </div>
        </nav>
    );
}