import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/users.routes.js";

dotenv.config();


const app = express();
const server = createServer(app);
connectToSocket(server);

app.set("port", process.env.PORT || 5000);

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

const start = async () => {
    try {
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB connected: ${db.connection.host}`);
        server.listen(app.get("port"), () => {
            console.log(`Server running on port ${app.get("port")}`);
        });
    } catch (err) {
        console.error("Startup error:", err.message);
        process.exit(1);
    }
};

start();