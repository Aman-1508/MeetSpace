import { useState, useEffect, useRef } from "react";
import { getSocket } from "../hooks/useSocket";

export default function ChatPanel({ onClose, userName }) {
    const socket = getSocket();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const bottomRef = useRef(null);

    useEffect(() => {
        socket.on("chat-message", (data, sender, senderId) => {
            setMessages(prev => [...prev, {
                id: Date.now(),
                text: data,
                sender,
                self: senderId === socket.id,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }]);
        });
        return () => socket.off("chat-message");
    }, [socket]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        socket.emit("chat-message", input.trim(), userName);
        setInput("");
    };

    return (
        <div className="flex flex-col h-full bg-gray-950 border-l border-gray-800">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="text-sm font-semibold text-white">Meeting Chat</h3>
                </div>
                <button onClick={onClose}
                    className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-800">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
                        <div className="text-3xl">💬</div>
                        <p className="text-gray-500 text-sm">No messages yet.<br/>Say hello!</p>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.self ? "items-end" : "items-start"}`}>
                        {!msg.self && (
                            <span className="text-xs text-gray-500 mb-1 ml-1">{msg.sender}</span>
                        )}
                        <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${msg.self
                                ? "bg-blue-600 text-white rounded-br-sm"
                                : "bg-gray-800 text-gray-100 rounded-bl-sm"
                            }`}>
                            {msg.text}
                        </div>
                        <span className="text-xs text-gray-600 mt-1 mx-1">{msg.time}</span>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-800">
                <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2
                    focus-within:border-blue-500 transition">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && sendMessage()}
                        placeholder="Send a message..."
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 outline-none"
                    />
                    <button onClick={sendMessage}
                        disabled={!input.trim()}
                        className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 transition p-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}