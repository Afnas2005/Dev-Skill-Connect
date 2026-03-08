"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSkillsByUserId = exports.getMySkills = exports.deleteSkill = exports.updateSkill = exports.createSkill = void 0;
const Skill_1 = __importDefault(require("../models/Skill"));
const SKILL_SELECTION = "userId skillName level description attachments createdAt updatedAt";
const createSkill = async (userId, payload) => {
    const skill = await Skill_1.default.create({
        userId,
        skillName: payload.skillName,
        level: payload.level,
        description: payload.description || "",
        attachments: payload.attachments || [],
    });
    return Skill_1.default.findById(skill._id).select(SKILL_SELECTION).lean();
};
exports.createSkill = createSkill;
const updateSkill = async (userId, skillId, payload) => {
    const skill = await Skill_1.default.findById(skillId);
    if (!skill) {
        throw new Error("Skill not found");
    }
    if (skill.userId.toString() !== userId) {
        throw new Error("Forbidden");
    }
    if (payload.skillName !== undefined)
        skill.skillName = payload.skillName;
    if (payload.level !== undefined)
        skill.level = payload.level;
    if (payload.description !== undefined)
        skill.description = payload.description;
    if (payload.attachments !== undefined)
        skill.attachments = payload.attachments;
    await skill.save();
    return Skill_1.default.findById(skill._id).select(SKILL_SELECTION).lean();
};
exports.updateSkill = updateSkill;
const deleteSkill = async (userId, skillId) => {
    const skill = await Skill_1.default.findById(skillId);
    if (!skill) {
        throw new Error("Skill not found");
    }
    if (skill.userId.toString() !== userId) {
        throw new Error("Forbidden");
    }
    await skill.deleteOne();
    return { id: skillId };
};
exports.deleteSkill = deleteSkill;
const getMySkills = async (userId) => {
    return Skill_1.default.find({ userId }).select(SKILL_SELECTION).sort({ createdAt: -1 }).lean();
};
exports.getMySkills = getMySkills;
const getSkillsByUserId = async (userId) => {
    return Skill_1.default.find({ userId }).select(SKILL_SELECTION).sort({ createdAt: -1 }).lean();
};
exports.getSkillsByUserId = getSkillsByUserId;
