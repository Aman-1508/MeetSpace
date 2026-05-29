import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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

        socket.on("join-call", (path) => {
            if (!connections[path]) connections[path] = [];

            if (connections[path].length >= MAX_PARTICIPANTS) {
                socket.emit("room-full");
                return;
            }

            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();
            socket.join(path); // use Socket.IO rooms for cleaner broadcasting

            // Notify all peers in room
            connections[path].forEach((id) => {
                io.to(id).emit("user-joined", socket.id, connections[path]);
            });

            // Replay chat history for late joiners
            (messages[path] || []).forEach((msg) => {
                socket.emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
            });
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