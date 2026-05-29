export default function MediaControls({
    isMuted, isVideoOff, isScreenSharing, showWhiteboard, showChat,
    onToggleMute, onToggleVideo, onToggleScreen, onToggleWhiteboard, onToggleChat, onLeave,
    participantCount,
}) {
    const btn = "flex flex-col items-center gap-1 group";
    const icon = (active, danger = false) =>
        `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200
        ${danger
            ? "bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30"
            : active
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700"
        }`;
    const label = "text-xs text-gray-500 group-hover:text-gray-400 transition";

    return (
        <div className="h-20 flex items-center justify-between px-6 border-t border-gray-800 bg-gray-950">

            {/* Left — room info */}
            <div className="flex items-center gap-2 min-w-30">
                <div className="flex items-center gap-1.5 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-xl">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-xs text-gray-300">{participantCount} in call</span>
                </div>
            </div>

            {/* Center — controls */}
            <div className="flex items-center gap-3">

                <button className={btn} onClick={onToggleMute}>
                    <div className={icon(isMuted)}>
                        {isMuted ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                        )}
                    </div>
                    <span className={label}>{isMuted ? "Unmute" : "Mute"}</span>
                </button>

                <button className={btn} onClick={onToggleVideo}>
                    <div className={icon(isVideoOff)}>
                        {isVideoOff ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 6.5l-4-4-1.27 1.27 1.97 1.97L15 7.73V9l-2-2-9.38-9.38L2.27 1l2.92 2.92C4.45 4.28 4 5.1 4 6v12c0 1.1.9 2 2 2h12c.52 0 .99-.2 1.35-.51L21.27 22 22.6 20.67 21 19.07V6.5zm-3 10.44L7.06 6H18v10.94zM3.27 4L2 5.27 4 7.27V18c0 1.1.9 2 2 2h10.73l-2-2H6V9.27L3.27 4z"/>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M15 8v8H5V8h10m1-2H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4V7c0-.55-.45-1-1-1z"/>
                            </svg>
                        )}
                    </div>
                    <span className={label}>{isVideoOff ? "Start video" : "Stop video"}</span>
                </button>

                <button className={btn} onClick={onToggleScreen}>
                    <div className={icon(isScreenSharing)}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>
                        </svg>
                    </div>
                    <span className={label}>{isScreenSharing ? "Stop share" : "Share screen"}</span>
                </button>

                <button className={btn} onClick={onToggleWhiteboard}>
                    <div className={icon(showWhiteboard)}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </div>
                    <span className={label}>Whiteboard</span>
                </button>

                <button className={btn} onClick={onToggleChat}>
                    <div className={icon(showChat)}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                        </svg>
                    </div>
                    <span className={label}>Chat</span>
                </button>

            </div>

            {/* Right — leave */}
            <div className="min-w-30 flex justify-end">
                <button className={btn} onClick={onLeave}>
                    <div className={icon(false, true)}>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M10.9 15.5l-1.4-1.4 2.1-2.1-2.1-2.1 1.4-1.4 2.1 2.1 2.1-2.1 1.4 1.4-2.1 2.1 2.1 2.1-1.4 1.4-2.1-2.1-2.1 2.1zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12z"/>
                        </svg>
                    </div>
                    <span className={label}>Leave</span>
                </button>
            </div>
        </div>
    );
}