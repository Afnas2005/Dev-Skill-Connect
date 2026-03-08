import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
    userId: mongoose.Types.ObjectId;
    skillName: string;
    level: "beginner" | "intermediate" | "advanced";
    description?: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}

const SkillSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        skillName: { type: String, required: true, trim: true },
        level: {
            type: String,
            enum: ["beginner", "intermediate", "advanced"],
            default: "beginner",
        },
        description: {
            type: String,
            default: "",
            trim: true,
        },
        attachments: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

SkillSchema.index({ userId: 1 });
SkillSchema.index({ skillName: 1 });
SkillSchema.index({ level: 1 });
SkillSchema.index({ skillName: 1, level: 1, userId: 1 });

export default mongoose.model<ISkill>("Skill", SkillSchema);
