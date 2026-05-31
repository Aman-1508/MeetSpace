import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Meeting } from "../models/meeting.model.js";

const connections = {};
const messages = {};
const timeOnline = {};
const MAX_PARTICIPANTS = 6;

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Auth middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error("Authentication required"));
        try {
            socket.user = jwt.verify(token, process.env.JWT_SECRET);
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.user?.id} (${socket.id})`);

        socket.on("join-call", async (path) => {
            try {
                // Verify meeting exists in DB before allowing anyone in
                const meeting = await Meeting.findOne({ meetingCode: path });

                if (!meeting) {
                    socket.emit("invalid-room");   // tell client it's not valid
                    return;
                }

                if (connections[path] === undefined) {
                    connections[path] = [];
                }

                connections[path].push(socket.id);
                timeOnline[socket.id] = new Date();

                connections[path].forEach((id) => {
                    io.to(id).emit("user-joined", socket.id, connections[path]);
                });

                if (messages[path] !== undefined) {
                    messages[path].forEach((msg) => {
                        io.to(socket.id).emit(
                            "chat-message",
                            msg.data,
                            msg.sender,
                            msg["socket-id-sender"]
                        );
                    });
                }
            } catch (err) {
                console.error("join-call error:", err.message);
                socket.emit("invalid-room");
            }
        });
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const roomEntry = Object.entries(connections)
                .find(([, users]) => users.includes(socket.id));

            if (!roomEntry) return;
            const [roomKey] = roomEntry;

            if (!messages[roomKey]) messages[roomKey] = [];
            messages[roomKey].push({ sender, data, "socket-id-sender": socket.id });

            connections[roomKey].forEach((id) => {
                io.to(id).emit("chat-message", data, sender, socket.id);
            });
        });


        socket.on("whiteboard-draw", (drawData) => {
            const roomEntry = Object.entries(connections)
                .find(([, users]) => users.includes(socket.id));
            if (!roomEntry) return;
            const [roomKey] = roomEntry;
            connections[roomKey].forEach(id => {
                if (id !== socket.id) io.to(id).emit("whiteboard-draw", drawData);
            });
        });

        socket.on("whiteboard-clear", () => {
            const roomEntry = Object.entries(connections)
                .find(([, users]) => users.includes(socket.id));
            if (!roomEntry) return;
            const [roomKey] = roomEntry;
            connections[roomKey].forEach(id => {
                if (id !== socket.id) io.to(id).emit("whiteboard-clear");
            });
        });


        socket.on("disconnect", () => {
            for (const [roomKey, users] of Object.entries(connections)) {
                if (!users.includes(socket.id)) continue;

                connections[roomKey] = users.filter((id) => id !== socket.id);

                // Notify remaining peers
                connections[roomKey].forEach((id) => {
                    io.to(id).emit("user-left", socket.id);
                });

                // Clean up empty rooms
                if (connections[roomKey].length === 0) {
                    delete connections[roomKey];
                    delete messages[roomKey];
                }
                break;
            }

            delete timeOnline[socket.id];
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};