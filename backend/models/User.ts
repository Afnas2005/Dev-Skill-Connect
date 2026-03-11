import mongoose, { Schema, Document } from "mongoose";

export interface ISocialLinks {
    github?: string;
    linkedin?: string;
    twitter?: string;
}

export interface IUser extends Document {
    name?: string;
    email: string;
    password?: string;
    googleId?: string;
    bio?: string;
    professionalTitle?: string;
    location?: string;
    profileImage?: string;
    backgroundImage?: string;
    resumeUrl?: string;
    socialLinks?: ISocialLinks;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        name: { type: String },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        googleId: { type: String },
        bio: { type: String, default: "" },
        professionalTitle: { type: String, default: "" },
        location: { type: String, default: "" },
        profileImage: { type: String, default: "" },
        backgroundImage: { type: String, default: "" },
        resumeUrl: { type: String, default: "" },
        socialLinks: {
            github: { type: String, default: "" },
            linkedin: { type: String, default: "" },
            twitter: { type: String, default: "" },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
