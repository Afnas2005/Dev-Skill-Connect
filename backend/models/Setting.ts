import mongoose, { Document, Schema } from "mongoose";

export interface ISetting extends Document {
    userId: mongoose.Types.ObjectId;
    account: {
        username: string;
    };
    privacy: {
        publicProfile: boolean;
        showOnlineStatus: boolean;
        searchVisibility: boolean;
    };
    notifications: {
        emailRequests: boolean;
        emailMessages: boolean;
        emailUpdates: boolean;
        pushDesktop: boolean;
        pushSound: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        account: {
            username: { type: String, default: "" },
        },
        privacy: {
            publicProfile: { type: Boolean, default: true },
            showOnlineStatus: { type: Boolean, default: false },
            searchVisibility: { type: Boolean, default: true },
        },
        notifications: {
            emailRequests: { type: Boolean, default: true },
            emailMessages: { type: Boolean, default: true },
            emailUpdates: { type: Boolean, default: false },
            pushDesktop: { type: Boolean, default: true },
            pushSound: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

export default mongoose.model<ISetting>("Setting", SettingSchema);
