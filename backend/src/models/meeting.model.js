import mongoose, { Schema } from "mongoose";

const meetingSchema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User",
            required: true,
        },
        meetingCode: {
            type: String,
            required: true,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Meeting = mongoose.model("Meeting", meetingSchema);  

export { Meeting };