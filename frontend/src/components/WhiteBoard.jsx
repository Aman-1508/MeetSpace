import { useRef, useEffect, useState, useCallback } from "react";
import { getSocket } from "../hooks/useSocket";

const COLORS = ["#ffffff","#60a5fa","#34d399","#f87171","#fbbf24","#a78bfa","#fb923c","#111827"];

export default function Whiteboard() {
    const socket      = getSocket();
    const canvasRef   = useRef(null);
    const containerRef = useRef(null);
    const isDrawing   = useRef(false);
    const lastPos     = useRef(null);
    const [tool,  setTool]  = useState("pen");
    const [color, setColor] = useState("#ffffff");
    const [size,  setSize]  = useState(3);

    /* ── resize canvas to fill container ── */
    useEffect(() => {
        const canvas    = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const initCanvas = () => {
            const { width, height } = container.getBoundingClientRect();
            // console.log("Canvas Size:", width, height);
            if (width === 0 || height === 0) return;

            // Save current drawing before resize
            const imageData = canvas.width > 0
                ? canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height)
                : null;

            canvas.width  = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, width, height);

            // Restore drawing after resize
            if (imageData) ctx.putImageData(imageData, 0, 0);
        };

        // Run after paint so getBoundingClientRect is accurate
        const raf = requestAnimationFrame(initCanvas);

        const observer = new ResizeObserver(() => requestAnimationFrame(initCanvas));
        observer.observe(container);

        return () => { cancelAnimationFrame(raf); observer.disconnect(); };
    }, []);

    /* ── socket events ── */
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx    = canvas.getContext("2d");

        const handleDraw = (data) => {
            ctx.beginPath();
            ctx.moveTo(data.from.x, data.from.y);
            ctx.lineTo(data.to.x,   data.to.y);
            ctx.strokeStyle = data.tool === "eraser" ? "#1a1a2e" : data.color;
            ctx.lineWidth   = data.tool === "eraser" ? data.size * 5 : data.size;
            ctx.lineCap     = "round";
            ctx.lineJoin    = "round";
            ctx.stroke();
        };

        const handleClear = () => {
            ctx.fillStyle = "#1a1a2e";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        socket.on("whiteboard-draw",  handleDraw);
        socket.on("whiteboard-clear", handleClear);
        return () => {
            socket.off("whiteboard-draw",  handleDraw);
            socket.off("whiteboard-clear", handleClear);
        };
    }, [socket]);

    /* ── coordinate helper ── */
    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect   = canvas.getBoundingClientRect();
        // scale mouse coords → canvas internal coords
        const scaleX = canvas.width  / rect.width;
        const scaleY = canvas.height / rect.height;
        const src    = e.touches ? e.touches[0] : e;
        return {
            x: (src.clientX - rect.left) * scaleX,
            y: (src.clientY - rect.top)  * scaleY,
        };
    };

    /* ── draw helper ── */
    const drawStroke = useCallback((from, to, strokeColor, strokeSize, strokeTool) => {
        // console.log("DRAWING");
        const ctx = canvasRef.current.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x,   to.y);
        ctx.strokeStyle = strokeTool === "eraser" ? "#1a1a2e" : strokeColor;
        ctx.lineWidth   = strokeTool === "eraser" ? strokeSize * 5 : strokeSize;
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();
    }, []);

    /* ── mouse / touch events ── */
    const onStart = (e) => {
        // console.log("START");
        e.preventDefault();
        isDrawing.current = true;
        lastPos.current   = getPos(e);
    };

    const onMove = (e) => {
        console.log("MOVE");
        e.preventDefault();
        if (!isDrawing.current || !lastPos.current) return;
        const current = getPos(e);

        drawStroke(lastPos.current, current, color, size, tool);

        socket.emit("whiteboard-draw", {
            from:  lastPos.current,
            to:    current,
            color, size, tool,
        });

        lastPos.current = current;
    };

    const onEnd = () => { isDrawing.current = false; lastPos.current = null; };

    const clearBoard = () => {
        const ctx = canvasRef.current.getContext("2d");
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        socket.emit("whiteboard-clear");
    };

    /* ─────────── render ─────────── */
    return (
        <div style={{ display:"flex", flexDirection:"column", height:"100%", background:"#1a1a2e" }}>

            {/* Toolbar */}
            <div style={{
                display:"flex", alignItems:"center", gap:12, flexWrap:"wrap",
                padding:"8px 14px", background:"#030712",
                borderBottom:"1px solid #1f2937", flexShrink:0,
            }}>

                {/* Pen / Eraser */}
                <div style={{ display:"flex", background:"#111827", border:"1px solid #1f2937", borderRadius:10, padding:2 }}>
                    {[
                        { id:"pen",    label:"✏️ Pen" },
                        { id:"eraser", label:"🧹 Eraser" },
                    ].map(t => (
                        <button key={t.id} onClick={() => setTool(t.id)} style={{
                            padding:"5px 12px", borderRadius:8, fontSize:12, fontWeight:500,
                            border:"none", cursor:"pointer", transition:"all 0.15s",
                            background: tool === t.id ? "#2563eb" : "transparent",
                            color:      tool === t.id ? "white"   : "#9ca3af",
                        }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Colors */}
                <div style={{ display:"flex", gap:7, alignItems:"center" }}>
                    {COLORS.map(c => (
                        <button key={c} onClick={() => { setColor(c); setTool("pen"); }}
                            style={{
                                width: color === c && tool !== "eraser" ? 26 : 22,
                                height: color === c && tool !== "eraser" ? 26 : 22,
                                borderRadius:"50%", background:c, border:"none", cursor:"pointer",
                                outline: color === c && tool !== "eraser" ? "2px solid white" : "none",
                                outlineOffset: 2, transition:"all 0.15s",
                                boxShadow: c === "#111827" ? "inset 0 0 0 1px #374151" : "none",
                            }}
                        />
                    ))}
                </div>

                {/* Size */}
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:12, color:"#6b7280" }}>Size</span>
                    <input type="range" min="1" max="20" value={size}
                        onChange={e => setSize(Number(e.target.value))}
                        style={{ width:80, accentColor:"#2563eb" }}
                    />
                    <span style={{ fontSize:12, color:"#9ca3af", minWidth:16 }}>{size}</span>
                </div>

                {/* Preview dot */}
                <div style={{
                    width: Math.min(size * 2 + 4, 36),
                    height: Math.min(size * 2 + 4, 36),
                    borderRadius:"50%",
                    background: tool === "eraser" ? "#374151" : color,
                    border:"1px solid #374151",
                    flexShrink:0,
                    transition:"all 0.15s",
                }} />

                {/* Clear */}
                <button onClick={clearBoard} style={{
                    marginLeft:"auto", display:"flex", alignItems:"center", gap:6,
                    background:"transparent", border:"1px solid #7f1d1d80",
                    borderRadius:10, padding:"5px 12px", color:"#f87171",
                    fontSize:12, cursor:"pointer", transition:"all 0.15s",
                }}>
                    🗑️ Clear all
                </button>
            </div>

            {/* Canvas container — ref so ResizeObserver can watch it */}
            <div ref={containerRef} style={{ flex:1, overflow:"hidden", position:"relative" }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        display:"block",
                        width:"100%",
                        height:"100%",
                        cursor: tool === "eraser" ? "cell" : "crosshair",
                        touchAction:"none",   /* ← prevents scroll hijacking on touch */
                    }}
                    onMouseDown={onStart}
                    onMouseMove={onMove}
                    onMouseUp={onEnd}
                    onMouseLeave={onEnd}
                    onTouchStart={onStart}
                    onTouchMove={onMove}
                    onTouchEnd={onEnd}
                />
            </div>
        </div>
    );
}