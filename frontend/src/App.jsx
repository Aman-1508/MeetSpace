import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Room from "./pages/Room";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-gray-950">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-500 text-sm">Loading...</span>
            </div>
        </div>
    );
    return user ? children : <Navigate to="/landing" />;
};

export default function App() {
    return (
        <Routes>
            <Route path="/landing"      element={<Landing />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />
            <Route path="/"             element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/room/:roomId" element={<PrivateRoute><Room /></PrivateRoute>} />
            <Route path="*"             element={<Navigate to="/landing" />} />
        </Routes>
    );
}