import Skill from "../models/Skill";

const SKILL_SELECTION =
    "userId skillName level description attachments createdAt updatedAt";

export const createSkill = async (
    userId: string,
    payload: {
        skillName: string;
        level: "beginner" | "intermediate" | "advanced";
        description?: string;
        attachments?: string[];
    }
) => {
    const skill = await Skill.create({
        userId,
        skillName: payload.skillName,
        level: payload.level,
        description: payload.description || "",
        attachments: payload.attachments || [],
    });

    return Skill.findById(skill._id).select(SKILL_SELECTION).lean();
};

export const updateSkill = async (
    userId: string,
    skillId: string,
    payload: {
        skillName?: string;
        level?: "beginner" | "intermediate" | "advanced";
        description?: string;
        attachments?: string[];
    }
) => {
    const skill = await Skill.findById(skillId);
    if (!skill) {
        throw new Error("Skill not found");
    }

    if (skill.userId.toString() !== userId) {
        throw new Error("Forbidden");
    }

    if (payload.skillName !== undefined) skill.skillName = payload.skillName;
    if (payload.level !== undefined) skill.level = payload.level;
    if (payload.description !== undefined) skill.description = payload.description;
    if (payload.attachments !== undefined) skill.attachments = payload.attachments;

    await skill.save();

    return Skill.findById(skill._id).select(SKILL_SELECTION).lean();
};

export const deleteSkill = async (userId: string, skillId: string) => {
    const skill = await Skill.findById(skillId);
    if (!skill) {
        throw new Error("Skill not found");
    }

    if (skill.userId.toString() !== userId) {
        throw new Error("Forbidden");
    }

    await skill.deleteOne();
    return { id: skillId };
};

export const getMySkills = async (userId: string) => {
    return Skill.find({ userId }).select(SKILL_SELECTION).sort({ createdAt: -1 }).lean();
};

export const getSkillsByUserId = async (userId: string) => {
    return Skill.find({ userId }).select(SKILL_SELECTION).sort({ createdAt: -1 }).lean();
};
