// controllers/user.controllers.js

import { User } from "../models/user.model.js";
import { Meeting } from "../models/meeting.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (user) =>
    jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

// POST /api/v1/users/register
export const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: "Username already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            password: hashedPassword,   // store hash, never plaintext
        });

        const token = generateToken(user);

        return res.status(201).json({
            message: "Registered successfully",
            token,                       // send in response only, never save to DB
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
            },
        });
    } catch (err) {
        console.error("Register error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/v1/users/login
export const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
            },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// POST /api/v1/users/add_to_activity
export const addToActivity = async (req, res) => {
    const { meetingCode } = req.body;

    if (!meetingCode) {
        return res.status(400).json({ message: "Meeting code is required" });
    }

    try {
        const meeting = await Meeting.create({
            user_id: req.user.id,
            meetingCode,
        });

        return res.status(201).json({
            message: "Activity recorded",
            meeting,
        });
    } catch (err) {
        console.error("Add activity error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};

// GET /api/v1/users/get_all_activity
export const getAllActivity = async (req, res) => {
    try {
        const meetings = await Meeting.find({ user_id: req.user.id })
            .sort({ date: -1 });   // newest first

        return res.status(200).json({ activity: meetings });
    } catch (err) {
        console.error("Get activity error:", err.message);
        return res.status(500).json({ message: "Server error" });
    }
};
// GET /api/v1/users/validate_meeting/:code
    export const validateMeeting = async (req, res) => {
        try {
            const meeting = await Meeting.findOne({ meetingCode: req.params.code });
            if (!meeting) {
                return res.status(404).json({ valid: false, message: "Meeting not found. Check your code." });
            }
            return res.status(200).json({ valid: true, meeting });
        } catch (err) {
            return res.status(500).json({ valid: false, message: "Server error" });
        }
    };