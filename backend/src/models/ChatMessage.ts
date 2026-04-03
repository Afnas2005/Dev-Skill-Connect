import mongoose, { Document, Schema } from "mongoose";

export interface IChatMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    senderId?: mongoose.Types.ObjectId;
    content: string;
    type: "text" | "call" | "voice";
    callMeta?: {
        callType: "audio" | "video";
        status: "completed" | "missed" | "declined";
        durationSeconds?: number;
    };
    voiceMeta?: {
        audioUrl: string;
        durationSeconds?: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },
        senderId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000,
        },
        type: {
            type: String,
            enum: ["text", "call", "voice"],
            default: "text",
            index: true,
        },
        callMeta: {
            callType: {
                type: String,
                enum: ["audio", "video"],
            },
            status: {
                type: String,
                enum: ["completed", "missed", "declined"],
            },
            durationSeconds: {
                type: Number,
                min: 0,
            },
        },
        voiceMeta: {
            audioUrl: {
                type: String,
                trim: true,
            },
            durationSeconds: {
                type: Number,
                min: 0,
            },
        },
    },
    { timestamps: true }
);

ChatMessageSchema.index({ conversationId: 1, createdAt: -1 });

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
