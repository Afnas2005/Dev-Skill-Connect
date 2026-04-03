import mongoose, { Document, Schema } from "mongoose";

export interface IConversation extends Document {
    isGroup: boolean;
    name?: string;
    adminId?: mongoose.Types.ObjectId;
    participantIds: mongoose.Types.ObjectId[];
    participantKey?: string; // sparse, unique for direct chats
    lastMessageText: string;
    lastMessageAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        isGroup: {
            type: Boolean,
            default: false,
        },
        name: {
            type: String,
        },
        adminId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        participantIds: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        participantKey: {
            type: String,
            sparse: true,
            unique: true,
            index: true,
        },
        lastMessageText: {
            type: String,
            default: "",
        },
        lastMessageAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

ConversationSchema.index({ participantIds: 1 });

export default mongoose.model<IConversation>("Conversation", ConversationSchema);
