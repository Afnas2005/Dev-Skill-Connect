"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicProfile = exports.updateMyProfile = exports.getMyProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const Skill_1 = __importDefault(require("../models/Skill"));
const PROFILE_SELECTION = "name email bio professionalTitle location profileImage backgroundImage socialLinks createdAt updatedAt";
const PUBLIC_PROFILE_SELECTION = "name bio professionalTitle location profileImage backgroundImage socialLinks createdAt updatedAt";
const sanitizeProfile = (user) => ({
    id: user._id,
    name: user.name || "",
    email: user.email,
    bio: user.bio || "",
    professionalTitle: user.professionalTitle || "",
    location: user.location || "",
    profileImage: user.profileImage || "",
    backgroundImage: user.backgroundImage || "",
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const sanitizePublicProfile = (user) => ({
    id: user._id,
    name: user.name || "",
    bio: user.bio || "",
    professionalTitle: user.professionalTitle || "",
    location: user.location || "",
    profileImage: user.profileImage || "",
    backgroundImage: user.backgroundImage || "",
    socialLinks: user.socialLinks || {},
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
});
const getMyProfile = async (userId) => {
    const user = await User_1.default.findById(userId).select(PROFILE_SELECTION).lean();
    if (!user) {
        throw new Error("User not found");
    }
    const skills = await Skill_1.default.find({ userId })
        .select("skillName level description attachments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();
    return {
        profile: sanitizeProfile(user),
        skills,
    };
};
exports.getMyProfile = getMyProfile;
const updateMyProfile = async (userId, payload) => {
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    if (payload.name !== undefined)
        user.name = payload.name;
    if (payload.bio !== undefined)
        user.bio = payload.bio;
    if (payload.professionalTitle !== undefined)
        user.professionalTitle = payload.professionalTitle;
    if (payload.location !== undefined)
        user.location = payload.location;
    if (payload.profileImage !== undefined)
        user.profileImage = payload.profileImage;
    if (payload.backgroundImage !== undefined)
        user.backgroundImage = payload.backgroundImage;
    if (payload.socialLinks) {
        user.socialLinks = {
            ...(user.socialLinks || {}),
            ...payload.socialLinks,
        };
    }
    await user.save();
    return (0, exports.getMyProfile)(userId);
};
exports.updateMyProfile = updateMyProfile;
const getPublicProfile = async (userId) => {
    const user = await User_1.default.findById(userId).select(PUBLIC_PROFILE_SELECTION).lean();
    if (!user) {
        throw new Error("User not found");
    }
    const skills = await Skill_1.default.find({ userId })
        .select("skillName level description attachments createdAt updatedAt")
        .sort({ createdAt: -1 })
        .lean();
    return {
        profile: sanitizePublicProfile(user),
        skills,
    };
};
exports.getPublicProfile = getPublicProfile;
