import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Register() {
    const [form, setForm] = useState({ name: "", username: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate     = useNavigate();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, username, password } = form;
        if (!name || !username || !password) return toast.error("All fields required");
        if (password.length < 6) return toast.error("Password min 6 characters");
        setLoading(true);
        try {
            await register(name, username, password);
            toast.success("Account created!");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally { setLoading(false); }
    };

    const inp = {
        width: "100%", boxSizing: "border-box",
        background: "#111827", border: "1px solid #374151",
        borderRadius: 12, padding: "12px 16px",
        color: "white", fontSize: 14, outline: "none",
    };

    return (
        <div style={{ minHeight: "100vh", background: "#030712", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ width: "100%", maxWidth: 400 }}>

                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <div style={{ width: 52, height: 52, background: "#2563eb", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                        <svg width="26" height="26" fill="white" viewBox="0 0 24 24">
                            <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                        </svg>
                    </div>
                    <h1 style={{ color: "white", fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Create account</h1>
                    <p style={{ color: "#6b7280", fontSize: 13, margin: 0 }}>Start meeting in seconds</p>
                </div>

                <div style={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 20, padding: "28px 24px" }}>
                    <form onSubmit={handleSubmit}>
                        {[
                            { label: "Full name", name: "name", type: "text", placeholder: "John Doe" },
                            { label: "Username", name: "username", type: "text", placeholder: "johndoe" },
                            { label: "Password", name: "password", type: "password", placeholder: "Min. 6 characters" },
                        ].map(field => (
                            <div key={field.name} style={{ marginBottom: 16 }}>
                                <label style={{ display: "block", color: "#d1d5db", fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                                    {field.label}
                                </label>
                                <input style={inp} type={field.type} name={field.name}
                                    value={form[field.name]} onChange={handleChange}
                                    placeholder={field.placeholder} />
                            </div>
                        ))}
                        <button type="submit" disabled={loading} style={{
                            width: "100%", background: loading ? "#1e40af" : "#2563eb",
                            color: "white", border: "none", borderRadius: 12,
                            padding: "13px", fontSize: 14, fontWeight: 500,
                            cursor: "pointer", marginTop: 4,
                        }}>
                            {loading ? "Creating..." : "Create account"}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginTop: 20 }}>
                    Have an account?{" "}
                    <Link to="/login" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: 500 }}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}