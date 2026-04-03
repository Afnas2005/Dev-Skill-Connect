import mongoose, { Document, Schema } from "mongoose";

export type PostVisibility = "public" | "private";
export type PostStatus = "draft" | "published";
export type CodeLanguage =
    | "typescript"
    | "javascript"
    | "python"
    | "java"
    | "go"
    | "rust"
    | "cpp"
    | "other";

export interface IPost extends Document {
    userId: mongoose.Types.ObjectId;
    content: string;
    codeSnippet?: string;
    codeLanguage: CodeLanguage;
    screenshots: string[];
    attachments: string[];
    visibility: PostVisibility;
    status: PostStatus;
    scheduledAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        content: { type: String, default: "", trim: true, maxlength: 3000 },
        codeSnippet: { type: String, default: "", trim: true, maxlength: 12000 },
        codeLanguage: {
            type: String,
            enum: ["typescript", "javascript", "python", "java", "go", "rust", "cpp", "other"],
            default: "typescript",
        },
        screenshots: { type: [String], default: [] },
        attachments: { type: [String], default: [] },
        visibility: { type: String, enum: ["public", "private"], default: "public" },
        status: { type: String, enum: ["draft", "published"], default: "published", index: true },
        scheduledAt: { type: Date, default: null },
    },
    { timestamps: true }
);

PostSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IPost>("Post", PostSchema);
