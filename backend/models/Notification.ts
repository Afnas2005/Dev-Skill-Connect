import mongoose, { Document, Schema } from "mongoose";

export type NotificationType = "connections" | "mentions" | "skills";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    actorId?: mongoose.Types.ObjectId;
    type: NotificationType;
    name: string;
    message: string;
    actionLabel: string;
    secondaryAction?: string;
    unread: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        actorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
        type: {
            type: String,
            enum: ["connections", "mentions", "skills"],
            required: true,
            index: true,
        },
        name: { type: String, required: true },
        message: { type: String, required: true },
        actionLabel: { type: String, required: true },
        secondaryAction: { type: String },
        unread: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>("Notification", NotificationSchema);
