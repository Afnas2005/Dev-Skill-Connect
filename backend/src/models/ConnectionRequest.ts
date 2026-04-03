import mongoose, { Document, Schema } from "mongoose";

export type ConnectionStatus = "pending" | "accepted" | "rejected";

export interface IConnectionRequest extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    status: ConnectionStatus;
    createdAt: Date;
    updatedAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>(
    {
        senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
            index: true,
        },
    },
    { timestamps: true }
);

ConnectionRequestSchema.index({ senderId: 1, receiverId: 1 }, { unique: true });

export default mongoose.model<IConnectionRequest>("ConnectionRequest", ConnectionRequestSchema);
