import mongoose, { Document, Schema } from "mongoose";

interface ISocialLinks {
    github?: string;
    linkedin?: string;
    twitter?: string;
}

export interface IProfile extends Document {
    userId: mongoose.Types.ObjectId;
    bio?: string;
    professionalTitle?: string;
    location?: string;
    profileImage?: string;
    socialLinks?: ISocialLinks;
    createdAt: Date;
    updatedAt: Date;
}

const SocialLinksSchema = new Schema<ISocialLinks>(
    {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        twitter: { type: String, default: "" },
    },
    { _id: false }
);

const ProfileSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
        bio: { type: String, default: "" },
        professionalTitle: { type: String, default: "" },
        location: { type: String, default: "" },
        profileImage: { type: String, default: "" },
        socialLinks: { type: SocialLinksSchema, default: {} },
    },
    { timestamps: true }
);

export default mongoose.model<IProfile>("Profile", ProfileSchema);
